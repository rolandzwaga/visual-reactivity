/**
 * Type Contracts: Timeline View - Horizontal Timeline Visualization
 *
 * Feature: 006-timeline-view-horizontal
 * Date: 2026-01-09
 * Status: Phase 1 - Design
 *
 * These type definitions will be implemented in src/types/timeline.ts
 */

import type { ScaleTime } from "d3-scale";
import type { EventType, ReactivityEvent } from "../types/events";
import type { NodeType, ReactiveNode } from "../types/nodes";

// ============================================================================
// Core Timeline Entities
// ============================================================================

/**
 * Represents a single reactive event on the timeline.
 * Extends the existing ReactivityEvent type with timeline-specific fields.
 */
export interface TimelineEvent extends ReactivityEvent {
	/** Unique event identifier */
	id: string;

	/** Batch identifier for grouping synchronous events (null if unbatched) */
	batchId: string | null;
}

/**
 * Represents a horizontal track for a specific reactive node's events.
 */
export interface Swimlane {
	/** ID of reactive node */
	nodeId: string;

	/** Human-readable node name (null if unnamed) */
	nodeName: string | null;

	/** Type of node (signal, memo, effect) */
	nodeType: NodeType;

	/** Vertical pixel position (calculated by d3.scaleBand) */
	yPosition: number;

	/** Swimlane height in pixels (from scaleBand.bandwidth()) */
	height: number;

	/** Whether node has been disposed */
	isDisposed: boolean;

	/** Timestamp when node was disposed (null if not disposed) */
	disposalTime: number | null;

	/** Swimlane color based on node type */
	color: string;
}

/**
 * Represents a group of events that occurred synchronously.
 */
export interface EventBatch {
	/** Unique batch identifier */
	id: string;

	/** Timestamp of first event in batch */
	startTime: number;

	/** Timestamp of last event in batch */
	endTime: number;

	/** Duration in milliseconds (endTime - startTime) */
	duration: number;

	/** Array of event IDs in this batch */
	eventIds: string[];

	/** Number of events in batch */
	eventCount: number;
}

/**
 * Represents aggregated events when density exceeds threshold.
 * Used for performance optimization when zoomed out.
 */
export interface EventCluster {
	/** Unique cluster identifier */
	id: string;

	/** Representative timestamp (center of cluster) */
	centerTime: number;

	/** [startTime, endTime] of clustered events */
	timeRange: [number, number];

	/** Array of event IDs in this cluster */
	eventIds: string[];

	/** Number of events in cluster */
	eventCount: number;

	/** Node ID (all events in cluster from same node) */
	nodeId: string;
}

// ============================================================================
// Timeline State
// ============================================================================

/**
 * Represents the current time position on the timeline.
 */
export interface TimelineCursor {
	/** Current cursor timestamp */
	time: number;

	/** Cursor X position in pixels (calculated from time scale) */
	x: number;

	/** ID of event cursor is snapped to (null if free) */
	snappedEventId: string | null;

	/** Whether cursor is snapped to an event */
	isSnapped: boolean;
}

/**
 * Configuration for which events and nodes are visible.
 */
export interface TimelineFilter {
	/** Set of enabled event types */
	enabledEventTypes: Set<EventType>;

	/** Set of selected node IDs (null = show all) */
	selectedNodeIds: Set<string> | null;

	/** Text search query (empty = no search filter) */
	searchQuery: string;
}

/**
 * Playback mode for timeline animation.
 */
export type PlaybackMode = "manual" | "playing" | "paused";

/**
 * Configuration for timeline playback controls.
 */
export interface PlaybackState {
	/** Whether playback is active */
	isPlaying: boolean;

	/** Playback speed multiplier (0.25, 0.5, 1, 2, 5) */
	speed: number;

	/** Playback mode */
	mode: PlaybackMode;

	/** Timestamp of last animation frame (null if not started) */
	lastTickTime: number | null;

	/** requestAnimationFrame ID for cancellation (null if not active) */
	rafId: number | null;

	/** Whether to loop playback */
	loop?: boolean;
}

/**
 * Represents the D3 time scale for timestamp-to-pixel mapping.
 */
