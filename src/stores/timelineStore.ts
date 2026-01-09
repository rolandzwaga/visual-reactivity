import { scaleUtc } from "d3-scale";
import { createStore } from "solid-js/store";
import type { TimelineState } from "../types/timeline";

export interface TimelineStoreState extends TimelineState {
	selectedEventIds: Set<string>;
	hoveredEventId: string | null;
}

export function createInitialTimelineState(): TimelineStoreState {
	return {
		events: [],
		swimlanes: [],
		batches: [],
		clusters: [],
		cursor: {
			time: 0,
			x: 0,
			snappedEventId: null,
			isSnapped: false,
		},
		scale: {
			startTime: 0,
			endTime: 1000,
			width: 1000,
			scale: scaleUtc().domain([0, 1000]).range([0, 1000]),
		},
		filter: {
			enabledEventTypes: new Set([
				"signal-read",
				"signal-write",
				"computation-execute-start",
				"computation-execute-end",
				"computation-dispose",
			]),
			selectedNodeIds: null,
			searchQuery: "",
		},
		playback: {
			isPlaying: false,
			speed: 1,
			mode: "manual",
			lastTickTime: null,
			rafId: null,
		},
		liveMode: "live",
		selectedEventIds: new Set(),
		hoveredEventId: null,
	};
}

export const DEFAULT_TIMELINE_STATE = createInitialTimelineState;

export function createTimelineStore() {
	return createStore<TimelineStoreState>(createInitialTimelineState());
}
