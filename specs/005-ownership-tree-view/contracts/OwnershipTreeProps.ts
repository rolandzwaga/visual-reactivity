/**
 * Ownership Tree Component Props
 *
 * Main component props for the ownership tree visualization.
 */

import type { HierarchyLayoutOptions } from "./HierarchyLayoutOptions";

export interface OwnershipTreeProps {
	// Layout configuration
	layoutOptions?: Partial<HierarchyLayoutOptions>;

	// Selection synchronization (shared with DependencyGraph)
	selectedNodeId?: string | null;
	onSelectNode?: (nodeId: string | null) => void;

	// View controls
	width?: number | string;
	height?: number | string;

	// Optional class for styling
	class?: string;
}
