import { describe, expect, it } from "vitest";
import { calculateVisibleRange } from "../virtualScroller";

describe("virtualScroller", () => {
	describe("calculateVisibleRange", () => {
		const ITEM_HEIGHT = 50;
		const BUFFER_SIZE = 5;

		it("should calculate visible range for scroll position 0", () => {
			const result = calculateVisibleRange({
				scrollTop: 0,
				viewportHeight: 500,
				itemHeight: ITEM_HEIGHT,
				totalItems: 100,
				bufferSize: BUFFER_SIZE,
			});

			expect(result.start).toBe(0);
			// viewport shows 10 items (500 / 50), +5 buffer = 15
			expect(result.end).toBe(15);
		});

		it("should calculate visible range for middle scroll position", () => {
			const result = calculateVisibleRange({
				scrollTop: 1000, // Item 20 starts here
				viewportHeight: 500,
				itemHeight: ITEM_HEIGHT,
				totalItems: 100,
				bufferSize: BUFFER_SIZE,
			});

			// Start: floor(1000/50) - 5 = 20 - 5 = 15
			expect(result.start).toBe(15);
			// End: ceil((1000 + 500) / 50) + 5 = 30 + 5 = 35
			expect(result.end).toBe(35);
		});

		it("should calculate visible range near end of list", () => {
			const result = calculateVisibleRange({
				scrollTop: 4500, // Near bottom
				viewportHeight: 500,
				itemHeight: ITEM_HEIGHT,
				totalItems: 100,
				bufferSize: BUFFER_SIZE,
			});

			// Start: floor(4500/50) - 5 = 90 - 5 = 85
			expect(result.start).toBe(85);
			// End: min(ceil((4500 + 500) / 50) + 5, 100) = min(105, 100) = 100
			expect(result.end).toBe(100);
		});

		it("should not allow start index below 0", () => {
			const result = calculateVisibleRange({
				scrollTop: 50, // Very close to top
				viewportHeight: 500,
				itemHeight: ITEM_HEIGHT,
				totalItems: 100,
				bufferSize: BUFFER_SIZE,
			});

			// Start: max(floor(50/50) - 5, 0) = max(1 - 5, 0) = 0
			expect(result.start).toBeGreaterThanOrEqual(0);
		});

		it("should not allow end index to exceed total items", () => {
			const result = calculateVisibleRange({
				scrollTop: 4800,
				viewportHeight: 500,
				itemHeight: ITEM_HEIGHT,
				totalItems: 100,
				bufferSize: BUFFER_SIZE,
			});

			expect(result.end).toBeLessThanOrEqual(100);
			expect(result.end).toBe(100);
		});

		it("should handle small lists that fit in viewport", () => {
			const result = calculateVisibleRange({
				scrollTop: 0,
				viewportHeight: 500,
				itemHeight: ITEM_HEIGHT,
				totalItems: 5, // Only 5 items total
				bufferSize: BUFFER_SIZE,
			});

			expect(result.start).toBe(0);
			expect(result.end).toBe(5);
		});

		it("should handle empty list", () => {
			const result = calculateVisibleRange({
				scrollTop: 0,
				viewportHeight: 500,
				itemHeight: ITEM_HEIGHT,
				totalItems: 0,
				bufferSize: BUFFER_SIZE,
			});

			expect(result.start).toBe(0);
			expect(result.end).toBe(0);
		});

		it("should handle single item", () => {
			const result = calculateVisibleRange({
				scrollTop: 0,
				viewportHeight: 500,
				itemHeight: ITEM_HEIGHT,
				totalItems: 1,
				bufferSize: BUFFER_SIZE,
			});

			expect(result.start).toBe(0);
			expect(result.end).toBe(1);
		});

		it("should handle zero buffer size", () => {
			const result = calculateVisibleRange({
				scrollTop: 1000,
				viewportHeight: 500,
				itemHeight: ITEM_HEIGHT,
				totalItems: 100,
				bufferSize: 0,
			});

			// Start: floor(1000/50) = 20
			expect(result.start).toBe(20);
			// End: ceil((1000 + 500) / 50) = 30
			expect(result.end).toBe(30);
		});

		it("should handle large buffer size", () => {
			const result = calculateVisibleRange({
				scrollTop: 1000,
				viewportHeight: 500,
				itemHeight: ITEM_HEIGHT,
				totalItems: 100,
				bufferSize: 50,
			});

			// Should clamp to valid range
			expect(result.start).toBeGreaterThanOrEqual(0);
			expect(result.end).toBeLessThanOrEqual(100);
		});

		it("should handle fractional scroll positions", () => {
			const result = calculateVisibleRange({
				scrollTop: 123.456,
				viewportHeight: 500,
				itemHeight: ITEM_HEIGHT,
				totalItems: 100,
				bufferSize: BUFFER_SIZE,
			});

			expect(result.start).toBeGreaterThanOrEqual(0);
			expect(result.end).toBeLessThanOrEqual(100);
			expect(Number.isInteger(result.start)).toBe(true);
			expect(Number.isInteger(result.end)).toBe(true);
		});

		it("should handle different item heights", () => {
			const result = calculateVisibleRange({
				scrollTop: 1000,
				viewportHeight: 600,
				itemHeight: 75, // Taller items
				totalItems: 100,
				bufferSize: BUFFER_SIZE,
			});

			// Start: floor(1000/75) - 5 = 13 - 5 = 8
			expect(result.start).toBe(8);
			// End: ceil((1000 + 600) / 75) + 5 = 22 + 5 = 27
			expect(result.end).toBe(27);
		});

		it("should ensure end is always greater than or equal to start", () => {
			const result = calculateVisibleRange({
				scrollTop: 0,
				viewportHeight: 500,
				itemHeight: ITEM_HEIGHT,
				totalItems: 100,
				bufferSize: BUFFER_SIZE,
			});

			expect(result.end).toBeGreaterThanOrEqual(result.start);
		});

		it("should calculate total height correctly", () => {
			const result = calculateVisibleRange({
				scrollTop: 500,
				viewportHeight: 500,
				itemHeight: ITEM_HEIGHT,
				totalItems: 100,
				bufferSize: BUFFER_SIZE,
			});

			// Total height should be totalItems * itemHeight
			const totalHeight = 100 * ITEM_HEIGHT;
			expect(totalHeight).toBe(5000);

			// Range should be valid for this total height
			expect(result.end * ITEM_HEIGHT).toBeLessThanOrEqual(
				totalHeight + ITEM_HEIGHT,
			);
		});
	});

	describe("edge cases", () => {
		it("should handle viewport taller than total content", () => {
			const result = calculateVisibleRange({
				scrollTop: 0,
				viewportHeight: 5000, // Very tall viewport
				itemHeight: 50,
				totalItems: 10, // Only 10 items = 500px total
				bufferSize: 5,
			});

			expect(result.start).toBe(0);
			expect(result.end).toBe(10);
		});

		it("should handle very small item heights", () => {
			const result = calculateVisibleRange({
				scrollTop: 100,
				viewportHeight: 500,
				itemHeight: 5, // Very small items
				totalItems: 1000,
				bufferSize: 10,
			});

			expect(result.start).toBeGreaterThanOrEqual(0);
			expect(result.end).toBeLessThanOrEqual(1000);
			expect(result.end - result.start).toBeGreaterThan(0);
		});

		it("should handle very large item heights", () => {
			const result = calculateVisibleRange({
				scrollTop: 100,
				viewportHeight: 500,
				itemHeight: 1000, // Items larger than viewport
				totalItems: 100,
				bufferSize: 2,
			});

			expect(result.start).toBeGreaterThanOrEqual(0);
			expect(result.end).toBeLessThanOrEqual(100);
		});
	});
});
