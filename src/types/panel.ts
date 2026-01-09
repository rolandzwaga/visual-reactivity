/**
 * Type Contracts: Live Values Panel
 *
 * Feature: 004-live-values-panel
 * Date: 2026-01-09
 *
 * This file defines the TypeScript type contracts for the Live Values Panel feature.
 * These types serve as the formal API contract between components.
 */

/**
 * Represents a single signal entry displayed in the panel list.
 *
 * Lifecycle:
 * - Created when tracker emits signal-create event
 * - Updated when tracker emits signal-write event
 * - Removed when tracker emits computation-dispose event
 */
export interface SignalEntry {
	/** Unique identifier from ReactivityTracker */
	id: string;

	/** User-provided name or null (uses generated ID if null) */
	name: string | null;

	/** Type of reactive node */
	type: "signal" | "memo";

	/** Current value of the signal/memo */
	currentValue: unknown;

	/** JSON-serialized current value, or null if unserializable */
	serializedValue: string | null;

	/** Whether this entry can be edited (true for signals, false for memos) */
	isEditable: boolean;

	/** Total number of value changes since creation */
	updateCount: number;

	/** Timestamp of most recent value change (milliseconds since epoch) */
	lastUpdatedAt: number;

	/** History of last 20 value changes for sparkline visualization */
	valueHistory: ValueHistoryPoint[];
}

/**
 * Represents a single point in the value history for sparkline rendering.
 *
 * Used to visualize value changes over time in a compact sparkline chart.
 */
export interface ValueHistoryPoint {
	/** When this value was recorded (milliseconds since epoch) */
	timestamp: number;

	/** Original value at this point in time */
	value: unknown;

	/** Numeric representation for plotting on sparkline (numbers: direct, booleans: 0/1, strings/objects: hash) */
	numericValue: number;

	/** JSON-serialized value for tooltip display, or null if unserializable */
	serializedValue: string | null;
}

/**
 * Current search and filter criteria for the signal list.
 *
 * Controls which signals are visible and how they are ordered in the panel.
 */
export interface FilterState {
	/** Search query text (case-insensitive substring match on name/ID) */
	searchText: string;

	/** Type filter selection */
	typeFilter: "all" | "signals" | "memos";

	/** Sort order for the list */
	sortOrder: "name-asc" | "name-desc" | "recent";
}

/**
 * User preferences persisted to localStorage across sessions.
 *
 * Storage key: 'visual-reactivity:panel-prefs'
 * Format: JSON string
 */
export interface PanelPreferences {
	/** Whether the panel is currently visible */
	isVisible: boolean;

	/** Panel width in pixels (constrained: 200px to 50% of viewport) */
	width: number;
}

/**
 * Tracks current selection state for cross-view synchronization.
 *
 * When a signal is selected in the graph view, it highlights in the panel, and vice versa.
 */
export interface SelectionState {
	/** ID of currently selected signal, or null if nothing selected */
	selectedId: string | null;

	/** Where the selection originated from */
	selectionSource: "graph" | "panel" | "none";
}

/**
 * Props for the main LiveValuesPanel component.
 */
export interface LiveValuesPanelProps {
	/** Whether the panel is visible */
	isVisible: boolean;

	/** Current panel width in pixels */
	width: number;

	/** Callback when panel visibility changes */
	onVisibilityChange: (isVisible: boolean) => void;

	/** Callback when panel width changes (via resize handle) */
	onWidthChange: (width: number) => void;
}

/**
 * Props for the PanelToggle button component.
 */
export interface PanelToggleProps {
	/** Current visibility state */
	isVisible: boolean;

	/** Callback when toggle is clicked */
	onToggle: () => void;

	/** Optional keyboard shortcut hint to display (e.g., "Ctrl+Shift+V") */
	shortcut?: string;
}

/**
 * Props for the SearchFilter component.
 */
export interface SearchFilterProps {
	/** Current filter state */
	filterState: FilterState;

	/** Callback when search text changes */
	onSearchChange: (searchText: string) => void;

	/** Callback when type filter changes */
	onTypeFilterChange: (typeFilter: FilterState["typeFilter"]) => void;

	/** Callback when sort order changes */
	onSortOrderChange: (sortOrder: FilterState["sortOrder"]) => void;

	/** Callback when clear button is clicked */
	onClear: () => void;
}

/**
 * Props for the SignalList component (virtual scrolling list).
 */
export interface SignalListProps {
	/** Filtered and sorted signal entries to display */
	signals: SignalEntry[];

