import { generatePatternId } from "../../lib/patternUtils";
import type { ReactiveNode } from "../../types/nodes";
import type { DeepChainMetadata, Pattern } from "../../types/pattern";

export function detectDeepChains(
	nodes: ReactiveNode[],
	edges: Array<{ source: string; target: string }>,
	threshold = 5,
): Pattern[] {
	const patterns: Pattern[] = [];
	const now = Date.now();

	const _nodeMap = new Map(nodes.map((n) => [n.id, n]));
	const adjList = new Map<string, string[]>();
	for (const edge of edges) {
		const list = adjList.get(edge.source) || [];
		list.push(edge.target);
		adjList.set(edge.source, list);
	}

	const findRoots = (): string[] => {
		const hasIncoming = new Set<string>();
		for (const targets of adjList.values()) {
			for (const target of targets) {
				hasIncoming.add(target);
			}
		}
		return nodes.filter((n) => !hasIncoming.has(n.id)).map((n) => n.id);
	};

	const bfs = (startId: string) => {
		const queue: Array<{ id: string; depth: number; path: string[] }> = [
			{ id: startId, depth: 0, path: [startId] },
		];
		const visited = new Set<string>();

		while (queue.length > 0) {
			const current = queue.shift();
			if (!current) continue;

			if (visited.has(current.id)) continue;
			visited.add(current.id);

			if (current.depth > threshold) {
				const metadata: DeepChainMetadata = {
					depth: current.depth,
					chainPath: current.path,
				};

				patterns.push({
					id: generatePatternId("deep-chain", current.path, now),
					type: "deep-chain",
					severity: current.depth > 8 ? "high" : "medium",
					affectedNodeIds: current.path,
					timestamp: now,
					description: `Dependency chain depth ${current.depth} exceeds threshold ${threshold}`,
					remediation:
						"Flatten dependency chain or add batching to reduce propagation overhead",
					metadata: metadata as unknown as Record<string, unknown>,
					isExpected: false,
				});
			}

			const neighbors = adjList.get(current.id) || [];
			for (const neighbor of neighbors) {
				if (!visited.has(neighbor)) {
					queue.push({
						id: neighbor,
						depth: current.depth + 1,
						path: [...current.path, neighbor],
					});
				}
			}
		}
	};

	const roots = findRoots();
	for (const root of roots) {
		bfs(root);
	}

	return patterns;
}
