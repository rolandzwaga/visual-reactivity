import type { HierarchyPointNode } from "d3-hierarchy";
import { describe, expect, it } from "vitest";
import {
	createHierarchyLayout,
	type HierarchyLayoutOptions,
} from "../hierarchyLayout";

describe("hierarchyLayout", () => {
	describe("createHierarchyLayout", () => {
		it("should create a tree layout with nodeSize", () => {
			const layout = createHierarchyLayout();

			expect(layout).toBeDefined();
			expect(layout.nodeSize()).toEqual([60, 80]);
		});

		it("should allow custom nodeSize configuration", () => {
			const options: HierarchyLayoutOptions = {
				nodeWidth: 100,
				nodeHeight: 120,
			};
			const layout = createHierarchyLayout(options);

			expect(layout.nodeSize()).toEqual([100, 120]);
		});

		it("should use default separation function", () => {
			const layout = createHierarchyLayout();
			const separation = layout.separation();

			expect(separation).toBeDefined();
			expect(typeof separation).toBe("function");
		});

		it("should allow custom separation function", () => {
			const customSeparation = () => 2;
			const options: HierarchyLayoutOptions = {
				separation: customSeparation,
			};
			const layout = createHierarchyLayout(options);

			expect(layout.separation()).toBe(customSeparation);
		});

		it("should use default separation multiplier for siblings", () => {
			const layout = createHierarchyLayout();
			const separation = layout.separation();

			const parent = {} as unknown;
			const siblingsA = { parent, depth: 1 } as HierarchyPointNode<unknown>;
			const siblingsB = { parent, depth: 1 } as HierarchyPointNode<unknown>;
			const result = separation(siblingsA, siblingsB);

			expect(result).toBe(1);
		});

		it("should use increased separation multiplier for non-siblings", () => {
			const layout = createHierarchyLayout();
			const separation = layout.separation();

			const nodeA = {
				parent: {} as HierarchyPointNode<unknown>,
				depth: 1,
			} as HierarchyPointNode<unknown>;
			const nodeB = {
				parent: {} as HierarchyPointNode<unknown>,
				depth: 1,
			} as HierarchyPointNode<unknown>;
			const result = separation(nodeA, nodeB);

			expect(result).toBe(1.5);
		});
	});
});
