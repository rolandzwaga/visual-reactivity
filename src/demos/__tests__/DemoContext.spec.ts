import { describe, it, expect, beforeEach } from "vitest";
import { testInRoot } from "../../__tests__/helpers";
import { createTrackedSignal } from "../../instrumentation";
import { tracker } from "../../instrumentation/tracker";

describe("DemoContext", () => {
	beforeEach(() => {
		tracker.reset();
	});

	it("creates isolated reactive context with createRoot", () => {
		testInRoot(() => {
			let disposeDemo: (() => void) | null = null;

			import("solid-js").then(({ createRoot }) => {
				createRoot((dispose) => {
					disposeDemo = dispose;
					const [count] = createTrackedSignal(0, { name: "demo-signal" });
					count();
				});

				const nodesBefore = tracker.getNodes().length;
				expect(nodesBefore).toBeGreaterThan(0);

				if (disposeDemo) {
					disposeDemo();
				}

				const nodesAfter = tracker.getNodes().length;
				expect(nodesAfter).toBe(0);
			});
		});
	});

	it("cleanup function disposes reactive scope and resets tracker", () => {
		testInRoot(() => {
			let disposeDemo: (() => void) | null = null;

			import("solid-js").then(({ createRoot }) => {
				createRoot((dispose) => {
					disposeDemo = dispose;
					createTrackedSignal(0, { name: "signal1" });
					createTrackedSignal(1, { name: "signal2" });
				});

				expect(tracker.getNodes().length).toBe(2);

				const cleanup = () => {
					if (disposeDemo) {
						disposeDemo();
						disposeDemo = null;
					}
					tracker.reset();
				};

				cleanup();

				expect(tracker.getNodes().length).toBe(0);
			});
		});
	});

	it("prevents interference between sequential demo contexts", () => {
		testInRoot(() => {
			import("solid-js").then(({ createRoot }) => {
				let dispose1: (() => void) | null = null;

				createRoot((dispose) => {
					dispose1 = dispose;
					createTrackedSignal(0, { name: "demo1-signal" });
				});

				const nodesDemo1 = tracker.getNodes().length;
				expect(nodesDemo1).toBe(1);

				if (dispose1) {
					dispose1();
				}
				tracker.reset();

				expect(tracker.getNodes().length).toBe(0);

				let dispose2: (() => void) | null = null;

				createRoot((dispose) => {
					dispose2 = dispose;
					createTrackedSignal(0, { name: "demo2-signal" });
				});

				const nodesDemo2 = tracker.getNodes().length;
				expect(nodesDemo2).toBe(1);
				expect(tracker.getNodes()[0].name).toBe("demo2-signal");

				if (dispose2) {
					dispose2();
				}
				tracker.reset();
			});
		});
	});
});
