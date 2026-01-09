import { select } from "d3-selection";
import { transition } from "d3-transition";

const ANIMATION_DURATION = 300;

export function animateGraphTransition(
	selection: any,
	duration: number = ANIMATION_DURATION,
): void {
	selection.interrupt("graph-transition");
	selection.transition("graph-transition").duration(duration);
}

export function animateGraphNodes(
	svg: SVGSVGElement,
	nodeData: Array<{ id: string; x: number; y: number; visible: boolean }>,
	duration: number = ANIMATION_DURATION,
): void {
	const nodes = select(svg)
		.selectAll(".node")
		.data(nodeData, (d: any) => d.id);

	nodes.interrupt("graph-transition");

	nodes
		.transition("graph-transition")
		.duration(duration)
		.attr("cx", (d: any) => d.x)
		.attr("cy", (d: any) => d.y)
		.attr("opacity", (d: any) => (d.visible ? 1 : 0));
}

export function cancelGraphAnimations(svg: SVGSVGElement): void {
	select(svg).selectAll("*").interrupt("graph-transition");
}
