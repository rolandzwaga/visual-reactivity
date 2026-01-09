import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import type { Pattern } from "../../types/pattern";
import { PatternBadge } from "../PatternBadge";

describe("PatternBadge", () => {
	const mockPattern: Pattern = {
		id: "orphaned-effect-123-abc",
		type: "orphaned-effect",
		severity: "high",
		affectedNodeIds: ["effect-1"],
		timestamp: Date.now(),
		description: "Effect without owner",
		remediation: "Wrap in createRoot",
		metadata: {},
		isExpected: false,
	};

	it("renders badge with correct color for high severity", () => {
		const onClick = vi.fn();
		const { container } = render(() => (
			<svg>
				<PatternBadge pattern={mockPattern} onClick={onClick} x={100} y={50} />
			</svg>
		));

		const circle = container.querySelector("circle");
		expect(circle).toBeTruthy();
		expect(circle?.getAttribute("fill")).toBe("#ef4444");
	});

	it("renders badge with count of 1 by default", () => {
		const onClick = vi.fn();
		const { container } = render(() => (
			<svg>
				<PatternBadge pattern={mockPattern} onClick={onClick} x={100} y={50} />
			</svg>
		));

		const text = container.querySelector("text");
		expect(text?.textContent).toBe("1");
	});

	it("triggers click handler when clicked", () => {
		const onClick = vi.fn();
		const { container } = render(() => (
			<svg>
				<PatternBadge pattern={mockPattern} onClick={onClick} x={100} y={50} />
			</svg>
		));

		const badge = container.querySelector(".pattern-badge");
		badge?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		expect(onClick).toHaveBeenCalledWith(mockPattern);
	});

	it("renders with correct position translation", () => {
		const onClick = vi.fn();
		const { container } = render(() => (
			<svg>
				<PatternBadge pattern={mockPattern} onClick={onClick} x={100} y={50} />
			</svg>
		));

		const badge = container.querySelector(".pattern-badge");
		expect(badge?.getAttribute("transform")).toBe("translate(100, 50)");
	});

	it("shows count when multiple patterns provided", () => {
		const onClick = vi.fn();
		const patterns: Pattern[] = [
			mockPattern,
			{ ...mockPattern, id: "pattern-2" },
		];

		const { container } = render(() => (
			<svg>
				<PatternBadge
					pattern={mockPattern}
					patterns={patterns}
					onClick={onClick}
					x={100}
					y={50}
				/>
			</svg>
		));

		const text = container.querySelector("text");
		expect(text?.textContent).toBe("2");
	});

	it("uses highest severity color when multiple patterns", () => {
		const onClick = vi.fn();
		const patterns: Pattern[] = [
			{ ...mockPattern, severity: "low" },
			{ ...mockPattern, severity: "high", id: "pattern-2" },
			{ ...mockPattern, severity: "medium", id: "pattern-3" },
		];

		const { container } = render(() => (
			<svg>
				<PatternBadge
					pattern={mockPattern}
					patterns={patterns}
					onClick={onClick}
					x={100}
					y={50}
				/>
			</svg>
		));

		const circle = container.querySelector("circle");
		expect(circle?.getAttribute("fill")).toBe("#ef4444");
	});
});
