import { describe, expect, it } from "vitest";
import {
	easeBounceOut,
	easeCubicIn,
	easeCubicInOut,
	easeCubicOut,
	easeElasticOut,
	easeLinear,
	easeQuadIn,
	easeQuadInOut,
	easeQuadOut,
} from "../easing";

describe("easing", () => {
	describe("easeLinear", () => {
		it("should return input unchanged", () => {
			expect(easeLinear(0)).toBe(0);
			expect(easeLinear(0.5)).toBe(0.5);
			expect(easeLinear(1)).toBe(1);
		});
	});

	describe("easeQuadIn", () => {
		it("should start slow and accelerate", () => {
			expect(easeQuadIn(0)).toBe(0);
			expect(easeQuadIn(0.5)).toBeLessThan(0.5);
			expect(easeQuadIn(1)).toBe(1);
		});
	});

	describe("easeQuadOut", () => {
		it("should start fast and decelerate", () => {
			expect(easeQuadOut(0)).toBe(0);
			expect(easeQuadOut(0.5)).toBeGreaterThan(0.5);
			expect(easeQuadOut(1)).toBe(1);
		});
	});

	describe("easeQuadInOut", () => {
		it("should ease in and out symmetrically", () => {
			expect(easeQuadInOut(0)).toBe(0);
			expect(easeQuadInOut(0.5)).toBeCloseTo(0.5, 5);
			expect(easeQuadInOut(1)).toBe(1);
		});
	});

	describe("easeCubicIn", () => {
		it("should provide cubic ease in", () => {
			expect(easeCubicIn(0)).toBe(0);
			expect(easeCubicIn(1)).toBe(1);
		});
	});

	describe("easeCubicOut", () => {
		it("should provide cubic ease out", () => {
			expect(easeCubicOut(0)).toBe(0);
			expect(easeCubicOut(1)).toBe(1);
		});
	});

	describe("easeCubicInOut", () => {
		it("should provide cubic ease in-out", () => {
			expect(easeCubicInOut(0)).toBe(0);
			expect(easeCubicInOut(0.5)).toBeCloseTo(0.5, 5);
			expect(easeCubicInOut(1)).toBe(1);
		});
	});

	describe("easeElasticOut", () => {
		it("should overshoot then settle", () => {
			expect(easeElasticOut(0)).toBe(0);
			expect(easeElasticOut(1)).toBeCloseTo(1, 5);
		});
	});

	describe("easeBounceOut", () => {
		it("should bounce at the end", () => {
			expect(easeBounceOut(0)).toBe(0);
			expect(easeBounceOut(1)).toBe(1);
		});
	});

	describe("all easing functions", () => {
		const easingFunctions = [
			easeLinear,
			easeQuadIn,
			easeQuadOut,
			easeQuadInOut,
			easeCubicIn,
			easeCubicOut,
			easeCubicInOut,
			easeElasticOut,
			easeBounceOut,
		];

		it("should all return 0 for input 0", () => {
			for (const fn of easingFunctions) {
				expect(fn(0)).toBe(0);
			}
		});

		it("should all return approximately 1 for input 1", () => {
			for (const fn of easingFunctions) {
				expect(fn(1)).toBeCloseTo(1, 3);
			}
		});

		it("should return values in reasonable range for mid values", () => {
			for (const fn of easingFunctions) {
				const mid = fn(0.5);
				expect(mid).toBeGreaterThanOrEqual(-0.5);
				expect(mid).toBeLessThanOrEqual(1.5);
			}
		});
	});
});
