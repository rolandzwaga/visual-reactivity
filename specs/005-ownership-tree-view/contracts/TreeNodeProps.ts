/**
 * Tree Node Component Props
 *
 * Props for rendering individual tree nodes, reusing existing node shape components.
 */

import type { TreeNode } from "./TreeNode";

export interface TreeNodeProps {
	node: TreeNode;

	// State
	isSelected: boolean;
	isHovered: boolean;
	isExpanded: boolean;

	// Animation state (from animation controller)
	pulseScale?: number;
	isStale?: boolean;
	isExecuting?: boolean;
	highlightOpacity?: number;
	disposeProgress?: number; // 0-1, for 5-second fade-out

	// Interactions
	onClick: (nodeId: string) => void;
	onToggle: (nodeId: string) => void;
	onHover: (nodeId: string | null) => void;
}
