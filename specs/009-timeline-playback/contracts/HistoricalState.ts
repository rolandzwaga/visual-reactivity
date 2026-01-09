/**
 * API Contract: HistoricalState
 *
 * Reconstructs historical graph state at any point in time using event replay.
 * Implements memoized snapshot caching for performance.
 *
 * Feature: 009-timeline-playback
 *
 * @see data-model.md for HistoricalGraphState entity definition
 * @see research.md for incremental replay algorithm with LRU caching
 */

import type { ReactiveEdge, ReactiveNode } from "../../../src/types";
import type { ReactivityEvent } from "../../../src/types/events";

export interface HistoricalNode {
	node: ReactiveNode;
	value: unknown;
	lastUpdateTime: number;
	createdAt: number;
}

export interface HistoricalGraphState {
	timestamp: number;
	activeNodes: Map<string, HistoricalNode>;
	edges: ReactiveEdge[];
	disposedNodeIds: Set<string>;
}

export interface StateReconstructor {
	reconstructAt(timestamp: number): HistoricalGraphState;
	clearCache(): void;
	getCacheStats(): { size: number; hits: number; misses: number };
}

export function createStateReconstructor(
	events: ReactivityEvent[],
): StateReconstructor;
