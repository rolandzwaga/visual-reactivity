import type { Axis, AxisScale } from "d3-axis";
import { axisBottom } from "d3-axis";
import type { TimelineScale } from "../types/timeline";

export function createTimelineAxis(
	timelineScale: TimelineScale,
): Axis<Date | number> {
	return axisBottom(timelineScale.scale as AxisScale<Date | number>)
		.ticks(5)
		.tickFormat((d) => {
			const date = new Date(d as number);
			const ms = date.getMilliseconds();
			const sec = date.getSeconds();
			const min = date.getMinutes();
			const hour = date.getHours();

			if (ms !== 0) return `${ms}ms`;
			if (sec !== 0) return `${sec}s`;
			if (min !== 0) return `${min}m`;
			if (hour !== 0) return `${hour}h`;
			return date.toLocaleDateString();
		});
}
