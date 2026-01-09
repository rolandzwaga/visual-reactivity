import { beforeEach, describe, expect, it } from "vitest";
import { testInRoot } from "../../__tests__/helpers";
import type { ReactivityEvent } from "../../types";
import {
	createTrackedEffect,
	createTrackedMemo,
	createTrackedSignal,
} from "../primitives";
import { tracker } from "../tracker";

describe("Integration: Full Reactive Chain", () => {
	beforeEach(() => {
		tracker.reset();
	});

	it("should emit ordered events for signal -> memo -> effect chain", async () => {
		await testInRoot(async () => {
			const events: ReactivityEvent[] = [];
			tracker.subscribe((e) => events.push(e));

			const [count, setCount] = createTrackedSignal(1, { name: "count" });
			const doubled = createTrackedMemo(() => count() * 2, {
				name: "doubled",
			});
			createTrackedEffect(
				() => {
					doubled();
				},
				{ name: "logger" },
			);

			await new Promise((resolve) => queueMicrotask(resolve));

			setCount(2);

			await new Promise((resolve) => queueMicrotask(resolve));

			const eventTypes = events.map((e) => e.type);

			expect(eventTypes).toContain("signal-create");
			expect(eventTypes).toContain("computation-create");
			expect(eventTypes).toContain("computation-execute-start");
			expect(eventTypes).toContain("computation-execute-end");
			expect(eventTypes).toContain("signal-write");
		});
	});

	it("should track dependency graph for diamond pattern", async () => {
		await testInRoot(async () => {
			const [a, setA] = createTrackedSignal(1, { name: "a" });
			const b = createTrackedMemo(() => a() + 1, { name: "b" });
			const c = createTrackedMemo(() => a() + 2, { name: "c" });
			createTrackedMemo(() => b() + c(), { name: "d" });

			await new Promise((resolve) => queueMicrotask(resolve));

			setA(10);

			await new Promise((resolve) => queueMicrotask(resolve));

			const edges = Array.from(tracker.getEdges().values());
			const depEdges = edges.filter((e) => e.type === "dependency");

			expect(depEdges.length).toBeGreaterThanOrEqual(2);

			const nodes = Array.from(tracker.getNodes().values());
			const memoNodes = nodes.filter((n) => n.type === "memo");
			expect(memoNodes.length).toBe(3);
		});
	});

	it("should track conditional dependencies correctly", async () => {
		await testInRoot(async () => {
			const [condition, setCondition] = createTrackedSignal(true, {
				name: "condition",
			});
			const [valueA] = createTrackedSignal(1, { name: "valueA" });
			const [valueB] = createTrackedSignal(2, { name: "valueB" });

			createTrackedMemo(
				() => {
					if (condition()) {
						return valueA();
					}
					return valueB();
				},
				{ name: "conditional" },
			);

			await new Promise((resolve) => queueMicrotask(resolve));

			const edgesBefore = Array.from(tracker.getEdges().values());
			const valueADepsBefore = edgesBefore.filter(
				(e) =>
					e.type === "dependency" &&
					tracker.getNode(e.source)?.name === "valueA",
			);
			expect(valueADepsBefore.length).toBeGreaterThanOrEqual(1);

			setCondition(false);

			await new Promise((resolve) => queueMicrotask(resolve));
		});
	});
});
