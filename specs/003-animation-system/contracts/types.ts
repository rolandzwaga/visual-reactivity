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
	readonly scale: number;
}

export interface NodeStaleData {
	readonly type: "node-stale";
	readonly opacity: number;
}

export interface NodeExecutingData {
	readonly type: "node-executing";
	readonly glowIntensity: number;
}

export interface NodeFadeOutData {
	readonly type: "node-fade-out";
	readonly opacity: number;
}

export interface NodeDisposeData {
	readonly type: "node-dispose";
	readonly scale: number;
	readonly opacity: number;
}

export interface EdgeParticleData {
	readonly type: "edge-particle";
	readonly pathProgress: number;
	readonly particleId: string;
}

export interface EdgeAddData {
	readonly type: "edge-add";
	readonly strokeDashoffset: number;
}

export interface EdgeRemoveData {
	readonly type: "edge-remove";
	readonly opacity: number;
}

export interface BatchIndicatorData {
	readonly type: "batch-indicator";
	readonly nodeIds: readonly string[];
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
	readonly startTime: number;
	readonly duration: number;
	readonly progress: number;
	readonly easing: EasingFunction;
	readonly state: AnimationState;
	readonly data: AnimationData;
}

export interface AnimationQueueState {
	readonly pending: readonly Animation[];
	readonly active: ReadonlyMap<string, Animation>;
	readonly completedCount: number;
}

export interface AnimationQueue {
	enqueue(animation: Omit<Animation, "id" | "state" | "progress">): string;
	cancel(animationId: string): void;
	cancelForTarget(targetId: string): void;
	getState(): AnimationQueueState;
	tick(deltaTime: number, speedMultiplier: number): void;
	pause(): void;
	resume(): void;
	clear(): void;
}

export interface PlaybackState {
	readonly isPaused: boolean;
	readonly speedMultiplier: number;
	readonly pendingCount: number;
}

export interface PlaybackController {
	readonly state: () => PlaybackState;
	togglePause(): void;
	setPaused(paused: boolean): void;
	setSpeed(multiplier: number): void;
}

export interface NodeVisualState {
	readonly nodeId: string;
	readonly isStale: boolean;
	readonly isExecuting: boolean;
	readonly pulseScale: number;
	readonly highlightOpacity: number;
	readonly disposeProgress: number;
}

export interface EdgeVisualState {
	readonly edgeId: string;
	readonly particleProgress: number | null;
	readonly addProgress: number;
	readonly removeProgress: number;
}

export interface AnimationControllerOptions {
	readonly baseDuration?: number;
	readonly showBatchIndicator?: boolean;
}

export interface AnimationController {
	readonly playback: PlaybackController;
	getNodeVisualState(nodeId: string): () => NodeVisualState;
	getEdgeVisualState(edgeId: string): () => EdgeVisualState;
	animateSignalWrite(nodeId: string): void;
	animateExecutionStart(nodeId: string): void;
	animateExecutionEnd(nodeId: string): void;
	animateEdgeAdd(edgeId: string): void;
	animateEdgeRemove(edgeId: string): void;
	animateDisposal(nodeId: string): void;
	setNodeStale(nodeId: string, isStale: boolean): void;
	startBatch(): void;
	endBatch(): void;
	dispose(): void;
}
