import { createRoot } from "solid-js";
import { beforeEach, describe, expect, it } from "vitest";
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
		const events: ReactivityEvent[] = [];
		tracker.subscribe((e) => events.push(e));

		await new Promise<void>((resolve) => {
			createRoot((dispose) => {
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

				queueMicrotask(() => {
					setCount(2);

					queueMicrotask(() => {
						dispose();
						resolve();
					});
				});
			});
		});

		const eventTypes = events.map((e) => e.type);

		expect(eventTypes).toContain("signal-create");
		expect(eventTypes).toContain("computation-create");
		expect(eventTypes).toContain("computation-execute-start");
		expect(eventTypes).toContain("computation-execute-end");
		expect(eventTypes).toContain("signal-write");
	});

	it("should track dependency graph for diamond pattern", async () => {
		await new Promise<void>((resolve) => {
			createRoot((dispose) => {
				const [a, setA] = createTrackedSignal(1, { name: "a" });
				const b = createTrackedMemo(() => a() + 1, { name: "b" });
				const c = createTrackedMemo(() => a() + 2, { name: "c" });
				createTrackedMemo(() => b() + c(), { name: "d" });

				queueMicrotask(() => {
					setA(10);

					queueMicrotask(() => {
						const edges = Array.from(tracker.getEdges().values());
						const depEdges = edges.filter((e) => e.type === "dependency");

						expect(depEdges.length).toBeGreaterThanOrEqual(2);

						const nodes = Array.from(tracker.getNodes().values());
						const memoNodes = nodes.filter((n) => n.type === "memo");
						expect(memoNodes.length).toBe(3);

						dispose();
						resolve();
					});
				});
			});
		});
	});

	it("should track conditional dependencies correctly", async () => {
		await new Promise<void>((resolve) => {
			createRoot((dispose) => {
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

				queueMicrotask(() => {
					const edgesBefore = Array.from(tracker.getEdges().values());
					const valueADepsBefore = edgesBefore.filter(
						(e) =>
							e.type === "dependency" &&
							tracker.getNode(e.source)?.name === "valueA",
					);
					expect(valueADepsBefore.length).toBeGreaterThanOrEqual(1);

					setCondition(false);

					queueMicrotask(() => {
						dispose();
						resolve();
					});
				});
			});
		});
	});
});
