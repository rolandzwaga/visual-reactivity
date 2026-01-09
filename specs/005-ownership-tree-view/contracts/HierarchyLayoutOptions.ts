/**
 * Hierarchy Layout Options
 *
 * Configuration for D3 tree layout.
 */

export interface HierarchyLayoutOptions {
	// Node spacing
	nodeWidth: number; // Horizontal spacing between sibling nodes (dx)
	nodeHeight: number; // Vertical spacing between parent/child levels (dy)

	// Separation function
	separation?: (a: unknown, b: unknown) => number;

	// Multiple trees
	treeVerticalSpacing: number; // Space between separate root trees

	// Viewport
	minViewportWidth: number; // Minimum SVG width
	padding: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
}

export const DEFAULT_LAYOUT_OPTIONS: HierarchyLayoutOptions = {
	nodeWidth: 60,
	nodeHeight: 80,
	treeVerticalSpacing: 100,
	minViewportWidth: 800,
	padding: {
		top: 40,
		right: 40,
		bottom: 40,
		left: 40,
	},
};
