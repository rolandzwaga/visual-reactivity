import { render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { tracker } from "../../instrumentation";
import { ConditionalDependencies } from "../ConditionalDependencies";

describe("ConditionalDependencies Demo", () => {
	afterEach(() => {
		tracker.reset();
		document.body.innerHTML = "";
	});

	test("creates 3 signals and 1 effect", () => {
		tracker.reset();

		render(() => <ConditionalDependencies />);

		const nodes = tracker.getNodes();
		const signals = Array.from(nodes.values()).filter(
			(n) => n.type === "signal",
		);
		const effects = Array.from(nodes.values()).filter(
			(n) => n.type === "effect",
		);

		expect(signals).toHaveLength(3);
		expect(effects).toHaveLength(1);
	});

	test("nodes have correct names", () => {
		tracker.reset();

		render(() => <ConditionalDependencies />);

		const nodes = tracker.getNodes();
		const signals = Array.from(nodes.values()).filter(
			(n) => n.type === "signal",
		);

		const signalNames = signals.map((s) => s.name).sort();
		expect(signalNames).toContain("signalA");
		expect(signalNames).toContain("signalB");
		expect(signalNames).toContain("useA");
	});

	test("displays all signal values", () => {
		tracker.reset();

		render(() => <ConditionalDependencies />);

		expect(screen.getByText(/signal a: 10/i)).toBeTruthy();
		expect(screen.getByText(/signal b: 20/i)).toBeTruthy();
		expect(screen.getByText(/using: signal a/i)).toBeTruthy();
	});

	test("toggle button changes active signal", async () => {
		tracker.reset();

		render(() => <ConditionalDependencies />);

		const toggleButton = screen.getByRole("button", {
			name: /toggle source/i,
		});
		toggleButton.click();
		await Promise.resolve();

		expect(screen.getByText(/using: signal b/i)).toBeTruthy();
	});

	test("creates dependency edges", () => {
		tracker.reset();

		render(() => <ConditionalDependencies />);

		const edges = Array.from(tracker.getEdges().values());
		const dependencyEdges = edges.filter((e) => e.type === "dependency");

		expect(dependencyEdges.length).toBeGreaterThan(0);
	});
});
