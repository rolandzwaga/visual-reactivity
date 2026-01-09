import { beforeEach, describe, expect, it } from "vitest";
import { testInRoot } from "../../__tests__/helpers";
import type { ReactivityEvent } from "../../types";
import {
	createTrackedEffect,
	createTrackedMemo,
	createTrackedSignal,
} from "../primitives";
import { tracker } from "../tracker";

describe("createTrackedSignal", () => {
	beforeEach(() => {
		tracker.reset();
	});

	it("should register a signal node on creation", () => {
		testInRoot(() => {
			createTrackedSignal(42, { name: "count" });

			const nodes = tracker.getNodes();
			expect(nodes.size).toBe(1);

			const node = nodes.values().next().value;
			expect(node).toBeDefined();
			expect(node?.type).toBe("signal");
			expect(node?.name).toBe("count");
			expect(node?.value).toBe(42);
		});
	});

	it("should emit signal-create event on creation", () => {
		testInRoot(() => {
			const events: ReactivityEvent[] = [];
			tracker.subscribe((e) => events.push(e));

			createTrackedSignal(10, { name: "test" });

			expect(events.length).toBe(1);
			expect(events[0].type).toBe("signal-create");
			expect(events[0].data).toEqual({ value: 10 });
		});
	});

	it("should emit signal-read event when getter is called", () => {
		testInRoot(() => {
			const [count] = createTrackedSignal(5, { name: "count" });

			const events: ReactivityEvent[] = [];
			tracker.subscribe((e) => events.push(e));

			const value = count();

			expect(value).toBe(5);
			expect(events.length).toBe(1);
			expect(events[0].type).toBe("signal-read");
			expect(events[0].data).toEqual({ value: 5 });
		});
	});

	it("should emit signal-write event when setter is called", () => {
		testInRoot(() => {
			const [count, setCount] = createTrackedSignal(0, { name: "count" });

			const events: ReactivityEvent[] = [];
			tracker.subscribe((e) => events.push(e));

			setCount(10);

			expect(count()).toBe(10);
			expect(events.some((e) => e.type === "signal-write")).toBe(true);

			const writeEvent = events.find((e) => e.type === "signal-write");
			expect(writeEvent).toBeDefined();
			expect(writeEvent?.data).toEqual({ previousValue: 0, newValue: 10 });
		});
	});

	it("should work without a custom name", () => {
		testInRoot(() => {
			createTrackedSignal(1);

			const nodes = tracker.getNodes();
			const node = nodes.values().next().value;

			expect(node).toBeDefined();
			expect(node?.name).toBeNull();
			expect(node?.value).toBe(1);
		});
	});
});

describe("createTrackedMemo", () => {
	beforeEach(() => {
		tracker.reset();
	});

	it("should register a memo node on creation", () => {
		testInRoot(() => {
			const [count] = createTrackedSignal(5, { name: "count" });
			createTrackedMemo(() => count() * 2, { name: "doubled" });

			const nodes = Array.from(tracker.getNodes().values());
			const memoNode = nodes.find((n) => n.type === "memo");

			expect(memoNode).toBeDefined();
			expect(memoNode?.name).toBe("doubled");
		});
	});

	it("should emit computation-execute-start and computation-execute-end events", () => {
		testInRoot(() => {
			const events: ReactivityEvent[] = [];
			tracker.subscribe((e) => events.push(e));

			const [count] = createTrackedSignal(5);
			createTrackedMemo(() => count() * 2);

			const startEvent = events.find(
				(e) => e.type === "computation-execute-start",
			);
			const endEvent = events.find((e) => e.type === "computation-execute-end");

			expect(startEvent).toBeDefined();
			expect(endEvent).toBeDefined();
		});
	});

	it("should record dependency edges when reading signals", () => {
		testInRoot(() => {
			const [countA] = createTrackedSignal(1, { name: "a" });
			const [countB] = createTrackedSignal(2, { name: "b" });
			createTrackedMemo(() => countA() + countB(), { name: "sum" });

			const edges = Array.from(tracker.getEdges().values());
			const depEdges = edges.filter((e) => e.type === "dependency");

			expect(depEdges.length).toBe(2);
		});
	});

	it("should re-evaluate and emit events when dependencies change", () => {
		testInRoot(() => {
			const [count, setCount] = createTrackedSignal(1, { name: "count" });
			const doubled = createTrackedMemo(() => count() * 2, { name: "doubled" });

			expect(doubled()).toBe(2);

			const events: ReactivityEvent[] = [];
			tracker.subscribe((e) => events.push(e));

			setCount(5);

			const reEvalStart = events.filter(
				(e) => e.type === "computation-execute-start",
			);
			expect(reEvalStart.length).toBeGreaterThanOrEqual(1);

			expect(doubled()).toBe(10);
		});
	});
});

