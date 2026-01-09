import { type HierarchyPointNode, tree } from "d3-hierarchy";

export interface HierarchyLayoutOptions<Datum = unknown> {
	nodeWidth?: number;
	nodeHeight?: number;
	separation?: (
		a: HierarchyPointNode<Datum>,
		b: HierarchyPointNode<Datum>,
	) => number;
}

export function createHierarchyLayout<Datum>(
	options: HierarchyLayoutOptions<Datum> = {},
) {
	const nodeWidth = options.nodeWidth ?? 60;
	const nodeHeight = options.nodeHeight ?? 80;

	const defaultSeparation = (
		a: HierarchyPointNode<Datum>,
		b: HierarchyPointNode<Datum>,
	): number => {
		return a.parent === b.parent ? 1 : 1.5;
	};

	const treeLayout = tree<Datum>()
		.nodeSize([nodeWidth, nodeHeight])
		.separation(options.separation ?? defaultSeparation);

	return treeLayout;
}

export type TreeLayout<Datum> = ReturnType<typeof tree<Datum>>;
export type TreeNode<Datum> = HierarchyPointNode<Datum>;