export interface TimelineScale {
	/** Timeline start timestamp (domain start) */
	startTime: number;

	/** Timeline end timestamp (domain end) */
	endTime: number;

	/** Timeline width in pixels (range end) */
	width: number;

	/** D3 time scale instance */
	scale: ScaleTime<number, number>;
}

/**
 * Live mode configuration for real-time event streaming.
 */
export type LiveMode = "live" | "paused";

/**
 * Complete timeline state.
 */
export interface TimelineState {
	/** All timeline events */
	events: TimelineEvent[];

	/** Swimlane layout for all nodes */
	swimlanes: Swimlane[];

	/** Detected event batches */
	batches: EventBatch[];

	/** Event clusters (when zoomed out) */
	clusters: EventCluster[];

	/** Current cursor state */
	cursor: TimelineCursor;

	/** Current time scale */
	scale: TimelineScale;

	/** Active filters */
	filter: TimelineFilter;

	/** Playback state */
	playback: PlaybackState;

	/** Live mode (auto-scroll to new events) */
	liveMode: LiveMode;
}

// ============================================================================
// Configuration & Options
// ============================================================================

/**
 * Options for creating a timeline scale.
 */
export interface TimelineScaleOptions {
	/** Start timestamp */
	startTime: number;

	/** End timestamp */
	endTime: number;

	/** Timeline width in pixels */
	width: number;

	/** Whether to round domain to nice values */
	nice?: boolean;

	/** Whether to clamp values to domain */
	clamp?: boolean;
}

/**
 * Options for swimlane layout calculation.
 */
export interface SwimlaneLayoutOptions {
	/** Nodes to create swimlanes for */
	nodes: ReactiveNode[];

	/** Total height available */
	height: number;

	/** Padding between swimlanes (0-1) */
	padding?: number;

	/** Disposed nodes to include */
	disposedNodes?: Map<string, number>; // nodeId -> disposalTime
}

/**
 * Options for event batching algorithm.
 */
export interface EventBatchOptions {
	/** Maximum time delta for same batch (ms) */
	maxDelta?: number;

	/** Minimum events required for batch (1 = all are batches) */
	minEvents?: number;
}

/**
 * Options for event clustering/aggregation.
 */
export interface EventClusterOptions {
	/** Pixel density threshold (events per 100px) */
	densityThreshold?: number;

	/** Current time scale for density calculation */
	scale: TimelineScale;

	/** Node ID to cluster events for */
	nodeId: string;
}

/**
 * Options for timeline cursor snapping.
 */
export interface CursorSnapOptions {
	/** Snap threshold in pixels */
	snapThreshold?: number;

	/** Events available for snapping */
	events: TimelineEvent[];

	/** Current time scale */
	scale: TimelineScale;
}

/**
 * Options for playback controller.
 */
export interface PlaybackControllerOptions {
	/** Initial speed */
	initialSpeed?: number;

	/** Maximum delta per frame (ms) */
	maxDelta?: number;

	/** Callback when playback reaches end */
	onEnd?: () => void;

	/** Callback on each tick */
	onTick?: (time: number) => void;
}

// ============================================================================
// Event & Callback Types
// ============================================================================

/**
 * Callback when cursor position changes.
 */
export type CursorMoveCallback = (cursor: TimelineCursor) => void;

/**
 * Callback when playback state changes.
 */
export type PlaybackStateCallback = (state: PlaybackState) => void;

/**
 * Callback when timeline is zoomed.
 */
export type ZoomCallback = (scale: TimelineScale) => void;

/**
 * Callback when filters are updated.
 */
export type FilterChangeCallback = (filter: TimelineFilter) => void;

/**
 * Callback when event is clicked.
 */
export type EventClickCallback = (event: TimelineEvent) => void;

/**
 * Callback when event is hovered.
 */
export type EventHoverCallback = (event: TimelineEvent | null) => void;

/**
 * Callback when batch is clicked.
 */
export type BatchClickCallback = (batch: EventBatch) => void;

// ============================================================================
// Factory & Utility Types
// ============================================================================

/**
 * Factory function to create TimelineEvent from ReactivityEvent.
 */
export type TimelineEventFactory = (
	event: ReactivityEvent,
	batchId: string | null,
) => TimelineEvent;