describe("createTrackedEffect", () => {
	beforeEach(() => {
		tracker.reset();
	});

	it("should register an effect node on creation", () => {
		testInRoot(() => {
			const [count] = createTrackedSignal(5);
			createTrackedEffect(
				() => {
					count();
				},
				{ name: "logger" },
			);

			const nodes = Array.from(tracker.getNodes().values());
			const effectNode = nodes.find((n) => n.type === "effect");

			expect(effectNode).toBeDefined();
			expect(effectNode?.name).toBe("logger");
		});
	});

	it("should emit computation-execute-start and computation-execute-end events", async () => {
		await testInRoot(async () => {
			const events: ReactivityEvent[] = [];
			const unsubscribe = tracker.subscribe((e) => events.push(e));

			const [count] = createTrackedSignal(5);
			createTrackedEffect(() => {
				count();
			});

			// Allow effect to run in next microtask
			await new Promise<void>((resolve) => queueMicrotask(resolve));

			unsubscribe();

			const startEvents = events.filter(
				(e) => e.type === "computation-execute-start",
			);
			const endEvents = events.filter(
				(e) => e.type === "computation-execute-end",
			);

			expect(startEvents.length).toBeGreaterThanOrEqual(1);
			expect(endEvents.length).toBeGreaterThanOrEqual(1);
		});
	});

	it("should record dependency edges when reading signals", async () => {
		await testInRoot(async () => {
			const [countA] = createTrackedSignal(1, { name: "a" });
			const [countB] = createTrackedSignal(2, { name: "b" });
			createTrackedEffect(() => {
				countA();
				countB();
			});

			// Allow effect to run in next microtask
			await new Promise<void>((resolve) => queueMicrotask(resolve));

			const edges = Array.from(tracker.getEdges().values());
			const depEdges = edges.filter((e) => e.type === "dependency");

			expect(depEdges.length).toBe(2);
		});
	});

	it("should emit computation-dispose event on disposal", () => {
		let disposeEffect: (() => void) | undefined;

		testInRoot(() => {
			const events: ReactivityEvent[] = [];

			const [count] = createTrackedSignal(1);
			disposeEffect = createTrackedEffect(
				() => {
					count();
				},
				{ name: "disposable" },
			);

			tracker.subscribe((e) => events.push(e));

			disposeEffect?.();

			const disposeEvent = events.find((e) => e.type === "computation-dispose");
			expect(disposeEvent).toBeDefined();

			const nodes = Array.from(tracker.getNodes().values());
			const effectNode = nodes.find((n) => n.name === "disposable");
			expect(effectNode?.disposedAt).not.toBeNull();
		});
	});

	it("should create ownership edge between parent and child computation", async () => {
		await testInRoot(async () => {
			const [count] = createTrackedSignal(1);

			createTrackedEffect(
				() => {
					count();
					createTrackedMemo(() => count() * 2, { name: "childMemo" });
				},
				{ name: "parentEffect" },
			);

			// Allow effect to run in next microtask
			await new Promise<void>((resolve) => queueMicrotask(resolve));

			const edges = Array.from(tracker.getEdges().values());
			const ownershipEdges = edges.filter((e) => e.type === "ownership");

			expect(ownershipEdges.length).toBeGreaterThanOrEqual(1);
		});
	});
});

describe("Edge Cases", () => {
	beforeEach(() => {
		tracker.reset();
	});

	it("should handle conditional dependency changes during re-evaluation", async () => {
		await testInRoot(async () => {
			const [condition, setCondition] = createTrackedSignal(true, {
				name: "condition",
			});
			const [valueA] = createTrackedSignal(10, { name: "valueA" });
			const [valueB] = createTrackedSignal(20, { name: "valueB" });

			createTrackedMemo(
				() => {
					if (condition()) {
						return valueA();
					}
					return valueB();
				},
				{ name: "conditionalMemo" },
			);

			await new Promise<void>((resolve) => queueMicrotask(resolve));

			const edgesBefore = Array.from(tracker.getEdges().values());
			const conditionNodeId = Array.from(tracker.getNodes().values()).find(
				(n) => n.name === "condition",
			)?.id;
			const valueANodeId = Array.from(tracker.getNodes().values()).find(
				(n) => n.name === "valueA",
			)?.id;

			const hasConditionDep = edgesBefore.some(
				(e) => e.type === "dependency" && e.source === conditionNodeId,
			);
			const hasValueADep = edgesBefore.some(
				(e) => e.type === "dependency" && e.source === valueANodeId,
			);

			expect(hasConditionDep).toBe(true);
			expect(hasValueADep).toBe(true);

			setCondition(false);
		});
	});

	it("should handle memos and effects without explicit names", () => {
		testInRoot(() => {
			const [count] = createTrackedSignal(1);
			const doubled = createTrackedMemo(() => count() * 2);
			createTrackedEffect(() => {
				doubled();
			});

			const nodes = Array.from(tracker.getNodes().values());
			const signalNode = nodes.find((n) => n.type === "signal");
			const memoNode = nodes.find((n) => n.type === "memo");
			const effectNode = nodes.find((n) => n.type === "effect");

			expect(signalNode?.name).toBeNull();
			expect(memoNode?.name).toBeNull();
			expect(effectNode?.name).toBeNull();

			expect(nodes.length).toBe(3);
		});
	});
});