	/** Currently selected signal ID, or null */
	selectedId: string | null;

	/** Callback when a signal row is clicked */
	onSignalClick: (signalId: string) => void;

	/** Callback when a signal value is edited */
	onValueEdit: (signalId: string, newValue: unknown) => void;
}

/**
 * Props for an individual SignalRow component.
 */
export interface SignalRowProps {
	/** Signal data to display */
	signal: SignalEntry;

	/** Whether this row is currently selected */
	isSelected: boolean;

	/** Callback when row is clicked */
	onClick: () => void;

	/** Callback when value is edited */
	onValueEdit: (newValue: unknown) => void;
}

/**
 * Props for the ValueEditor component (inline editor for signal values).
 */
export interface ValueEditorProps {
	/** Current value to edit */
	currentValue: unknown;

	/** Serialized form of current value */
	serializedValue: string | null;

	/** Whether editing is allowed (false for memos) */
	isEditable: boolean;

	/** Callback when value is saved (returns validated parsed value) */
	onSave: (newValue: unknown) => void;

	/** Callback when editing is cancelled */
	onCancel: () => void;
}

/**
 * Props for the Sparkline component (mini chart of value history).
 */
export interface SparklineProps {
	/** Historical value points to plot */
	history: ValueHistoryPoint[];

	/** Width of sparkline in pixels */
	width: number;

	/** Height of sparkline in pixels */
	height: number;

	/** Optional color for the line (default: CSS variable) */
	color?: string;

	/** Callback when user hovers over a point (shows tooltip) */
	onPointHover?: (point: ValueHistoryPoint | null) => void;
}

/**
 * Return type for the usePanelState hook.
 */
export interface UsePanelStateReturn {
	/** Current panel preferences (reactive accessor) */
	preferences: () => PanelPreferences;

	/** Update visibility */
	setIsVisible: (isVisible: boolean) => void;

	/** Update width */
	setWidth: (width: number) => void;

	/** Toggle visibility (keyboard shortcut handler) */
	toggleVisibility: () => void;
}

/**
 * Return type for the useSignalList hook.
 */
export interface UseSignalListReturn {
	/** Map of all signal entries by ID (reactive accessor) */
	signalEntries: () => Map<string, SignalEntry>;

	/** Array of all signal entries (reactive accessor) */
	signals: () => SignalEntry[];

	/** Get a specific signal entry by ID */
	getSignal: (id: string) => SignalEntry | undefined;

	/** Update a signal's value (called when edited) */
	updateSignalValue: (id: string, newValue: unknown) => void;
}

/**
 * Return type for the useValueHistory hook.
 */
export interface UseValueHistoryReturn {
	/** Get value history for a specific signal */
	getHistory: (signalId: string) => ValueHistoryPoint[];

	/** Add a new value point to history */
	addValuePoint: (signalId: string, value: unknown) => void;

	/** Clear history for a signal (on disposal) */
	clearHistory: (signalId: string) => void;
}

/**
 * Return type for value serialization utility.
 */
export interface SerializationResult {
	/** Serialized JSON string, or null if value is unserializable */
	serialized: string | null;

	/** Whether serialization succeeded */
	success: boolean;

	/** Error message if serialization failed */
	error: string | null;
}

/**
 * Return type for JSON parsing utility.
 */
export interface ParseResult {
	/** Parsed value, or null if parsing failed */
	value: unknown;

	/** Error message if parsing failed, or null if successful */
	error: string | null;
}

/**
 * Virtual scrolling state and methods.
 */
export interface VirtualScrollState {
	/** Current scroll position in pixels */
	scrollTop: number;

	/** Height of the scrollable viewport in pixels */
	viewportHeight: number;

	/** Height of a single item in pixels (fixed for performance) */
	itemHeight: number;

	/** Index of first visible item */
	visibleStart: number;

	/** Index of last visible item */
	visibleEnd: number;

	/** Buffer size (extra items to render above/below viewport) */
	bufferSize: number;
}

/**
 * Return type for useVirtualScroll hook.
 */
export interface UseVirtualScrollReturn {
	/** Current scroll state */
	scrollState: VirtualScrollState;

	/** Update scroll position (called on scroll event) */
	onScroll: (scrollTop: number) => void;

	/** Set viewport height (called on resize) */
	setViewportHeight: (height: number) => void;

	/** Calculate which items should be rendered */
	getVisibleRange: () => { start: number; end: number };
}
