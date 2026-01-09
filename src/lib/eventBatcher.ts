import type {
	EventBatch,
	EventBatchOptions,
	TimelineEvent,
} from "../types/timeline";

export interface BatchEventsResult {
	events: TimelineEvent[];
	batches: EventBatch[];
}

export function batchEvents(
	events: TimelineEvent[],
	options: EventBatchOptions = {},
): BatchEventsResult {
	const { maxDelta = 50, minEvents = 2 } = options;

	if (events.length === 0) {
		return { events: [], batches: [] };
	}

	const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

	const batches: EventBatch[] = [];
	let currentBatch: TimelineEvent[] = [];

	for (const event of sortedEvents) {
		if (currentBatch.length === 0) {
			currentBatch.push(event);
			continue;
		}

		const firstTimestamp = currentBatch[0].timestamp;
		const delta = event.timestamp - firstTimestamp;

		if (delta <= maxDelta) {
			currentBatch.push(event);
		} else {
			if (currentBatch.length >= minEvents) {
				batches.push(createBatch(currentBatch));
			}
			currentBatch = [event];
		}
	}

	if (currentBatch.length >= minEvents) {
		batches.push(createBatch(currentBatch));
	}

	const batchIdMap = new Map<string, string>();
	for (const batch of batches) {
		for (const eventId of batch.eventIds) {
			batchIdMap.set(eventId, batch.id);
		}
	}

	const eventsWithBatchIds = sortedEvents.map((event) => ({
		...event,
		batchId: batchIdMap.get(event.id) ?? null,
	}));

	return {
		events: eventsWithBatchIds,
		batches,
	};
}

function createBatch(events: TimelineEvent[]): EventBatch {
	const timestamps = events.map((e) => e.timestamp);
	const startTime = Math.min(...timestamps);
	const endTime = Math.max(...timestamps);

	return {
		id: `batch-${startTime}-${events.length}`,
		startTime,
		endTime,
		duration: endTime - startTime,
		eventIds: events.map((e) => e.id),
		eventCount: events.length,
	};
}
