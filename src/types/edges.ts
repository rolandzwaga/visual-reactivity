export type EdgeType = "dependency" | "ownership";

export interface ReactiveEdge {
	readonly id: string;
	readonly type: EdgeType;
	readonly source: string;
	readonly target: string;
	lastTriggeredAt: number | null;
	triggerCount: number;
}

export function createReactiveEdge(
	type: EdgeType,
	source: string,
	target: string,
): ReactiveEdge {
	return {
		id: `${type}-${source}-${target}`,
		type,
		source,
		target,
		lastTriggeredAt: null,
		triggerCount: 0,
	};
}
