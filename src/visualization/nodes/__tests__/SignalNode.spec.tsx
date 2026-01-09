import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { createReactiveNode } from "../../../types";
import { type GraphNode, NODE_STYLES } from "../../types";
import { SignalNode } from "../SignalNode";

function createMockGraphNode(id: string): GraphNode {
	return {
		id,
		type: "signal",
		name: `signal-${id}`,
		x: 100,
		y: 100,
		vx: 0,
		vy: 0,
		fx: null,
		fy: null,
		data: createReactiveNode(id, "signal", `signal-${id}`, 42),
	};
}

describe("SignalNode", () => {
	it("renders as a circle", () => {
		const node = createMockGraphNode("test");
		const { container } = render(() => (
			<svg>
				<SignalNode
					node={node}
					isSelected={false}
					isHovered={false}
					onClick={() => {}}
					onMouseEnter={() => {}}
					onMouseLeave={() => {}}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		expect(circle).not.toBeNull();
	});

	it("has correct fill color", () => {
		const node = createMockGraphNode("test");
		const { container } = render(() => (
			<svg>
				<SignalNode
					node={node}
					isSelected={false}
					isHovered={false}
					onClick={() => {}}
					onMouseEnter={() => {}}
					onMouseLeave={() => {}}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		expect(circle?.getAttribute("fill")).toBe(NODE_STYLES.signal.color);
	});

	it("has correct radius", () => {
		const node = createMockGraphNode("test");
		const { container } = render(() => (
			<svg>
				<SignalNode
					node={node}
					isSelected={false}
					isHovered={false}
					onClick={() => {}}
					onMouseEnter={() => {}}
					onMouseLeave={() => {}}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		expect(circle?.getAttribute("r")).toBe(String(NODE_STYLES.signal.radius));
	});

	it("calls onClick when clicked", () => {
		const node = createMockGraphNode("test-click");
		const onClick = vi.fn();
		const { container } = render(() => (
			<svg>
				<SignalNode
					node={node}
					isSelected={false}
					isHovered={false}
					onClick={onClick}
					onMouseEnter={() => {}}
					onMouseLeave={() => {}}
				/>
			</svg>
		));

		const group = container.querySelector("g");
		group?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onClick).toHaveBeenCalledWith("test-click", expect.any(MouseEvent));
	});

	it("calls onMouseEnter when mouse enters", () => {
		const node = createMockGraphNode("test-enter");
		const onMouseEnter = vi.fn();
		const { container } = render(() => (
			<svg>
				<SignalNode
					node={node}
					isSelected={false}
					isHovered={false}
					onClick={() => {}}
					onMouseEnter={onMouseEnter}
					onMouseLeave={() => {}}
				/>
			</svg>
		));

		const group = container.querySelector("g");
		group?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
		expect(onMouseEnter).toHaveBeenCalledWith("test-enter");
	});

	it("calls onMouseLeave when mouse leaves", () => {
		const node = createMockGraphNode("test-leave");
		const onMouseLeave = vi.fn();
		const { container } = render(() => (
			<svg>
				<SignalNode
					node={node}
					isSelected={false}
					isHovered={false}
					onClick={() => {}}
					onMouseEnter={() => {}}
					onMouseLeave={onMouseLeave}
				/>
			</svg>
		));

		const group = container.querySelector("g");
		group?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
		expect(onMouseLeave).toHaveBeenCalled();
	});

	it("shows visual difference when selected", () => {
		const node = createMockGraphNode("test");
		const { container } = render(() => (
			<svg>
				<SignalNode
					node={node}
					isSelected={true}
					isHovered={false}
					onClick={() => {}}
					onMouseEnter={() => {}}
					onMouseLeave={() => {}}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		expect(circle?.getAttribute("stroke-width")).toBe("3");
	});

	it("shows visual difference when hovered", () => {
		const node = createMockGraphNode("test");
		const { container } = render(() => (
			<svg>
				<SignalNode
					node={node}
					isSelected={false}
					isHovered={true}
					onClick={() => {}}
					onMouseEnter={() => {}}
					onMouseLeave={() => {}}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		expect(circle?.getAttribute("stroke-width")).toBe("2");
	});
});
