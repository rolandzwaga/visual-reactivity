import { render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { tracker } from "../../instrumentation";
import { NestedEffects } from "../NestedEffects";

describe("NestedEffects Demo", () => {
	afterEach(() => {
		tracker.reset();
		document.body.innerHTML = "";
	});

	test("creates parent effect with conditional child effects", () => {
		tracker.reset();

		render(() => <NestedEffects />);

		const nodes = tracker.getNodes();
		const signals = Array.from(nodes.values()).filter(
			(n) => n.type === "signal",
		);
		const effects = Array.from(nodes.values()).filter(
			(n) => n.type === "effect",
		);

		expect(signals).toHaveLength(1);
		expect(effects.length).toBeGreaterThan(1);
	});

	test("nodes have correct names", () => {
		tracker.reset();

		render(() => <NestedEffects />);

		const nodes = tracker.getNodes();
		const signal = Array.from(nodes.values()).find((n) => n.type === "signal");
		const parentEffect = Array.from(nodes.values()).find(
			(n) => n.type === "effect" && n.name === "parent",
		);

		expect(signal?.name).toBe("toggle");
		expect(parentEffect?.name).toBe("parent");
	});

	test("displays toggle state", () => {
		tracker.reset();

		render(() => <NestedEffects />);

		expect(screen.getByText(/toggle: inactive/i)).toBeTruthy();
	});

	test("toggle button updates state", async () => {
		tracker.reset();

		render(() => <NestedEffects />);

		const button = screen.getByRole("button", { name: /toggle state/i });
		expect(button).toBeTruthy();

		button.click();
		await Promise.resolve();

		expect(screen.getByText(/toggle: active/i)).toBeTruthy();
	});

	test("creates ownership edges", () => {
		tracker.reset();

		render(() => <NestedEffects />);

		const edges = Array.from(tracker.getEdges().values());
		const ownershipEdges = edges.filter((e) => e.type === "ownership");

		expect(ownershipEdges.length).toBeGreaterThan(0);
	});
});
