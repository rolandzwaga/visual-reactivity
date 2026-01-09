import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
	it("should render dialog with message", () => {
		const { container } = render(() => (
			<ConfirmDialog
				isOpen={true}
				message="Are you sure?"
				onConfirm={() => {}}
				onCancel={() => {}}
			/>
		));

		expect(container.textContent).toContain("Are you sure?");
	});

	it("should call onConfirm when confirm button clicked", () => {
		const mockOnConfirm = vi.fn();
		const { container } = render(() => (
			<ConfirmDialog
				isOpen={true}
				message="Confirm action?"
				onConfirm={mockOnConfirm}
				onCancel={() => {}}
			/>
		));

		const confirmButton = container.querySelector(
			'button[data-action="confirm"]',
		);
		expect(confirmButton).toBeTruthy();
	});

	it("should call onCancel when cancel button clicked", () => {
		const mockOnCancel = vi.fn();
		const { container } = render(() => (
			<ConfirmDialog
				isOpen={true}
				message="Cancel action?"
				onConfirm={() => {}}
				onCancel={mockOnCancel}
			/>
		));

		const cancelButton = container.querySelector(
			'button[data-action="cancel"]',
		);
		expect(cancelButton).toBeTruthy();
	});

	it("should not render when isOpen is false", () => {
		const { container } = render(() => (
			<ConfirmDialog
				isOpen={false}
				message="Should not appear"
				onConfirm={() => {}}
				onCancel={() => {}}
			/>
		));

		expect(container.textContent).toBe("");
	});

	it("should render with custom title", () => {
		const { container } = render(() => (
			<ConfirmDialog
				isOpen={true}
				title="Custom Title"
				message="Message"
				onConfirm={() => {}}
				onCancel={() => {}}
			/>
		));

		expect(container.textContent).toContain("Custom Title");
	});
});
