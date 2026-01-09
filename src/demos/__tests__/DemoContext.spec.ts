import { createRoot } from "solid-js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { testInRoot } from "../../__tests__/helpers";
import { createTrackedSignal } from "../../instrumentation";
import { tracker } from "../../instrumentation/tracker";

describe("DemoContext", () => {
	beforeEach(() => {
		tracker.reset();
	});

	afterEach(() => {
		tracker.reset();
	});

	it("creates isolated reactive context with createRoot", () => {
		testInRoot(() => {
			const cleanup = createRoot((dispose) => {
				const [count] = createTrackedSignal(0, { name: "demo-signal" });
				count();
				return () => {
					dispose();
					tracker.reset();
				};
			});

			const nodesBefore = tracker.getNodes().size;
			expect(nodesBefore).toBeGreaterThan(0);

			cleanup();

			const nodesAfter = tracker.getNodes().size;
			expect(nodesAfter).toBe(0);
		});
	});

	it("cleanup function disposes reactive scope and resets tracker", () => {
		testInRoot(() => {
			const cleanup = createRoot((dispose) => {
				createTrackedSignal(0, { name: "signal1" });
				createTrackedSignal(1, { name: "signal2" });
				return () => {
					dispose();
					tracker.reset();
				};
			});

			expect(tracker.getNodes().size).toBe(2);

			cleanup();

			expect(tracker.getNodes().size).toBe(0);
		});
	});

	it("prevents interference between sequential demo contexts", () => {
		testInRoot(() => {
			const cleanup1 = createRoot((dispose) => {
				createTrackedSignal(0, { name: "demo1-signal" });
				return () => {
					dispose();
					tracker.reset();
				};
			});

			const nodesDemo1 = tracker.getNodes().size;
			expect(nodesDemo1).toBe(1);

			cleanup1();

			expect(tracker.getNodes().size).toBe(0);

			const cleanup2 = createRoot((dispose) => {
				createTrackedSignal(0, { name: "demo2-signal" });
				return () => {
					dispose();
					tracker.reset();
				};
			});

			const nodesDemo2 = tracker.getNodes().size;
			expect(nodesDemo2).toBe(1);
			const demo2Signal = Array.from(tracker.getNodes().values())[0];
			expect(demo2Signal.name).toBe("demo2-signal");

			cleanup2();
		});
	});
});
