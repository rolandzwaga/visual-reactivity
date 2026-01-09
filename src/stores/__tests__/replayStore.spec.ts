import { describe, expect, test } from "vitest";
import { testInRoot } from "../../__tests__/helpers";
import type { ReactivityEvent } from "../../types/events";
import { createReplayStore } from "../replayStore";

describe("ReplayStore", () => {
	test("initializes with live mode inactive state", () => {
		testInRoot(() => {
			const store = createReplayStore();
			const state = store.state();

			expect(state.active).toBe(false);
			expect(state.cursorTimestamp).toBeNull();
			expect(state.recordingId).toBeNull();
			expect(state.mode).toBe("live");
		});
	});

	test("setCursor activates replay mode", () => {
		testInRoot(() => {
			const store = createReplayStore();
			store.setCursor(1000);
			const state = store.state();

			expect(state.active).toBe(true);
			expect(state.cursorTimestamp).toBe(1000);
			expect(state.mode).toBe("live");
		});
	});

	test("setCursor throws on negative timestamp", () => {
		testInRoot(() => {
			const store = createReplayStore();
			expect(() => store.setCursor(-1)).toThrow();
		});
	});

	test("clearCursor deactivates replay mode", () => {
		testInRoot(() => {
			const store = createReplayStore();
			store.setCursor(1000);
			store.clearCursor();
			const state = store.state();

			expect(state.active).toBe(false);
			expect(state.cursorTimestamp).toBeNull();
		});
	});

	test("stepForward moves to next event", () => {
		testInRoot(() => {
			const store = createReplayStore();
			const events: ReactivityEvent[] = [
				{
					id: "event-1",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 100,
					data: { newValue: 1, previousValue: 0 },
				},
				{
					id: "event-2",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 200,
					data: { newValue: 2, previousValue: 1 },
				},
			];

			store.setCursor(100);
			const nextTime = store.stepForward(events);

			expect(nextTime).toBe(200);
			expect(store.state().cursorTimestamp).toBe(200);
		});
	});

	test("stepForward returns null at end", () => {
		testInRoot(() => {
			const store = createReplayStore();
			const events: ReactivityEvent[] = [
				{
					id: "event-3",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 100,
					data: { newValue: 1, previousValue: 0 },
				},
			];

			store.setCursor(100);
			const nextTime = store.stepForward(events);

			expect(nextTime).toBeNull();
		});
	});

	test("stepBackward moves to previous event", () => {
		testInRoot(() => {
			const store = createReplayStore();
			const events: ReactivityEvent[] = [
				{
					id: "event-4",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 100,
					data: { newValue: 1, previousValue: 0 },
				},
				{
					id: "event-5",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 200,
					data: { newValue: 2, previousValue: 1 },
				},
			];

			store.setCursor(200);
			const prevTime = store.stepBackward(events);

			expect(prevTime).toBe(100);
			expect(store.state().cursorTimestamp).toBe(100);
		});
	});

	test("stepBackward returns null at beginning", () => {
		testInRoot(() => {
			const store = createReplayStore();
			const events: ReactivityEvent[] = [
				{
					id: "event-6",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 100,
					data: { newValue: 1, previousValue: 0 },
				},
			];

			store.setCursor(100);
			const prevTime = store.stepBackward(events);

			expect(prevTime).toBeNull();
		});
	});

	test("jumpToStart sets cursor to first event", () => {
		testInRoot(() => {
			const store = createReplayStore();
			const events: ReactivityEvent[] = [
				{
					id: "event-7",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 100,
					data: { newValue: 1, previousValue: 0 },
				},
				{
					id: "event-8",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 200,
					data: { newValue: 2, previousValue: 1 },
				},
			];

			store.jumpToStart(events);

			expect(store.state().cursorTimestamp).toBe(100);
			expect(store.state().active).toBe(true);
		});
	});

	test("jumpToEnd sets cursor to last event", () => {
		testInRoot(() => {
			const store = createReplayStore();
			const events: ReactivityEvent[] = [
				{
					id: "event-9",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 100,
					data: { newValue: 1, previousValue: 0 },
				},
				{
					id: "event-10",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 200,
					data: { newValue: 2, previousValue: 1 },
				},
			];

			store.jumpToEnd(events);

			expect(store.state().cursorTimestamp).toBe(200);
			expect(store.state().active).toBe(true);
		});
	});

	test("loadRecording switches to replay mode", () => {
		testInRoot(() => {
			const store = createReplayStore();
			const recording = {
				id: 1,
				name: "Test Recording",
				dateCreated: Date.now(),
				eventCount: 2,
				duration: 100,
				version: "1.0.0",
				events: [],
			};

			store.loadRecording(recording);
			const state = store.state();

			expect(state.mode).toBe("replay");
			expect(state.recordingId).toBe(1);
			expect(state.active).toBe(false);
			expect(state.cursorTimestamp).toBeNull();
		});
	});

	test("unloadRecording returns to live mode", () => {
		testInRoot(() => {
			const store = createReplayStore();
			const recording = {
				id: 1,
				name: "Test Recording",
				dateCreated: Date.now(),
				eventCount: 2,
				duration: 100,
				version: "1.0.0",
				events: [],
			};

			store.loadRecording(recording);
			store.unloadRecording();
			const state = store.state();

			expect(state.mode).toBe("live");
			expect(state.recordingId).toBeNull();
			expect(state.active).toBe(false);
		});
	});

	test("subscribe receives state changes", () => {
		testInRoot(() => {
			const store = createReplayStore();
			const states: any[] = [];
			store.subscribe((state) => states.push({ ...state }));

			store.setCursor(1000);

			expect(states.length).toBeGreaterThan(0);
			expect(states[states.length - 1].cursorTimestamp).toBe(1000);
		});
	});
});