/**
 * Factory function to create Swimlane from ReactiveNode.
 */
export type SwimlaneFactory = (
	node: ReactiveNode,
	yPosition: number,
	height: number,
	isDisposed: boolean,
	disposalTime: number | null,
) => Swimlane;

/**
 * Factory function to create EventBatch.
 */
export type EventBatchFactory = (events: TimelineEvent[]) => EventBatch;

/**
 * Factory function to create EventCluster.
 */
export type EventClusterFactory = (
	events: TimelineEvent[],
	nodeId: string,
) => EventCluster;

/**
 * Predicate function to check if events should be clustered.
 */
export type ShouldClusterPredicate = (
	events: TimelineEvent[],
	scale: TimelineScale,
	densityThreshold: number,
) => boolean;

/**
 * Function to calculate event density (events per 100px).
 */
export type DensityCalculator = (
	events: TimelineEvent[],
	scale: TimelineScale,
) => number;

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for TimelineView component.
 */
export interface TimelineViewProps {
	/** Width of timeline in pixels */
	width: number;

	/** Height of timeline in pixels */
	height: number;

	/** Callback when event is clicked */
	onEventClick?: EventClickCallback;

	/** Callback when cursor moves */
	onCursorMove?: CursorMoveCallback;

	/** Callback when playback state changes */
	onPlaybackChange?: PlaybackStateCallback;

	/** Selection store for cross-view synchronization */
	selection?: import("./selection").SelectionStore;

	/** Replay store for event replay functionality */
	replayStore?: import("../stores/replayStore").ReplayStore;

	/** Recording store for save/load functionality */
	recordingStore?: import("../stores/recordingStore").RecordingStore;
}

/**
 * Props for Swimlane component.
 */
export interface SwimlaneProps {
	/** Swimlane data */
	swimlane: Swimlane;

	/** Events for this swimlane */
	events: TimelineEvent[];

	/** Current time scale */
	scale: TimelineScale;

	/** Whether this swimlane is selected */
	isSelected: boolean;

	/** Callback when event clicked */
	onEventClick?: EventClickCallback;

	/** Callback when event hovered */
	onEventHover?: EventHoverCallback;

	/** Callback when swimlane clicked */
	onSwimlaneClick?: (event: MouseEvent) => void;
}

/**
 * Props for EventMark component.
 */
export interface EventMarkProps {
	/** Event data */
	event: TimelineEvent;

	/** X position in pixels */
	x: number;

	/** Y position in pixels */
	y: number;

	/** Whether event is selected */
	isSelected: boolean;

	/** Whether event is hovered */
	isHovered: boolean;

	/** Whether event is snapped by cursor */
	isSnapped: boolean;

	/** Callback when clicked */
	onClick?: () => void;

	/** Callback when hovered */
	onHover?: (hovered: boolean) => void;
}

/**
 * Props for TimelineCursor component.
 */
export interface TimelineCursorProps {
	/** Cursor state */
	cursor: TimelineCursor;

	/** Timeline height */
	height: number;

	/** Callback when cursor moves */
	onMove?: CursorMoveCallback;
}

/**
 * Props for PlaybackControls component.
 */
export interface PlaybackControlsProps {
	/** Playback state */
	playback: PlaybackState;

	/** Callback when play clicked */
	onPlay?: () => void;

	/** Callback when pause clicked */
	onPause?: () => void;

	/** Callback when speed changed */
	onSpeedChange?: (speed: number) => void;

	/** Callback for step forward */
	onStepForward?: () => void;

	/** Callback for step backward */
	onStepBackward?: () => void;

	/** Callback for jump to start */
	onJumpToStart?: () => void;

	/** Callback for jump to end */
	onJumpToEnd?: () => void;

	/** Callback for toggle loop mode */
	onToggleLoop?: () => void;
}

/**
 * Props for TimelineFilters component.
 */
export interface TimelineFiltersProps {
	/** Current filter state */
	filter: TimelineFilter;

	/** Available nodes for filtering */
	availableNodes: ReactiveNode[];

	/** Callback when filters change */
	onChange?: FilterChangeCallback;
}

