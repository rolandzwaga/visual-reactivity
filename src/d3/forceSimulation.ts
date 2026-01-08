import {
	forceCenter,
	forceCollide,
	forceLink,
	forceManyBody,
	forceSimulation,
	type Simulation,
} from "d3-force";
import type { GraphEdge, GraphNode } from "../visualization/types";

export interface ForceSimulationOptions {
	width?: number;
	height?: number;
	chargeStrength?: number;
	linkDistance?: number;
	collisionRadius?: number;
	onTick?: () => void;
}

const DEFAULT_OPTIONS: Required<Omit<ForceSimulationOptions, "onTick">> = {
	width: 800,
	height: 600,
	chargeStrength: -300,
	linkDistance: 100,
	collisionRadius: 30,
};

export type GraphSimulation = Simulation<GraphNode, GraphEdge>;

export function createForceSimulation(
	nodes: GraphNode[],
	edges: GraphEdge[],
	options: ForceSimulationOptions = {},
): GraphSimulation {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	const simulation = forceSimulation<GraphNode>(nodes)
		.force(
			"link",
			forceLink<GraphNode, GraphEdge>(edges)
				.id((d) => d.id)
				.distance(opts.linkDistance),
		)
		.force("charge", forceManyBody().strength(opts.chargeStrength))
		.force("center", forceCenter(opts.width / 2, opts.height / 2))
		.force("collide", forceCollide<GraphNode>(opts.collisionRadius));

	if (options.onTick) {
		simulation.on("tick", options.onTick);
	}

	return simulation;
}

export function updateSimulationNodes(
	simulation: GraphSimulation,
	nodes: GraphNode[],
): void {
	simulation.nodes(nodes);
	simulation.alpha(0.3).restart();
}

export function updateSimulationEdges(
	simulation: GraphSimulation,
	edges: GraphEdge[],
): void {
	const linkForce = simulation.force("link") as
		| ReturnType<typeof forceLink<GraphNode, GraphEdge>>
		| undefined;
	if (linkForce) {
		linkForce.links(edges);
	}
	simulation.alpha(0.3).restart();
}
