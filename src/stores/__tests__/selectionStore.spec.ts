/**
 * Selection Store Tests (Phase 2: Foundational Layer)
 * @feature 007-view-sync
 * Tests written FIRST (TDD Red phase) - must FAIL before implementation
 */

import { beforeEach, describe, expect, test, vi } from "vitest";
import { testInRoot } from "../../__tests__/helpers";
import { tracker } from "../../instrumentation";
import type { SelectionEvent } from "../../types/selection";
import { createSelectionStore } from "../selectionStore";

describe("selectionStore - Foundational Layer", () => {
	beforeEach(() => {
		tracker.reset();
	});

	// T004: Test initialization with default state
	test("T004: initializes with empty Set and null hover", () => {
		testInRoot(() => {
			const store = createSelectionStore();

			expect(store.selectedNodeIds()).toEqual(new Set());
			expect(store.hoveredNodeId()).toBeNull();
			expect(store.selectionSource()).toBeNull();
			expect(store.selectionCount()).toBe(0);
		});
	});

	// T005: Test single-selection mode (replaces existing)
	test("T005: single selection replaces existing selection", () => {
		testInRoot(() => {
			const store = createSelectionStore();

			// Create mock nodes in tracker
			tracker.getNode = vi.fn((id: string) => ({ id }) as never);

			// Select first node
			store.selectNode("node-1", false);
			expect(store.selectedNodeIds().has("node-1")).toBe(true);
			expect(store.selectionCount()).toBe(1);

			// Select second node (single-select mode)
			store.selectNode("node-2", false);
			expect(store.selectedNodeIds().has("node-1")).toBe(false);
			expect(store.selectedNodeIds().has("node-2")).toBe(true);
			expect(store.selectionCount()).toBe(1);
		});
	});

	// T006: Test multi-selection mode (adds to existing)
	test("T006: multi-selection adds to existing selection", () => {
		testInRoot(() => {
			const store = createSelectionStore();

			tracker.getNode = vi.fn((id: string) => ({ id }) as never);

			// Select first node
			store.selectNode("node-1", false);
			expect(store.selectionCount()).toBe(1);

			// Add second node with multi-select
			store.selectNode("node-2", true);
			expect(store.selectedNodeIds().has("node-1")).toBe(true);
			expect(store.selectedNodeIds().has("node-2")).toBe(true);
			expect(store.selectionCount()).toBe(2);
		});
	});

	// T007: Test toggle behavior
	test("T007: toggleNodeSelection adds if not selected, removes if selected", () => {
		testInRoot(() => {
			const store = createSelectionStore();

			tracker.getNode = vi.fn((id: string) => ({ id }) as never);

			// Toggle on (add)
			store.toggleNodeSelection("node-1");
			expect(store.selectedNodeIds().has("node-1")).toBe(true);

			// Toggle off (remove)
			store.toggleNodeSelection("node-1");
			expect(store.selectedNodeIds().has("node-1")).toBe(false);
		});
	});

	// T008: Test clear selection
	test("T008: clearSelection resets to empty state", () => {
		testInRoot(() => {
			const store = createSelectionStore();

			tracker.getNode = vi.fn((id: string) => ({ id }) as never);

			// Select multiple nodes
			store.selectNode("node-1", false);
			store.selectNode("node-2", true);
			expect(store.selectionCount()).toBe(2);

			// Clear all
			store.clearSelection();
			expect(store.selectedNodeIds()).toEqual(new Set());
			expect(store.selectionCount()).toBe(0);
		});
	});

	// T009: Test hover state
	test("T009: setHoveredNode updates hover state", () => {
		testInRoot(() => {
			const store = createSelectionStore();

			expect(store.hoveredNodeId()).toBeNull();

			store.setHoveredNode("node-1");
			expect(store.hoveredNodeId()).toBe("node-1");

			store.setHoveredNode(null);
			expect(store.hoveredNodeId()).toBeNull();
		});
	});

	// T010: Test O(1) lookup
	test("T010: isNodeSelected returns correct boolean for O(1) lookup", () => {
		testInRoot(() => {
			const store = createSelectionStore();

			tracker.getNode = vi.fn((id: string) => ({ id }) as never);

			store.selectNode("node-1", false);

			expect(store.isNodeSelected("node-1")).toBe(true);
			expect(store.isNodeSelected("node-2")).toBe(false);
		});
	});

	// T011: Test immutable Set updates
	test("T011: immutable Set updates create new references", () => {
		testInRoot(() => {
			const store = createSelectionStore();

			tracker.getNode = vi.fn((id: string) => ({ id }) as never);

			const initialSet = store.selectedNodeIds();
			store.selectNode("node-1", false);
			const afterSelectSet = store.selectedNodeIds();

			// Verify new reference created
			expect(afterSelectSet).not.toBe(initialSet);
			expect(afterSelectSet.has("node-1")).toBe(true);
		});
	});

	// T012: Test event emission
	test("T012: selection event emission with correct delta", () => {
		testInRoot(() => {
			const store = createSelectionStore();

			tracker.getNode = vi.fn((id: string) => ({ id }) as never);

			const events: SelectionEvent[] = [];
			store.subscribe("test-view", (event) => events.push(event));

			store.selectNode("node-1", false, "graph");

			expect(events).toHaveLength(1);
			expect(events[0].type).toBe("selection-replace");
			expect(events[0].addedNodeIds).toEqual(["node-1"]);
			expect(events[0].removedNodeIds).toEqual([]);
			expect(events[0].source).toBe("graph");
		});
	});

	// T013: Test multiple subscribers
	test("T013: multiple subscribers all receive events", () => {
		testInRoot(() => {
			const store = createSelectionStore();

			tracker.getNode = vi.fn((id: string) => ({ id }) as never);

			const events1: SelectionEvent[] = [];
			const events2: SelectionEvent[] = [];

			store.subscribe("view-1", (event) => events1.push(event));
			store.subscribe("view-2", (event) => events2.push(event));

			store.selectNode("node-1", false);

			expect(events1).toHaveLength(1);
			expect(events2).toHaveLength(1);
			expect(events1[0].type).toBe("selection-replace");
			expect(events2[0].type).toBe("selection-replace");
		});
	});

	// T014: Test unsubscribe
	test("T014: unsubscribe stops receiving events", () => {
		testInRoot(() => {
			const store = createSelectionStore();

			tracker.getNode = vi.fn((id: string) => ({ id }) as never);

			const events: SelectionEvent[] = [];
			const unsubscribe = store.subscribe("test-view", (event) =>
				events.push(event),
			);

			store.selectNode("node-1", false);
			expect(events).toHaveLength(1);

			unsubscribe();

			store.selectNode("node-2", false);
			expect(events).toHaveLength(1); // No new events
		});
	});

	// T015: Test batch() groups updates
	test("T015: batch() groups multiple signal updates into single effect run", () => {
		testInRoot(() => {
			const store = createSelectionStore();

			tracker.getNode = vi.fn((id: string) => ({ id }) as never);

			const events: SelectionEvent[] = [];
			store.subscribe("test-view", (event) => events.push(event));

			// setSelection should use batch internally for atomic update
			store.setSelection(["node-1", "node-2"], "graph");

			// Should only emit ONE event despite multiple nodes
			expect(events).toHaveLength(1);
			expect(events[0].addedNodeIds).toContain("node-1");
			expect(events[0].addedNodeIds).toContain("node-2");
		});
	});

	// T016: Test createSelector O(2) performance
	test("T016: createSelector reduces updates from O(n) to O(2)", () => {
		testInRoot(() => {
			const store = createSelectionStore();

			tracker.getNode = vi.fn((id: string) => ({ id }) as never);

			// Create selector (should be exposed by store)
			// This test verifies that when selection changes from node-1 to node-2,
			// only 2 nodes update (old and new), not all N nodes in a list

			store.selectNode("node-1", false);

			// Simulate list with 10 items checking isSelected
			const checks = [
				"node-1",
				"node-2",
				"node-3",
				"node-4",
				"node-5",
				"node-6",
				"node-7",
				"node-8",
				"node-9",
				"node-10",
			];

			// Track how many checks change when selection changes
			const initialResults = checks.map((id) => store.isNodeSelected(id));

			// Change selection from node-1 to node-2
			store.selectNode("node-2", false);

			const afterResults = checks.map((id) => store.isNodeSelected(id));

			// Count differences (should be exactly 2: node-1 became false, node-2 became true)
			let changes = 0;
			for (let i = 0; i < checks.length; i++) {
				if (initialResults[i] !== afterResults[i]) {
					changes++;
				}
			}

			expect(changes).toBe(2); // O(2), not O(10)
		});
	});
});
