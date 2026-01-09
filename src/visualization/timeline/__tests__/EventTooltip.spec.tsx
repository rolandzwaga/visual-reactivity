import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import type { TimelineEvent } from "../../../types/timeline";
import { EventTooltip } from "../EventTooltip";

function createMockEvent(): TimelineEvent {
	return {
		id: "e1",
		type: "signal-write",
		timestamp: 12345,
		nodeId: "node1",
		data: { newValue: 42, previousValue: 0 },
		batchId: null,
	};
}

describe("EventTooltip", () => {
	it("renders nothing when not visible", () => {
		const event = createMockEvent();
		const { container } = render(() => (
			<EventTooltip event={event} x={100} y={50} visible={false} />
		));

		expect(container.textContent).toBe("");
	});

	it("renders tooltip when visible", () => {
		const event = createMockEvent();
		const { container } = render(() => (
			<EventTooltip event={event} x={100} y={50} visible={true} />
		));

		expect(container.querySelector("div")).not.toBeNull();
	});

	it("displays event type", () => {
		const event = createMockEvent();
		const { container } = render(() => (
			<EventTooltip event={event} x={100} y={50} visible={true} />
		));

		expect(container.textContent).toContain("signal-write");
	});

	it("displays timestamp", () => {
		const event = createMockEvent();
		const { container } = render(() => (
			<EventTooltip event={event} x={100} y={50} visible={true} />
		));

		expect(container.textContent).toContain("12345");
	});

	it("positions at given coordinates", () => {
		const event = createMockEvent();
		const { container } = render(() => (
			<EventTooltip event={event} x={100} y={50} visible={true} />
		));

		const tooltip = container.querySelector("div");
		expect(tooltip?.style.left).toBe("110px");
		expect(tooltip?.style.top).toBe("20px");
	});
});
