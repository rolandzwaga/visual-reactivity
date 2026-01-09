import { createRoot } from "solid-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { tracker } from "../../../instrumentation";
import { createSelectionStore } from "../../../stores/selectionStore";
import { useKeyboardNav } from "../useKeyboardNav";

describe("useKeyboardNav", () => {
	beforeEach(() => {
		tracker.reset();
		vi.clearAllMocks();
	});

	// T075: Hook test - returns handleKeyDown and navContext
	it("should return handleKeyDown function and navContext accessor", () =>
		createRoot((dispose) => {
			const selection = createSelectionStore();
			const nav = useKeyboardNav("graph", selection);

			expect(typeof nav.handleKeyDown).toBe("function");
			expect(typeof nav.navContext).toBe("function");
			expect(nav.navContext()).toEqual({ activeView: "graph" });

			dispose();
		}));

	// T076: Right arrow calls navigateToNextObserver when activeView is 'graph'
	it("should call navigateToNextObserver on Right arrow in graph view", () =>
		createRoot((dispose) => {
			const selection = createSelectionStore();
			const nav = useKeyboardNav("graph", selection);

			// Setup: mock tracker to return nodes and edges
			tracker.getNode = vi.fn((id: string) => ({ id }) as never);
			tracker.getEdgesForNode = vi.fn((id: string) =>
				id === "signal-1"
					? [{ source: "signal-1", target: "memo-1", type: "dependency" }]
					: [],
			) as never;

			selection.selectNode("signal-1", false, "graph");

			const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
			nav.handleKeyDown(event);

			// Should navigate to observer (memo-1)
			expect(selection.selectedNodeIds().has("memo-1")).toBe(true);
			expect(selection.selectedNodeIds().has("signal-1")).toBe(false);

			dispose();
		}));

	// T077: Left arrow calls navigateToNextSource when activeView is 'graph'
	it("should call navigateToNextSource on Left arrow in graph view", () =>
		createRoot((dispose) => {
			const selection = createSelectionStore();
			const nav = useKeyboardNav("graph", selection);

			// Setup: mock tracker to return nodes and edges
			tracker.getNode = vi.fn((id: string) => ({ id }) as never);
			tracker.getEdgesForNode = vi.fn((id: string) =>
				id === "memo-1"
					? [{ source: "signal-1", target: "memo-1", type: "dependency" }]
					: [],
			) as never;

			selection.selectNode("memo-1", false, "graph");

			const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
			nav.handleKeyDown(event);

			// Should navigate to source (signal-1)
			expect(selection.selectedNodeIds().has("signal-1")).toBe(true);
			expect(selection.selectedNodeIds().has("memo-1")).toBe(false);

			dispose();
		}));

	// T078: Down arrow calls navigateToFirstChild when activeView is 'tree'
	it("should call navigateToFirstChild on Down arrow in tree view", () =>
		createRoot((dispose) => {
			const selection = createSelectionStore();
			const nav = useKeyboardNav("tree", selection);

			// Setup: mock tracker to return parent with owned children
			tracker.getNode = vi.fn((id: string) =>
				id === "parent-1"
					? { id: "parent-1", owned: ["child-1"] }
					: { id: "child-1" },
			) as never;

			selection.selectNode("parent-1", false, "tree");

			const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
			nav.handleKeyDown(event);

			// Should navigate to child
			expect(selection.selectedNodeIds().has("child-1")).toBe(true);
			expect(selection.selectedNodeIds().has("parent-1")).toBe(false);

			dispose();
		}));

	// T079: Up arrow calls navigateToOwner when activeView is 'tree'
	it("should call navigateToOwner on Up arrow in tree view", () =>
		createRoot((dispose) => {
			const selection = createSelectionStore();
			const nav = useKeyboardNav("tree", selection);

			// Setup: mock tracker to return child with owner
			tracker.getNode = vi.fn((id: string) =>
				id === "child-1"
					? { id: "child-1", owner: "parent-1" }
					: { id: "parent-1" },
			) as never;

			selection.selectNode("child-1", false, "tree");

			const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
			nav.handleKeyDown(event);

			// Should navigate to owner
			expect(selection.selectedNodeIds().has("parent-1")).toBe(true);
			expect(selection.selectedNodeIds().has("child-1")).toBe(false);

			dispose();
		}));

	// T080: Escape key calls clearSelection
	it("should call clearSelection on Escape key", () =>
		createRoot((dispose) => {
			const selection = createSelectionStore();
			const nav = useKeyboardNav("graph", selection);

			// Setup: mock tracker and select a node
			tracker.getNode = vi.fn((id: string) => ({ id }) as never);
			selection.selectNode("signal-1", false, "graph");
			expect(selection.selectedNodeIds().size).toBe(1);

			const event = new KeyboardEvent("keydown", { key: "Escape" });
			nav.handleKeyDown(event);

			// Should clear selection
			expect(selection.selectedNodeIds().size).toBe(0);

			dispose();
		}));

	it("should do nothing when navigation returns null (no neighbor)", () =>
		createRoot((dispose) => {
			const selection = createSelectionStore();
			const nav = useKeyboardNav("graph", selection);

			// Setup: mock tracker - node with no neighbors
			tracker.getNode = vi.fn((id: string) => ({ id }) as never);
			tracker.getEdgesForNode = vi.fn(() => []) as never;

			selection.selectNode("signal-1", false, "graph");

			const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
			nav.handleKeyDown(event);

			// Should stay on same node (no observer exists)
			expect(selection.selectedNodeIds().has("signal-1")).toBe(true);
			expect(selection.selectedNodeIds().size).toBe(1);

			dispose();
		}));

	it("should do nothing when no node is selected", () =>
		createRoot((dispose) => {
			const selection = createSelectionStore();
			const nav = useKeyboardNav("graph", selection);

			const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
			nav.handleKeyDown(event);

			// Should not throw, selection remains empty
			expect(selection.selectedNodeIds().size).toBe(0);

			dispose();
		}));

	it("should ignore other keys", () =>
		createRoot((dispose) => {
			const selection = createSelectionStore();
			const nav = useKeyboardNav("graph", selection);

			tracker.getNode = vi.fn((id: string) => ({ id }) as never);
			selection.selectNode("signal-1", false, "graph");

			const event = new KeyboardEvent("keydown", { key: "a" });
			nav.handleKeyDown(event);

			// Selection unchanged
			expect(selection.selectedNodeIds().has("signal-1")).toBe(true);
			expect(selection.selectedNodeIds().size).toBe(1);

			dispose();
		}));
});
