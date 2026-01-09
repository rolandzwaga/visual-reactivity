import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import type { TimelineEvent } from "../../../types/timeline";
import { EventMark } from "../EventMark";

function createMockEvent(id: string): TimelineEvent {
	return {
		id,
		type: "signal-write",
		timestamp: 100,
		nodeId: "node1",
		data: { newValue: 42, previousValue: 0 },
		batchId: null,
	};
}

describe("EventMark", () => {
	it("renders as a circle", () => {
		const event = createMockEvent("e1");
		const { container } = render(() => (
			<svg>
				<EventMark
					event={event}
					x={100}
					y={50}
					isSelected={false}
					isHovered={false}
					isSnapped={false}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		expect(circle).not.toBeNull();
	});

	it("positions circle correctly", () => {
		const event = createMockEvent("e1");
		const { container } = render(() => (
			<svg>
				<EventMark
					event={event}
					x={100}
					y={50}
					isSelected={false}
					isHovered={false}
					isSnapped={false}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		expect(circle?.getAttribute("cx")).toBe("100");
		expect(circle?.getAttribute("cy")).toBe("50");
	});

	it("calls onClick when clicked", () => {
		const event = createMockEvent("e1");
		const onClick = vi.fn();
		const { container } = render(() => (
			<svg>
				<EventMark
					event={event}
					x={100}
					y={50}
					isSelected={false}
					isHovered={false}
					isSnapped={false}
					onClick={onClick}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		circle?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onClick).toHaveBeenCalled();
	});

	it("calls onHover on mouse enter", () => {
		const event = createMockEvent("e1");
		const onHover = vi.fn();
		const { container } = render(() => (
			<svg>
				<EventMark
					event={event}
					x={100}
					y={50}
					isSelected={false}
					isHovered={false}
					isSnapped={false}
					onHover={onHover}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		circle?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
		expect(onHover).toHaveBeenCalledWith(true);
	});

	it("calls onHover on mouse leave", () => {
		const event = createMockEvent("e1");
		const onHover = vi.fn();
		const { container } = render(() => (
			<svg>
				<EventMark
					event={event}
					x={100}
					y={50}
					isSelected={false}
					isHovered={false}
					isSnapped={false}
					onHover={onHover}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		circle?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
		expect(onHover).toHaveBeenCalledWith(false);
	});

	it("applies selected class when isSelected is true", () => {
		const event = createMockEvent("e1");
		const { container } = render(() => (
			<svg>
				<EventMark
					event={event}
					x={100}
					y={50}
					isSelected={true}
					isHovered={false}
					isSnapped={false}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		expect(circle?.classList.contains("selected")).toBe(true);
	});

	it("applies hovered class when isHovered is true", () => {
		const event = createMockEvent("e1");
		const { container } = render(() => (
			<svg>
				<EventMark
					event={event}
					x={100}
					y={50}
					isSelected={false}
					isHovered={true}
					isSnapped={false}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		expect(circle?.classList.contains("hovered")).toBe(true);
	});

	it("applies snapped class when isSnapped is true", () => {
		const event = createMockEvent("e1");
		const { container } = render(() => (
			<svg>
				<EventMark
					event={event}
					x={100}
					y={50}
					isSelected={false}
					isHovered={false}
					isSnapped={true}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		expect(circle?.classList.contains("snapped")).toBe(true);
	});
});
