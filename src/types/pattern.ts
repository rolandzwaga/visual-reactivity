export type PatternType =
	| "orphaned-effect"
	| "deep-chain"
	| "diamond-pattern"
	| "hot-path"
	| "high-subscriptions"
	| "stale-memo";

export type Severity = "low" | "medium" | "high";

export interface Pattern {
	id: string;
	type: PatternType;
	severity: Severity;
	affectedNodeIds: string[];
	timestamp: number;
	description: string;
	remediation: string;
	metadata: Record<string, unknown>;
	isExpected: boolean;
}

export interface OrphanedEffectMetadata {
	effectId: string;
	createdAt: number;
	lastRunAt: number;
}

export interface DeepChainMetadata {
	depth: number;
	chainPath: string[];
}

export interface DiamondPatternMetadata {
	convergenceNodeId: string;
	inputPaths: string[][];
	pathCount: number;
}

export interface HotPathMetadata {
	updateCount: number;
	windowDuration: number;
	updatesPerSecond: number;
}

export interface HighSubscriptionsMetadata {
	subscriberCount: number;
	subscriberIds: string[];
}

export interface StaleMemoMetadata {
	staleSince: number;
	lastComputedAt: number;
	observerCount: number;
}

export interface PatternThreshold {
	patternType: PatternType;
	thresholdValue: number;
	enabled: boolean;
}

export interface PatternException {
	id: string;
	patternId: string;
	reason: string;
	createdAt: number;
	expiresAt: number | null;
}

export interface MetricsSummary {
	totalPatterns: number;
	byType: Record<PatternType, number>;
	bySeverity: Record<Severity, number>;
	mostProblematicNodes: Array<{ nodeId: string; patternCount: number }>;
	lastAnalysisAt: number;
	analysisStatus: "idle" | "analyzing" | "success" | "error";
	errorMessage: string | null;
}

export const DEFAULT_THRESHOLDS: PatternThreshold[] = [
	{ patternType: "orphaned-effect", thresholdValue: 0, enabled: true },
	{ patternType: "deep-chain", thresholdValue: 5, enabled: true },
	{ patternType: "diamond-pattern", thresholdValue: 2, enabled: true },
	{ patternType: "hot-path", thresholdValue: 10, enabled: true },
	{ patternType: "high-subscriptions", thresholdValue: 50, enabled: true },
	{ patternType: "stale-memo", thresholdValue: 0, enabled: true },
];

export const SEVERITY_COLORS: Record<Severity, string> = {
	low: "#fbbf24",
	medium: "#fb923c",
	high: "#ef4444",
};
