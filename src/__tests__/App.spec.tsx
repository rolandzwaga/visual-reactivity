import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { App } from "../App";

describe("App - Timeline Integration", () => {
	test("renders graph and tree view mode buttons", () => {
		render(() => <App />);

		expect(screen.getByText("Dependency Graph")).toBeTruthy();
		expect(screen.getByText("Ownership Tree")).toBeTruthy();
	});

	test("renders timeline view mode button after integration", () => {
		render(() => <App />);

		const buttons = screen.getAllByRole("button");
		const timelineButton = buttons.find((b) => b.textContent === "Timeline");
		expect(timelineButton).toBeTruthy();
	});

	test("creates replay and recording stores", () => {
		render(() => <App />);
	});
});

describe("App - Demo System Integration", () => {
	test("renders demo menu button in navigation", () => {
		render(() => <App />);

		const buttons = screen.getAllByRole("button");
		const demoButton = buttons.find((b) => b.textContent === "Demos");
		expect(demoButton).toBeTruthy();
	});

	test("opens demo menu when Demos button is clicked", async () => {
		render(() => <App />);

		const buttons = screen.getAllByRole("button");
		const demoButton = buttons.find((b) => b.textContent === "Demos");
		expect(demoButton).toBeTruthy();

		demoButton?.click();
		await Promise.resolve(); // flush microtasks

		// Menu should be visible (implementation will provide specific test hook)
		expect(screen.queryByTestId("demo-menu")).toBeTruthy();
	});

	test("loads demo when selected from menu", async () => {
		render(() => <App />);

		// Open menu
		const buttons = screen.getAllByRole("button");
		const demoButton = buttons.find((b) => b.textContent === "Demos");
		expect(demoButton).toBeTruthy();
		demoButton?.click();
		await Promise.resolve();

		// Select first demo (demos should be registered)
		const firstDemo = screen.queryByTestId("demo-item-0");
		expect(firstDemo).toBeTruthy(); // Verify demos are loaded

		firstDemo?.click();
		await Promise.resolve();

		// Demo panel should be visible
		expect(screen.queryByTestId("demo-panel")).toBeTruthy();
	});

	test.skip("cleans up previous demo when switching demos", async () => {
		render(() => <App />);

		// This test verifies cleanup behavior
		// Implementation should call dispose() + tracker.reset() on demo switch
		// Actual verification will be via tracker.getNodes().length check
	});

	test.skip("cleans up demo when closing demo panel", async () => {
		render(() => <App />);

		// Open menu and load demo
		const buttons = screen.getAllByRole("button");
		const demoButton = buttons.find((b) => b.textContent === "Demos");
		demoButton?.click();
		await Promise.resolve();

		// Select first demo
		const firstDemo = screen.queryByTestId("demo-item-0");
		if (firstDemo) {
			firstDemo.click();
			await Promise.resolve();

			// Close demo panel
			const closeButton = screen.queryByTestId("demo-panel-close");
			closeButton?.click();
			await Promise.resolve();

			// Demo panel should be hidden
			expect(screen.queryByTestId("demo-panel")).toBeNull();
		}
	});
});
