import { createRoot } from "solid-js";
import { beforeEach, describe, expect, it } from "vitest";
import {
	createTrackedMemo,
	createTrackedSignal,
} from "../../../instrumentation/primitives";
import { tracker } from "../../../instrumentation/tracker";
import { useSignalList } from "../useSignalList";

/**
 * Helper to wait for async operations
 */
function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("useSignalList", () => {
	beforeEach(() => {
		tracker.reset();
	});

	it("should initialize with empty signal list", () => {
		createRoot((dispose) => {
			const { signals } = useSignalList();

			expect(signals()).toEqual([]);

			dispose();
		});
	});

	it("should detect new tracked signals", async () => {
		await createRoot(async (dispose) => {
			const { signals } = useSignalList();

			const [_count] = createTrackedSignal(0, { name: "count" });

			// Allow reactivity to process
			await wait(10);

			const signalList = signals();
			expect(signalList.length).toBe(1);
			expect(signalList[0].name).toBe("count");
			expect(signalList[0].type).toBe("signal");
			expect(signalList[0].currentValue).toBe(0);

			dispose();
		});
	});

	it("should update signal values when they change", async () => {
		await createRoot(async (dispose) => {
			const { signals } = useSignalList();

			const [_count, setCount] = createTrackedSignal(0, { name: "count" });

			await wait(10);
			setCount(42);
			await wait(10);

			const signalList = signals();
			expect(signalList[0].currentValue).toBe(42);
			expect(signalList[0].updateCount).toBeGreaterThan(0);

			dispose();
		});
	});

	it("should track memos as read-only", async () => {
		await createRoot(async (dispose) => {
			const { signals } = useSignalList();

			const [count] = createTrackedSignal(5, { name: "count" });
			const _doubled = createTrackedMemo(() => count() * 2, {
				name: "doubled",
			});

			await wait(10);

			const signalList = signals();
			const memoEntry = signalList.find((s) => s.name === "doubled");

			expect(memoEntry).toBeDefined();
			expect(memoEntry?.type).toBe("memo");
			expect(memoEntry?.isEditable).toBe(false);
			expect(memoEntry?.currentValue).toBe(10);

			dispose();
		});
	});

	it("should remove disposed signals from list", async () => {
		await createRoot(async (dispose) => {
			const { signals } = useSignalList();

			const [_count] = createTrackedSignal(0, { name: "count" });

			await wait(10);
			expect(signals().length).toBe(1);

			// Get the node and dispose it through tracker
			const nodes = Array.from(tracker.getNodes().values());
			const node = nodes.find((n) => n.name === "count");
			if (node) {
				tracker.emit("computation-dispose", node.id, {});
			}

			await wait(10);
			expect(signals().length).toBe(0);

			dispose();
		});
	});

	it("should sort signals alphabetically by name", async () => {
		await createRoot(async (dispose) => {
			const { signals } = useSignalList();

			createTrackedSignal(1, { name: "zebra" });
			createTrackedSignal(2, { name: "alpha" });
			createTrackedSignal(3, { name: "beta" });

			await wait(10);

			const signalList = signals();
			expect(signalList[0].name).toBe("alpha");
			expect(signalList[1].name).toBe("beta");
			expect(signalList[2].name).toBe("zebra");

			dispose();
		});
	});

	it("should handle signals without names (use ID)", async () => {
		await createRoot(async (dispose) => {
			const { signals } = useSignalList();

			createTrackedSignal(0); // No name option

			await wait(10);

			const signalList = signals();
			expect(signalList.length).toBe(1);
			expect(signalList[0].name).toBeNull();
			expect(signalList[0].id).toBeTruthy();

			dispose();
		});
	});

	it("should serialize signal values", async () => {
		await createRoot(async (dispose) => {
			const { signals } = useSignalList();

			createTrackedSignal({ name: "test", value: 42 }, { name: "obj" });

			await wait(10);

			const signalList = signals();
			expect(signalList[0].serializedValue).toBeTruthy();
			expect(signalList[0].serializedValue).toContain('"name":"test"');

			dispose();
		});
	});

	it("should handle unserializable values", async () => {
		await createRoot(async (dispose) => {
			const { signals } = useSignalList();

			const circular: Record<string, unknown> = { name: "test" };
			circular.self = circular;

			createTrackedSignal(circular, { name: "circular" });

			await wait(10);

			const signalList = signals();
			expect(signalList[0].serializedValue).toBeNull();

			dispose();
		});
	});

	it("should track update count for signals", async () => {
		await createRoot(async (dispose) => {
			const { signals } = useSignalList();

			const [_count, setCount] = createTrackedSignal(0, { name: "count" });

			await wait(10);
			const initialUpdateCount = signals()[0].updateCount;

			setCount(1);
			setCount(2);
			setCount(3);

			await wait(10);

			const updatedCount = signals()[0].updateCount;
			expect(updatedCount).toBeGreaterThan(initialUpdateCount);

			dispose();
		});
	});

	it("should update lastUpdatedAt timestamp", async () => {
		await createRoot(async (dispose) => {
			const { signals } = useSignalList();

			const [_count, setCount] = createTrackedSignal(0, { name: "count" });

			await wait(10);
			const initialTimestamp = signals()[0].lastUpdatedAt;

			await wait(10);
			setCount(42);

			await wait(10);

			const updatedTimestamp = signals()[0].lastUpdatedAt;
			expect(updatedTimestamp).toBeGreaterThan(initialTimestamp);

			dispose();
		});
	});

	it("should provide getSignal method to find by ID", async () => {
		await createRoot(async (dispose) => {
			const { getSignal } = useSignalList();

			const [_count] = createTrackedSignal(42, { name: "count" });

			await wait(10);

			const nodes = Array.from(tracker.getNodes().values());
			const node = nodes.find((n) => n.name === "count");
			if (node) {
				const signal = getSignal(node.id);
				expect(signal).toBeDefined();
				expect(signal?.currentValue).toBe(42);
			}

			dispose();
		});
	});

	it("should update signal value via updateSignalValue method", async () => {
		await createRoot(async (dispose) => {
			const { signals, updateSignalValue } = useSignalList();

			const [_count] = createTrackedSignal(0, { name: "count" });

			await wait(10);

			const nodes = Array.from(tracker.getNodes().values());
			const node = nodes.find((n) => n.name === "count");
			if (node) {
				updateSignalValue(node.id, 99);

				await wait(10);

				expect(signals()[0].currentValue).toBe(99);
			}

			dispose();
		});
	});

	it("should handle rapid signal updates (throttling)", async () => {
		await createRoot(async (dispose) => {
			const { signals } = useSignalList();

			const [_count, setCount] = createTrackedSignal(0, { name: "count" });

			// Rapid updates
			for (let i = 0; i < 100; i++) {
				setCount(i);
			}

			await wait(100);

			const signalList = signals();
			expect(signalList[0].currentValue).toBe(99);

			dispose();
		});
	});
});
