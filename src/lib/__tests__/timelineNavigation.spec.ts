import { describe, expect, it } from "vitest";
import type { TimelineEvent } from "../../types/timeline";
import {
	findNextEvent,
	findPreviousEvent,
	jumpToEnd,
	jumpToStart,
} from "../timelineNavigation";

describe("timelineNavigation", () => {
	const createEvent = (
		id: string,
		timestamp: number,
		nodeId: string,
	): TimelineEvent => ({
		id,
		type: "signal-write",
		timestamp,
		nodeId,
		data: { newValue: 1, previousValue: 0 },
		batchId: null,
	});

	describe("findNextEvent", () => {
		it("should return null for empty events", () => {
			const result = findNextEvent([], 100);
			expect(result).toBeNull();
		});

		it("should find next event after current time", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
				createEvent("e3", 300, "node1"),
			];

			const result = findNextEvent(events, 150);

			expect(result).not.toBeNull();
			expect(result?.id).toBe("e2");
			expect(result?.timestamp).toBe(200);
		});

		it("should return first event if current time is before all events", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
			];

			const result = findNextEvent(events, 50);

			expect(result?.id).toBe("e1");
		});

		it("should return null if current time is after all events", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
			];

			const result = findNextEvent(events, 300);

			expect(result).toBeNull();
		});

		it("should skip events at exact current time", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
				createEvent("e3", 300, "node1"),
			];

			const result = findNextEvent(events, 200);

			expect(result?.id).toBe("e3");
		});

		it("should handle unsorted events", () => {
			const events = [
				createEvent("e3", 300, "node1"),
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
			];

			const result = findNextEvent(events, 150);

			expect(result?.id).toBe("e2");
		});
	});

	describe("findPreviousEvent", () => {
		it("should return null for empty events", () => {
			const result = findPreviousEvent([], 100);
			expect(result).toBeNull();
		});

		it("should find previous event before current time", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
				createEvent("e3", 300, "node1"),
			];

			const result = findPreviousEvent(events, 250);

			expect(result).not.toBeNull();
			expect(result?.id).toBe("e2");
			expect(result?.timestamp).toBe(200);
		});

		it("should return null if current time is before all events", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
			];

			const result = findPreviousEvent(events, 50);

			expect(result).toBeNull();
		});

		it("should return last event if current time is after all events", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
			];

			const result = findPreviousEvent(events, 300);

			expect(result?.id).toBe("e2");
		});

		it("should skip events at exact current time", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
				createEvent("e3", 300, "node1"),
			];

			const result = findPreviousEvent(events, 200);

			expect(result?.id).toBe("e1");
		});

		it("should handle unsorted events", () => {
			const events = [
				createEvent("e3", 300, "node1"),
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
			];

			const result = findPreviousEvent(events, 250);

			expect(result?.id).toBe("e2");
		});
	});

	describe("jumpToStart", () => {
		it("should return 0 for empty events", () => {
			const result = jumpToStart([]);
			expect(result).toBe(0);
		});

		it("should return first event timestamp", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
				createEvent("e3", 300, "node1"),
			];

			const result = jumpToStart(events);

			expect(result).toBe(100);
		});

		it("should handle unsorted events", () => {
			const events = [
				createEvent("e3", 300, "node1"),
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
			];

			const result = jumpToStart(events);

			expect(result).toBe(100);
		});

		it("should handle single event", () => {
			const events = [createEvent("e1", 100, "node1")];

			const result = jumpToStart(events);

			expect(result).toBe(100);
		});
	});

	describe("jumpToEnd", () => {
		it("should return 0 for empty events", () => {
			const result = jumpToEnd([]);
			expect(result).toBe(0);
		});

		it("should return last event timestamp", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
				createEvent("e3", 300, "node1"),
			];

			const result = jumpToEnd(events);

			expect(result).toBe(300);
		});

		it("should handle unsorted events", () => {
			const events = [
				createEvent("e3", 300, "node1"),
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
			];

			const result = jumpToEnd(events);

			expect(result).toBe(300);
		});

		it("should handle single event", () => {
			const events = [createEvent("e1", 100, "node1")];

			const result = jumpToEnd(events);

			expect(result).toBe(100);
		});
	});
});
