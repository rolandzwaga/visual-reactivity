import { scaleUtc } from "d3-scale";
import { describe, expect, it } from "vitest";
import type { TimelineEvent, TimelineScale } from "../../types/timeline";
import {
	calculateEventDensity,
	clusterEvents,
	shouldCluster,
} from "../eventDensityAnalyzer";

describe("eventDensityAnalyzer", () => {
	const createEvent = (
		id: string,
		timestamp: number,
		nodeId: string,
	): TimelineEvent => ({
		id,
		type: "signal-write",
		timestamp,
		nodeId,
		data: { value: 1 as never, prevValue: 0 as never },
		batchId: null,
	});

	const createScale = (
		startTime: number,
		endTime: number,
		width: number,
	): TimelineScale => ({
		startTime,
		endTime,
		width,
		scale: scaleUtc().domain([startTime, endTime]).range([0, width]),
	});

	describe("calculateEventDensity", () => {
		it("should return 0 for empty events", () => {
			const scale = createScale(0, 1000, 500);
			const density = calculateEventDensity([], scale);
			expect(density).toBe(0);
		});

		it("should calculate events per 100px correctly", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
				createEvent("e3", 300, "node1"),
			];
			const scale = createScale(0, 1000, 200);

			const density = calculateEventDensity(events, scale);

			expect(density).toBe(1.5);
		});

		it("should handle single event", () => {
			const events = [createEvent("e1", 100, "node1")];
			const scale = createScale(0, 1000, 1000);

			const density = calculateEventDensity(events, scale);

			expect(density).toBe(0.1);
		});

		it("should scale density based on timeline width", () => {
			const events = Array.from({ length: 100 }, (_, i) =>
				createEvent(`e${i}`, i * 10, "node1"),
			);

			const scale1 = createScale(0, 1000, 1000);
			const scale2 = createScale(0, 1000, 500);

			const density1 = calculateEventDensity(events, scale1);
			const density2 = calculateEventDensity(events, scale2);

			expect(density2).toBeGreaterThan(density1);
		});
	});

	describe("shouldCluster", () => {
		it("should return false for empty events", () => {
			const scale = createScale(0, 1000, 500);
			expect(shouldCluster([], scale, 50)).toBe(false);
		});

		it("should return true when density exceeds threshold", () => {
			const events = Array.from({ length: 60 }, (_, i) =>
				createEvent(`e${i}`, i * 10, "node1"),
			);
			const scale = createScale(0, 1000, 100);

			expect(shouldCluster(events, scale, 50)).toBe(true);
		});

		it("should return false when density is below threshold", () => {
			const events = Array.from({ length: 10 }, (_, i) =>
				createEvent(`e${i}`, i * 10, "node1"),
			);
			const scale = createScale(0, 1000, 1000);

			expect(shouldCluster(events, scale, 50)).toBe(false);
		});

		it("should use custom threshold", () => {
			const events = Array.from({ length: 30 }, (_, i) =>
				createEvent(`e${i}`, i * 10, "node1"),
			);
			const scale = createScale(0, 1000, 100);

			expect(shouldCluster(events, scale, 20)).toBe(true);
			expect(shouldCluster(events, scale, 50)).toBe(false);
		});
	});

	describe("clusterEvents", () => {
		it("should return empty array for empty events", () => {
			const scale = createScale(0, 1000, 500);
			const clusters = clusterEvents([], "node1", scale);
			expect(clusters).toEqual([]);
		});

		it("should create single cluster for events", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
				createEvent("e3", 300, "node1"),
			];
			const scale = createScale(0, 1000, 500);

			const clusters = clusterEvents(events, "node1", scale);

			expect(clusters).toHaveLength(1);
			expect(clusters[0].nodeId).toBe("node1");
			expect(clusters[0].eventIds).toEqual(["e1", "e2", "e3"]);
			expect(clusters[0].eventCount).toBe(3);
			expect(clusters[0].timeRange).toEqual([100, 300]);
			expect(clusters[0].centerTime).toBe(200);
		});

		it("should calculate center time as midpoint", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 500, "node1"),
			];
			const scale = createScale(0, 1000, 500);

			const clusters = clusterEvents(events, "node1", scale);

			expect(clusters[0].centerTime).toBe(300);
		});

		it("should handle single event cluster", () => {
			const events = [createEvent("e1", 100, "node1")];
			const scale = createScale(0, 1000, 500);

			const clusters = clusterEvents(events, "node1", scale);

			expect(clusters).toHaveLength(1);
			expect(clusters[0].eventCount).toBe(1);
			expect(clusters[0].timeRange).toEqual([100, 100]);
			expect(clusters[0].centerTime).toBe(100);
		});

		it("should generate unique cluster IDs", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
			];
			const scale = createScale(0, 1000, 500);

			const clusters = clusterEvents(events, "node1", scale);

			expect(clusters[0].id).toMatch(/^cluster-/);
			expect(clusters[0].id).toContain("node1");
		});

		it("should filter events by nodeId", () => {
			const events = [
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node2"),
				createEvent("e3", 300, "node1"),
			];
			const scale = createScale(0, 1000, 500);

			const clusters = clusterEvents(events, "node1", scale);

			expect(clusters[0].eventIds).toEqual(["e1", "e3"]);
			expect(clusters[0].eventCount).toBe(2);
		});

		it("should sort events by timestamp in cluster", () => {
			const events = [
				createEvent("e3", 300, "node1"),
				createEvent("e1", 100, "node1"),
				createEvent("e2", 200, "node1"),
			];
			const scale = createScale(0, 1000, 500);

			const clusters = clusterEvents(events, "node1", scale);

			expect(clusters[0].eventIds).toEqual(["e1", "e2", "e3"]);
		});
	});
});
