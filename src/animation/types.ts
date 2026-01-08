export type AnimationType =
	| "node-pulse"
	| "node-stale"
	| "node-executing"
	| "node-fade-out"
	| "node-dispose"
	| "edge-particle"
	| "edge-add"
	| "edge-remove"
	| "batch-indicator";

export type AnimationState = "pending" | "running" | "paused" | "complete";

export type EasingFunction = (t: number) => number;

export interface NodePulseData {
	readonly type: "node-pulse";
	scale: number;
}

export interface NodeStaleData {
	readonly type: "node-stale";
	opacity: number;
}

export interface NodeExecutingData {
	readonly type: "node-executing";
	glowIntensity: number;
}

export interface NodeFadeOutData {
	readonly type: "node-fade-out";
	opacity: number;
}

export interface NodeDisposeData {
	readonly type: "node-dispose";
	scale: number;
	opacity: number;
}

export interface EdgeParticleData {
	readonly type: "edge-particle";
	pathProgress: number;
	particleId: string;
}

export interface EdgeAddData {
	readonly type: "edge-add";
	strokeDashoffset: number;
}

export interface EdgeRemoveData {
	readonly type: "edge-remove";
	opacity: number;
}

export interface BatchIndicatorData {
	readonly type: "batch-indicator";
	nodeIds: string[];
}

export type AnimationData =
	| NodePulseData
	| NodeStaleData
	| NodeExecutingData
	| NodeFadeOutData
	| NodeDisposeData
	| EdgeParticleData
	| EdgeAddData
	| EdgeRemoveData
	| BatchIndicatorData;

export interface Animation {
	readonly id: string;
	readonly type: AnimationType;
	readonly targetId: string;
	startTime: number;
	readonly duration: number;
	progress: number;
	readonly easing: EasingFunction;
	state: AnimationState;
	data: AnimationData;
}

export interface AnimationQueueState {
	readonly pending: readonly Animation[];
	readonly active: ReadonlyMap<string, Animation>;
	readonly completedCount: number;
}

export interface PlaybackState {
	readonly isPaused: boolean;
	readonly speedMultiplier: number;
	readonly pendingCount: number;
}

export interface NodeVisualState {
	readonly nodeId: string;
	isStale: boolean;
	isExecuting: boolean;
	pulseScale: number;
	highlightOpacity: number;
	disposeProgress: number;
}

export interface EdgeVisualState {
	readonly edgeId: string;
	particleProgress: number | null;
	addProgress: number;
	removeProgress: number;
}

export interface AnimationControllerOptions {
	readonly baseDuration?: number;
	readonly showBatchIndicator?: boolean;
}

export const DEFAULT_ANIMATION_DURATION = 300;
export const MIN_SPEED_MULTIPLIER = 0.25;
export const MAX_SPEED_MULTIPLIER = 2.0;
export const STALE_OPACITY = 0.5;
export const PULSE_SCALE_MAX = 1.2;
