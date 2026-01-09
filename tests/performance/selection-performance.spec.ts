/**
 * Performance Validation Tests (T115-T118)
 * @feature 007-view-sync
 *
 * These tests validate that selection synchronization meets performance targets:
 * - T115: <100ms cross-view sync time
 * - T116: 10+ nodes without lag or frame drops
 * - T117: 100+ rapid selection changes without UI freezing
 * - T118: Edge cases handled correctly
 */

import { createRoot } from "solid-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { tracker } from "../../src/instrumentation";
import { createSelectionStore } from "../../src/stores/selectionStore";

describe("Selection Performance Validation", () => {
	beforeEach(() => {
		tracker.reset();
		// Mock tracker to return valid nodes
		tracker.getNode = vi.fn(
			(id: string) =>
				({
					id,
					type: "signal",
					name: `node-${id}`,
				}) as never,
		);
	});

	// T115: Measure selection-to-highlight time (target: <100ms)
	it("T115: should sync selection across views in <100ms", () =>
		createRoot((dispose) => {
			const selection = createSelectionStore();

			// Subscribe 4 views (simulating graph, tree, timeline, list)
			const viewUpdateTimes: number[] = [];
			const views = ["graph", "tree", "timeline", "list"];

			for (const view of views) {
				selection.subscribe(view, () => {
					viewUpdateTimes.push(performance.now());
				});
			}

			const startTime = performance.now();

			// Trigger selection
			selection.selectNode("signal-1", false, "graph");

			const endTime = performance.now();
			const totalTime = endTime - startTime;

			// All 4 views should receive update
			expect(viewUpdateTimes).toHaveLength(4);

			// Total sync time should be under 100ms
			expect(totalTime).toBeLessThan(100);

			// In practice, should be much faster (< 10ms)
			expect(totalTime).toBeLessThan(10);

			dispose();
		}));

	// T116: Test multi-selection with 10 nodes (target: no lag)
	it("T116: should handle 10+ selected nodes without performance degradation", () =>
		createRoot((dispose) => {
			const selection = createSelectionStore();
			const eventTimes: number[] = [];

			selection.subscribe("test-view", () => {
				eventTimes.push(performance.now());
			});

			const startTime = performance.now();

			// Select 10 nodes
			for (let i = 1; i <= 10; i++) {
				selection.selectNode(`signal-${i}`, true, "graph");
			}

			const endTime = performance.now();
			const totalTime = endTime - startTime;

			// Should complete all 10 selections quickly
			expect(totalTime).toBeLessThan(100);
			expect(eventTimes).toHaveLength(10);

			// Verify all selected
			expect(selection.selectionCount()).toBe(10);
			for (let i = 1; i <= 10; i++) {
				expect(selection.isNodeSelected(`signal-${i}`)).toBe(true);
			}

			// Each individual selection should be fast
			const avgTimePerSelection = totalTime / 10;
			expect(avgTimePerSelection).toBeLessThan(10); // <10ms per selection

			dispose();
		}));

	// T117: Test rapid selection changes (100+ arrow key presses)
	it("T117: should handle 100+ rapid selection changes without freezing", () =>
		createRoot((dispose) => {
			const selection = createSelectionStore();
			const eventCount = { count: 0 };

			selection.subscribe("test-view", () => {
				eventCount.count++;
			});

			// Create 100 mock nodes
			const mockNodes = new Map<string, unknown>();
			for (let i = 1; i <= 100; i++) {
				mockNodes.set(`signal-${i}`, {
					id: `signal-${i}`,
					type: "signal",
					name: `signal-${i}`,
				});
			}

			tracker.getNode = vi.fn((id: string) => {
				return mockNodes.get(id) as never;
			});

			const startTime = performance.now();

			// Simulate 100 rapid arrow key presses (changing selection rapidly)
			for (let i = 1; i <= 100; i++) {
				selection.selectNode(`signal-${i}`, false, "graph");
			}

			const endTime = performance.now();
			const totalTime = endTime - startTime;

			// Should complete all 100 changes without freezing
			expect(totalTime).toBeLessThan(1000); // 1 second for 100 changes
			expect(eventCount.count).toBe(100);

			// Last selection should be active
			expect(selection.isNodeSelected("signal-100")).toBe(true);
			expect(selection.selectionCount()).toBe(1);

			// Average time per change should be reasonable
			const avgTimePerChange = totalTime / 100;
			expect(avgTimePerChange).toBeLessThan(10); // <10ms per change

			dispose();
		}));

	// T118: Edge case validation
	describe("T118: Edge Case Validation", () => {
		// Edge case 1: Selection of disposed node
		it("should handle selection of disposed node gracefully", () =>
			createRoot((dispose) => {
				const selection = createSelectionStore();

				// Mock disposed node
				tracker.getNode = vi.fn((id: string) => {
					if (id === "disposed-1") {
						return undefined; // Disposed node returns undefined
					}
					return { id, type: "signal" } as never;
				});

				// Selecting disposed node should throw
				expect(() => {
					selection.selectNode("disposed-1", false);
				}).toThrow();

				dispose();
			}));

		// Edge case 2: Rapid toggle of same node
		it("should handle rapid toggle of same node", () =>
			createRoot((dispose) => {
				const selection = createSelectionStore();

				const startTime = performance.now();

				// Toggle same node 50 times rapidly
				for (let i = 0; i < 50; i++) {
					selection.toggleNodeSelection("signal-1");
				}

				const endTime = performance.now();

				// Should complete quickly
				expect(endTime - startTime).toBeLessThan(100);

				// Final state: node should be deselected (50 toggles = even)
				expect(selection.isNodeSelected("signal-1")).toBe(false);

				dispose();
			}));

		// Edge case 3: Selection limit enforcement
		it("should enforce 1000 node selection limit", () =>
			createRoot((dispose) => {
				const selection = createSelectionStore();

				// Select up to limit (1000 nodes)
				const nodeIds: string[] = [];
				for (let i = 1; i <= 1000; i++) {
					nodeIds.push(`signal-${i}`);
				}

				// Should succeed
				selection.setSelection(nodeIds);
				expect(selection.selectionCount()).toBe(1000);

				// Attempting to add one more should fail
				expect(() => {
					selection.selectNode("signal-1001", true);
				}).toThrow(/selection limit/i);

				dispose();
			}));

		// Edge case 4: Multi-view unsubscribe
		it("should handle view unsubscribe without affecting other views", () =>
			createRoot((dispose) => {
				const selection = createSelectionStore();

				const view1Events: number[] = [];
				const view2Events: number[] = [];

				const unsubscribe1 = selection.subscribe("view-1", () => {
					view1Events.push(1);
				});
				selection.subscribe("view-2", () => {
					view2Events.push(1);
				});

				selection.selectNode("signal-1", false);

				expect(view1Events).toHaveLength(1);
				expect(view2Events).toHaveLength(1);

				// Unsubscribe view-1
				unsubscribe1();

				selection.selectNode("signal-2", false);

				// View-1 should not receive update
				expect(view1Events).toHaveLength(1);
				// View-2 should receive update
				expect(view2Events).toHaveLength(2);

				dispose();
			}));

		// Edge case 5: Clear selection on empty state
		it("should handle clear selection when already empty", () =>
			createRoot((dispose) => {
				const selection = createSelectionStore();
				const events: unknown[] = [];

				selection.subscribe("test", (event) => {
					events.push(event);
				});

				// Clear when empty
				selection.clearSelection();

				// Should emit event even when already empty
				expect(events).toHaveLength(1);
				expect((events[0] as { type: string }).type).toBe("selection-clear");

				dispose();
			}));
	});

	// Bonus: Verify batch() prevents excessive re-renders
	it("should use batch() to prevent UI thrashing during multi-updates", () =>
		createRoot((dispose) => {
			const selection = createSelectionStore();
			let effectRunCount = 0;

			// Simulate SolidJS effect that tracks selection
			selection.subscribe("test-view", () => {
				effectRunCount++;
			});

			// Set multiple nodes at once - should emit single event due to batch()
			selection.setSelection(["signal-1", "signal-2", "signal-3"]);

			// Should only trigger one effect run (batched update)
			expect(effectRunCount).toBe(1);

			dispose();
		}));
});
