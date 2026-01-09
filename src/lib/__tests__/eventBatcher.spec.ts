import { describe, expect, it } from "vitest";
import type { TimelineEvent } from "../../types/timeline";
import { batchEvents } from "../eventBatcher";

describe("eventBatcher", () => {
	const createEvent = (
		id: string,
		timestamp: number,
		nodeId: string,
	): TimelineEvent => ({
		id,
		type: "signal-write",
		timestamp,
		nodeId,
		data: { value: 1, prevValue: 0 },
		batchId: null,
	});

	describe("batchEvents", () => {
		it("should return empty array for empty events", () => {
			const result = batchEvents([]);
			expect(result.events).toEqual([]);
			expect(result.batches).toEqual([]);
		});

		it("should not batch single event", () => {
			const event = createEvent("e1", 100, "node1");
			const result = batchEvents([event]);

			expect(result.events).toHaveLength(1);
			expect(result.events[0].batchId).toBeNull();
			expect(result.batches).toHaveLength(0);
		});

		it("should batch events within 50ms threshold", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 120, "node2"),
				createEvent("e3", 140, "node3"),
			];

			const result = batchEvents(events);

			expect(result.batches).toHaveLength(1);
			expect(result.batches[0].eventIds).toEqual(["e1", "e2", "e3"]);
			expect(result.batches[0].startTime).toBe(100);
			expect(result.batches[0].endTime).toBe(140);
			expect(result.batches[0].duration).toBe(40);
			expect(result.batches[0].eventCount).toBe(3);

			expect(result.events[0].batchId).toBe(result.batches[0].id);
			expect(result.events[1].batchId).toBe(result.batches[0].id);
			expect(result.events[2].batchId).toBe(result.batches[0].id);
		});

		it("should not batch events beyond 50ms threshold", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node2"),
			];

			const result = batchEvents(events);

			expect(result.batches).toHaveLength(0);
			expect(result.events[0].batchId).toBeNull();
			expect(result.events[1].batchId).toBeNull();
		});

		it("should create multiple batches for separate groups", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 120, "node2"),
				createEvent("e3", 300, "node3"),
				createEvent("e4", 320, "node4"),
			];

			const result = batchEvents(events);

			expect(result.batches).toHaveLength(2);
			expect(result.batches[0].eventIds).toEqual(["e1", "e2"]);
			expect(result.batches[1].eventIds).toEqual(["e3", "e4"]);
		});

		it("should handle custom maxDelta threshold", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 140, "node2"),
			];

			const result = batchEvents(events, { maxDelta: 30 });

			expect(result.batches).toHaveLength(0);
		});

		it("should respect minEvents threshold", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 120, "node2"),
			];

			const result = batchEvents(events, { minEvents: 3 });

			expect(result.batches).toHaveLength(0);
			expect(result.events[0].batchId).toBeNull();
		});

		it("should handle events with identical timestamps", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 100, "node2"),
				createEvent("e3", 100, "node3"),
			];

			const result = batchEvents(events);

			expect(result.batches).toHaveLength(1);
			expect(result.batches[0].duration).toBe(0);
			expect(result.batches[0].eventCount).toBe(3);
		});

		it("should generate unique batch IDs", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 120, "node2"),
				createEvent("e3", 300, "node3"),
				createEvent("e4", 320, "node4"),
			];

			const result = batchEvents(events);

			const batchIds = result.batches.map((b) => b.id);
			const uniqueIds = new Set(batchIds);
			expect(uniqueIds.size).toBe(batchIds.length);
		});

		it("should handle unsorted events by sorting them first", () => {
			const events = [
				createEvent("e3", 140, "node3"),
				createEvent("e1", 100, "node1"),
				createEvent("e2", 120, "node2"),
			];

			const result = batchEvents(events);

			expect(result.batches).toHaveLength(1);
			expect(result.batches[0].eventIds).toEqual(["e1", "e2", "e3"]);
		});

		it("should preserve event order in batches", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 110, "node2"),
				createEvent("e3", 120, "node3"),
				createEvent("e4", 130, "node4"),
			];

			const result = batchEvents(events);

			expect(result.events[0].id).toBe("e1");
			expect(result.events[1].id).toBe("e2");
			expect(result.events[2].id).toBe("e3");
			expect(result.events[3].id).toBe("e4");
		});
	});
});
