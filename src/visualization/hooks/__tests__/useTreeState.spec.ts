import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushMicrotasks, testInRoot } from "../../../__tests__/helpers";
import { useTreeState } from "../useTreeState";

describe("useTreeState", () => {
	it("should initialize with empty expanded nodes", () =>
		testInRoot(() => {
			const state = useTreeState();

			expect(state.expandedNodes()).toEqual(new Set());
		}));

	it("should toggle node expansion", () =>
		testInRoot(() => {
			const state = useTreeState();

			state.toggleExpanded("node-1");
			expect(state.expandedNodes().has("node-1")).toBe(true);

			state.toggleExpanded("node-1");
			expect(state.expandedNodes().has("node-1")).toBe(false);
		}));

	it("should allow multiple nodes to be expanded", () =>
		testInRoot(() => {
			const state = useTreeState();

			state.toggleExpanded("node-1");
			state.toggleExpanded("node-2");

			expect(state.expandedNodes().has("node-1")).toBe(true);
			expect(state.expandedNodes().has("node-2")).toBe(true);
		}));

	it("should track disposing nodes with timestamps", () =>
		testInRoot(() => {
			const state = useTreeState();
			const now = Date.now();

			state.markDisposing("node-1");

			const disposingNodes = state.disposingNodes();
			expect(disposingNodes.has("node-1")).toBe(true);
			expect(disposingNodes.get("node-1")).toBeGreaterThanOrEqual(now);
		}));

	it("should set and get selected node", () =>
		testInRoot(() => {
			const state = useTreeState();

			expect(state.selectedNodeId()).toBe(null);

			state.setSelectedNodeId("node-1");
			expect(state.selectedNodeId()).toBe("node-1");

			state.setSelectedNodeId(null);
			expect(state.selectedNodeId()).toBe(null);
		}));

	it("should set and get hovered node", () =>
		testInRoot(() => {
			const state = useTreeState();

			expect(state.hoveredNodeId()).toBe(null);

			state.setHoveredNodeId("node-2");
			expect(state.hoveredNodeId()).toBe("node-2");

			state.setHoveredNodeId(null);
			expect(state.hoveredNodeId()).toBe(null);
		}));

	it("should reset all state", () =>
		testInRoot(() => {
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
		}));

	describe("default expansion depth", () => {
		it("should support initializing with default expanded nodes", () =>
			testInRoot(() => {
				const defaultExpanded = new Set(["node-1", "node-2"]);
				const state = useTreeState(defaultExpanded);

				expect(state.expandedNodes().has("node-1")).toBe(true);
				expect(state.expandedNodes().has("node-2")).toBe(true);
			}));
	});

	describe("disposed node auto-removal", () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("should track disposed nodes and remove them after 5 seconds", async () =>
			testInRoot(async () => {
				const state = useTreeState();

				state.markDisposing("node-1");
				expect(state.disposingNodes().has("node-1")).toBe(true);

				await flushMicrotasks();
				vi.advanceTimersByTime(5000);
				await flushMicrotasks();

				expect(state.disposingNodes().has("node-1")).toBe(false);
			}));

		it("should handle multiple disposed nodes independently", async () =>
			testInRoot(async () => {
				const state = useTreeState();

				state.markDisposing("node-1");
				await flushMicrotasks();
				vi.advanceTimersByTime(2000);
				await flushMicrotasks();
				state.markDisposing("node-2");

				expect(state.disposingNodes().has("node-1")).toBe(true);
				expect(state.disposingNodes().has("node-2")).toBe(true);

				await flushMicrotasks();
				vi.advanceTimersByTime(3000);
				await flushMicrotasks();

				expect(state.disposingNodes().has("node-1")).toBe(false);
				expect(state.disposingNodes().has("node-2")).toBe(true);

				await flushMicrotasks();
				vi.advanceTimersByTime(2000);
				await flushMicrotasks();

				expect(state.disposingNodes().has("node-2")).toBe(false);
			}));
	});
});
