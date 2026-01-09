import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import type { TimelineEvent } from "../../../types/timeline";
import { EventDetailsPanel } from "../EventDetailsPanel";

function createMockEvent(): TimelineEvent {
	return {
		id: "e1",
		type: "signal-write",
		timestamp: 12345,
		nodeId: "node1",
		data: { newValue: 42, previousValue: 0 },
		batchId: "batch-1",
	};
}

describe("EventDetailsPanel", () => {
	it("renders nothing when no event selected", () => {
		const { container } = render(() => (
			<EventDetailsPanel event={null} onClose={() => {}} />
		));

		expect(container.textContent).toBe("");
	});

	it("renders panel when event selected", () => {
		const event = createMockEvent();
		const { container } = render(() => (
			<EventDetailsPanel event={event} onClose={() => {}} />
		));

		expect(container.querySelector(".panel")).not.toBeNull();
	});

	it("displays event details", () => {
		const event = createMockEvent();
		const { container } = render(() => (
			<EventDetailsPanel event={event} onClose={() => {}} />
		));

		expect(container.textContent).toContain("signal-write");
		expect(container.textContent).toContain("12345");
		expect(container.textContent).toContain("node1");
	});

	it("displays batch ID when present", () => {
		const event = createMockEvent();
		const { container } = render(() => (
			<EventDetailsPanel event={event} onClose={() => {}} />
		));

		expect(container.textContent).toContain("batch-1");
	});
});
