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
