/**
 * API Contract: Selection Store
 *
 * Defines the public interface for centralized selection state management
 * across all visualization views (dependency graph, ownership tree, timeline, values panel).
 *
 * @module contracts/selection-store
 * @feature 007-view-sync
 */

import type { Accessor } from "solid-js";

// ============================================================================
// Core Types
// ============================================================================

/**
 * Type of visualization view.
 */
export type ViewType = "graph" | "tree" | "timeline" | "list";

/**
 * Direction for keyboard navigation.
 */
export type NavigationDirection = "up" | "down" | "left" | "right";

/**
 * Graph traversal mode for keyboard navigation.
 */
export type GraphTraversalMode = "observers" | "sources" | "both";

/**
 * Type of selection change event.
 */
export type SelectionEventType =
	| "selection-add" // Node(s) added to selection
	| "selection-remove" // Node(s) removed from selection
	| "selection-replace" // Selection completely replaced
	| "selection-clear"; // All selections cleared

/**
 * Action that triggered a selection change.
 */
export type SelectionAction =
	| "click" // Mouse click
	| "keyboard" // Keyboard navigation
	| "programmatic" // API call
	| "batch"; // Batch operation (e.g., select all)

/**
 * Scroll behavior for scroll-to-selected operations.
 */
export type ScrollBehavior = "smooth" | "instant";

/**
 * Scroll alignment for positioning selected nodes in viewport.
 */
export type ScrollAlignment = "center" | "nearest" | "start" | "end";

// ============================================================================
// State Entities
// ============================================================================

/**
 * Centralized selection state.
 *
 * Represents the current selection across all views.
 */
export interface SelectionState {
	/**
	 * Set of currently selected reactive node IDs.
	 * Empty Set means no selection.
	 * Maximum 1000 nodes for performance.
	 */
	selectedNodeIds: Set<string>;

	/**
	 * Currently hovered node ID (for hover previews).
	 * Only one node can be hovered at a time.
	 * Null means no hover.
	 */
	hoveredNodeId: string | null;

	/**
	 * Which view initiated the current selection.
	 * Null means no selection or programmatic selection.
	 */
	selectionSource: ViewType | null;

	/**
	 * Timestamp of last selection change (ms since epoch).
	 */
	lastSelectionTime: number;
}

/**
 * Event emitted when selection state changes.
 *
 * Provides delta information (added/removed) and full current state.
 * Views subscribe to these events to update their highlighting.
 */
export interface SelectionEvent {
	/**
	 * Type of selection change.
	 */
	type: SelectionEventType;

	/**
	 * Node IDs added to selection.
	 * Empty array if no nodes added.
	 */
	addedNodeIds: string[];

	/**
	 * Node IDs removed from selection.
	 * Empty array if no nodes removed.
	 */
	removedNodeIds: string[];

	/**
	 * Full selection state after change.
	 * Immutable Set - do not modify.
	 */
	currentSelection: Set<string>;

	/**
	 * Action that triggered this event.
	 */
	triggeringAction: SelectionAction;

	/**
	 * When event occurred (ms since epoch).
	 */
	timestamp: number;

	/**
	 * Which view triggered the event.
	 * Null for programmatic or batch operations.
	 */
	source: ViewType | null;
}

/**
 * Context for keyboard navigation operations.
 */
export interface KeyboardNavigationContext {
	/**
	 * Which view currently has keyboard focus.
	 */
	activeView: ViewType;

	/**
	 * Currently focused node for navigation.
	 * Null if no node focused.
	 */
	currentNodeId: string | null;

	/**
	 * Valid navigation directions from current node.
	 * Empty array if no navigation possible.
	 */
	availableDirections: NavigationDirection[];

	/**
	 * How to traverse graph (observers vs sources).
	 */
	graphTraversalMode: GraphTraversalMode;
}

/**
 * Target for scroll-to-selected operation.
 */
export interface ScrollTarget {
	/**
	 * Node to scroll to.
	 */
	nodeId: string;

	/**
	 * Which view should scroll.
	 */
	viewType: ViewType;

