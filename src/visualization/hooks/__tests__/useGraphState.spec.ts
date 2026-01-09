import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { testInRoot } from "../../../__tests__/helpers";
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
		testInRoot(() => {
			const state = useGraphState();

			expect(state.nodes()).toEqual([]);
			expect(state.edges()).toEqual([]);
			expect(state.selectedNodeId()).toBeNull();
			expect(state.hoveredNodeId()).toBeNull();
		});
	});

	it("provides addNode method", () => {
		testInRoot(() => {
			const state = useGraphState();
			const node = createReactiveNode("test-1", "signal", "testSignal", 42);

			state.addNode(node);

			expect(state.nodes()).toHaveLength(1);
			expect(state.nodes()[0].id).toBe("test-1");
			expect(state.nodes()[0].data).toBe(node);
		});
	});

	it("provides removeNode method", () => {
		testInRoot(() => {
			const state = useGraphState();
			const node = createReactiveNode("test-1", "signal", "testSignal", 42);

			state.addNode(node);
			expect(state.nodes()).toHaveLength(1);

			state.removeNode("test-1");
			expect(state.nodes()).toHaveLength(0);
		});
	});

	it("provides addEdge method", () => {
		testInRoot(() => {
			const state = useGraphState();
			const nodeA = createReactiveNode("a", "signal", "signalA", 1);
			const nodeB = createReactiveNode("b", "memo", "memoB", 2);

			state.addNode(nodeA);
			state.addNode(nodeB);
			state.addEdge("a", "b", "dependency");

			expect(state.edges()).toHaveLength(1);
			expect(state.edges()[0].source).toBe("a");
			expect(state.edges()[0].target).toBe("b");
		});
	});

	it("provides removeEdge method", () => {
		testInRoot(() => {
			const state = useGraphState();
			const nodeA = createReactiveNode("a", "signal", "signalA", 1);
			const nodeB = createReactiveNode("b", "memo", "memoB", 2);

			state.addNode(nodeA);
			state.addNode(nodeB);
			state.addEdge("a", "b", "dependency");
			expect(state.edges()).toHaveLength(1);

			state.removeEdge("a", "b");
			expect(state.edges()).toHaveLength(0);
		});
	});

	it("provides setSelectedNode method", () => {
		testInRoot(() => {
			const state = useGraphState();

			state.setSelectedNode("node-1");
			expect(state.selectedNodeId()).toBe("node-1");

			state.setSelectedNode(null);
			expect(state.selectedNodeId()).toBeNull();
		});
	});

	it("provides setHoveredNode method", () => {
		testInRoot(() => {
			const state = useGraphState();

			state.setHoveredNode("node-1");
			expect(state.hoveredNodeId()).toBe("node-1");

			state.setHoveredNode(null);
			expect(state.hoveredNodeId()).toBeNull();
		});
	});

	it("removes edges when node is removed", () => {
		testInRoot(() => {
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
		});
	});

	it("provides getNodeById method", () => {
		testInRoot(() => {
			const state = useGraphState();
			const node = createReactiveNode("test-1", "signal", "testSignal", 42);

			state.addNode(node);

			const found = state.getNodeById("test-1");
			expect(found).toBeDefined();
			expect(found?.id).toBe("test-1");

			const notFound = state.getNodeById("nonexistent");
			expect(notFound).toBeUndefined();
		});
	});
});
