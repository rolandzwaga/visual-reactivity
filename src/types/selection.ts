/**
 * Selection types for cross-view synchronization
 * @module types/selection
 * @feature 007-view-sync
 */

import type { Accessor } from "solid-js";

/**
 * Type of visualization view
 */
export type ViewType = "graph" | "tree" | "timeline" | "list";

/**
 * Direction for keyboard navigation
 */
export type NavigationDirection = "up" | "down" | "left" | "right";

/**
 * Graph traversal mode for keyboard navigation
 */
export type GraphTraversalMode = "observers" | "sources" | "both";

/**
 * Type of selection change event
 */
export type SelectionEventType =
	| "selection-add"
	| "selection-remove"
	| "selection-replace"
	| "selection-clear";

/**
 * Action that triggered a selection change
 */
export type SelectionAction = "click" | "keyboard" | "programmatic" | "batch";

/**
 * Scroll behavior for scroll-to-selected operations
 */
export type ScrollBehavior = "smooth" | "instant";

/**
 * Scroll alignment for positioning selected nodes in viewport
 */
export type ScrollAlignment = "center" | "nearest" | "start" | "end";

/**
 * Centralized selection state across all views
 */
export interface SelectionState {
	selectedNodeIds: Set<string>;
	hoveredNodeId: string | null;
	selectionSource: ViewType | null;
	lastSelectionTime: number;
}

/**
 * Event emitted when selection state changes
 */
export interface SelectionEvent {
	type: SelectionEventType;
	addedNodeIds: string[];
	removedNodeIds: string[];
	currentSelection: Set<string>;
	triggeringAction: SelectionAction;
	timestamp: number;
	source: ViewType | null;
}

/**
 * Context for keyboard navigation operations
 */
export interface KeyboardNavigationContext {
	activeView: ViewType;
	currentNodeId: string | null;
	availableDirections: NavigationDirection[];
	graphTraversalMode: GraphTraversalMode;
}

/**
 * Target for scroll-to-selected operation
 */
export interface ScrollTarget {
	nodeId: string;
	viewType: ViewType;
	behavior: ScrollBehavior;
	alignment: ScrollAlignment;
	shouldZoom?: boolean;
	targetZoom?: number;
}

/**
 * Selection store API interface
 */
export interface SelectionStore {
	selectedNodeIds: Accessor<Set<string>>;
	hoveredNodeId: Accessor<string | null>;
	selectionSource: Accessor<ViewType | null>;
	selectionCount: Accessor<number>;
	isNodeSelected(nodeId: string): boolean;
	selectNode(
		nodeId: string,
		multiSelect: boolean,
		source?: ViewType | null,
	): void;
	deselectNode(nodeId: string, source?: ViewType | null): void;
	toggleNodeSelection(nodeId: string, source?: ViewType | null): void;
	setSelection(nodeIds: Set<string> | string[], source?: ViewType | null): void;
	clearSelection(source?: ViewType | null): void;
	setHoveredNode(nodeId: string | null, source?: ViewType | null): void;
	navigateToNextObserver(currentNodeId: string): string | null;
	navigateToNextSource(currentNodeId: string): string | null;
	navigateToOwner(currentNodeId: string): string | null;
	navigateToFirstChild(currentNodeId: string): string | null;
	subscribe(
		viewId: string,
		callback: (event: SelectionEvent) => void,
	): () => void;
}