	/**
	 * Smooth or instant scroll.
	 */
	behavior: ScrollBehavior;

	/**
	 * Where to position node in viewport.
	 */
	alignment: ScrollAlignment;

	/**
	 * Whether to zoom (for SVG views).
	 * Default: false
	 */
	shouldZoom?: boolean;

	/**
	 * Target zoom level if shouldZoom is true.
	 * Default: 1.5
	 */
	targetZoom?: number;
}

// ============================================================================
// Selection Store API
// ============================================================================

/**
 * Programmatic interface for selection store.
 *
 * Use `createSelectionStore()` to instantiate.
 * Pass to all views as prop for cross-view synchronization.
 *
 * @example
 * ```typescript
 * const selection = createSelectionStore();
 *
 * // In component
 * const isSelected = selection.isNodeSelected('signal-1');
 * selection.selectNode('signal-1', false);
 * ```
 */
export interface SelectionStore {
	// ========================================================================
	// Reactive Getters (Accessors)
	// ========================================================================

	/**
	 * Get all currently selected node IDs.
	 * Returns reactive accessor that updates when selection changes.
	 *
	 * @returns Set of selected node IDs (immutable - do not modify)
	 *
	 * @example
	 * ```typescript
	 * createEffect(() => {
	 *   const ids = selection.selectedNodeIds();
	 *   console.log(`${ids.size} nodes selected`);
	 * });
	 * ```
	 */
	selectedNodeIds: Accessor<Set<string>>;

	/**
	 * Get currently hovered node ID.
	 * Returns reactive accessor that updates when hover changes.
	 *
	 * @returns Node ID or null if no hover
	 *
	 * @example
	 * ```typescript
	 * const hovered = selection.hoveredNodeId();
	 * if (hovered) console.log(`Hovering: ${hovered}`);
	 * ```
	 */
	hoveredNodeId: Accessor<string | null>;

	/**
	 * Get which view initiated current selection.
	 * Returns reactive accessor that updates when selection source changes.
	 *
	 * @returns View type or null
	 */
	selectionSource: Accessor<ViewType | null>;

	/**
	 * Get number of selected nodes.
	 * Returns reactive accessor computed from selectedNodeIds.
	 *
	 * @returns Count of selected nodes
	 *
	 * @example
	 * ```typescript
	 * <Show when={selection.selectionCount() > 0}>
	 *   <p>{selection.selectionCount()} nodes selected</p>
	 * </Show>
	 * ```
	 */
	selectionCount: Accessor<number>;

	/**
	 * Check if specific node is selected.
	 * O(1) lookup using Set.has().
	 *
	 * @param nodeId - Node ID to check
	 * @returns True if node is selected
	 *
	 * @example
	 * ```typescript
	 * const isSelected = selection.isNodeSelected('signal-1');
	 * ```
	 */
	isNodeSelected(nodeId: string): boolean;

	// ========================================================================
	// Selection Actions (Setters)
	// ========================================================================

	/**
	 * Select a node (single or multi-select).
	 *
	 * @param nodeId - Node ID to select
	 * @param multiSelect - If true, add to selection; if false, replace selection
	 * @param source - Which view triggered selection (default: null)
	 *
	 * @throws {Error} If nodeId doesn't exist in tracker
	 * @throws {Error} If selection would exceed 1000 nodes
	 *
	 * @example
	 * ```typescript
	 * // Single select (replaces existing)
	 * selection.selectNode('signal-1', false);
	 *
	 * // Multi-select (adds to existing)
	 * selection.selectNode('signal-2', true);
	 * ```
	 */
	selectNode(
		nodeId: string,
		multiSelect: boolean,
		source?: ViewType | null,
	): void;

	/**
	 * Deselect a node.
	 *
	 * @param nodeId - Node ID to deselect
	 * @param source - Which view triggered deselection (default: null)
	 *
	 * @example
	 * ```typescript
	 * selection.deselectNode('signal-1');
	 * ```
	 */
	deselectNode(nodeId: string, source?: ViewType | null): void;

