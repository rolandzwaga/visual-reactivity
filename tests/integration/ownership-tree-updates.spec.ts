import { describe, expect, it } from "vitest";
import { tracker } from "../../src/instrumentation";
import {
	createTrackedEffect,
	createTrackedSignal,
} from "../../src/instrumentation/primitives";

describe("Ownership Tree Updates", () => {
	it("should build tree from tracker nodes with ownership relationships", () => {
		tracker.reset();

		createTrackedSignal(0, { name: "root-signal" });

		createTrackedEffect(
			() => {
				createTrackedSignal(1, { name: "child-signal" });
			},
			{ name: "parent-effect" },
		);

		const nodes = tracker.getNodes();
		expect(nodes.size).toBeGreaterThan(0);

		const rootNodes = Array.from(nodes.values()).filter(
			(n) => n.owner === null,
		);
		expect(rootNodes.length).toBeGreaterThan(0);
	});

	it("should track ownership hierarchy correctly", () => {
		tracker.reset();

		createTrackedSignal(0, { name: "signal-1" });
		createTrackedSignal(1, { name: "signal-2" });

		const nodes = tracker.getNodes();

		const allNodes = Array.from(nodes.values());
		expect(allNodes.length).toBeGreaterThan(0);

		const hasOwnerField = allNodes.every((n) => "owner" in n);
		expect(hasOwnerField).toBe(true);
	});

	it("should identify multiple root contexts", () => {
		tracker.reset();

		createTrackedSignal(0, { name: "root-1" });
		createTrackedSignal(1, { name: "root-2" });

		const nodes = tracker.getNodes();
		const roots = Array.from(nodes.values()).filter((n) => n.owner === null);

		expect(roots.length).toBeGreaterThanOrEqual(2);
	});
});
