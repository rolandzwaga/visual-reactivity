/**
 * Tree Node Interface
 *
 * Augments ReactiveNode with D3 hierarchy layout information.
 * Used for rendering ownership tree visualization.
 */

import type { HierarchyPointNode } from "d3-hierarchy";
import type { ReactiveNode } from "../../../src/types/nodes";

export interface TreeNode extends HierarchyPointNode<ReactiveNode> {
	// From d3.HierarchyPointNode:
	data: ReactiveNode; // Original reactive node
	parent: TreeNode | null; // D3 hierarchy parent
	children?: TreeNode[]; // D3 hierarchy children
	depth: number; // Distance from root (0-indexed)
	height: number; // Distance to deepest leaf
	x: number; // Computed x position (horizontal in vertical tree)
	y: number; // Computed y position (vertical depth)

	// Tree-specific computed properties:
	id: string; // Convenience accessor: data.id
	isCollapsed: boolean; // Whether this node's children are hidden
	isVisible: boolean; // Whether this node should be rendered
}
