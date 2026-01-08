import { createRoot } from "solid-js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { tracker } from "../../../instrumentation";
import { createReactiveNode } from "../../../types";
import { useGraphState } from "../useGraphState";

describe("useGraphState", () => {
	beforeEach(() => {
		tracker.reset();
	});

	afterEach(() => {
		tracker.reset();
	});

	it("initializes with empty graph state", () => {
		createRoot((dispose) => {
			const state = useGraphState();

			expect(state.nodes()).toEqual([]);
			expect(state.edges()).toEqual([]);
			expect(state.selectedNodeId()).toBeNull();
			expect(state.hoveredNodeId()).toBeNull();

			dispose();
		});
	});

	it("provides addNode method", () => {
		createRoot((dispose) => {
			const state = useGraphState();
			const node = createReactiveNode("test-1", "signal", "testSignal", 42);

			state.addNode(node);

			expect(state.nodes()).toHaveLength(1);
			expect(state.nodes()[0].id).toBe("test-1");
			expect(state.nodes()[0].data).toBe(node);

			dispose();
		});
	});

	it("provides removeNode method", () => {
		createRoot((dispose) => {
			const state = useGraphState();
			const node = createReactiveNode("test-1", "signal", "testSignal", 42);

			state.addNode(node);
			expect(state.nodes()).toHaveLength(1);

			state.removeNode("test-1");
			expect(state.nodes()).toHaveLength(0);

			dispose();
		});
	});

	it("provides addEdge method", () => {
		createRoot((dispose) => {
			const state = useGraphState();
			const nodeA = createReactiveNode("a", "signal", "signalA", 1);
			const nodeB = createReactiveNode("b", "memo", "memoB", 2);

			state.addNode(nodeA);
			state.addNode(nodeB);
			state.addEdge("a", "b", "dependency");

			expect(state.edges()).toHaveLength(1);
			expect(state.edges()[0].source).toBe("a");
			expect(state.edges()[0].target).toBe("b");

			dispose();
		});
	});

	it("provides removeEdge method", () => {
		createRoot((dispose) => {
			const state = useGraphState();
			const nodeA = createReactiveNode("a", "signal", "signalA", 1);
			const nodeB = createReactiveNode("b", "memo", "memoB", 2);

			state.addNode(nodeA);
			state.addNode(nodeB);
			state.addEdge("a", "b", "dependency");
			expect(state.edges()).toHaveLength(1);

			state.removeEdge("a", "b");
			expect(state.edges()).toHaveLength(0);

			dispose();
		});
	});

	it("provides setSelectedNode method", () => {
		createRoot((dispose) => {
			const state = useGraphState();

			state.setSelectedNode("node-1");
			expect(state.selectedNodeId()).toBe("node-1");

			state.setSelectedNode(null);
			expect(state.selectedNodeId()).toBeNull();

			dispose();
		});
	});

	it("provides setHoveredNode method", () => {
		createRoot((dispose) => {
			const state = useGraphState();

			state.setHoveredNode("node-1");
			expect(state.hoveredNodeId()).toBe("node-1");

			state.setHoveredNode(null);
			expect(state.hoveredNodeId()).toBeNull();

			dispose();
		});
	});

	it("removes edges when node is removed", () => {
		createRoot((dispose) => {
			const state = useGraphState();
			const nodeA = createReactiveNode("a", "signal", "signalA", 1);
			const nodeB = createReactiveNode("b", "memo", "memoB", 2);
			const nodeC = createReactiveNode("c", "effect", "effectC", null);

			state.addNode(nodeA);
			state.addNode(nodeB);
			state.addNode(nodeC);
			state.addEdge("a", "b", "dependency");
			state.addEdge("b", "c", "dependency");

			expect(state.edges()).toHaveLength(2);

			state.removeNode("b");

			expect(state.edges()).toHaveLength(0);

			dispose();
		});
	});

	it("provides getNodeById method", () => {
		createRoot((dispose) => {
			const state = useGraphState();
			const node = createReactiveNode("test-1", "signal", "testSignal", 42);

			state.addNode(node);

			const found = state.getNodeById("test-1");
			expect(found).toBeDefined();
			expect(found?.id).toBe("test-1");

			const notFound = state.getNodeById("nonexistent");
			expect(notFound).toBeUndefined();

			dispose();
		});
	});
});
