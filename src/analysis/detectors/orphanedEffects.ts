import { generatePatternId } from "../../lib/patternUtils";
import type { ReactiveNode } from "../../types/nodes";
import type { OrphanedEffectMetadata, Pattern } from "../../types/pattern";

export function detectOrphanedEffects(nodes: ReactiveNode[]): Pattern[] {
	const patterns: Pattern[] = [];
	const now = Date.now();

	for (const node of nodes) {
		if (node.type === "effect" && node.owner === null) {
			const metadata: OrphanedEffectMetadata = {
				effectId: node.id,
				createdAt: now,
				lastRunAt: now,
			};

			patterns.push({
				id: generatePatternId("orphaned-effect", [node.id], now),
				type: "orphaned-effect",
				severity: "high",
				affectedNodeIds: [node.id],
				timestamp: now,
				description: "Effect created without ownership context",
				remediation: "Wrap effect in createRoot() or component context",
				metadata: metadata as unknown as Record<string, unknown>,
				isExpected: false,
			});
		}
	}

	return patterns;
}