/**
 * Props for EventTooltip component.
 */
export interface EventTooltipProps {
	/** Event to display */
	event: TimelineEvent | null;

	/** Tooltip X position */
	x: number;

	/** Tooltip Y position */
	y: number;

	/** Whether tooltip is visible */
	visible: boolean;
}

/**
 * Props for BatchIndicator component.
 */
export interface BatchIndicatorProps {
	/** Batch data */
	batch: EventBatch;

	/** Start X position */
	x1: number;

	/** End X position */
	x2: number;

	/** Y position */
	y: number;

	/** Height of indicator */
	height: number;

	/** Whether batch is hovered */
	isHovered: boolean;

	/** Callback when clicked */
	onClick?: () => void;

	/** Callback when hovered */
	onHover?: (hovered: boolean) => void;
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * Return type for useTimelineState hook.
 */
export interface UseTimelineStateReturn {
	/** Current timeline state */
	state: () => TimelineState;

	/** Add new event to timeline */
	addEvent: (event: ReactivityEvent) => void;

	/** Update cursor position */
	setCursor: (time: number) => void;

	/** Update filter configuration */
	setFilter: (filter: Partial<TimelineFilter>) => void;

	/** Dispose a node */
	disposeNode: (nodeId: string, time: number) => void;
}

/**
 * Return type for useTimelineLayout hook.
 */
export interface UseTimelineLayoutReturn {
	/** Calculated swimlanes */
	swimlanes: () => Swimlane[];

	/** Time scale */
	scale: () => TimelineScale;

	/** Update timeline dimensions */
	resize: (width: number, height: number) => void;
}

/**
 * Return type for usePlaybackController hook.
 */
export interface UsePlaybackControllerReturn {
	/** Current playback state */
	state: () => PlaybackState;

	/** Start playback */
	play: () => void;

	/** Pause playback */
	pause: () => void;

	/** Set playback speed */
	setSpeed: (speed: number) => void;

	/** Jump to specific time */
	seek: (time: number) => void;
}

/**
 * Return type for useEventFilters hook.
 */
export interface UseEventFiltersReturn {
	/** Current filter configuration */
	filter: () => TimelineFilter;

	/** Filtered events */
	filteredEvents: () => TimelineEvent[];

	/** Visible swimlanes after filtering */
	visibleSwimlanes: () => Swimlane[];

	/** Toggle event type */
	toggleEventType: (type: EventType) => void;

	/** Set selected nodes */
	setSelectedNodes: (nodeIds: Set<string> | null) => void;

	/** Set search query */
	setSearchQuery: (query: string) => void;

	/** Clear all filters */
	clearFilters: () => void;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default values for timeline configuration.
 */
export const TIMELINE_DEFAULTS = {
	/** Default swimlane height (px) */
	SWIMLANE_HEIGHT: 45,

	/** Default swimlane padding (0-1) */
	SWIMLANE_PADDING: 0.1,

	/** Default batch detection threshold (ms) */
	BATCH_THRESHOLD: 50,

	/** Default event clustering threshold (events per 100px) */
	CLUSTER_THRESHOLD: 50,

	/** Default cursor snap threshold (px) */
	SNAP_THRESHOLD: 10,

	/** Default playback speed options */
	SPEED_OPTIONS: [0.5, 1, 2, 5],

	/** Default playback max delta (ms) */
	MAX_DELTA: 50,

	/** Minimum swimlane count for virtual scrolling */
	VIRTUAL_SCROLL_THRESHOLD: 50,
} as const;

/**
 * Color palette for different node types.
 */
export const NODE_COLORS = {
	signal: "#4FC08D",
	memo: "#41B86A",
	effect: "#A451AF",
	unknown: "#999999",
} as const;

/**
 * Color palette for different event types.
 */
export const EVENT_COLORS: Record<EventType, string> = {
	"signal-create": "#4FC08D",
	"signal-read": "#4FC08D",
	"signal-write": "#41B86A",
	"computation-create": "#A451AF",
	"computation-execute-start": "#A451AF",
	"computation-execute-end": "#8151AF",
	"computation-dispose": "#666666",
	"subscription-add": "#999999",
	"subscription-remove": "#999999",
};
