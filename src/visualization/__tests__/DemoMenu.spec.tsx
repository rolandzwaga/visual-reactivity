import { fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import { testInRoot } from "../../__tests__/helpers";

describe("DemoMenu", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});
	const mockDemos = [
		{
			metadata: {
				id: "test-demo-1",
				name: "Test Demo 1",
				concept: "Test Concept 1",
				description: "Test description 1",
				instructions: "Test instructions 1",
			},
			component: () => <div>Demo 1</div>,
			setup: () => ({ dispose: () => {} }),
		},
		{
			metadata: {
				id: "test-demo-2",
				name: "Test Demo 2",
				concept: "Test Concept 2",
				description: "Test description 2",
				instructions: "Test instructions 2",
			},
			component: () => <div>Demo 2</div>,
			setup: () => ({ dispose: () => {} }),
		},
	];

	it("renders menu with demo list when open", async () => {
		const { DemoMenu } = await import("../DemoMenu");
		const onClose = vi.fn();
		const onSelectDemo = vi.fn();

		testInRoot(() => {
			render(() => (
				<DemoMenu
					isOpen={true}
					onClose={onClose}
					demos={mockDemos}
					activeDemoId={null}
					onSelect={onSelectDemo}
				/>
			));

			expect(screen.getByText("Test Demo 1")).toBeTruthy();
			expect(screen.getByText("Test Demo 2")).toBeTruthy();
		});
	});

	it("does not render when open is false", async () => {
		const { DemoMenu } = await import("../DemoMenu");
		const onClose = vi.fn();
		const onSelectDemo = vi.fn();

		testInRoot(() => {
			const { container } = render(() => (
				<DemoMenu
					isOpen={false}
					onClose={onClose}
					demos={mockDemos}
					activeDemoId={null}
					onSelect={onSelectDemo}
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
					isOpen={true}
					onClose={onClose}
					demos={mockDemos}
					activeDemoId={null}
					onSelect={onSelectDemo}
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
					isOpen={true}
					onClose={onClose}
					demos={mockDemos}
					activeDemoId={null}
					onSelect={onSelectDemo}
				/>
			));

			const demo1Button = screen.getByTestId("demo-item-0");
			fireEvent.click(demo1Button);

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
					isOpen={true}
					onClose={onClose}
					demos={mockDemos}
					activeDemoId={"test-demo-1"}
					onSelect={onSelectDemo}
				/>
			));

			const demo1Button = screen.getByTestId("demo-item-0");
			expect(demo1Button.classList.toString()).toMatch(/active/);
		});
	});
});
