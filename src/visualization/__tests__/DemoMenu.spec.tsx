import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { testInRoot } from "../../__tests__/helpers";

describe("DemoMenu", () => {
	const mockDemos = [
		{
			id: "test-demo-1",
			metadata: {
				name: "Test Demo 1",
				concept: "Test Concept 1",
				description: "Test description 1",
				instructions: "Test instructions 1",
			},
			render: () => <div>Demo 1</div>,
		},
		{
			id: "test-demo-2",
			metadata: {
				name: "Test Demo 2",
				concept: "Test Concept 2",
				description: "Test description 2",
				instructions: "Test instructions 2",
			},
			render: () => <div>Demo 2</div>,
		},
	];

	it("renders menu with demo list when open", async () => {
		const { DemoMenu } = await import("../DemoMenu");
		const onClose = vi.fn();
		const onSelectDemo = vi.fn();

		testInRoot(() => {
			render(() => (
				<DemoMenu
					open={true}
					onClose={onClose}
					demos={mockDemos}
					currentDemoId={null}
					onSelectDemo={onSelectDemo}
				/>
			));

			expect(screen.getByText("Test Demo 1")).toBeInTheDocument();
			expect(screen.getByText("Test Demo 2")).toBeInTheDocument();
		});
	});

	it("does not render when open is false", async () => {
		const { DemoMenu } = await import("../DemoMenu");
		const onClose = vi.fn();
		const onSelectDemo = vi.fn();

		testInRoot(() => {
			const { container } = render(() => (
				<DemoMenu
					open={false}
					onClose={onClose}
					demos={mockDemos}
					currentDemoId={null}
					onSelectDemo={onSelectDemo}
				/>
			));

			expect(container.firstChild).toBeNull();
		});
	});

	it("calls onClose when close button clicked", async () => {
		const { DemoMenu } = await import("../DemoMenu");
		const onClose = vi.fn();
		const onSelectDemo = vi.fn();

		testInRoot(() => {
			render(() => (
				<DemoMenu
					open={true}
					onClose={onClose}
					demos={mockDemos}
					currentDemoId={null}
					onSelectDemo={onSelectDemo}
				/>
			));

			const closeButton = screen.getByRole("button", { name: /close/i });
			fireEvent.click(closeButton);

			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	it("calls onSelectDemo when demo is clicked", async () => {
		const { DemoMenu } = await import("../DemoMenu");
		const onClose = vi.fn();
		const onSelectDemo = vi.fn();

		testInRoot(() => {
			render(() => (
				<DemoMenu
					open={true}
					onClose={onClose}
					demos={mockDemos}
					currentDemoId={null}
					onSelectDemo={onSelectDemo}
				/>
			));

			const demo1 = screen.getByText("Test Demo 1");
			fireEvent.click(demo1);

			expect(onSelectDemo).toHaveBeenCalledWith("test-demo-1");
		});
	});

	it("highlights currently active demo", async () => {
		const { DemoMenu } = await import("../DemoMenu");
		const onClose = vi.fn();
		const onSelectDemo = vi.fn();

		testInRoot(() => {
			render(() => (
				<DemoMenu
					open={true}
					onClose={onClose}
					demos={mockDemos}
					currentDemoId={"test-demo-1"}
					onSelectDemo={onSelectDemo}
				/>
			));

			const demo1Element = screen.getByText("Test Demo 1").closest("button");
			expect(demo1Element).toHaveClass(/active|selected/);
		});
	});
});
