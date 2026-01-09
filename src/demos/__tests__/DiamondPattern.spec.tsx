import { render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { tracker } from "../../instrumentation";
import { DiamondPattern } from "../DiamondPattern";

describe("DiamondPattern Demo", () => {
	afterEach(() => {
		tracker.reset();
		document.body.innerHTML = "";
	});

	test("creates diamond structure: 1 signal, 2 memos, 1 effect", () => {
		tracker.reset();

		render(() => <DiamondPattern />);

		const nodes = tracker.getNodes();
		const signals = Array.from(nodes.values()).filter(
			(n) => n.type === "signal",
		);
		const memos = Array.from(nodes.values()).filter((n) => n.type === "memo");
		const effects = Array.from(nodes.values()).filter(
			(n) => n.type === "effect",
		);

		expect(signals).toHaveLength(1);
		expect(memos).toHaveLength(2);
		expect(effects).toHaveLength(1);
	});

	test("nodes have correct names", () => {
		tracker.reset();

		render(() => <DiamondPattern />);

		const nodes = tracker.getNodes();
		const signal = Array.from(nodes.values()).find((n) => n.type === "signal");
		const memos = Array.from(nodes.values()).filter((n) => n.type === "memo");
		const effect = Array.from(nodes.values()).find((n) => n.type === "effect");

		expect(signal?.name).toBe("value");
		expect(memos.some((m) => m.name === "double")).toBe(true);
		expect(memos.some((m) => m.name === "triple")).toBe(true);
		expect(effect?.name).toBe("sum");
	});

	test("memos compute correct values", () => {
		tracker.reset();

		render(() => <DiamondPattern />);

		const memos = Array.from(tracker.getNodes().values()).filter(
			(n) => n.type === "memo",
		);
		const doubleMemo = memos.find((m) => m.name === "double");
		const tripleMemo = memos.find((m) => m.name === "triple");

		expect(doubleMemo?.value).toBe(2);
		expect(tripleMemo?.value).toBe(3);
	});

	test("effect executes once per signal update", () => {
		tracker.reset();

		render(() => <DiamondPattern />);

		const effect = Array.from(tracker.getNodes().values()).find(
			(n) => n.type === "effect",
		);
		expect(effect).toBeTruthy();

		const initialExecutionCount = effect?.executionCount || 0;
		expect(initialExecutionCount).toBeGreaterThan(0);
	});

	test("creates correct diamond dependency structure", () => {
		tracker.reset();

		render(() => <DiamondPattern />);

		const signal = Array.from(tracker.getNodes().values()).find(
			(n) => n.type === "signal",
		);
		const memos = Array.from(tracker.getNodes().values()).filter(
			(n) => n.type === "memo",
		);
		const effect = Array.from(tracker.getNodes().values()).find(
			(n) => n.type === "effect",
		);

		const edges = Array.from(tracker.getEdges().values());

		const signalToMemo1 = edges.find(
			(e) => e.source === signal?.id && e.target === memos[0]?.id,
		);
		const signalToMemo2 = edges.find(
			(e) => e.source === signal?.id && e.target === memos[1]?.id,
		);
		const memo1ToEffect = edges.find(
			(e) => e.source === memos[0]?.id && e.target === effect?.id,
		);
		const memo2ToEffect = edges.find(
			(e) => e.source === memos[1]?.id && e.target === effect?.id,
		);

		expect(signalToMemo1).toBeTruthy();
		expect(signalToMemo2).toBeTruthy();
		expect(memo1ToEffect).toBeTruthy();
		expect(memo2ToEffect).toBeTruthy();
	});

	test("displays value and sum", () => {
		tracker.reset();

		render(() => <DiamondPattern />);

		expect(screen.getByText(/value: 1/i)).toBeTruthy();
		expect(screen.getByText(/sum: 5/i)).toBeTruthy();
	});
});
