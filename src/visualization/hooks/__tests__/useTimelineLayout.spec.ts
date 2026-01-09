import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";
import { testInRoot } from "../../../__tests__/helpers";
import { useTimelineLayout } from "../useTimelineLayout";

describe("useTimelineLayout", () => {
	it("initializes with empty swimlanes", () => {
		testInRoot(() => {
			const layout = useTimelineLayout({
				events: [],
				nodes: [],
				width: 1000,
				height: 500,
			});

			expect(layout.swimlanes()).toEqual([]);
			expect(layout.scale()).toBeDefined();
		});
	});

	it("calculates swimlanes for nodes", () => {
		testInRoot(() => {
			const nodes = [
				{ id: "node1", type: "signal" as const, name: "count" },
				{ id: "node2", type: "memo" as const, name: "doubled" },
			];

			const layout = useTimelineLayout({
				events: [],
				nodes,
				width: 1000,
				height: 500,
			});

			const swimlanes = layout.swimlanes();
			expect(swimlanes).toHaveLength(2);
			expect(swimlanes[0].nodeId).toBe("node1");
			expect(swimlanes[1].nodeId).toBe("node2");
		});
	});

	it("updates scale on resize", () => {
		testInRoot(() => {
			const layout = useTimelineLayout({
				events: [],
				nodes: [],
				width: 1000,
				height: 500,
			});

			const initialWidth = layout.scale().width;
			layout.resize(2000, 500);
			const newWidth = layout.scale().width;

			expect(newWidth).toBe(2000);
			expect(newWidth).not.toBe(initialWidth);
		});
	});
});
