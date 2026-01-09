import { render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { tracker } from "../../instrumentation";
import { DeepChain } from "../DeepChain";

describe("DeepChain Demo", () => {
	afterEach(() => {
		tracker.reset();
		document.body.innerHTML = "";
	});

	test("creates 5-node chain: 1 signal, 3 memos, 1 effect", () => {
		tracker.reset();

		render(() => <DeepChain />);

		const nodes = tracker.getNodes();
		const signals = Array.from(nodes.values()).filter(
			(n) => n.type === "signal",
		);
		const memos = Array.from(nodes.values()).filter((n) => n.type === "memo");
		const effects = Array.from(nodes.values()).filter(
			(n) => n.type === "effect",
		);

		expect(signals).toHaveLength(1);
		expect(memos).toHaveLength(3);
		expect(effects).toHaveLength(1);
	});

	test("nodes have correct names", () => {
		tracker.reset();

		render(() => <DeepChain />);

		const nodes = tracker.getNodes();
		const signal = Array.from(nodes.values()).find((n) => n.type === "signal");
		const memos = Array.from(nodes.values()).filter((n) => n.type === "memo");
		const effect = Array.from(nodes.values()).find((n) => n.type === "effect");

		expect(signal?.name).toBe("signalA");
		expect(memos.map((m) => m.name).sort()).toEqual([
			"memoB",
			"memoC",
			"memoD",
		]);
		expect(effect?.name).toBe("effectE");
	});

	test("memos compute correct chained values", () => {
		tracker.reset();

		render(() => <DeepChain />);

		const memos = Array.from(tracker.getNodes().values()).filter(
			(n) => n.type === "memo",
		);
		const memoB = memos.find((m) => m.name === "memoB");
		const memoC = memos.find((m) => m.name === "memoC");
		const memoD = memos.find((m) => m.name === "memoD");

		expect(memoB?.value).toBe(11);
		expect(memoC?.value).toBe(22);
		expect(memoD?.value).toBe(27);
	});

	test("displays all intermediate values", () => {
		tracker.reset();

		render(() => <DeepChain />);

		expect(screen.getByText(/signal a: 1/i)).toBeTruthy();
		expect(screen.getByText(/memo b: 11/i)).toBeTruthy();
		expect(screen.getByText(/memo c: 22/i)).toBeTruthy();
		expect(screen.getByText(/memo d: 27/i)).toBeTruthy();
	});

	test("creates correct chain dependency structure", () => {
		tracker.reset();

		render(() => <DeepChain />);

		const signal = Array.from(tracker.getNodes().values()).find(
			(n) => n.type === "signal",
		);
		const memos = Array.from(tracker.getNodes().values()).filter(
			(n) => n.type === "memo",
		);
		const effect = Array.from(tracker.getNodes().values()).find(
			(n) => n.type === "effect",
		);

		const memoB = memos.find((m) => m.name === "memoB");
		const memoC = memos.find((m) => m.name === "memoC");
		const memoD = memos.find((m) => m.name === "memoD");

		const edges = Array.from(tracker.getEdges().values());

		const signalToB = edges.find(
			(e) => e.source === signal?.id && e.target === memoB?.id,
		);
		const bToC = edges.find(
			(e) => e.source === memoB?.id && e.target === memoC?.id,
		);
		const cToD = edges.find(
			(e) => e.source === memoC?.id && e.target === memoD?.id,
		);
		const dToEffect = edges.find(
			(e) => e.source === memoD?.id && e.target === effect?.id,
		);

		expect(signalToB).toBeTruthy();
		expect(bToC).toBeTruthy();
		expect(cToD).toBeTruthy();
		expect(dToEffect).toBeTruthy();
	});
});
