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

export interface ReactivityEvent {
	readonly id: string;
	readonly type: EventType;
	readonly timestamp: number;
	readonly nodeId: string;
	readonly data: EventData;
}

export function createReactivityEvent(
	id: string,
	type: EventType,
	nodeId: string,
	data: EventData,
): ReactivityEvent {
	return {
		id,
		type,
		timestamp: Date.now(),
		nodeId,
		data,
	};
}
