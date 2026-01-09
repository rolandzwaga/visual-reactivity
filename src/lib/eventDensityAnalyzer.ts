import type {
	EventCluster,
	TimelineEvent,
	TimelineScale,
} from "../types/timeline";

export function calculateEventDensity(
	events: TimelineEvent[],
	scale: TimelineScale,
): number {
	if (events.length === 0) {
		return 0;
	}

	return (events.length / scale.width) * 100;
}

export function shouldCluster(
	events: TimelineEvent[],
	scale: TimelineScale,
	densityThreshold: number,
): boolean {
	if (events.length === 0) {
		return false;
	}

	const density = calculateEventDensity(events, scale);
	return density > densityThreshold;
}

export function clusterEvents(
	events: TimelineEvent[],
	nodeId: string,
	scale: TimelineScale,
): EventCluster[] {
	const nodeEvents = events
		.filter((e) => e.nodeId === nodeId)
		.sort((a, b) => a.timestamp - b.timestamp);

	if (nodeEvents.length === 0) {
		return [];
	}

	const timestamps = nodeEvents.map((e) => e.timestamp);
	const startTime = Math.min(...timestamps);
	const endTime = Math.max(...timestamps);
	const centerTime = (startTime + endTime) / 2;

	const cluster: EventCluster = {
		id: `cluster-${nodeId}-${startTime}-${nodeEvents.length}`,
		centerTime,
		timeRange: [startTime, endTime],
		eventIds: nodeEvents.map((e) => e.id),
		eventCount: nodeEvents.length,
		nodeId,
	};

	return [cluster];
}
