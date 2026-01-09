import { describe, expect, it } from "vitest";
import { createTimelineScale } from "../timelineScale";

describe("createTimelineScale", () => {
	it("creates a time scale with given domain and range", () => {
		const scale = createTimelineScale({
			startTime: 0,
			endTime: 1000,
			width: 500,
		});

		expect(scale).toBeDefined();
		expect(scale.startTime).toBe(0);
		expect(scale.endTime).toBe(1000);
		expect(scale.width).toBe(500);
		expect(scale.scale(0)).toBe(0);
		expect(scale.scale(1000)).toBe(500);
	});

	it("maps timestamps to pixel positions correctly", () => {
		const scale = createTimelineScale({
			startTime: 0,
			endTime: 1000,
			width: 1000,
		});

		expect(scale.scale(500)).toBe(500);
		expect(scale.scale(250)).toBe(250);
		expect(scale.scale(750)).toBe(750);
	});

	it("handles non-zero start times", () => {
		const scale = createTimelineScale({
			startTime: 100,
			endTime: 200,
			width: 500,
		});

		expect(scale.scale(100)).toBe(0);
		expect(scale.scale(200)).toBe(500);
		expect(scale.scale(150)).toBe(250);
	});

	it("clamps values when clamp option is true", () => {
		const scale = createTimelineScale({
			startTime: 0,
			endTime: 1000,
			width: 500,
			clamp: true,
		});

		expect(scale.scale(-100)).toBe(0);
		expect(scale.scale(1500)).toBe(500);
	});

	it("allows extrapolation when clamp is false", () => {
		const scale = createTimelineScale({
			startTime: 0,
			endTime: 1000,
			width: 500,
			clamp: false,
		});

		expect(scale.scale(-100)).toBeLessThan(0);
		expect(scale.scale(1500)).toBeGreaterThan(500);
	});
});
