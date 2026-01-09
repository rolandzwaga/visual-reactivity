/**
 * Pattern Detector API Contract
 *
 * Defines the interface for the pattern detection engine that analyzes
 * the reactivity graph and identifies anti-patterns.
 *
 * Implementation location: src/analysis/patternDetector.ts
 */

import type { ReactiveNode } from "../../../src/types/nodes";
import type { Pattern, PatternThreshold } from "../../../src/types/pattern";

/**
 * Core pattern detector interface
 */
export interface IPatternDetector {
	/**
	 * Detects effects without owner (memory leak risk)
	 *
	 * Algorithm: O(n) scan checking node.owner === null
	 *
	 * @returns Array of Pattern instances with type='orphaned-effect'
	 */
	detectOrphanedEffects(): Pattern[];

	/**
	 * Detects dependency chains exceeding depth threshold
	 *
	 * Algorithm: BFS from each root node, track depth, flag if > threshold
	 * Time complexity: O(V + E) where V=nodes, E=edges
	 *
	 * @param threshold - Maximum acceptable depth (default: 5)
	 * @returns Array of Pattern instances with type='deep-chain'
	 */
	detectDeepChains(threshold?: number): Pattern[];

	/**
	 * Detects diamond patterns (multiple paths converging)
	 *
	 * Algorithm: For each node, find all upstream paths, detect convergence
	 * Time complexity: O(V * E) worst case
	 *
	 * @param minPaths - Minimum convergent paths to trigger (default: 2)
	 * @returns Array of Pattern instances with type='diamond-pattern'
	 */
	detectDiamondPatterns(minPaths?: number): Pattern[];

	/**
	 * Detects nodes with excessive update frequency
	 *
	 * Algorithm: Track update events in sliding 1-second window
	 * Time complexity: O(1) per update, O(n) for analysis
	 *
	 * @param threshold - Updates per second threshold (default: 10)
	 * @returns Array of Pattern instances with type='hot-path'
	 */
	detectHotPaths(threshold?: number): Pattern[];

	/**
	 * Detects nodes with excessive observer count
	 *
	 * Algorithm: O(n) scan checking observers.length > threshold
	 *
	 * @param threshold - Maximum observer count (default: 50)
	 * @returns Array of Pattern instances with type='high-subscriptions'
	 */
	detectHighSubscriptions(threshold?: number): Pattern[];

	/**
	 * Detects memos with zero observers
	 *
	 * Algorithm: O(n) scan filtering memos with observers.length === 0
	 *
	 * @returns Array of Pattern instances with type='stale-memo'
	 */
	detectStaleMemos(): Pattern[];

	/**
	 * Runs all detection algorithms in optimized order
	 *
	 * Execution order (fastest to slowest):
	 * 1. detectOrphanedEffects() - O(n)
	 * 2. detectHighSubscriptions() - O(n)
	 * 3. detectStaleMemos() - O(n)
	 * 4. detectDeepChains() - O(V + E)
	 * 5. detectHotPaths() - O(n)
	 * 6. detectDiamondPatterns() - O(V * E)
	 *
	 * @param thresholds - Custom threshold overrides (optional)
	 * @returns Object with all detected patterns categorized by type
	 */
	runAnalysis(thresholds?: Partial<Record<string, number>>): AnalysisResult;

	/**
	 * Resets internal state (update counters, caches)
	 *
	 * Called when tracker.reset() is invoked or graph is cleared
	 */
	reset(): void;

	/**
	 * Updates internal state based on reactivity event
	 *
	 * Called by tracker.subscribe() to maintain update frequency tracking
	 *
	 * @param event - Reactivity event from tracker
	 */
	handleEvent(event: ReactivityEvent): void;
}

/**
 * Result structure from runAnalysis()
 */
export interface AnalysisResult {
	patterns: Pattern[];
	duration: number; // milliseconds
	timestamp: number; // Unix timestamp
	nodesAnalyzed: number;
	edgesAnalyzed: number;
}

/**
 * Reactivity event structure (from tracker)
 */
export interface ReactivityEvent {
	type: "create" | "update" | "dependency-add" | "dependency-remove";
	nodeId: string;
	timestamp: number;
	metadata?: Record<string, unknown>;
}

/**
 * Factory function signature
 *
 * Creates detector instance bound to ReactivityTracker
 *
 * @param getNodes - Function returning current graph nodes
 * @param getEdges - Function returning current graph edges
 * @returns PatternDetector instance
 */
export type CreatePatternDetector = (
	getNodes: () => ReactiveNode[],
	getEdges: () => Array<{ source: string; target: string; type: string }>,
) => IPatternDetector;

/**
 * Configuration options for pattern detector
 */
export interface PatternDetectorConfig {
	/**
	 * Custom thresholds for each pattern type
	 */
	thresholds: PatternThreshold[];

	/**
	 * Debounce delay for analysis trigger (milliseconds)
	 * Default: 300
	 */
	debounceMs: number;

	/**
	 * Enable console logging for debugging
	 * Default: false
	 */
	debug: boolean;

	/**
	 * Maximum time allowed for analysis (milliseconds)
	 * Analysis aborts if exceeded, returns partial results
	 * Default: 5000
	 */
	maxAnalysisTime: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: PatternDetectorConfig = {
	thresholds: [
		{ patternType: "orphaned-effect", thresholdValue: 0, enabled: true },
		{ patternType: "deep-chain", thresholdValue: 5, enabled: true },
		{ patternType: "diamond-pattern", thresholdValue: 2, enabled: true },
		{ patternType: "hot-path", thresholdValue: 10, enabled: true },
		{ patternType: "high-subscriptions", thresholdValue: 50, enabled: true },
		{ patternType: "stale-memo", thresholdValue: 0, enabled: true },
	],
	debounceMs: 300,
	debug: false,
	maxAnalysisTime: 5000,
};

/**
 * Error types that can occur during analysis
 */
export class PatternDetectionError extends Error {
	constructor(
		message: string,
		public readonly code: "TIMEOUT" | "INVALID_GRAPH" | "INVALID_CONFIG",
		public readonly details?: Record<string, unknown>,
	) {
		super(message);
		this.name = "PatternDetectionError";
	}
}

/**
 * Usage Example:
 *
 * ```typescript
 * import { createPatternDetector } from './analysis/patternDetector';
 * import { tracker } from './instrumentation/tracker';
 *
 * const detector = createPatternDetector(
 *   () => tracker.getNodes(),
 *   () => tracker.getEdges()
 * );
 *
 * // Subscribe to tracker events
 * tracker.subscribe((event) => detector.handleEvent(event));
 *
 * // Run analysis
 * const result = detector.runAnalysis();
 * console.log(`Found ${result.patterns.length} patterns in ${result.duration}ms`);
 *
 * // Or detect specific pattern type
 * const orphans = detector.detectOrphanedEffects();
 * ```
 */
