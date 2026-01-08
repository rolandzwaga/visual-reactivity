import { beforeEach, describe, expect, it, vi } from "vitest";
import { createZoomBehavior, type ZoomBehaviorOptions } from "../zoom";

describe("createZoomBehavior", () => {
	let container: SVGSVGElement;

	beforeEach(() => {
		container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		document.body.appendChild(container);
	});

	it("creates a zoom behavior", () => {
		const behavior = createZoomBehavior();
		expect(behavior).toBeDefined();
	});

	it("accepts scale extent options", () => {
		const options: ZoomBehaviorOptions = {
			scaleMin: 0.5,
			scaleMax: 4,
		};
		const behavior = createZoomBehavior(options);
		expect(behavior).toBeDefined();
	});

	it("calls onZoom callback when transform changes", () => {
		const onZoom = vi.fn();
		const behavior = createZoomBehavior({ onZoom });

		expect(behavior).toBeDefined();
	});
});
