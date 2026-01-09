import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { createTimelineScale } from "../../../d3/timelineScale";
import type {
	Swimlane as SwimlaneData,
	TimelineEvent,
	TimelineScale,
} from "../../../types/timeline";
import { Swimlane } from "../Swimlane";

function createMockSwimlane(): SwimlaneData {
	return {
		nodeId: "node1",
		nodeName: "count",
		nodeType: "signal",
		yPosition: 0,
		height: 40,
		isDisposed: false,
		disposalTime: null,
		color: "#4FC08D",
	};
}

function createMockEvent(id: string, timestamp: number): TimelineEvent {
	return {
		id,
		type: "signal-write",
		timestamp,
		nodeId: "node1",
		data: { newValue: 1, previousValue: 0 },
		batchId: null,
	};
}

function createMockScale(): TimelineScale {
	return createTimelineScale({
		startTime: 0,
		endTime: 1000,
		width: 1000,
	});
}

describe("Swimlane", () => {
	it("renders as SVG group", () => {
		const swimlane = createMockSwimlane();
		const scale = createMockScale();
		const { container } = render(() => (
			<svg>
				<Swimlane
					swimlane={swimlane}
					events={[]}
					scale={scale}
					isSelected={false}
				/>
			</svg>
		));

		const group = container.querySelector("g");
		expect(group).not.toBeNull();
	});

	it("renders swimlane label", () => {
		const swimlane = createMockSwimlane();
		const scale = createMockScale();
		const { container } = render(() => (
			<svg>
				<Swimlane
					swimlane={swimlane}
					events={[]}
					scale={scale}
					isSelected={false}
				/>
			</svg>
		));

		const text = container.querySelector("text");
		expect(text?.textContent).toBe("count");
	});

	it("renders background rect", () => {
		const swimlane = createMockSwimlane();
		const scale = createMockScale();
		const { container } = render(() => (
			<svg>
				<Swimlane
					swimlane={swimlane}
					events={[]}
					scale={scale}
					isSelected={false}
				/>
			</svg>
		));

		const rect = container.querySelector("rect");
		expect(rect).not.toBeNull();
	});

	it("renders events as EventMarks", () => {
		const swimlane = createMockSwimlane();
		const scale = createMockScale();
		const events = [createMockEvent("e1", 100), createMockEvent("e2", 500)];

		const { container } = render(() => (
			<svg>
				<Swimlane
					swimlane={swimlane}
					events={events}
					scale={scale}
					isSelected={false}
				/>
			</svg>
		));

		const circles = container.querySelectorAll("circle");
		expect(circles.length).toBe(2);
	});

	it("positions events correctly using time scale", () => {
		const swimlane = createMockSwimlane();
		const scale = createMockScale();
		const events = [createMockEvent("e1", 500)];

		const { container } = render(() => (
			<svg>
				<Swimlane
					swimlane={swimlane}
					events={events}
					scale={scale}
					isSelected={false}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		expect(circle?.getAttribute("cx")).toBe("500");
	});
});
