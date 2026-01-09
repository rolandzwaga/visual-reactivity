import type { BrushBehavior } from "d3-brush";
import { brushX } from "d3-brush";

export interface TimelineBrushOptions {
	width: number;
	onBrush?: (selection: [number, number] | null) => void;
}

export function createTimelineBrush(
	options: TimelineBrushOptions,
): BrushBehavior<unknown> {
	const { width, onBrush } = options;

	const brush = brushX().extent([
		[0, 0],
		[width, 30],
	]);

	if (onBrush) {
		brush.on("brush end", (event) => {
			const selection = event.selection as [number, number] | null;
			onBrush(selection);
		});
	}

	return brush;
}
