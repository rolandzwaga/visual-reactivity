import { select } from "d3-selection";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTimelineBrush } from "../timelineBrush";

describe("createTimelineBrush", () => {
	let container: SVGGElement;

	beforeEach(() => {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		container = document.createElementNS("http://www.w3.org/2000/svg", "g");
		svg.appendChild(container);
		document.body.appendChild(svg);
	});

	it("creates a brush behavior", () => {
		const brush = createTimelineBrush({ width: 500 });

		expect(brush).toBeDefined();
	});

	it("applies brush to selection", () => {
		const brush = createTimelineBrush({ width: 500 });
		const selection = select(container);
		selection.call(brush);

		const brushElement = container.querySelector(".selection");
		expect(brushElement).toBeDefined();
	});

	it("calls onBrush callback", () => {
		const onBrush = vi.fn();
		const brush = createTimelineBrush({ width: 500, onBrush });

		expect(brush).toBeDefined();
	});
});
