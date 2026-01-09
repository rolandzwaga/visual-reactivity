import type { Pattern, PatternType, Severity } from "../types/pattern";
import { SEVERITY_COLORS } from "../types/pattern";

export function getSeverityColor(severity: Severity): string {
	return SEVERITY_COLORS[severity];
}

export function getPatternDescription(type: PatternType): string {
	const descriptions: Record<PatternType, string> = {
		"orphaned-effect": "Effect created without ownership context",
		"deep-chain": "Dependency chain exceeds depth threshold",
		"diamond-pattern": "Multiple dependency paths converge to same node",
		"hot-path": "Node updating excessively per second",
		"high-subscriptions": "Node has excessive observer count",
		"stale-memo": "Memo computed but never read",
	};
	return descriptions[type];
}

export function getPatternRemediation(type: PatternType): string {
	const remediations: Record<PatternType, string> = {
		"orphaned-effect":
			"Wrap effect in createRoot() or component context to ensure proper cleanup",
		"deep-chain":
			"Flatten dependency chain or add batching to reduce propagation overhead",
		"diamond-pattern":
			"This is informational - SolidJS handles convergent updates correctly with glitch-free execution",
		"hot-path":
			"Consider debouncing or throttling updates to reduce computation",
		"high-subscriptions":
			"Verify fan-out is intentional, or refactor to reduce observer count",
		"stale-memo": "Remove unused memo or add consumers to make it useful",
	};
	return remediations[type];
}

export function generatePatternId(
	type: PatternType,
	affectedNodeIds: string[],
	timestamp: number,
): string {
	const idsStr = affectedNodeIds.sort().join(",");
	const hash = simpleHash(idsStr);
	return `${type}-${timestamp}-${hash.substring(0, 8)}`;
}

function simpleHash(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return Math.abs(hash).toString(16);
}

export function isPatternVisible(
	pattern: Pattern,
	showExpected: boolean,
): boolean {
	return showExpected || !pattern.isExpected;
}

export function getPatternAge(pattern: Pattern): string {
	const ageMs = Date.now() - pattern.timestamp;
	const ageSec = Math.floor(ageMs / 1000);

	if (ageSec < 5) return "just now";
	if (ageSec < 60) return `${ageSec}s ago`;
	const ageMin = Math.floor(ageSec / 60);
	if (ageMin < 60) return `${ageMin}m ago`;
	const ageHour = Math.floor(ageMin / 60);
	return `${ageHour}h ago`;
}
