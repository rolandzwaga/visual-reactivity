import { createRoot } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTreeState } from "./useTreeState";

describe("useTreeState", () => {
	it("should initialize with empty expanded nodes", () =>
		createRoot((dispose) => {
			const state = useTreeState();

			expect(state.expandedNodes()).toEqual(new Set());

			dispose();
		}));

	it("should toggle node expansion", () =>
		createRoot((dispose) => {
			const state = useTreeState();

			state.toggleExpanded("node-1");
			expect(state.expandedNodes().has("node-1")).toBe(true);

			state.toggleExpanded("node-1");
			expect(state.expandedNodes().has("node-1")).toBe(false);

			dispose();
		}));

	it("should allow multiple nodes to be expanded", () =>
		createRoot((dispose) => {
			const state = useTreeState();

			state.toggleExpanded("node-1");
			state.toggleExpanded("node-2");

			expect(state.expandedNodes().has("node-1")).toBe(true);
			expect(state.expandedNodes().has("node-2")).toBe(true);

			dispose();
		}));

	it("should track disposing nodes with timestamps", () =>
		createRoot((dispose) => {
			const state = useTreeState();
			const now = Date.now();

			state.markDisposing("node-1");

			const disposingNodes = state.disposingNodes();
			expect(disposingNodes.has("node-1")).toBe(true);
			expect(disposingNodes.get("node-1")).toBeGreaterThanOrEqual(now);

			dispose();
		}));

	it("should set and get selected node", () =>
		createRoot((dispose) => {
			const state = useTreeState();

			expect(state.selectedNodeId()).toBe(null);

			state.setSelectedNodeId("node-1");
			expect(state.selectedNodeId()).toBe("node-1");

			state.setSelectedNodeId(null);
			expect(state.selectedNodeId()).toBe(null);

			dispose();
		}));

	it("should set and get hovered node", () =>
		createRoot((dispose) => {
			const state = useTreeState();

			expect(state.hoveredNodeId()).toBe(null);

			state.setHoveredNodeId("node-2");
			expect(state.hoveredNodeId()).toBe("node-2");

			state.setHoveredNodeId(null);
			expect(state.hoveredNodeId()).toBe(null);

			dispose();
		}));

	it("should reset all state", () =>
		createRoot((dispose) => {
			const state = useTreeState();

			state.toggleExpanded("node-1");
			state.markDisposing("node-2");
			state.setSelectedNodeId("node-3");
			state.setHoveredNodeId("node-4");

			state.reset();

			expect(state.expandedNodes().size).toBe(0);
			expect(state.disposingNodes().size).toBe(0);
			expect(state.selectedNodeId()).toBe(null);
			expect(state.hoveredNodeId()).toBe(null);

			dispose();
		}));

	describe("default expansion depth", () => {
		it("should support initializing with default expanded nodes", () =>
			createRoot((dispose) => {
				const defaultExpanded = new Set(["node-1", "node-2"]);
				const state = useTreeState(defaultExpanded);

				expect(state.expandedNodes().has("node-1")).toBe(true);
				expect(state.expandedNodes().has("node-2")).toBe(true);

				dispose();
			}));
	});

	describe("disposed node auto-removal", () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("should track disposed nodes and remove them after 5 seconds", () =>
			createRoot((dispose) => {
				const state = useTreeState();

				state.markDisposing("node-1");
				expect(state.disposingNodes().has("node-1")).toBe(true);

				vi.advanceTimersByTime(5000);

				expect(state.disposingNodes().has("node-1")).toBe(false);

				dispose();
			}));

		it("should handle multiple disposed nodes independently", () =>
			createRoot((dispose) => {
				const state = useTreeState();

				state.markDisposing("node-1");
				vi.advanceTimersByTime(2000);
				state.markDisposing("node-2");

				expect(state.disposingNodes().has("node-1")).toBe(true);
				expect(state.disposingNodes().has("node-2")).toBe(true);

				vi.advanceTimersByTime(3000);

				expect(state.disposingNodes().has("node-1")).toBe(false);
				expect(state.disposingNodes().has("node-2")).toBe(true);

				vi.advanceTimersByTime(2000);

				expect(state.disposingNodes().has("node-2")).toBe(false);

				dispose();
			}));
	});
});
