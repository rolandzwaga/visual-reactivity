import { describe, expect, it, vi } from "vitest";
import { createReactiveNode } from "../../types";
import type { GraphEdge, GraphNode } from "../../visualization/types";
import {
	createForceSimulation,
	type ForceSimulationOptions,
	updateSimulationEdges,
	updateSimulationNodes,
} from "../forceSimulation";

function createMockNode(id: string, x = 0, y = 0): GraphNode {
	return {
		id,
		type: "signal",
		name: id,
		x,
		y,
		vx: 0,
		vy: 0,
		fx: null,
		fy: null,
		data: createReactiveNode(id, "signal", id, null),
	};
}

function createMockEdge(sourceId: string, targetId: string): GraphEdge {
	return {
		id: `${sourceId}->${targetId}`,
		type: "dependency",
		source: sourceId,
		target: targetId,
	};
}

describe("createForceSimulation", () => {
	it("creates a D3 force simulation with nodes", () => {
		const nodes = [createMockNode("a"), createMockNode("b")];
		const simulation = createForceSimulation(nodes, []);

		expect(simulation).toBeDefined();
		expect(simulation.nodes()).toHaveLength(2);
	});

	it("applies link force for edges", () => {
		const nodes = [createMockNode("a"), createMockNode("b")];
		const edges = [createMockEdge("a", "b")];
		const simulation = createForceSimulation(nodes, edges);

		const linkForce = simulation.force("link");
		expect(linkForce).toBeDefined();
	});

	it("applies charge force for node repulsion", () => {
		const nodes = [createMockNode("a"), createMockNode("b")];
		const simulation = createForceSimulation(nodes, []);

		const chargeForce = simulation.force("charge");
		expect(chargeForce).toBeDefined();
	});

	it("applies center force to keep graph centered", () => {
		const nodes = [createMockNode("a")];
		const simulation = createForceSimulation(nodes, []);

		const centerForce = simulation.force("center");
		expect(centerForce).toBeDefined();
	});

	it("accepts custom options", () => {
		const nodes = [createMockNode("a")];
		const options: ForceSimulationOptions = {
			width: 1000,
			height: 800,
			chargeStrength: -500,
			linkDistance: 150,
		};
		const simulation = createForceSimulation(nodes, [], options);

		expect(simulation).toBeDefined();
	});
});

describe("updateSimulationNodes", () => {
	it("updates simulation with new nodes", () => {
		const initialNodes = [createMockNode("a")];
		const simulation = createForceSimulation(initialNodes, []);

		const newNodes = [createMockNode("a"), createMockNode("b")];
		updateSimulationNodes(simulation, newNodes);

		expect(simulation.nodes()).toHaveLength(2);
	});

	it("restarts simulation after node update", () => {
		const nodes = [createMockNode("a")];
		const simulation = createForceSimulation(nodes, []);
		const alphaSpy = vi.spyOn(simulation, "alpha");

		updateSimulationNodes(simulation, [
			createMockNode("a"),
			createMockNode("b"),
		]);

		expect(alphaSpy).toHaveBeenCalled();
	});
});

describe("updateSimulationEdges", () => {
	it("updates link force with new edges", () => {
		const nodes = [
			createMockNode("a"),
			createMockNode("b"),
			createMockNode("c"),
		];
		const edges = [createMockEdge("a", "b")];
		const simulation = createForceSimulation(nodes, edges);

		const newEdges = [createMockEdge("a", "b"), createMockEdge("b", "c")];
		updateSimulationEdges(simulation, newEdges);

		const linkForce = simulation.force("link");
		expect(linkForce).toBeDefined();
	});
});

describe("simulation tick", () => {
	it("calls onTick callback during simulation", async () => {
		const nodes = [createMockNode("a"), createMockNode("b")];
		const onTick = vi.fn();
		const simulation = createForceSimulation(nodes, [], { onTick });

		simulation.alpha(1).restart();

		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(onTick).toHaveBeenCalled();

		simulation.stop();
	});

	it("updates node positions during simulation", async () => {
		const nodeA = createMockNode("a", 0, 0);
		const nodeB = createMockNode("b", 0, 0);
		const nodes = [nodeA, nodeB];

		const simulation = createForceSimulation(nodes, []);
		simulation.alpha(1).restart();

		await new Promise((resolve) => setTimeout(resolve, 100));

		const simNodes = simulation.nodes();
		const hasPositionChange =
			simNodes[0].x !== 0 ||
			simNodes[0].y !== 0 ||
			simNodes[1].x !== 0 ||
			simNodes[1].y !== 0;

		expect(hasPositionChange).toBe(true);

		simulation.stop();
	});
});
