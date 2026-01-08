/**
 * Type contracts for Dependency Graph Visualization
 * Feature: 002-dependency-graph-visualization
 *
 * These types define the visualization layer's data structures.
 * They wrap/extend the instrumentation layer types for D3 force simulation.
 */

import type { EdgeType, NodeType, ReactiveEdge, ReactiveNode } from "../types";

// =============================================================================
// Graph Node Types
// =============================================================================

/**
 * Node representation for D3 force simulation.
 * Extends ReactiveNode data with position and velocity fields.
 */
export interface GraphNode {
	readonly id: string;
	readonly type: NodeType;
	readonly name: string | null;

	/** Current x position (mutated by D3 simulation) */
	x: number;
	/** Current y position (mutated by D3 simulation) */
	y: number;
	/** Velocity x (managed by D3 simulation) */
	vx: number;
	/** Velocity y (managed by D3 simulation) */
	vy: number;
	/** Fixed x position when dragging (null = not fixed) */
	fx: number | null;
	/** Fixed y position when dragging (null = not fixed) */
	fy: number | null;

	/** Reference to underlying tracker node data */
	readonly data: ReactiveNode;
}

/**
 * Edge representation for D3 force simulation.
 * D3 replaces source/target strings with node objects during simulation.
 */
export interface GraphEdge {
	readonly id: string;
	readonly type: EdgeType;
	/** Source node (string ID before simulation, GraphNode after) */
	source: string | GraphNode;
	/** Target node (string ID before simulation, GraphNode after) */
	target: string | GraphNode;
}

// =============================================================================
// Graph State Types
// =============================================================================

/**
 * Complete state for the graph visualization.
 */
export interface GraphState {
	/** All nodes in the graph */
	nodes: GraphNode[];
	/** All edges in the graph */
	edges: GraphEdge[];
	/** Currently selected node ID (for detail panel) */
	selectedNodeId: string | null;
	/** Currently hovered node ID (for highlighting) */
	hoveredNodeId: string | null;
}

/**
 * D3 zoom transform state.
 */
export interface ZoomTransform {
	k: number; // scale
	x: number; // translate x
	y: number; // translate y
}

// =============================================================================
// Detail Panel Types
// =============================================================================

/**
 * Data for the node detail panel.
 */
export interface DetailPanelData {
	/** The selected node */
	node: ReactiveNode;
	/** Upstream dependencies (nodes this node reads from) */
	sources: ReactiveNode[];
	/** Downstream dependents (nodes that read from this node) */
	observers: ReactiveNode[];
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the main DependencyGraph component.
 */
export interface DependencyGraphProps {
	/** Width of the SVG canvas */
	width?: number;
	/** Height of the SVG canvas */
	height?: number;
	/** CSS class for the container */
	class?: string;
}

/**
 * Props for the DetailPanel component.
 */
export interface DetailPanelProps {
	/** Data to display (null = panel hidden) */
	data: DetailPanelData | null;
	/** Callback when panel should close */
	onClose: () => void;
}

/**
 * Props for node shape components.
 */
export interface NodeShapeProps {
	/** The graph node to render */
	node: GraphNode;
	/** Whether this node is currently selected */
	isSelected: boolean;
	/** Whether this node is currently hovered */
	isHovered: boolean;
	/** Callback when node is clicked */
	onClick: (nodeId: string) => void;
	/** Callback when mouse enters node */
	onMouseEnter: (nodeId: string) => void;
	/** Callback when mouse leaves node */
	onMouseLeave: () => void;
	/** Animation visual state */
	pulseScale?: number;
	/** Stale state indicator */
	isStale?: boolean;
	/** Executing state indicator */
	isExecuting?: boolean;
	/** Highlight opacity for execution feedback */
	highlightOpacity?: number;
	/** Disposal progress (0-1) */
	disposeProgress?: number;
}

// =============================================================================
// Visual Constants
// =============================================================================

/**
 * Visual styling constants for node types.
 */
export const NODE_STYLES = {
	signal: {
		shape: "circle" as const,
		color: "#3b82f6", // blue-500
		radius: 20,
	},
	memo: {
		shape: "diamond" as const,
		color: "#8b5cf6", // purple-500
		size: 28,
	},
	effect: {
		shape: "square" as const,
		color: "#22c55e", // green-500
		size: 28,
	},
} as const;

/**
 * Edge styling constants.
 */
export const EDGE_STYLES = {
	dependency: {
		stroke: "#6b7280", // gray-500
		strokeWidth: 2,
	},
	ownership: {
		stroke: "#9ca3af", // gray-400
		strokeWidth: 1,
		strokeDasharray: "4,4",
	},
} as const;

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create a GraphNode from a ReactiveNode.
 */
export function createGraphNode(
	reactiveNode: ReactiveNode,
	x = 0,
	y = 0,
): GraphNode {
	return {
		id: reactiveNode.id,
		type: reactiveNode.type,
		name: reactiveNode.name,
		x,
		y,
		vx: 0,
		vy: 0,
		fx: null,
		fy: null,
		data: reactiveNode,
	};
}

/**
 * Create a GraphEdge from a ReactiveEdge.
 */
export function createGraphEdge(reactiveEdge: ReactiveEdge): GraphEdge {
	return {
		id: reactiveEdge.id,
		type: reactiveEdge.type,
		source: reactiveEdge.source,
		target: reactiveEdge.target,
	};
}
