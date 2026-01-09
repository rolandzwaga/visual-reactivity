import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { testInRoot } from "../../__tests__/helpers";

describe("WelcomeMessage", () => {
	it("renders welcome message prompting to open demo menu", async () => {
		const { WelcomeMessage } = await import("../WelcomeMessage");
		const onOpenMenu = vi.fn();

		testInRoot(() => {
			render(() => <WelcomeMessage onOpenMenu={onOpenMenu} />);

			expect(screen.getByText(/demo/i)).toBeInTheDocument();
			expect(screen.getByText(/explore/i)).toBeInTheDocument();
		});
	});

	it("displays open menu button", async () => {
		const { WelcomeMessage } = await import("../WelcomeMessage");
		const onOpenMenu = vi.fn();

		testInRoot(() => {
			render(() => <WelcomeMessage onOpenMenu={onOpenMenu} />);

			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
		});
	});

	it("calls onOpenMenu when button is clicked", async () => {
		const { WelcomeMessage } = await import("../WelcomeMessage");
		const onOpenMenu = vi.fn();

		testInRoot(() => {
			render(() => <WelcomeMessage onOpenMenu={onOpenMenu} />);

			const button = screen.getByRole("button");
			fireEvent.click(button);

			expect(onOpenMenu).toHaveBeenCalledTimes(1);
		});
	});

	it("provides clear call-to-action for users", async () => {
		const { WelcomeMessage } = await import("../WelcomeMessage");
		const onOpenMenu = vi.fn();

		testInRoot(() => {
			render(() => <WelcomeMessage onOpenMenu={onOpenMenu} />);

			const button = screen.getByRole("button");
			expect(button.textContent).toMatch(/demo|open|explore|start/i);
		});
	});
});
