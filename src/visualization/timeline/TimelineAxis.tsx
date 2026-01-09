import { select } from "d3-selection";
import { type Component, onMount } from "solid-js";
import { createTimelineAxis } from "../../d3/timelineAxis";
import type { TimelineScale } from "../../types/timeline";
import styles from "./TimelineAxis.module.css";

export interface TimelineAxisProps {
	scale: TimelineScale;
}

export const TimelineAxis: Component<TimelineAxisProps> = (props) => {
	let axisRef: SVGGElement | undefined;

	onMount(() => {
		if (!axisRef) return;

		const axis = createTimelineAxis(props.scale);
		select(axisRef).call(axis);
	});

	return <g ref={axisRef} class={styles.axis} />;
};
