import type { TimelineEvent } from "../types/timeline";

export function findNextEvent(
	events: TimelineEvent[],
	currentTime: number,
): TimelineEvent | null {
	if (events.length === 0) {
		return null;
	}

	const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

	for (const event of sortedEvents) {
		if (event.timestamp > currentTime) {
			return event;
		}
	}

	return null;
}

export function findPreviousEvent(
	events: TimelineEvent[],
	currentTime: number,
): TimelineEvent | null {
	if (events.length === 0) {
		return null;
	}

	const sortedEvents = [...events].sort((a, b) => b.timestamp - a.timestamp);

	for (const event of sortedEvents) {
		if (event.timestamp < currentTime) {
			return event;
		}
	}

	return null;
}

export function jumpToStart(events: TimelineEvent[]): number {
	if (events.length === 0) {
		return 0;
	}

	const timestamps = events.map((e) => e.timestamp);
	return Math.min(...timestamps);
}

export function jumpToEnd(events: TimelineEvent[]): number {
	if (events.length === 0) {
		return 0;
	}

	const timestamps = events.map((e) => e.timestamp);
	return Math.max(...timestamps);
}
