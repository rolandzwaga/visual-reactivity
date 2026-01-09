import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { testInRoot } from "../../__tests__/helpers";

describe("DemoPanel", () => {
	const mockDemo = {
		id: "test-demo",
		metadata: {
			name: "Test Demo",
			concept: "Test Concept",
			description: "Test description for the demo",
			instructions: "Click buttons to interact",
		},
		render: () => <div>Demo Content</div>,
	};

	it("renders when demo is provided", async () => {
		const { DemoPanel } = await import("../DemoPanel");
		const onClose = vi.fn();
		const onReset = vi.fn();

		testInRoot(() => {
			render(() => (
				<DemoPanel demo={mockDemo} onClose={onClose} onReset={onReset}>
					<div>Test Children</div>
				</DemoPanel>
			));

			expect(screen.getByText("Test Demo")).toBeInTheDocument();
			expect(
				screen.getByText("Test description for the demo"),
			).toBeInTheDocument();
			expect(screen.getByText("Test Children")).toBeInTheDocument();
		});
	});

	it("does not render when demo is null", async () => {
		const { DemoPanel } = await import("../DemoPanel");
		const onClose = vi.fn();
		const onReset = vi.fn();

		testInRoot(() => {
			const { container } = render(() => (
				<DemoPanel demo={null} onClose={onClose} onReset={onReset}>
					<div>Test Children</div>
				</DemoPanel>
			));

			expect(container.firstChild).toBeNull();
		});
	});

	it("calls onClose when close button is clicked", async () => {
		const { DemoPanel } = await import("../DemoPanel");
		const onClose = vi.fn();
		const onReset = vi.fn();

		testInRoot(() => {
			render(() => (
				<DemoPanel demo={mockDemo} onClose={onClose} onReset={onReset}>
					<div>Test Children</div>
				</DemoPanel>
			));

			const closeButton = screen.getByRole("button", { name: /close|×/i });
			fireEvent.click(closeButton);

			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	it("calls onReset when reset button is clicked", async () => {
		const { DemoPanel } = await import("../DemoPanel");
		const onClose = vi.fn();
		const onReset = vi.fn();

		testInRoot(() => {
			render(() => (
				<DemoPanel demo={mockDemo} onClose={onClose} onReset={onReset}>
					<div>Test Children</div>
				</DemoPanel>
			));

			const resetButton = screen.getByRole("button", { name: /reset/i });
			fireEvent.click(resetButton);

			expect(onReset).toHaveBeenCalledTimes(1);
		});
	});

	it("displays demo metadata (name, description, instructions)", async () => {
		const { DemoPanel } = await import("../DemoPanel");
		const onClose = vi.fn();
		const onReset = vi.fn();

		testInRoot(() => {
			render(() => (
				<DemoPanel demo={mockDemo} onClose={onClose} onReset={onReset}>
					<div>Test Children</div>
				</DemoPanel>
			));

			expect(screen.getByText("Test Demo")).toBeInTheDocument();
			expect(
				screen.getByText(/Test description for the demo/),
			).toBeInTheDocument();
			expect(screen.getByText(/Click buttons to interact/)).toBeInTheDocument();
		});
	});
});
