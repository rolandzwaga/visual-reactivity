import { scaleUtc } from "d3-scale";
import type { TimelineScale, TimelineScaleOptions } from "../types/timeline";

export function createTimelineScale(
	options: TimelineScaleOptions,
): TimelineScale {
	const { startTime, endTime, width, nice = false, clamp = false } = options;

	let scale = scaleUtc()
		.domain([new Date(startTime), new Date(endTime)])
		.range([0, width]);

	if (nice) {
		scale = scale.nice();
	}

	if (clamp) {
		scale = scale.clamp(true);
	}

	return {
		startTime,
		endTime,
		width,
		scale: scale as TimelineScale["scale"],
	};
}
