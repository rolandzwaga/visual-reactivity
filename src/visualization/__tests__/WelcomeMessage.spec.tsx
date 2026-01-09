import { fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import { testInRoot } from "../../__tests__/helpers";

describe("WelcomeMessage", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});
	it("renders welcome message prompting to open demo menu", async () => {
		const { WelcomeMessage } = await import("../WelcomeMessage");
		const onOpenMenu = vi.fn();

		testInRoot(() => {
			render(() => <WelcomeMessage onOpenMenu={onOpenMenu} />);

			expect(screen.getByText("Welcome to Visual Reactivity")).toBeTruthy();
			expect(screen.getByText(/explore interactive demos/i)).toBeTruthy();
		});
	});

	it("displays open menu button", async () => {
		const { WelcomeMessage } = await import("../WelcomeMessage");
		const onOpenMenu = vi.fn();

		testInRoot(() => {
			render(() => <WelcomeMessage onOpenMenu={onOpenMenu} />);

			const button = screen.getByRole("button");
			expect(button).toBeTruthy();
		});
	});

	it("calls onOpenMenu when button is clicked", async () => {
		const { WelcomeMessage } = await import("../WelcomeMessage");
		const onOpenMenu = vi.fn();

		testInRoot(() => {
			render(() => <WelcomeMessage onOpenMenu={onOpenMenu} />);

			const button = screen.getByTestId("welcome-open-menu");
			fireEvent.click(button);

			expect(onOpenMenu).toHaveBeenCalledTimes(1);
		});
	});

	it("provides clear call-to-action for users", async () => {
		const { WelcomeMessage } = await import("../WelcomeMessage");
		const onOpenMenu = vi.fn();

		testInRoot(() => {
			render(() => <WelcomeMessage onOpenMenu={onOpenMenu} />);

			const button = screen.getByTestId("welcome-open-menu");
			expect(button.textContent).toMatch(/demo|open|explore|start/i);
		});
	});
});
