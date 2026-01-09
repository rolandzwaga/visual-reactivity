import { beforeEach, describe, expect, test, vi } from "vitest";
import { testInRoot } from "../../../__tests__/helpers";
import { tracker } from "../../../instrumentation";
import { createSelectionStore } from "../../../stores/selectionStore";
import { useSelectionSync } from "../useSelectionSync";

describe("useSelectionSync - User Story 1", () => {
	beforeEach(() => {
		tracker.reset();
	});

	test("T028: returns isNodeSelected and handleNodeClick", () => {
		testInRoot(() => {
			const store = createSelectionStore();
			const sync = useSelectionSync("graph", store);

			expect(typeof sync.isNodeSelected).toBe("function");
			expect(typeof sync.handleNodeClick).toBe("function");
			expect(typeof sync.highlightedNodeIds).toBe("function");
		});
	});

	test("T029: handleNodeClick with no modifier selects node (single-select)", () => {
		testInRoot(() => {
			tracker.getNode = vi.fn((id: string) => ({ id }) as never);

			const store = createSelectionStore();
			const sync = useSelectionSync("graph", store);

			const mockEvent = { ctrlKey: false, metaKey: false } as MouseEvent;
			sync.handleNodeClick("node-1", mockEvent);

			expect(sync.isNodeSelected("node-1")).toBe(true);
			expect(store.selectedNodeIds().size).toBe(1);
		});
	});

	test("T030: handleNodeClick calls selection.selectNode with correct viewType source", () => {
		testInRoot(() => {
			tracker.getNode = vi.fn((id: string) => ({ id }) as never);

			const store = createSelectionStore();
			const selectNodeSpy = vi.spyOn(store, "selectNode");
			const sync = useSelectionSync("tree", store);

			const mockEvent = { ctrlKey: false, metaKey: false } as MouseEvent;
			sync.handleNodeClick("node-1", mockEvent);

			expect(selectNodeSpy).toHaveBeenCalledWith("node-1", false, "tree");
		});
	});

	describe("useSelectionSync - User Story 2: Multi-select", () => {
		beforeEach(() => {
			tracker.reset();
		});

		test("T059: handleNodeClick with Ctrl key adds to selection (multi-select)", () => {
			testInRoot(() => {
				tracker.getNode = vi.fn((id: string) => ({ id }) as never);

				const store = createSelectionStore();
				const sync = useSelectionSync("graph", store);

				const mockEvent = { ctrlKey: false, metaKey: false } as MouseEvent;
				sync.handleNodeClick("node-1", mockEvent);

				const ctrlEvent = { ctrlKey: true, metaKey: false } as MouseEvent;
				sync.handleNodeClick("node-2", ctrlEvent);

				expect(sync.isNodeSelected("node-1")).toBe(true);
				expect(sync.isNodeSelected("node-2")).toBe(true);
				expect(store.selectedNodeIds().size).toBe(2);
			});
		});

		test("T060: handleNodeClick with Cmd key (metaKey) adds to selection on Mac", () => {
			testInRoot(() => {
				tracker.getNode = vi.fn((id: string) => ({ id }) as never);

				const store = createSelectionStore();
				const sync = useSelectionSync("graph", store);

				sync.handleNodeClick("node-1", {
					ctrlKey: false,
					metaKey: false,
				} as MouseEvent);

				const cmdEvent = { ctrlKey: false, metaKey: true } as MouseEvent;
				sync.handleNodeClick("node-2", cmdEvent);

				expect(sync.isNodeSelected("node-1")).toBe(true);
				expect(sync.isNodeSelected("node-2")).toBe(true);
				expect(store.selectedNodeIds().size).toBe(2);
			});
		});

		test("T061: Ctrl+click on already selected node removes it (toggle)", () => {
			testInRoot(() => {
				tracker.getNode = vi.fn((id: string) => ({ id }) as never);

				const store = createSelectionStore();
				const sync = useSelectionSync("graph", store);

				sync.handleNodeClick("node-1", {
					ctrlKey: false,
					metaKey: false,
				} as MouseEvent);
				sync.handleNodeClick("node-2", {
					ctrlKey: true,
					metaKey: false,
				} as MouseEvent);

				expect(store.selectedNodeIds().size).toBe(2);

				sync.handleNodeClick("node-1", {
					ctrlKey: true,
					metaKey: false,
				} as MouseEvent);

				expect(sync.isNodeSelected("node-1")).toBe(false);
				expect(sync.isNodeSelected("node-2")).toBe(true);
				expect(store.selectedNodeIds().size).toBe(1);
			});
		});
	});
});
