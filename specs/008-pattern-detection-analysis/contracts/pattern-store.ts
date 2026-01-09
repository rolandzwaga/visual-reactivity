/**
 * Pattern Store API Contract
 *
 * Defines the reactive store interface for managing detected patterns,
 * exceptions, thresholds, and metrics in a SolidJS application.
 *
 * Implementation location: src/stores/patternStore.ts
 */

import type { Accessor } from "solid-js";
import type {
	MetricsSummary,
	Pattern,
	PatternException,
	PatternThreshold,
} from "../../../src/types/pattern";

export interface IPatternStore {
	patterns: Accessor<Pattern[]>;
	exceptions: Accessor<PatternException[]>;
	thresholds: Accessor<PatternThreshold[]>;
	metrics: Accessor<MetricsSummary>;
	status: Accessor<"idle" | "analyzing" | "success" | "error">;
	errorMessage: Accessor<string | null>;

	addPattern(pattern: Pattern): void;
	addPatterns(patterns: Pattern[]): void;
	removePattern(patternId: string): void;
	clearPatterns(): void;
	updatePattern(patternId: string, updates: Partial<Pattern>): void;

	markAsExpected(patternId: string, reason?: string, expiresAt?: number): void;
	removeException(patternId: string): void;
	isExpected(patternId: string): boolean;

	updateThreshold(patternType: string, value: number): void;
	toggleThreshold(patternType: string, enabled: boolean): void;
	resetThresholds(): void;

	getPatternsByType(type: string): Pattern[];
	getPatternsBySeverity(severity: "low" | "medium" | "high"): Pattern[];
	getPatternsForNode(nodeId: string): Pattern[];

	setStatus(
		status: "idle" | "analyzing" | "success" | "error",
		error?: string,
	): void;

	loadFromStorage(): void;
	saveToStorage(): void;
	reset(): void;
}

export type CreatePatternStore = () => IPatternStore;

export const DEFAULT_METRICS: MetricsSummary = {
	totalPatterns: 0,
	byType: {
		"orphaned-effect": 0,
		"deep-chain": 0,
		"diamond-pattern": 0,
		"hot-path": 0,
		"high-subscriptions": 0,
		"stale-memo": 0,
	},
	bySeverity: {
		low: 0,
		medium: 0,
		high: 0,
	},
	mostProblematicNodes: [],
	lastAnalysisAt: 0,
	analysisStatus: "idle",
	errorMessage: null,
};
