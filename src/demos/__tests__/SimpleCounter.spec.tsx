import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { tracker } from "../../instrumentation";
import { SimpleCounter } from "../SimpleCounter";

describe("SimpleCounter Demo", () => {
	test("creates 1 signal and 1 effect", () => {
		tracker.reset();

		render(() => <SimpleCounter />);

		const nodes = tracker.getNodes();
		const signals = Array.from(nodes.values()).filter(
			(n) => n.type === "signal",
		);
		const effects = Array.from(nodes.values()).filter(
			(n) => n.type === "effect",
		);

		expect(signals).toHaveLength(1);
		expect(effects).toHaveLength(1);
	});

	test("nodes have correct names", () => {
		tracker.reset();

		render(() => <SimpleCounter />);

		const nodes = tracker.getNodes();
		const signal = Array.from(nodes.values()).find((n) => n.type === "signal");
		const effect = Array.from(nodes.values()).find((n) => n.type === "effect");

		expect(signal?.name).toBe("count");
		expect(effect?.name).toBe("display");
	});

	test("increment button updates count", async () => {
		tracker.reset();

		render(() => <SimpleCounter />);

		const incrementButton = screen.getByRole("button", { name: /increment/i });
		expect(incrementButton).toBeTruthy();

		const countDisplay = screen.getByText(/count: 0/i);
		expect(countDisplay).toBeTruthy();

		incrementButton.click();
		await Promise.resolve();

		expect(screen.getByText(/count: 1/i)).toBeTruthy();
	});

	test("signal value updates on increment", () => {
		tracker.reset();

		render(() => <SimpleCounter />);

		const signal = Array.from(tracker.getNodes().values()).find(
			(n) => n.type === "signal",
		);
		expect(signal?.value).toBe(0);

		const incrementButton = screen.getByRole("button", { name: /increment/i });
		incrementButton.click();

		const updatedSignal = tracker.getNode(signal?.id || "");
		expect(updatedSignal?.value).toBe(1);
	});

	test("creates dependency edge from signal to effect", () => {
		tracker.reset();

		render(() => <SimpleCounter />);

		const edges = tracker.getEdges();
		const dependencyEdges = Array.from(edges.values()).filter(
			(e) => e.type === "dependency",
		);

		expect(dependencyEdges.length).toBeGreaterThan(0);

		const signal = Array.from(tracker.getNodes().values()).find(
			(n) => n.type === "signal",
		);
		const effect = Array.from(tracker.getNodes().values()).find(
			(n) => n.type === "effect",
		);

		const edge = dependencyEdges.find(
			(e) => e.source === signal?.id && e.target === effect?.id,
		);
		expect(edge).toBeTruthy();
	});
});
