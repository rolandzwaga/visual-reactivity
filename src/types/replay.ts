/**
 * Replay system types
 * Feature: 009-timeline-playback
 */

import type { ReactivityEvent } from "./events";

/**
 * Current replay mode state
 */
export interface ReplayState {
	/** Whether replay mode is currently active */
	active: boolean;
	/** Current cursor position (ms since epoch), null if not positioned */
	cursorTimestamp: number | null;
	/** ID of loaded recording, null if viewing live events */
	recordingId: number | null;
	/** Current mode */
	mode: "live" | "replay";
}

/**
 * Saved event recording
 */
export interface Recording {
	/** Auto-generated IndexedDB key */
	id: number;
	/** User-provided name (1-100 chars, alphanumeric + dash/underscore/space, unique) */
	name: string;
	/** Creation timestamp (ms since epoch) */
	dateCreated: number;
	/** Total number of events (cached) */
	eventCount: number;
	/** Time span from first to last event (milliseconds) */
	duration: number;
	/** Serialization format version (semver) */
	version: string;
	/** Full event array */
	events: ReactivityEvent[];
}

/**
 * Recording metadata (lightweight, for list display)
 */
export interface RecordingMetadata {
	/** Recording ID */
	id: number;
	/** Recording name */
	name: string;
	/** Creation timestamp */
	dateCreated: number;
	/** Total events */
	eventCount: number;
	/** Duration in milliseconds */
	duration: number;
	/** Unique node types in recording */
	nodeTypes: string[];
	/** Application version when recording was created */
	appVersion: string;
}

/**
 * Reconstruction of the reactive graph at a specific point in time
 */
export interface HistoricalGraphState {
	/** Point in time this state represents (ms) */
	timestamp: number;
	/** Nodes that existed at this timestamp */
	activeNodes: Map<string, HistoricalNode>;
	/** Dependency edges that existed at this timestamp */
	edges: Array<{ from: string; to: string; type: string }>;
	/** Nodes that had been disposed before this timestamp */
	disposedNodeIds: Set<string>;
}

/**
 * Historical node with value at specific timestamp
 */
export interface HistoricalNode {
	/** Node metadata */
	node: {
		id: string;
		name: string;
		type: string;
	};
	/** Value at this timestamp */
	value: unknown;
	/** When this value was set */
	lastUpdateTime: number;
	/** When node was created */
	createdAt: number;
}

/**
 * Extended playback control state (extends Feature 006)
 */
export interface PlaybackControlState {
	/** Whether auto-playback is active */
	isPlaying: boolean;
	/** Playback speed multiplier */
	speed: number;
	/** Playback mode */
	mode: "manual" | "auto";
	/** Last animation frame timestamp */
	lastTickTime: number | null;
	/** RequestAnimationFrame ID for cancellation */
	rafId: number | null;
	/** Whether to restart from beginning when reaching end (new) */
	loop: boolean;
	/** Whether in single-step mode (new) */
	stepMode: boolean;
}

/**
 * Configuration for recording export operations
 */
export interface ExportOptions {
	/** How to handle event values */
	valueInclusion: "full" | "truncated" | "structure-only";
	/** Max bytes per value when truncated */
	truncationLimit: number;
	/** Whether to include full metadata object */
	includeMetadata: boolean;
}