	/**
	 * Toggle node selection (add if not selected, remove if selected).
	 *
	 * @param nodeId - Node ID to toggle
	 * @param source - Which view triggered toggle (default: null)
	 *
	 * @example
	 * ```typescript
	 * // Ctrl+click handler
	 * selection.toggleNodeSelection('signal-1', 'graph');
	 * ```
	 */
	toggleNodeSelection(nodeId: string, source?: ViewType | null): void;

	/**
	 * Replace current selection with new set of nodes.
	 *
	 * @param nodeIds - New selection (Set or Array)
	 * @param source - Which view triggered replacement (default: null)
	 *
	 * @throws {Error} If any nodeId doesn't exist in tracker
	 * @throws {Error} If selection would exceed 1000 nodes
	 *
	 * @example
	 * ```typescript
	 * // Select all signals
	 * const signalIds = getAllSignalIds();
	 * selection.setSelection(new Set(signalIds));
	 * ```
	 */
	setSelection(nodeIds: Set<string> | string[], source?: ViewType | null): void;

	/**
	 * Clear all selections.
	 *
	 * @param source - Which view triggered clear (default: null)
	 *
	 * @example
	 * ```typescript
	 * // Escape key handler
	 * selection.clearSelection('graph');
	 * ```
	 */
	clearSelection(source?: ViewType | null): void;

	// ========================================================================
	// Hover Actions
	// ========================================================================

	/**
	 * Set currently hovered node.
	 * Replaces previous hover (not additive).
	 *
	 * @param nodeId - Node ID to hover, or null to clear hover
	 * @param source - Which view triggered hover (default: null)
	 *
	 * @example
	 * ```typescript
	 * // Mouse enter handler
	 * selection.setHoveredNode('signal-1', 'graph');
	 *
	 * // Mouse leave handler
	 * selection.setHoveredNode(null, 'graph');
	 * ```
	 */
	setHoveredNode(nodeId: string | null, source?: ViewType | null): void;

	// ========================================================================
	// Keyboard Navigation
	// ========================================================================

	/**
	 * Navigate to next observer (downstream dependent) in dependency graph.
	 *
	 * @param currentNodeId - Starting node ID
	 * @returns Next observer ID, or null if no observers
	 *
	 * @example
	 * ```typescript
	 * // Right arrow key in graph
	 * const next = selection.navigateToNextObserver(currentId);
	 * if (next) selection.selectNode(next, false, 'graph');
	 * ```
	 */
	navigateToNextObserver(currentNodeId: string): string | null;

	/**
	 * Navigate to next source (upstream dependency) in dependency graph.
	 *
	 * @param currentNodeId - Starting node ID
	 * @returns Next source ID, or null if no sources
	 *
	 * @example
	 * ```typescript
	 * // Left arrow key in graph
	 * const next = selection.navigateToNextSource(currentId);
	 * if (next) selection.selectNode(next, false, 'graph');
	 * ```
	 */
	navigateToNextSource(currentNodeId: string): string | null;

	/**
	 * Navigate to parent (owner) in ownership tree.
	 *
	 * @param currentNodeId - Starting node ID
	 * @returns Parent node ID, or null if no parent
	 *
	 * @example
	 * ```typescript
	 * // Up arrow key in tree
	 * const parent = selection.navigateToOwner(currentId);
	 * if (parent) selection.selectNode(parent, false, 'tree');
	 * ```
	 */
	navigateToOwner(currentNodeId: string): string | null;

	/**
	 * Navigate to first child (owned node) in ownership tree.
	 *
	 * @param currentNodeId - Starting node ID
	 * @returns First child ID, or null if no children
	 *
	 * @example
	 * ```typescript
	 * // Down arrow key in tree
	 * const child = selection.navigateToFirstChild(currentId);
	 * if (child) selection.selectNode(child, false, 'tree');
	 * ```
	 */
	navigateToFirstChild(currentNodeId: string): string | null;

	// ========================================================================
	// Event Subscription
	// ========================================================================

