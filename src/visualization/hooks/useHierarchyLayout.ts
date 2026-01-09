import { type HierarchyPointNode, hierarchy } from "d3-hierarchy";
import { type Accessor, createMemo } from "solid-js";
import { createHierarchyLayout } from "../../d3/hierarchyLayout";
import type { ReactiveNode } from "../../types";

export interface HierarchyLayoutReturn {
	roots: Accessor<HierarchyPointNode<ReactiveNode>[]>;
	allNodes: Accessor<HierarchyPointNode<ReactiveNode>[]>;
	treeWidth: Accessor<number>;
	treeHeight: Accessor<number>;
}

const TREE_VERTICAL_SPACING = 100;
const MIN_VIEWPORT_WIDTH = 800;
const PADDING = 40;

export function useHierarchyLayout(
	nodes: Accessor<Map<string, ReactiveNode>>,
): HierarchyLayoutReturn {
	const treeLayout = createHierarchyLayout<ReactiveNode>();

	const roots = createMemo(() => {
		const nodeMap = nodes();
		const rootNodes: ReactiveNode[] = [];

		for (const [, node] of nodeMap) {
			if (node.owner === null) {
				rootNodes.push(node);
			}
		}

		const hierarchyRoots = rootNodes.map((rootNode) => {
			const root = hierarchy<ReactiveNode>(rootNode, (d) => {
				return d.owned
					.map((childId) => nodeMap.get(childId))
					.filter((child): child is ReactiveNode => child !== undefined)
					.sort((a, b) => a.createdAt - b.createdAt);
			});

			treeLayout(root);

			return root;
		});

		let cumulativeHeight = PADDING;
		for (const root of hierarchyRoots) {
			root.descendants().forEach((node) => {
				node.y = (node.y ?? 0) + cumulativeHeight;
			});

			const maxY = Math.max(...root.descendants().map((n) => n.y ?? 0));
			cumulativeHeight = maxY + TREE_VERTICAL_SPACING;
		}

		return hierarchyRoots as HierarchyPointNode<ReactiveNode>[];
	});

	const allNodes = createMemo(() => {
		return roots().flatMap((root) =>
			root.descendants(),
		) as HierarchyPointNode<ReactiveNode>[];
	});

	const treeWidth = createMemo(() => {
		const all = allNodes();
		if (all.length === 0) return MIN_VIEWPORT_WIDTH;

		const maxX = Math.max(...all.map((n) => n.x ?? 0));
		return Math.max(maxX + PADDING * 2, MIN_VIEWPORT_WIDTH);
	});

	const treeHeight = createMemo(() => {
		const all = allNodes();
		if (all.length === 0) return 600;

		const maxY = Math.max(...all.map((n) => n.y ?? 0));
		return maxY + PADDING * 2;
	});

	return {
		roots,
		allNodes,
		treeWidth,
		treeHeight,
	};
}
