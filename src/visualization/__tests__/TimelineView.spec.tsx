import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { TimelineView } from "../TimelineView";

describe("TimelineView", () => {
	it("renders as SVG element", () => {
		const { container } = render(() => (
			<TimelineView width={1000} height={500} />
		));

		const svg = container.querySelector("svg");
		expect(svg).not.toBeNull();
	});

	it("sets correct SVG dimensions", () => {
		const { container } = render(() => (
			<TimelineView width={1000} height={500} />
		));

		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("width")).toBe("1000");
		expect(svg?.getAttribute("height")).toBe("500");
	});

	it("renders axis group", () => {
		const { container } = render(() => (
			<TimelineView width={1000} height={500} />
		));

		const groups = container.querySelectorAll("g");
		expect(groups.length).toBeGreaterThan(0);
	});
});
