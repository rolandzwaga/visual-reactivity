import { describe, expect, it } from "vitest";
import { testInRoot } from "../../../__tests__/helpers";
import type { ReactiveNode } from "../../../types";
import { useHierarchyLayout } from "../useHierarchyLayout";

describe("useHierarchyLayout", () => {
	const createMockNode = (
		id: string,
		owner: string | null = null,
	): ReactiveNode => ({
		id,
		type: "signal",
		name: id,
		value: 0,
		isStale: false,
		isExecuting: false,
		executionCount: 0,
		lastExecutedAt: 0,
		sources: [],
		observers: [],
		owner,
		owned: [],
		createdAt: Date.now(),
		disposedAt: null,
	});

	it("should return empty array when no nodes provided", () =>
		testInRoot(() => {
			const nodes = () => new Map<string, ReactiveNode>();
			const layout = useHierarchyLayout(nodes);

			expect(layout.roots()).toEqual([]);
			expect(layout.allNodes()).toEqual([]);
		}));

	it("should identify root nodes (owner === null)", () =>
		testInRoot(() => {
			const node1 = createMockNode("root-1", null);
			const node2 = createMockNode("child-1", "root-1");

			const nodes = () =>
				new Map([
					["root-1", node1],
					["child-1", node2],
				]);

			const layout = useHierarchyLayout(nodes);
			const roots = layout.roots();

			expect(roots).toHaveLength(1);
			expect(roots[0].data.id).toBe("root-1");
		}));

	it("should build hierarchy from owner/owned relationships", () =>
		testInRoot(() => {
			const root = createMockNode("root", null);
			const child1 = createMockNode("child-1", "root");
			const child2 = createMockNode("child-2", "root");

			root.owned = ["child-1", "child-2"];

			const nodes = () =>
				new Map([
					["root", root],
					["child-1", child1],
					["child-2", child2],
				]);

			const layout = useHierarchyLayout(nodes);
			const roots = layout.roots();

			expect(roots).toHaveLength(1);
			expect(roots[0].children).toHaveLength(2);
			expect(roots[0].children?.[0].data.id).toBe("child-1");
			expect(roots[0].children?.[1].data.id).toBe("child-2");
		}));

	it("should handle multiple separate trees", () =>
		testInRoot(() => {
			const root1 = createMockNode("root-1", null);
			const root2 = createMockNode("root-2", null);

			const nodes = () =>
				new Map([
					["root-1", root1],
					["root-2", root2],
				]);

			const layout = useHierarchyLayout(nodes);
			const roots = layout.roots();

			expect(roots).toHaveLength(2);
		}));

	it("should calculate tree dimensions", () =>
		testInRoot(() => {
			const root = createMockNode("root", null);
			const child = createMockNode("child", "root");

			root.owned = ["child"];

			const nodes = () =>
				new Map([
					["root", root],
					["child", child],
				]);

			const layout = useHierarchyLayout(nodes);

			expect(layout.treeWidth()).toBeGreaterThan(0);
			expect(layout.treeHeight()).toBeGreaterThan(0);
		}));

	it("should include all nodes in allNodes accessor", () =>
		testInRoot(() => {
			const root = createMockNode("root", null);
			const child = createMockNode("child", "root");

			root.owned = ["child"];

			const nodes = () =>
				new Map([
					["root", root],
					["child", child],
				]);

			const layout = useHierarchyLayout(nodes);
			const allNodes = layout.allNodes();

			expect(allNodes).toHaveLength(2);
		}));
});
