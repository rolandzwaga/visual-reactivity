import { render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { tracker } from "../../instrumentation";
import { DerivedState } from "../DerivedState";

describe("DerivedState Demo", () => {
	afterEach(() => {
		tracker.reset();
		document.body.innerHTML = "";
	});

	test("creates signal, memo, and effect", () => {
		tracker.reset();

		render(() => <DerivedState />);

		const nodes = tracker.getNodes();
		const signals = Array.from(nodes.values()).filter(
			(n) => n.type === "signal",
		);
		const memos = Array.from(nodes.values()).filter((n) => n.type === "memo");
		const effects = Array.from(nodes.values()).filter(
			(n) => n.type === "effect",
		);

		expect(signals).toHaveLength(1);
		expect(memos).toHaveLength(1);
		expect(effects).toHaveLength(1);
	});

	test("nodes have correct names", () => {
		tracker.reset();

		render(() => <DerivedState />);

		const nodes = tracker.getNodes();
		const signal = Array.from(nodes.values()).find((n) => n.type === "signal");
		const memo = Array.from(nodes.values()).find((n) => n.type === "memo");
		const effect = Array.from(nodes.values()).find((n) => n.type === "effect");

		expect(signal?.name).toBe("count");
		expect(memo?.name).toBe("doubled");
		expect(effect?.name).toBe("logger");
	});

	test("memo caches derived value", () => {
		tracker.reset();

		render(() => <DerivedState />);

		const memo = Array.from(tracker.getNodes().values()).find(
			(n) => n.type === "memo",
		);
		expect(memo?.value).toBe(0);

		const incrementButton = screen.getByRole("button", { name: /increment/i });
		incrementButton.click();

		const updatedMemo = tracker.getNode(memo?.id || "");
		expect(updatedMemo?.value).toBe(2);
	});

	test("displays count and doubled value", async () => {
		tracker.reset();

		render(() => <DerivedState />);

		expect(screen.getByText(/count: 0/i)).toBeTruthy();
		expect(screen.getByText(/doubled: 0/i)).toBeTruthy();

		const incrementButton = screen.getByRole("button", { name: /increment/i });
		incrementButton.click();
		await Promise.resolve();

		expect(screen.getByText(/count: 1/i)).toBeTruthy();
		expect(screen.getByText(/doubled: 2/i)).toBeTruthy();
	});

	test("creates correct dependency chain", () => {
		tracker.reset();

		render(() => <DerivedState />);

		const signal = Array.from(tracker.getNodes().values()).find(
			(n) => n.type === "signal",
		);
		const memo = Array.from(tracker.getNodes().values()).find(
			(n) => n.type === "memo",
		);
		const effect = Array.from(tracker.getNodes().values()).find(
			(n) => n.type === "effect",
		);

		const edges = Array.from(tracker.getEdges().values());

		const signalToMemo = edges.find(
			(e) => e.source === signal?.id && e.target === memo?.id,
		);
		const memoToEffect = edges.find(
			(e) => e.source === memo?.id && e.target === effect?.id,
		);

		expect(signalToMemo).toBeTruthy();
		expect(memoToEffect).toBeTruthy();
	});
});
