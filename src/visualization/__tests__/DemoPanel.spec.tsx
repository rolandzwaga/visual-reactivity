import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { testInRoot } from "../../__tests__/helpers";

describe("DemoPanel", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	const mockDemo = {
		id: "test-demo",
		metadata: {
			id: "test-demo",
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
				<DemoPanel
					metadata={mockDemo.metadata}
					onClose={onClose}
					onReset={onReset}
				>
					<div>Test Children</div>
				</DemoPanel>
			));

			expect(screen.getByText("Test Demo")).toBeTruthy();
			expect(screen.getByText(/Click buttons to interact/)).toBeTruthy();
			expect(screen.getByText("Test Children")).toBeTruthy();
		});
	});

	it("does not render when demo is null", async () => {
		const { DemoPanel } = await import("../DemoPanel");
		const onClose = vi.fn();
		const onReset = vi.fn();

		testInRoot(() => {
			const { container } = render(() => (
				<DemoPanel metadata={null} onClose={onClose} onReset={onReset}>
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
				<DemoPanel
					metadata={mockDemo.metadata}
					onClose={onClose}
					onReset={onReset}
				>
					<div>Test Children</div>
				</DemoPanel>
			));

			const closeButton = screen.getByTestId("demo-panel-close");
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
				<DemoPanel
					metadata={mockDemo.metadata}
					onClose={onClose}
					onReset={onReset}
				>
					<div>Test Children</div>
				</DemoPanel>
			));

			const resetButton = screen.getByTestId("demo-panel-reset");
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
				<DemoPanel
					metadata={mockDemo.metadata}
					onClose={onClose}
					onReset={onReset}
				>
					<div>Test Children</div>
				</DemoPanel>
			));

			expect(screen.getByText("Test Demo")).toBeTruthy();
			expect(screen.getByText("Test Concept")).toBeTruthy();
			expect(screen.getByText(/Click buttons to interact/)).toBeTruthy();
		});
	});
});
