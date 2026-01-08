export type NodeType = "signal" | "memo" | "effect" | "root";

export interface ReactiveNode {
	readonly id: string;
	readonly type: NodeType;
	readonly name: string | null;
	value: unknown;
	isStale: boolean;
	isExecuting: boolean;
	executionCount: number;
	readonly createdAt: number;
	lastExecutedAt: number | null;
	disposedAt: number | null;
	readonly sources: string[];
	readonly observers: string[];
	readonly owner: string | null;
	readonly owned: string[];
}

export type EdgeType = "dependency" | "ownership";

export interface ReactiveEdge {
	readonly id: string;
	readonly type: EdgeType;
	readonly source: string;
	readonly target: string;
	lastTriggeredAt: number | null;
	triggerCount: number;
}

export type EventType =
	| "signal-create"
	| "signal-read"
	| "signal-write"
	| "computation-create"
	| "computation-execute-start"
	| "computation-execute-end"
	| "computation-dispose"
	| "subscription-add"
	| "subscription-remove";

export interface SignalCreateData {
	value: unknown;
}

export interface SignalReadData {
	value: unknown;
}

export interface SignalWriteData {
	previousValue: unknown;
	newValue: unknown;
}

export interface ComputationCreateData {
	computationType: "memo" | "effect";
}

export type ComputationExecuteStartData = Record<string, never>;

export interface ComputationExecuteEndData {
	durationMs: number;
}

export type ComputationDisposeData = Record<string, never>;

export interface SubscriptionAddData {
	sourceId: string;
}

export interface SubscriptionRemoveData {
	sourceId: string;
}

export type EventData =
	| SignalCreateData
	| SignalReadData
	| SignalWriteData
	| ComputationCreateData
	| ComputationExecuteStartData
	| ComputationExecuteEndData
	| ComputationDisposeData
	| SubscriptionAddData
	| SubscriptionRemoveData;

export interface ReactivityEvent<T extends EventType = EventType> {
	readonly id: string;
	readonly type: T;
	readonly timestamp: number;
	readonly nodeId: string;
	readonly data: T extends "signal-create"
		? SignalCreateData
		: T extends "signal-read"
			? SignalReadData
			: T extends "signal-write"
				? SignalWriteData
				: T extends "computation-create"
					? ComputationCreateData
					: T extends "computation-execute-start"
						? ComputationExecuteStartData
						: T extends "computation-execute-end"
							? ComputationExecuteEndData
							: T extends "computation-dispose"
								? ComputationDisposeData
								: T extends "subscription-add"
									? SubscriptionAddData
									: T extends "subscription-remove"
										? SubscriptionRemoveData
										: EventData;
}

export type EventCallback = (event: ReactivityEvent) => void;

export interface ReactivityTrackerAPI {
	getNodes(): ReadonlyMap<string, ReactiveNode>;
	getNode(id: string): ReactiveNode | undefined;
	getEdges(): ReadonlyMap<string, ReactiveEdge>;
	getEdgesByType(type: EdgeType): ReactiveEdge[];
	getEdgesForNode(nodeId: string): ReactiveEdge[];
	subscribe(callback: EventCallback): () => void;
	reset(): void;
}

export interface TrackedSignalOptions {
	name?: string;
	equals?: (prev: unknown, next: unknown) => boolean;
}

export interface TrackedMemoOptions<T> {
	name?: string;
	equals?: (prev: T, next: T) => boolean;
}

export interface TrackedEffectOptions {
	name?: string;
}

export type TrackedSignal<T> = [
	get: () => T,
	set: (v: T | ((prev: T) => T)) => void,
];

export type TrackedMemo<T> = () => T;

export type TrackedEffect = void;
