import type { ReactivityEvent } from "../types/events";
import type { ReactiveNode } from "../types/nodes";
import type { Pattern, PatternThreshold } from "../types/pattern";

export interface AnalysisResult {
	patterns: Pattern[];
	duration: number;
	timestamp: number;
	nodesAnalyzed: number;
	edgesAnalyzed: number;
}

export interface PatternDetectorConfig {
	thresholds: PatternThreshold[];
	debounceMs: number;
	debug: boolean;
	maxAnalysisTime: number;
}

export const DEFAULT_CONFIG: PatternDetectorConfig = {
	thresholds: [],
	debounceMs: 300,
	debug: false,
	maxAnalysisTime: 5000,
};

export interface PatternDetector {
	detectOrphanedEffects(): Pattern[];
	detectDeepChains(threshold?: number): Pattern[];
	detectDiamondPatterns(minPaths?: number): Pattern[];
	detectHotPaths(threshold?: number): Pattern[];
	detectHighSubscriptions(threshold?: number): Pattern[];
	detectStaleMemos(): Pattern[];
	runAnalysis(thresholds?: Partial<Record<string, number>>): AnalysisResult;
	reset(): void;
	handleEvent(event: ReactivityEvent): void;
}

export function createPatternDetector(
	getNodes: () => ReactiveNode[],
	getEdges: () => Array<{ source: string; target: string; type: string }>,
	config: Partial<PatternDetectorConfig> = {},
): PatternDetector {
	const fullConfig = { ...DEFAULT_CONFIG, ...config };
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	const updateCounters = new Map<string, number[]>();

	const handleEvent = (event: ReactivityEvent): void => {
		if (
			event.type === "signal-write" ||
			event.type === "computation-execute-end"
		) {
			const now = Date.now();
			const nodeId = event.nodeId;
			const timestamps = updateCounters.get(nodeId) || [];
			timestamps.push(now);
			const windowStart = now - 1000;
			const recentUpdates = timestamps.filter((t) => t >= windowStart);
			updateCounters.set(nodeId, recentUpdates);
		}

		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		debounceTimer = setTimeout(() => {
			if (fullConfig.debug) {
				console.log("Pattern detection triggered after debounce");
			}
		}, fullConfig.debounceMs);
	};

	const detectOrphanedEffects = (): Pattern[] => {
		const nodes = getNodes();
		const patterns: Pattern[] = [];
		const now = Date.now();

		for (const node of nodes) {
			if (node.type === "effect" && node.owner === null) {
				patterns.push({
					id: `orphaned-effect-${now}-${node.id.substring(0, 8)}`,
					type: "orphaned-effect",
					severity: "high",
					affectedNodeIds: [node.id],
					timestamp: now,
					description: "Effect created without ownership context",
					remediation: "Wrap effect in createRoot() or component context",
					metadata: {
						effectId: node.id,
						createdAt: now,
						lastRunAt: now,
					},
					isExpected: false,
				});
			}
		}

		return patterns;
	};

	const detectDeepChains = (threshold = 5): Pattern[] => {
		const nodes = getNodes();
		const edges = getEdges();
		const patterns: Pattern[] = [];
		const now = Date.now();

		const adjList = new Map<string, string[]>();
		for (const edge of edges) {
			const list = adjList.get(edge.source) || [];
			list.push(edge.target);
			adjList.set(edge.source, list);
		}

		const hasIncoming = new Set<string>();
		for (const targets of adjList.values()) {
			for (const target of targets) {
				hasIncoming.add(target);
			}
		}
		const roots = nodes.filter((n) => !hasIncoming.has(n.id));

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
					patterns.push({
						id: `deep-chain-${now}-${current.path[0].substring(0, 8)}`,
						type: "deep-chain",
						severity: current.depth > 8 ? "high" : "medium",
						affectedNodeIds: current.path,
						timestamp: now,
						description: `Chain depth ${current.depth} exceeds threshold ${threshold}`,
						remediation:
							"Flatten dependency chain or add batching to reduce propagation",
						metadata: { depth: current.depth, chainPath: current.path },
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

		for (const root of roots) {
			bfs(root.id);
		}

		return patterns;
	};

	const detectDiamondPatterns = (minPaths = 2): Pattern[] => {
		const nodes = getNodes();
		const edges = getEdges();
		const patterns: Pattern[] = [];
		const now = Date.now();

		const adjList = new Map<string, Set<string>>();
		for (const edge of edges) {
			if (!adjList.has(edge.source)) {
				adjList.set(edge.source, new Set());
			}
			adjList.get(edge.source)?.add(edge.target);
		}

		const findPaths = (
			start: string,
			end: string,
			visited: Set<string>,
		): string[][] => {
			if (start === end) return [[start]];
			visited.add(start);

			const paths: string[][] = [];
			const neighbors = adjList.get(start);
			if (neighbors) {
				for (const neighbor of neighbors) {
					if (!visited.has(neighbor)) {
						const subPaths = findPaths(neighbor, end, new Set(visited));
						for (const subPath of subPaths) {
							paths.push([start, ...subPath]);
						}
					}
				}
			}
			return paths;
		};

		for (const node of nodes) {
			const incomingEdges = edges.filter((e) => e.target === node.id);
			if (incomingEdges.length < minPaths) continue;

			const sources = Array.from(new Set(incomingEdges.map((e) => e.source)));
			if (sources.length < minPaths) continue;

			const allPaths: string[][] = [];
			for (const source of sources) {
				const paths = findPaths(source, node.id, new Set());
				allPaths.push(...paths);
			}

			if (allPaths.length >= minPaths) {
				patterns.push({
					id: `diamond-pattern-${now}-${node.id.substring(0, 8)}`,
					type: "diamond-pattern",
					severity: allPaths.length > 3 ? "medium" : "low",
					affectedNodeIds: [node.id],
					timestamp: now,
					description: `${allPaths.length} convergent paths to node ${node.name}`,
					remediation:
						"Informational - SolidJS handles convergent updates correctly",
					metadata: {
						convergenceNodeId: node.id,
						inputPaths: allPaths,
						pathCount: allPaths.length,
					},
					isExpected: false,
				});
			}
		}

		return patterns;
	};

	const detectHotPaths = (threshold = 10): Pattern[] => {
		const patterns: Pattern[] = [];
		const now = Date.now();

		for (const [nodeId, timestamps] of updateCounters.entries()) {
			const windowStart = now - 1000;
			const recentUpdates = timestamps.filter((t) => t >= windowStart);
			const updatesPerSecond = recentUpdates.length;

			if (updatesPerSecond > threshold) {
				patterns.push({
					id: `hot-path-${now}-${nodeId}`,
					type: "hot-path",
					severity: updatesPerSecond > 50 ? "high" : "medium",
					affectedNodeIds: [nodeId],
					timestamp: now,
					description: `Node updating ${updatesPerSecond} times per second`,
					remediation: "Consider debouncing or throttling updates",
					metadata: {
						updateCount: updatesPerSecond,
						windowDuration: 1000,
						updatesPerSecond,
					},
					isExpected: false,
				});
			}
		}

		return patterns;
	};

	const detectHighSubscriptions = (threshold = 50): Pattern[] => {
		const nodes = getNodes();
		const patterns: Pattern[] = [];
		const now = Date.now();

		for (const node of nodes) {
			const observerCount = node.observers.length;
			if (observerCount > threshold) {
				patterns.push({
					id: `high-subscriptions-${now}-${node.id.substring(0, 8)}`,
					type: "high-subscriptions",
					severity:
						observerCount > 100
							? "high"
							: observerCount > 200
								? "high"
								: "medium",
					affectedNodeIds: [node.id],
					timestamp: now,
					description: `Node has ${observerCount} observers (threshold: ${threshold})`,
					remediation:
						"Verify fan-out is intentional, or refactor to reduce observer count",
					metadata: {
						subscriberCount: observerCount,
						subscriberIds: node.observers,
					},
					isExpected: false,
				});
			}
		}

		return patterns;
	};

	const detectStaleMemos = (): Pattern[] => {
		const nodes = getNodes();
		const patterns: Pattern[] = [];
		const now = Date.now();

		for (const node of nodes) {
			if (node.type === "memo" && node.observers.length === 0) {
				patterns.push({
					id: `stale-memo-${now}-${node.id.substring(0, 8)}`,
					type: "stale-memo",
					severity: "low",
					affectedNodeIds: [node.id],
					timestamp: now,
					description: `Memo ${node.name} is never read (0 observers)`,
					remediation: "Remove unused memo or add consumers to make it useful",
					metadata: {
						staleSince: now,
						lastComputedAt: now,
						observerCount: 0,
					},
					isExpected: false,
				});
			}
		}

		return patterns;
	};

	const runAnalysis = (
		_thresholds?: Partial<Record<string, number>>,
	): AnalysisResult => {
		const startTime = performance.now();
		const nodes = getNodes();
		const edges = getEdges();

		const patterns: Pattern[] = [
			...detectOrphanedEffects(),
			...detectHighSubscriptions(),
			...detectStaleMemos(),
			...detectDeepChains(),
			...detectHotPaths(),
			...detectDiamondPatterns(),
		];

		const duration = performance.now() - startTime;

		return {
			patterns,
			duration,
			timestamp: Date.now(),
			nodesAnalyzed: nodes.length,
			edgesAnalyzed: edges.length,
		};
	};

	const reset = (): void => {
		updateCounters.clear();
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = null;
		}
	};

	return {
		detectOrphanedEffects,
		detectDeepChains,
		detectDiamondPatterns,
		detectHotPaths,
		detectHighSubscriptions,
		detectStaleMemos,
		runAnalysis,
		reset,
		handleEvent,
	};
}
