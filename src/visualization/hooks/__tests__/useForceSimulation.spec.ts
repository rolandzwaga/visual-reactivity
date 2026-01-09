import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { testInRoot } from "../../../__tests__/helpers";
import { createReactiveNode } from "../../../types";
import type { GraphEdge, GraphNode } from "../../types";
import { useForceSimulation } from "../useForceSimulation";

function createMockNode(id: string): GraphNode {
	return {
		id,
		type: "signal",
		name: id,
		x: Math.random() * 100,
		y: Math.random() * 100,
		vx: 0,
		vy: 0,
		fx: null,
		fy: null,
		data: createReactiveNode(id, "signal", id, null),
	};
}

describe("useForceSimulation", () => {
	it("creates a force simulation from initial nodes", async () => {
		await testInRoot(async () => {
			const [nodes] = createSignal([createMockNode("a"), createMockNode("b")]);
			const [edges] = createSignal<GraphEdge[]>([]);

			const { simulation } = useForceSimulation(nodes, edges);

			await new Promise((r) => setTimeout(r, 10));

			expect(simulation()).toBeDefined();
			expect(simulation()?.nodes()).toHaveLength(2);

			simulation()?.stop();
		});
	});

	it("exposes simulation positions accessor", async () => {
		await testInRoot(async () => {
			const [nodes] = createSignal([createMockNode("a")]);
			const [edges] = createSignal<GraphEdge[]>([]);

			const { simulation, positions } = useForceSimulation(nodes, edges);

			await new Promise((r) => setTimeout(r, 50));

			expect(positions()).toBeDefined();
			expect(positions().length).toBeGreaterThan(0);
			expect(typeof positions()[0]?.x).toBe("number");
			expect(typeof positions()[0]?.y).toBe("number");

			simulation()?.stop();
		});
	});

	it("provides stop function", () => {
		testInRoot(() => {
			const [nodes] = createSignal([createMockNode("a")]);
			const [edges] = createSignal<GraphEdge[]>([]);

			const { stop } = useForceSimulation(nodes, edges);

			expect(typeof stop).toBe("function");
			stop();
		});
	});

	it("provides restart function", () => {
		testInRoot(() => {
			const [nodes] = createSignal([createMockNode("a")]);
			const [edges] = createSignal<GraphEdge[]>([]);

			const { restart } = useForceSimulation(nodes, edges);

			expect(typeof restart).toBe("function");
		});
	});

	it("accepts custom simulation options", async () => {
		await testInRoot(async () => {
			const [nodes] = createSignal([createMockNode("a")]);
			const [edges] = createSignal<GraphEdge[]>([]);

			const { simulation } = useForceSimulation(nodes, edges, {
				width: 1000,
				height: 800,
			});

			await new Promise((r) => setTimeout(r, 10));

			expect(simulation()).toBeDefined();

			simulation()?.stop();
		});
	});
});
