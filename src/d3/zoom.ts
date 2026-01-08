import { select } from "d3-selection";
import {
	type D3ZoomEvent,
	type ZoomBehavior,
	zoom,
	zoomIdentity,
} from "d3-zoom";
import type { ZoomTransform } from "../visualization/types";

export interface ZoomBehaviorOptions {
	scaleMin?: number;
	scaleMax?: number;
	onZoom?: (transform: ZoomTransform) => void;
}

const DEFAULT_OPTIONS: Required<Omit<ZoomBehaviorOptions, "onZoom">> = {
	scaleMin: 0.1,
	scaleMax: 10,
};

export function createZoomBehavior(
	options: ZoomBehaviorOptions = {},
): ZoomBehavior<SVGSVGElement, unknown> {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	const zoomBehavior = zoom<SVGSVGElement, unknown>().scaleExtent([
		opts.scaleMin,
		opts.scaleMax,
	]);

	if (options.onZoom) {
		zoomBehavior.on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
			options.onZoom?.({
				k: event.transform.k,
				x: event.transform.x,
				y: event.transform.y,
			});
		});
	}

	return zoomBehavior;
}

export function applyZoomBehavior(
	svg: SVGSVGElement,
	behavior: ZoomBehavior<SVGSVGElement, unknown>,
): void {
	select<SVGSVGElement, unknown>(svg).call(behavior);
}

export function resetZoom(
	svg: SVGSVGElement,
	behavior: ZoomBehavior<SVGSVGElement, unknown>,
): void {
	const selection = select<SVGSVGElement, unknown>(svg);
	behavior.transform(selection, zoomIdentity);
}
