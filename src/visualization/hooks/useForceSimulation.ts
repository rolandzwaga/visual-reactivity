import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";
import {
	createForceSimulation,
	type ForceSimulationOptions,
	type GraphSimulation,
	updateSimulationEdges,
	updateSimulationNodes,
} from "../../d3/forceSimulation";
import type { GraphEdge, GraphNode } from "../types";

export interface NodePosition {
	id: string;
	x: number;
	y: number;
}

export interface UseForceSimulationReturn {
	simulation: Accessor<GraphSimulation | null>;
	positions: Accessor<NodePosition[]>;
	stop: () => void;
	restart: () => void;
}

export function useForceSimulation(
	nodes: Accessor<GraphNode[]>,
	edges: Accessor<GraphEdge[]>,
	options: ForceSimulationOptions = {},
): UseForceSimulationReturn {
	const [simulation, setSimulation] = createSignal<GraphSimulation | null>(
		null,
	);
	const [positions, setPositions] = createSignal<NodePosition[]>([]);

	function updatePositions(): void {
		const sim = simulation();
		if (!sim) return;

		const simNodes = sim.nodes();
		setPositions(
			simNodes.map((n) => ({
				id: n.id,
				x: n.x,
				y: n.y,
			})),
		);
	}

	createEffect(() => {
		const currentNodes = nodes();
		const currentEdges = edges();

		const existingSim = simulation();

		if (existingSim) {
			updateSimulationNodes(existingSim, currentNodes);
			updateSimulationEdges(existingSim, currentEdges);
		} else if (currentNodes.length > 0) {
			const sim = createForceSimulation(currentNodes, currentEdges, {
				...options,
				onTick: updatePositions,
			});
			setSimulation(sim);
		}
	});

	onCleanup(() => {
		const sim = simulation();
		if (sim) {
			sim.stop();
		}
	});

	function stop(): void {
		const sim = simulation();
		if (sim) {
			sim.stop();
		}
	}

	function restart(): void {
		const sim = simulation();
		if (sim) {
			sim.alpha(0.3).restart();
		}
	}

	return {
		simulation,
		positions,
		stop,
		restart,
	};
}
