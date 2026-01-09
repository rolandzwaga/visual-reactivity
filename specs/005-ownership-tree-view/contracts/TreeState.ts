/**
 * Tree State Interface
 *
 * Manages tree-specific UI state including expansion, visibility,
 * selection, and disposal tracking.
 */

import type { Accessor, Setter } from "solid-js";
import type { OwnershipEdge } from "./OwnershipEdge";
import type { TreeNode } from "./TreeNode";

export interface TreeState {
	// Expansion state
	expandedNodes: Accessor<Set<string>>;
	setExpandedNodes: Setter<Set<string>>;

	// Computed tree structure
	roots: Accessor<TreeNode[]>;
	visibleNodes: Accessor<TreeNode[]>;
	visibleEdges: Accessor<OwnershipEdge[]>;

	// Layout dimensions
	treeWidth: Accessor<number>;
	treeHeight: Accessor<number>;

	// Selection state (synchronized with DependencyGraph)
	selectedNodeId: Accessor<string | null>;
	setSelectedNodeId: Setter<string | null>;

	hoveredNodeId: Accessor<string | null>;
	setHoveredNodeId: Setter<string | null>;

	// Disposal tracking
	disposingNodes: Accessor<Map<string, number>>; // nodeId -> removal timestamp

	// Actions
	toggleExpanded: (nodeId: string) => void;
	selectNode: (nodeId: string | null) => void;
	hoverNode: (nodeId: string | null) => void;
	markDisposing: (nodeId: string) => void;
	removeNode: (nodeId: string) => void;
	reset: () => void;
}
