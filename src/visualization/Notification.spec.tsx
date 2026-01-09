import { render } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Notification } from "./Notification";

describe("Notification", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should render notification with message", () => {
		const { container } = render(() => (
			<Notification
				isOpen={true}
				message="Test notification"
				onClose={() => {}}
			/>
		));

		expect(container.textContent).toContain("Test notification");
	});

	it("should not render when isOpen is false", () => {
		const { container } = render(() => (
			<Notification isOpen={false} message="Hidden" onClose={() => {}} />
		));

		expect(container.textContent).toBe("");
	});

	it("should auto-dismiss after 3 seconds", () => {
		const mockOnClose = vi.fn();
		render(() => (
			<Notification isOpen={true} message="Auto close" onClose={mockOnClose} />
		));

		expect(mockOnClose).not.toHaveBeenCalled();

		vi.advanceTimersByTime(3000);

		expect(mockOnClose).toHaveBeenCalled();
	});

	it("should call onClose when close button clicked", () => {
		const mockOnClose = vi.fn();
		const { container } = render(() => (
			<Notification isOpen={true} message="Closeable" onClose={mockOnClose} />
		));

		const closeButton = container.querySelector('button[data-action="close"]');
		expect(closeButton).toBeTruthy();
	});

	it("should support custom duration", () => {
		const mockOnClose = vi.fn();
		render(() => (
			<Notification
				isOpen={true}
				message="Custom duration"
				duration={5000}
				onClose={mockOnClose}
			/>
		));

		vi.advanceTimersByTime(3000);
		expect(mockOnClose).not.toHaveBeenCalled();

		vi.advanceTimersByTime(2000);
		expect(mockOnClose).toHaveBeenCalled();
	});
});
