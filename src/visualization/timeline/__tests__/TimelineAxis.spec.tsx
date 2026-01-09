import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { createTimelineScale } from "../../../d3/timelineScale";
import { TimelineAxis } from "../TimelineAxis";

describe("TimelineAxis", () => {
	it("renders as SVG group", () => {
		const scale = createTimelineScale({
			startTime: 0,
			endTime: 1000,
			width: 1000,
		});

		const { container } = render(() => (
			<svg>
				<TimelineAxis scale={scale} />
			</svg>
		));

		const group = container.querySelector("g");
		expect(group).not.toBeNull();
	});

	it("renders axis ticks", () => {
		const scale = createTimelineScale({
			startTime: 0,
			endTime: 1000,
			width: 1000,
		});

		const { container } = render(() => (
			<svg>
				<TimelineAxis scale={scale} />
			</svg>
		));

		const ticks = container.querySelectorAll(".tick");
		expect(ticks.length).toBeGreaterThan(0);
	});

	it("renders axis domain line", () => {
		const scale = createTimelineScale({
			startTime: 0,
			endTime: 1000,
			width: 1000,
		});

		const { container } = render(() => (
			<svg>
				<TimelineAxis scale={scale} />
			</svg>
		));

		const domain = container.querySelector(".domain");
		expect(domain).not.toBeNull();
	});
});
