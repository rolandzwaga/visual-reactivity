import { render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { tracker } from "../../instrumentation";
import { ComponentTree } from "../ComponentTree";

describe("ComponentTree Demo", () => {
	afterEach(() => {
		tracker.reset();
		document.body.innerHTML = "";
	});

	test("creates component hierarchy with shared signals", () => {
		tracker.reset();

		render(() => <ComponentTree />);

		const nodes = tracker.getNodes();
		const signals = Array.from(nodes.values()).filter(
			(n) => n.type === "signal",
		);
		const effects = Array.from(nodes.values()).filter(
			(n) => n.type === "effect",
		);

		expect(signals).toHaveLength(2);
		expect(effects.length).toBeGreaterThan(2);
	});

	test("shared theme signal affects multiple components", () => {
		tracker.reset();

		render(() => <ComponentTree />);

		const nodes = tracker.getNodes();
		const themeSignal = Array.from(nodes.values()).find(
			(n) => n.type === "signal" && n.name === "theme",
		);

		expect(themeSignal).toBeTruthy();
		expect(themeSignal?.value).toBe("light");
	});

	test("displays initial todos", () => {
		tracker.reset();

		render(() => <ComponentTree />);

		expect(screen.getByText(/learn solidjs/i)).toBeTruthy();
		expect(screen.getByText(/build reactive app/i)).toBeTruthy();
	});

	test("add todo button works", async () => {
		tracker.reset();

		render(() => <ComponentTree />);

		const initialEffects = Array.from(tracker.getNodes().values()).filter(
			(n) => n.type === "effect",
		).length;

		const addButton = screen.getByRole("button", { name: /add todo/i });
		addButton.click();
		await Promise.resolve();

		expect(screen.getByText(/task 3/i)).toBeTruthy();

		const afterEffects = Array.from(tracker.getNodes().values()).filter(
			(n) => n.type === "effect",
		).length;
		expect(afterEffects).toBeGreaterThan(initialEffects);
	});

	test("delete todo button works", async () => {
		tracker.reset();

		render(() => <ComponentTree />);

		const deleteButton = screen.getByRole("button", { name: /delete last/i });
		deleteButton.click();
		await Promise.resolve();

		const todos = screen.queryByText(/build reactive app/i);
		expect(todos).toBeFalsy();
	});
});
