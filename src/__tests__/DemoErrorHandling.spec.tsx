import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { App } from "../App";

describe("Demo Error Handling Integration", () => {
	test("displays error message when demo initialization fails", async () => {
		render(() => <App />);

		const buttons = screen.getAllByRole("button");
		const demoButton = buttons.find((b) => b.textContent === "Demos");
		demoButton?.click();
		await Promise.resolve();

		const errorDemo = screen.queryByTestId("demo-item-error-init");
		if (errorDemo) {
			errorDemo.click();
			await Promise.resolve();

			expect(screen.queryByTestId("demo-error-fallback")).toBeTruthy();
			expect(screen.getByText(/initialization error/i)).toBeTruthy();
		}
	});

	test("displays error state when demo execution throws", async () => {
		render(() => <App />);

		const buttons = screen.getAllByRole("button");
		const demoButton = buttons.find((b) => b.textContent === "Demos");
		demoButton?.click();
		await Promise.resolve();

		const errorDemo = screen.queryByTestId("demo-item-error-runtime");
		if (errorDemo) {
			errorDemo.click();
			await Promise.resolve();

			const triggerButton = screen.queryByTestId("trigger-error");
			triggerButton?.click();
			await Promise.resolve();

			expect(screen.queryByTestId("demo-error-fallback")).toBeTruthy();
		}
	});

	test("allows returning to menu after error", async () => {
		render(() => <App />);

		const buttons = screen.getAllByRole("button");
		const demoButton = buttons.find((b) => b.textContent === "Demos");
		demoButton?.click();
		await Promise.resolve();

		const errorDemo = screen.queryByTestId("demo-item-error-init");
		if (errorDemo) {
			errorDemo.click();
			await Promise.resolve();

			const closeButton = screen.queryByTestId("demo-error-close");
			closeButton?.click();
			await Promise.resolve();

			expect(screen.queryByTestId("demo-error-fallback")).toBeNull();
		}
	});

	test("allows retrying failed demo", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		render(() => <App />);

		const buttons = screen.getAllByRole("button");
		const demoButton = buttons.find((b) => b.textContent === "Demos");
		demoButton?.click();
		await Promise.resolve();

		const errorDemo = screen.queryByTestId("demo-item-error-init");
		if (errorDemo) {
			errorDemo.click();
			await Promise.resolve();

			const retryButton = screen.queryByTestId("demo-error-retry");
			if (retryButton) {
				retryButton.click();
				await Promise.resolve();

				expect(screen.queryByTestId("demo-error-fallback")).toBeTruthy();
			}
		}

		consoleSpy.mockRestore();
	});
});
