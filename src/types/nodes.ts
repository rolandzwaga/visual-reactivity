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
	sources: string[];
	observers: string[];
	owner: string | null;
	owned: string[];
}

export function createReactiveNode(
	id: string,
	type: NodeType,
	name: string | null,
	value: unknown,
): ReactiveNode {
	return {
		id,
		type,
		name,
		value,
		isStale: false,
		isExecuting: false,
		executionCount: 0,
		createdAt: Date.now(),
		lastExecutedAt: null,
		disposedAt: null,
		sources: [],
		observers: [],
		owner: null,
		owned: [],
	};
}
