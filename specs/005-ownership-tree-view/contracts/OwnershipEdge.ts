/**
 * Ownership Edge Interface
 *
 * Represents a parent-child ownership relationship link for rendering.
 */

import type { TreeNode } from "./TreeNode";

export interface OwnershipEdge {
	id: string; // Format: `${parent.id}->${child.id}`
	source: TreeNode; // Parent node
	target: TreeNode; // Child node
	type: "ownership"; // Edge type (always ownership for this view)
}
