import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { createReactiveNode } from "../../../types";
import { type GraphNode, NODE_STYLES } from "../../types";
import { MemoNode } from "../MemoNode";

function createMockGraphNode(id: string): GraphNode {
	return {
		id,
		type: "memo",
		name: `memo-${id}`,
		x: 100,
		y: 100,
		vx: 0,
		vy: 0,
		fx: null,
		fy: null,
		data: createReactiveNode(id, "memo", `memo-${id}`, null),
	};
}

describe("MemoNode", () => {
	it("renders as a diamond (rotated rect)", () => {
		const node = createMockGraphNode("test");
		const { container } = render(() => (
			<svg>
				<MemoNode
					node={node}
					isSelected={false}
					isHovered={false}
					onClick={() => {}}
					onMouseEnter={() => {}}
					onMouseLeave={() => {}}
				/>
			</svg>
		));

		const rect = container.querySelector("rect");
		expect(rect).not.toBeNull();
		const transform = rect?.getAttribute("transform");
		expect(transform).toContain("rotate(45)");
	});

	it("has correct fill color", () => {
		const node = createMockGraphNode("test");
		const { container } = render(() => (
			<svg>
				<MemoNode
					node={node}
					isSelected={false}
					isHovered={false}
					onClick={() => {}}
					onMouseEnter={() => {}}
					onMouseLeave={() => {}}
				/>
			</svg>
		));

		const rect = container.querySelector("rect");
		expect(rect?.getAttribute("fill")).toBe(NODE_STYLES.memo.color);
	});

	it("calls onClick when clicked", () => {
		const node = createMockGraphNode("test-click");
		const onClick = vi.fn();
		const { container } = render(() => (
			<svg>
				<MemoNode
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
		expect(onClick).toHaveBeenCalledWith("test-click");
	});

	it("shows visual difference when selected", () => {
		const node = createMockGraphNode("test");
		const { container } = render(() => (
			<svg>
				<MemoNode
					node={node}
					isSelected={true}
					isHovered={false}
					onClick={() => {}}
					onMouseEnter={() => {}}
					onMouseLeave={() => {}}
				/>
			</svg>
		));

		const rect = container.querySelector("rect");
		expect(rect?.getAttribute("stroke-width")).toBe("3");
	});

	it("shows visual difference when hovered", () => {
		const node = createMockGraphNode("test");
		const { container } = render(() => (
			<svg>
				<MemoNode
					node={node}
					isSelected={false}
					isHovered={true}
					onClick={() => {}}
					onMouseEnter={() => {}}
					onMouseLeave={() => {}}
				/>
			</svg>
		));

		const rect = container.querySelector("rect");
		expect(rect?.getAttribute("stroke-width")).toBe("2");
	});
});
