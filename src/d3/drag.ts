import { type D3DragEvent, drag } from "d3-drag";
import { select } from "d3-selection";
import type { GraphNode } from "../visualization/types";

export interface DragBehaviorOptions<T = GraphNode> {
	onDragStart?: (node: T) => void;
	onDrag?: (node: T, x: number, y: number) => void;
	onDragEnd?: (node: T) => void;
}

export function createDragBehavior<T extends GraphNode>(
	options: DragBehaviorOptions<T> = {},
) {
	return drag<SVGGElement, T>()
		.on("start", (event: D3DragEvent<SVGGElement, T, T>) => {
			options.onDragStart?.(event.subject);
		})
		.on("drag", (event: D3DragEvent<SVGGElement, T, T>) => {
			options.onDrag?.(event.subject, event.x, event.y);
		})
		.on("end", (event: D3DragEvent<SVGGElement, T, T>) => {
			options.onDragEnd?.(event.subject);
		});
}

export function applyDragBehavior<T extends GraphNode>(
	element: SVGGElement,
	behavior: ReturnType<typeof createDragBehavior<T>>,
): void {
	select<SVGGElement, T>(element).call(behavior);
}
