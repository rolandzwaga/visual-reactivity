import type { Selection } from "d3-selection";
import { select } from "d3-selection";

const ANIMATION_DURATION = 300;

type NodeData = { id: string; x: number; y: number; visible: boolean };

export function animateGraphTransition(
	selection: Selection<SVGElement, unknown, null, undefined>,
	duration: number = ANIMATION_DURATION,
): void {
	selection.interrupt("graph-transition");
	selection.transition("graph-transition").duration(duration);
}

export function animateGraphNodes(
	svg: SVGSVGElement,
	nodeData: NodeData[],
	duration: number = ANIMATION_DURATION,
): void {
	const nodes = select(svg)
		.selectAll(".node")
		.data(nodeData, (d) => (d as NodeData).id);

	nodes.interrupt("graph-transition");

	nodes
		.transition("graph-transition")
		.duration(duration)
		.attr("cx", (d: NodeData) => d.x)
		.attr("cy", (d: NodeData) => d.y)
		.attr("opacity", (d: NodeData) => (d.visible ? 1 : 0));
}

export function cancelGraphAnimations(svg: SVGSVGElement): void {
	select(svg).selectAll("*").interrupt("graph-transition");
}
