import { describe, expect, test } from "vitest";
import type { ReactivityEvent } from "../../types/events";
import { createStateReconstructor } from "../historicalState";

describe("historicalState", () => {
	test("reconstructs empty state at timestamp 0", () => {
		const events: ReactivityEvent[] = [];
		const reconstructor = createStateReconstructor(events);

		const state = reconstructor.reconstructAt(0);

		expect(state.timestamp).toBe(0);
		expect(state.activeNodes.size).toBe(0);
		expect(state.edges.length).toBe(0);
		expect(state.disposedNodeIds.size).toBe(0);
	});

	test("includes node created before timestamp", () => {
		const events: ReactivityEvent[] = [
			{
				id: "event-21",
				type: "signal-create",
				nodeId: "signal-1",
				timestamp: 100,
				data: { value: 0 },
			},
		];
		const reconstructor = createStateReconstructor(events);

		const state = reconstructor.reconstructAt(200);

		expect(state.activeNodes.has("signal-1")).toBe(true);
		const node = state.activeNodes.get("signal-1");
		expect(node?.value).toBe(0);
		expect(node?.createdAt).toBe(100);
	});

	test("excludes node created after timestamp", () => {
		const events: ReactivityEvent[] = [
			{
				id: "event-22",
				type: "signal-create",
				nodeId: "signal-1",
				timestamp: 200,
				data: { value: 0 },
			},
		];
		const reconstructor = createStateReconstructor(events);

		const state = reconstructor.reconstructAt(100);

		expect(state.activeNodes.has("signal-1")).toBe(false);
	});

	test("updates node value from signal-write", () => {
		const events: ReactivityEvent[] = [
			{
				id: "event-23",
				type: "signal-create",
				nodeId: "signal-1",
				timestamp: 100,
				data: { value: 0 },
			},
			{
				id: "event-24",
				type: "signal-write",
				nodeId: "signal-1",
				timestamp: 150,
				data: { newValue: 5, previousValue: 0 },
			},
		];
		const reconstructor = createStateReconstructor(events);

		const state = reconstructor.reconstructAt(200);

		const node = state.activeNodes.get("signal-1");
		expect(node?.value).toBe(5);
		expect(node?.lastUpdateTime).toBe(150);
	});

	test("excludes disposed node", () => {
		const events: ReactivityEvent[] = [
			{
				id: "event-25",
				type: "signal-create",
				nodeId: "signal-1",
				timestamp: 100,
				data: { value: 0 },
			},
			{
				id: "event-26",
				type: "computation-dispose",
				nodeId: "signal-1",
				timestamp: 150,
				data: {},
			},
		];
		const reconstructor = createStateReconstructor(events);

		const state = reconstructor.reconstructAt(200);

		expect(state.activeNodes.has("signal-1")).toBe(false);
		expect(state.disposedNodeIds.has("signal-1")).toBe(true);
	});

	test("includes node before disposal", () => {
		const events: ReactivityEvent[] = [
			{
				id: "event-27",
				type: "signal-create",
				nodeId: "signal-1",
				timestamp: 100,
				data: { value: 0 },
			},
			{
				id: "event-28",
				type: "computation-dispose",
				nodeId: "signal-1",
				timestamp: 200,
				data: {},
			},
		];
		const reconstructor = createStateReconstructor(events);

		const state = reconstructor.reconstructAt(150);

		expect(state.activeNodes.has("signal-1")).toBe(true);
		expect(state.disposedNodeIds.has("signal-1")).toBe(false);
	});

	test("tracks edges from subscription-add", () => {
		const events: ReactivityEvent[] = [
			{
				id: "event-29",
				type: "subscription-add",
				nodeId: "memo-1",
				timestamp: 100,
				data: {
					sourceId: "signal-1",
					},
			},
		];
		const reconstructor = createStateReconstructor(events);

		const state = reconstructor.reconstructAt(200);

		expect(state.edges.length).toBe(1);
		expect(state.edges[0].from).toBe("signal-1");
		expect(state.edges[0].to).toBe("memo-1");
	});

	test("caches snapshots for performance", () => {
		const events: ReactivityEvent[] = [
			{
				id: "event-30",
				type: "signal-create",
				nodeId: "signal-1",
				timestamp: 100,
				data: { value: 0 },
			},
		];
		const reconstructor = createStateReconstructor(events);

		reconstructor.reconstructAt(200);
		const stats1 = reconstructor.getCacheStats();

		reconstructor.reconstructAt(200);
		const stats2 = reconstructor.getCacheStats();

		expect(stats2.hits).toBeGreaterThan(stats1.hits);
	});

	test("clearCache removes cached snapshots", () => {
		const events: ReactivityEvent[] = [
			{
				id: "event-31",
				type: "signal-create",
				nodeId: "signal-1",
				timestamp: 100,
				data: { value: 0 },
			},
		];
		const reconstructor = createStateReconstructor(events);

		reconstructor.reconstructAt(200);
		reconstructor.clearCache();

		const stats = reconstructor.getCacheStats();
		expect(stats.size).toBe(0);
	});

	test("handles multiple signal writes", () => {
		const events: ReactivityEvent[] = [
			{
				id: "event-32",
				type: "signal-create",
				nodeId: "signal-1",
				timestamp: 100,
				data: { value: 0 },
			},
			{
				id: "event-33",
				type: "signal-write",
				nodeId: "signal-1",
				timestamp: 150,
				data: { newValue: 1, previousValue: 0 },
			},
			{
				id: "event-34",
				type: "signal-write",
				nodeId: "signal-1",
				timestamp: 200,
				data: { newValue: 2, previousValue: 1 },
			},
		];
		const reconstructor = createStateReconstructor(events);

		const state1 = reconstructor.reconstructAt(175);
		expect(state1.activeNodes.get("signal-1")?.value).toBe(1);

		const state2 = reconstructor.reconstructAt(250);
		expect(state2.activeNodes.get("signal-1")?.value).toBe(2);
	});
});
