import { select } from "d3-selection";
import { beforeEach, describe, expect, it } from "vitest";
import { createTimelineAxis } from "../timelineAxis";
import { createTimelineScale } from "../timelineScale";

describe("createTimelineAxis", () => {
	let container: SVGGElement;

	beforeEach(() => {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		container = document.createElementNS("http://www.w3.org/2000/svg", "g");
		svg.appendChild(container);
		document.body.appendChild(svg);
	});

	it("creates an axis behavior", () => {
		const scale = createTimelineScale({
			startTime: 0,
			endTime: 1000,
			width: 500,
		});

		const axis = createTimelineAxis(scale);

		expect(axis).toBeDefined();
	});

	it("applies axis to selection", () => {
		const scale = createTimelineScale({
			startTime: 0,
			endTime: 1000,
			width: 500,
		});

		const axis = createTimelineAxis(scale);
		const selection = select(container);
		selection.call(axis);

		const axisElement = container.querySelector(".tick");
		expect(axisElement).toBeDefined();
	});

	it("creates bottom axis by default", () => {
		const scale = createTimelineScale({
			startTime: 0,
			endTime: 1000,
			width: 500,
		});

		const axis = createTimelineAxis(scale);
		const selection = select(container);
		selection.call(axis);

		expect(container.querySelector(".domain")).toBeDefined();
	});
});
