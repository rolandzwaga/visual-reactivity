import { beforeEach, describe, expect, it, vi } from "vitest";
import { tracker } from "../tracker";

describe("ReactivityTracker", () => {
	beforeEach(() => {
		tracker.reset();
	});

	describe("node registry", () => {
		it("should register a new node", () => {
			const nodeId = tracker.registerNode("signal", "testSignal", 42);

			const node = tracker.getNode(nodeId);
			expect(node).toBeDefined();
			expect(node?.type).toBe("signal");
			expect(node?.name).toBe("testSignal");
			expect(node?.value).toBe(42);
		});

		it("should generate unique IDs for nodes", () => {
			const id1 = tracker.registerNode("signal", null, 1);
			const id2 = tracker.registerNode("signal", null, 2);

			expect(id1).not.toBe(id2);
		});

		it("should return all registered nodes", () => {
			tracker.registerNode("signal", "a", 1);
			tracker.registerNode("memo", "b", 2);

			const nodes = tracker.getNodes();
			expect(nodes.size).toBe(2);
		});
	});

	describe("ID generation", () => {
		it("should generate node IDs with type prefix", () => {
			const signalId = tracker.registerNode("signal", "test", 0);
			const memoId = tracker.registerNode("memo", "test", 0);
			const effectId = tracker.registerNode("effect", "test", undefined);

			expect(signalId).toMatch(/^signal-\d+$/);
			expect(memoId).toMatch(/^memo-\d+$/);
			expect(effectId).toMatch(/^effect-\d+$/);
		});

		it("should generate unique event IDs", () => {
			const id1 = tracker.generateEventId();
			const id2 = tracker.generateEventId();

			expect(id1).not.toBe(id2);
			expect(id1).toMatch(/^event-\d+$/);
		});

		it("should reset counters on tracker reset", () => {
			tracker.registerNode("signal", "test", 0);
			tracker.registerNode("signal", "test", 0);
			tracker.generateEventId();

			tracker.reset();

			const newSignalId = tracker.registerNode("signal", "test", 0);
			const newEventId = tracker.generateEventId();

			expect(newSignalId).toBe("signal-1");
			expect(newEventId).toBe("event-1");
		});
	});

	describe("edge registry", () => {
		it("should add a dependency edge between nodes", () => {
			const signalId = tracker.registerNode("signal", "count", 0);
			const memoId = tracker.registerNode("memo", "doubled", 0);

			tracker.addEdge("dependency", signalId, memoId);

			const edges = tracker.getEdges();
			expect(edges.size).toBe(1);

			const edge = edges.values().next().value;
			expect(edge).toBeDefined();
			expect(edge?.type).toBe("dependency");
			expect(edge?.source).toBe(signalId);
			expect(edge?.target).toBe(memoId);
		});

		it("should remove an edge", () => {
			const signalId = tracker.registerNode("signal", "count", 0);
			const memoId = tracker.registerNode("memo", "doubled", 0);

			const edgeId = tracker.addEdge("dependency", signalId, memoId);
			expect(tracker.getEdges().size).toBe(1);

			tracker.removeEdge(edgeId);
			expect(tracker.getEdges().size).toBe(0);
		});

		it("should update node sources and observers on edge add", () => {
			const signalId = tracker.registerNode("signal", "count", 0);
			const memoId = tracker.registerNode("memo", "doubled", 0);

			tracker.addEdge("dependency", signalId, memoId);

			const signal = tracker.getNode(signalId);
			const memo = tracker.getNode(memoId);

			expect(signal?.observers).toContain(memoId);
			expect(memo?.sources).toContain(signalId);
		});
	});

	describe("query API", () => {
		it("should filter edges by type with getEdgesByType", () => {
			const signalId = tracker.registerNode("signal", "count", 0);
			const memoId = tracker.registerNode("memo", "doubled", 0);
			const effectId = tracker.registerNode("effect", "logger", undefined);

			tracker.addEdge("dependency", signalId, memoId);
			tracker.addEdge("dependency", memoId, effectId);
			tracker.addEdge("ownership", memoId, effectId);

			const depEdges = tracker.getEdgesByType("dependency");
			const ownershipEdges = tracker.getEdgesByType("ownership");

			expect(depEdges.length).toBe(2);
			expect(ownershipEdges.length).toBe(1);
			expect(depEdges.every((e) => e.type === "dependency")).toBe(true);
			expect(ownershipEdges.every((e) => e.type === "ownership")).toBe(true);
		});

		it("should get edges for a specific node with getEdgesForNode", () => {
			const signalId = tracker.registerNode("signal", "count", 0);
			const memoId = tracker.registerNode("memo", "doubled", 0);
			const effectId = tracker.registerNode("effect", "logger", undefined);

			tracker.addEdge("dependency", signalId, memoId);
			tracker.addEdge("dependency", memoId, effectId);

			const signalEdges = tracker.getEdgesForNode(signalId);
			const memoEdges = tracker.getEdgesForNode(memoId);
			const effectEdges = tracker.getEdgesForNode(effectId);

			expect(signalEdges.length).toBe(1);
			expect(memoEdges.length).toBe(2);
			expect(effectEdges.length).toBe(1);
		});
	});

	describe("reset", () => {
		it("should clear all nodes", () => {
			tracker.registerNode("signal", "a", 1);
			tracker.registerNode("memo", "b", 2);

			tracker.reset();

			expect(tracker.getNodes().size).toBe(0);
		});

		it("should clear all edges", () => {
			const s = tracker.registerNode("signal", "a", 1);
			const m = tracker.registerNode("memo", "b", 2);
			tracker.addEdge("dependency", s, m);

			tracker.reset();

			expect(tracker.getEdges().size).toBe(0);
		});

		it("should clear all subscribers", () => {
			const callback = vi.fn();
			tracker.subscribe(callback);

			tracker.reset();
			tracker.emit("signal-read", "test", { value: 1 });

			expect(callback).not.toHaveBeenCalled();
		});
	});
});