	/**
	 * Subscribe to selection change events.
	 *
	 * Callback is invoked on every selection change with delta information.
	 * Use for views that need to update highlighting reactively.
	 *
	 * @param viewId - Unique identifier for the view
	 * @param callback - Function called on selection changes
	 * @returns Unsubscribe function - call to stop receiving events
	 *
	 * @example
	 * ```typescript
	 * onMount(() => {
	 *   const unsubscribe = selection.subscribe('graph-view', (event) => {
	 *     console.log('Selection changed:', event.type);
	 *     updateHighlighting(event.currentSelection);
	 *   });
	 *
	 *   onCleanup(() => unsubscribe());
	 * });
	 * ```
	 */
	subscribe(
		viewId: string,
		callback: (event: SelectionEvent) => void,
	): () => void;
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new selection store instance.
 *
 * Typically called once at app level and passed to all views.
 *
 * @returns SelectionStore instance
 *
 * @example
 * ```typescript
 * // App.tsx
 * function App() {
 *   const selection = createSelectionStore();
 *
 *   return (
 *     <>
 *       <DependencyGraph selection={selection} />
 *       <OwnershipTree selection={selection} />
 *       <TimelineView selection={selection} />
 *       <LiveValuesPanel selection={selection} />
 *     </>
 *   );
 * }
 * ```
 */
export function createSelectionStore(): SelectionStore;

// ============================================================================
// Hook Contracts
// ============================================================================

/**
 * Return type for useSelectionSync hook.
 */
export interface UseSelectionSyncReturn {
	/**
	 * Check if node is selected.
	 *
	 * @param nodeId - Node ID to check
	 * @returns True if selected
	 */
	isNodeSelected(nodeId: string): boolean;

	/**
	 * Handle node click (with modifier key support).
	 *
	 * @param nodeId - Node that was clicked
	 * @param event - Mouse event (for Ctrl/Cmd detection)
	 */
	handleNodeClick(nodeId: string, event: MouseEvent): void;

	/**
	 * Set of all selected node IDs (reactive).
	 */
	highlightedNodeIds: Accessor<Set<string>>;
}

/**
 * Hook for integrating selection synchronization into a view.
 *
 * Provides convenient helper methods for click handling and selection checking.
 * Automatically subscribes to selection events and cleans up on unmount.
 *
 * @param viewType - Type of view using this hook
 * @param selection - Selection store instance
 * @returns Selection sync utilities
 *
 * @example
 * ```typescript
 * function DependencyGraph(props: { selection: SelectionStore }) {
 *   const sync = useSelectionSync('graph', props.selection);
 *
 *   return (
 *     <g>
 *       {nodes().map(node => (
 *         <circle
 *           onClick={(e) => sync.handleNodeClick(node.id, e)}
 *           stroke-width={sync.isNodeSelected(node.id) ? 3 : 1}
 *         />
 *       ))}
 *     </g>
 *   );
 * }
 * ```
 */
export function useSelectionSync(
	viewType: ViewType,
	selection: SelectionStore,
): UseSelectionSyncReturn;

/**
 * Return type for useKeyboardNav hook.
 */
export interface UseKeyboardNavReturn {
	/**
	 * Keyboard event handler (attach to container element).
	 *
	 * @param event - Keyboard event
	 */
	handleKeyDown(event: KeyboardEvent): void;

	/**
	 * Current keyboard navigation context (reactive).
	 */
	navContext: Accessor<KeyboardNavigationContext>;
}

/**
 * Hook for keyboard navigation support in a view.
 *
 * Handles arrow keys, Escape, and updates selection accordingly.
 * Respects view type for appropriate navigation logic.
 *
 * @param viewType - Type of view using this hook
 * @param selection - Selection store instance
 * @returns Keyboard navigation utilities
 *
 * @example
 * ```typescript
 * function DependencyGraph(props: { selection: SelectionStore }) {
 *   const keyboard = useKeyboardNav('graph', props.selection);
 *   return h('svg', { onKeyDown: keyboard.handleKeyDown, tabindex: 0 });
 * }
 * ```
 */
export function useKeyboardNav(
	viewType: ViewType,
	selection: SelectionStore,
): UseKeyboardNavReturn;
