import { scaleBand } from "d3-scale";
import { createMemo, createSignal } from "solid-js";
import { createTimelineScale } from "../../d3/timelineScale";
import type { ReactiveNode } from "../../types/nodes";
import type {
	Swimlane,
	TimelineEvent,
	TimelineScale,
} from "../../types/timeline";
import { NODE_COLORS, TIMELINE_DEFAULTS } from "../../types/timeline";

export interface UseTimelineLayoutProps {
	events: TimelineEvent[];
	nodes: ReactiveNode[];
	width: number;
	height: number;
}

export function useTimelineLayout(props: UseTimelineLayoutProps) {
	const [dimensions, setDimensions] = createSignal({
		width: props.width,
		height: props.height,
	});

	const scale = createMemo((): TimelineScale => {
		const timestamps = props.events.map((e) => e.timestamp);
		const startTime = timestamps.length > 0 ? Math.min(...timestamps) : 0;
		const endTime = timestamps.length > 0 ? Math.max(...timestamps) : 1000;

		return createTimelineScale({
			startTime,
			endTime,
			width: dimensions().width,
		});
	});

	const swimlanes = createMemo((): Swimlane[] => {
		if (props.nodes.length === 0) {
			return [];
		}

		const yScale = scaleBand()
			.domain(props.nodes.map((n) => n.id))
			.range([0, dimensions().height])
			.padding(TIMELINE_DEFAULTS.SWIMLANE_PADDING);

		return props.nodes.map((node) => ({
			nodeId: node.id,
			nodeName: node.name ?? null,
			nodeType: node.type,
			yPosition: yScale(node.id) ?? 0,
			height: yScale.bandwidth(),
			isDisposed: false,
			disposalTime: null,
			color:
				NODE_COLORS[node.type as keyof typeof NODE_COLORS] ??
				NODE_COLORS.unknown,
		}));
	});

	const resize = (width: number, height: number) => {
		setDimensions({ width, height });
	};

	return {
		swimlanes,
		scale,
		resize,
	};
}
