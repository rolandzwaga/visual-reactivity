import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactivityEvent } from "../types";
import { tracker } from "./tracker";

describe("Event Emission", () => {
	beforeEach(() => {
		tracker.reset();
	});

	it("should emit events to subscribers", () => {
		const callback = vi.fn();
		tracker.subscribe(callback);

		tracker.emit("signal-create", "signal-1", { value: 42 });

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "signal-create",
				nodeId: "signal-1",
				data: { value: 42 },
			}),
		);
	});

	it("should include timestamp and ID in events", () => {
		const callback = vi.fn();
		tracker.subscribe(callback);

		const before = Date.now();
		tracker.emit("signal-read", "signal-1", { value: 10 });
		const after = Date.now();

		const event = callback.mock.calls[0][0] as ReactivityEvent;
		expect(event.id).toMatch(/^event-\d+$/);
		expect(event.timestamp).toBeGreaterThanOrEqual(before);
		expect(event.timestamp).toBeLessThanOrEqual(after);
	});

	it("should allow unsubscribing", () => {
		const callback = vi.fn();
		const unsubscribe = tracker.subscribe(callback);

		tracker.emit("signal-read", "signal-1", { value: 1 });
		expect(callback).toHaveBeenCalledTimes(1);

		unsubscribe();

		tracker.emit("signal-read", "signal-1", { value: 2 });
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it("should deliver events to multiple subscribers", () => {
		const callback1 = vi.fn();
		const callback2 = vi.fn();

		tracker.subscribe(callback1);
		tracker.subscribe(callback2);

		tracker.emit("signal-write", "signal-1", { previousValue: 1, newValue: 2 });

		expect(callback1).toHaveBeenCalledTimes(1);
		expect(callback2).toHaveBeenCalledTimes(1);

		const eventReceivedBySubscriber1 = callback1.mock
			.calls[0][0] as ReactivityEvent;
		const eventReceivedBySubscriber2 = callback2.mock
			.calls[0][0] as ReactivityEvent;
		expect(eventReceivedBySubscriber1.id).toBe(eventReceivedBySubscriber2.id);
		expect(eventReceivedBySubscriber1.type).toBe(
			eventReceivedBySubscriber2.type,
		);
	});

	it("should deliver events in emission order", () => {
		const events: ReactivityEvent[] = [];
		tracker.subscribe((e) => events.push(e));

		tracker.emit("signal-create", "signal-1", { value: 1 });
		tracker.emit("signal-read", "signal-1", { value: 1 });
		tracker.emit("signal-write", "signal-1", { previousValue: 1, newValue: 2 });
		tracker.emit("signal-read", "signal-1", { value: 2 });

		expect(events.length).toBe(4);
		expect(events[0].type).toBe("signal-create");
		expect(events[1].type).toBe("signal-read");
		expect(events[2].type).toBe("signal-write");
		expect(events[3].type).toBe("signal-read");

		for (let i = 1; i < events.length; i++) {
			const currentTimestamp = events[i].timestamp;
			const previousTimestamp = events[i - 1].timestamp;
			expect(currentTimestamp).toBeGreaterThanOrEqual(previousTimestamp);
		}
	});
});
