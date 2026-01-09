# Data Model: View Synchronization and Cross-View Selection

**Feature**: 007-view-sync  
**Date**: 2026-01-09  
**Status**: Phase 1 - Data Modeling

---

## Overview

This document defines the core data structures and relationships for cross-view selection synchronization. The selection system maintains a centralized state that all visualization views subscribe to, enabling instant highlighting and navigation across the dependency graph, ownership tree, timeline, and values panel.

---

## Entity Definitions

### 1. SelectionState

**Purpose**: Represents the current selection state across all views.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `selectedNodeIds` | `Set<string>` | Yes | Set of currently selected reactive node IDs | Must contain valid node IDs that exist in tracker |
| `hoveredNodeId` | `string \| null` | Yes | Currently hovered node ID (for hover previews) | Must be valid node ID or null |
| `selectionSource` | `ViewType \| null` | Yes | Which view initiated the current selection | One of: 'graph' \| 'tree' \| 'timeline' \| 'list' \| null |
| `lastSelectionTime` | `number` | Yes | Timestamp of last selection change (ms since epoch) | Positive integer |

**Constraints**:
- `selectedNodeIds` can be empty Set (no selection)
- Maximum 1000 selected nodes (performance constraint)
- `hoveredNodeId` must exist in tracker or be null
- `selectionSource` indicates which view triggered selection (for analytics/debugging)

**State Transitions**:
```
Empty → Single Selection (click node)
Single Selection → Empty (click same node or Escape)
Single Selection → Multi Selection (Ctrl+click additional node)
Multi Selection → Single Selection (click node without Ctrl)
Any State → Empty (Escape key or clear action)
```

**TypeScript Definition**:
```typescript
export type ViewType = 'graph' | 'tree' | 'timeline' | 'list';

export interface SelectionState {
  selectedNodeIds: Set<string>;
  hoveredNodeId: string | null;
  selectionSource: ViewType | null;
  lastSelectionTime: number;
}
```

---

### 2. SelectionEvent

**Purpose**: Represents a change in selection state, emitted when selection is modified.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `SelectionEventType` | Yes | Type of selection change |
| `addedNodeIds` | `string[]` | Yes | Node IDs added to selection (empty if none) |
| `removedNodeIds` | `string[]` | Yes | Node IDs removed from selection (empty if none) |
| `currentSelection` | `Set<string>` | Yes | Full selection state after change |
| `triggeringAction` | `SelectionAction` | Yes | What triggered this selection change |
| `timestamp` | `number` | Yes | When event occurred (ms since epoch) |
| `source` | `ViewType \| null` | Yes | Which view triggered the event |

**Event Types**:
```typescript
export type SelectionEventType = 
  | 'selection-add'      // Node(s) added to selection
  | 'selection-remove'   // Node(s) removed from selection
  | 'selection-replace'  // Selection completely replaced
  | 'selection-clear';   // All selections cleared

export type SelectionAction =
  | 'click'              // Mouse click
  | 'keyboard'           // Keyboard navigation
  | 'programmatic'       // API call
  | 'batch';             // Batch operation (e.g., select all)
```

**Usage**:
- Views subscribe to selection events to update their highlighting
- Events provide delta information (`addedNodeIds`, `removedNodeIds`) for efficient updates
- `currentSelection` provides full state for views that need complete rebuild

**TypeScript Definition**:
```typescript
export interface SelectionEvent {
  type: SelectionEventType;
  addedNodeIds: string[];
  removedNodeIds: string[];
  currentSelection: Set<string>;
  triggeringAction: SelectionAction;
  timestamp: number;
  source: ViewType | null;
}
```

---

### 3. KeyboardNavigationContext

**Purpose**: Provides context for keyboard navigation operations, tracking which view is active and what navigation options are available.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `activeView` | `ViewType` | Yes | Which view currently has keyboard focus |
| `currentNodeId` | `string \| null` | Yes | Currently focused node for navigation |
| `availableDirections` | `NavigationDirection[]` | Yes | Valid navigation directions from current node |
| `graphTraversalMode` | `GraphTraversalMode` | Yes | How to traverse graph (observers vs sources) |

**Navigation Directions**:
```typescript
export type NavigationDirection = 
  | 'up'         // Tree: parent, List: previous item
  | 'down'       // Tree: first child, List: next item
  | 'left'       // Graph: source (upstream dependency)
  | 'right';     // Graph: observer (downstream dependent)

export type GraphTraversalMode =
  | 'observers'  // Follow observers (downstream)
  | 'sources'    // Follow sources (upstream)
  | 'both';      // Allow both directions
```

**TypeScript Definition**:
```typescript
export interface KeyboardNavigationContext {
  activeView: ViewType;
  currentNodeId: string | null;
  availableDirections: NavigationDirection[];
  graphTraversalMode: GraphTraversalMode;
}
```

---

### 4. ViewSubscription

**Purpose**: Represents a view's subscription to selection state changes.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `viewId` | `string` | Yes | Unique identifier for the view |
| `viewType` | `ViewType` | Yes | Type of view (graph, tree, etc.) |
| `callback` | `(event: SelectionEvent) => void` | Yes | Function called when selection changes |
| `isActive` | `boolean` | Yes | Whether subscription is currently active |
| `priority` | `number` | No | Update priority (lower = earlier, default: 0) |

**Subscription Lifecycle**:
1. **Subscribe**: View registers callback when mounted
2. **Active**: Receives selection events while visible
3. **Inactive**: Paused when view hidden (but not unsubscribed)
4. **Unsubscribe**: Removed when view unmounted

**TypeScript Definition**:
```typescript
export interface ViewSubscription {
  viewId: string;
  viewType: ViewType;
  callback: (event: SelectionEvent) => void;
  isActive: boolean;
  priority?: number;
}
```

---

### 5. ScrollTarget

**Purpose**: Represents a node that should be scrolled into view when selected.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nodeId` | `string` | Yes | Node to scroll to |
| `viewType` | `ViewType` | Yes | Which view should scroll |
| `behavior` | `ScrollBehavior` | Yes | Smooth or instant scroll |
| `alignment` | `ScrollAlignment` | Yes | Where to position node in viewport |
| `shouldZoom` | `boolean` | No | Whether to zoom (for SVG views) |
| `targetZoom` | `number` | No | Target zoom level (default: 1.5) |

**Scroll Options**:
```typescript
export type ScrollBehavior = 'smooth' | 'instant';

export type ScrollAlignment = 
  | 'center'   // Center in viewport
  | 'nearest'  // Scroll minimum distance
  | 'start'    // Align to top/left
  | 'end';     // Align to bottom/right
```

**TypeScript Definition**:
```typescript
export interface ScrollTarget {
  nodeId: string;
  viewType: ViewType;
  behavior: ScrollBehavior;
  alignment: ScrollAlignment;
  shouldZoom?: boolean;
  targetZoom?: number;
}
```

---

## Entity Relationships

```
SelectionState (1)
  ├──> selectedNodeIds (N) ──> ReactiveNode (external)
  ├──> hoveredNodeId (0..1) ──> ReactiveNode (external)
  └──> selectionSource (0..1) ──> ViewType

SelectionEvent (emitted on state change)
  ├──> addedNodeIds (N) ──> ReactiveNode (external)
  ├──> removedNodeIds (N) ──> ReactiveNode (external)
  ├──> currentSelection (N) ──> ReactiveNode (external)
  └──> source (0..1) ──> ViewType

ViewSubscription (N)
  ├──> viewType ──> ViewType
  └──> callback ──> (SelectionEvent) => void

KeyboardNavigationContext (1)
  ├──> activeView ──> ViewType
  ├──> currentNodeId (0..1) ──> ReactiveNode (external)
  └──> availableDirections (N) ──> NavigationDirection

ScrollTarget (emitted on selection)
  ├──> nodeId ──> ReactiveNode (external)
  └──> viewType ──> ViewType
```

**External Dependencies**:
- `ReactiveNode`: Defined in `src/types/nodes.ts` (existing)
- `ReactivityTracker`: Provides node validation via `getNode(id)` (existing)

---

## Derived State

### 1. SelectedNodes (Computed)

**Purpose**: Full `ReactiveNode` objects for selected IDs.

**Derivation**:
```typescript
const selectedNodes = createMemo(() => {
  const ids = selectionState.selectedNodeIds;
  return Array.from(ids)
    .map(id => tracker.getNode(id))
    .filter(node => node !== undefined);
});
```

**Use Cases**:
- DetailPanel needs full node data
- Edge emphasis needs node relationships (sources/observers)

---

### 2. IsNodeSelected (Computed)

**Purpose**: O(1) lookup for whether a node is selected.

**Derivation**:
```typescript
const isNodeSelected = (nodeId: string): boolean => {
  return selectionState.selectedNodeIds.has(nodeId);
};
```

**Use Cases**:
- Node components check if they should render as selected
- Most frequent operation (called for every visible node on every render)

---

### 3. SelectionCount (Computed)

**Purpose**: Number of currently selected nodes.

**Derivation**:
```typescript
const selectionCount = createMemo(() => {
  return selectionState.selectedNodeIds.size;
});
```

**Use Cases**:
- UI displays "3 nodes selected"
- Conditional behavior (e.g., disable "compare" button if count < 2)

---

### 4. ConnectedEdges (Computed)

**Purpose**: Edges connecting currently selected nodes (for multi-select edge emphasis).

**Derivation**:
```typescript
const connectedEdges = createMemo(() => {
  const ids = selectionState.selectedNodeIds;
  const edges = tracker.getEdges();
  
  return edges.filter(edge => 
    ids.has(edge.from) && ids.has(edge.to)
  );
});
```

**Use Cases**:
- DependencyGraph emphasizes edges between selected nodes
- Shows relationships when comparing multiple nodes

---

## Validation Rules

### 1. Node ID Validation

**Rule**: Selected node IDs must exist in tracker.

**Validation**:
```typescript
function validateNodeId(nodeId: string): boolean {
  return tracker.getNode(nodeId) !== undefined;
}
```

**Enforcement**:
- On selection: Validate before adding to `selectedNodeIds`
- On tracker update: Remove disposed nodes from selection automatically

---

### 2. Selection Size Limit

**Rule**: Maximum 1000 nodes can be selected simultaneously.

**Rationale**: Performance constraint - highlighting/emphasizing 1000+ nodes degrades UI.

**Validation**:
```typescript
function canAddToSelection(currentSize: number, adding: number): boolean {
  return currentSize + adding <= MAX_SELECTION_SIZE;
}
```

**Enforcement**: Reject batch operations that exceed limit, show warning to user.

---

### 3. Hover Exclusivity

**Rule**: Only one node can be hovered at a time.

**Validation**:
```typescript
function setHoveredNode(nodeId: string | null): void {
  // Always replaces previous hover (not additive)
  state.hoveredNodeId = nodeId;
}
```

**Enforcement**: Setting hover always replaces previous value.

---

## State Management Patterns

### 1. Immutable Updates

**Critical**: Always create new Set references for SolidJS reactivity.

**Correct**:
```typescript
setSelectedNodeIds((prev) => {
  const next = new Set(prev);  // Copy first
  next.add(nodeId);
  return next;  // Return new reference
});
```

**Incorrect**:
```typescript
setSelectedNodeIds((prev) => {
  prev.add(nodeId);  // Mutates existing Set
  return prev;       // Same reference - no reactivity!
});
```

---

### 2. Batch Operations

**Pattern**: Group multiple changes into single state update.

**Example**:
```typescript
function selectAll(nodeIds: string[]): void {
  setSelectedNodeIds(new Set(nodeIds));  // Single update
}

// NOT this:
function selectAllWrong(nodeIds: string[]): void {
  for (const id of nodeIds) {
    toggleNodeSelection(id);  // N updates = N re-renders!
  }
}
```

---

### 3. Automatic Cleanup

**Pattern**: Remove disposed nodes from selection automatically.

**Implementation**:
```typescript
// Subscribe to tracker disposal events
onMount(() => {
  const unsubscribe = tracker.subscribe((event) => {
    if (event.type === 'computation-dispose') {
      setSelectedNodeIds((prev) => {
        if (!prev.has(event.nodeId)) return prev;  // No change
        const next = new Set(prev);
        next.delete(event.nodeId);
        return next;
      });
    }
  });
  
  onCleanup(() => unsubscribe());
});
```

---

## Performance Considerations

### 1. Selection Lookups

- **Operation**: `isNodeSelected(nodeId)`
- **Frequency**: Called for every visible node on every render
- **Complexity**: O(1) with `Set.has()`
- **Optimization**: Use Set instead of Array (O(n))

### 2. Event Emission

- **Operation**: Emit SelectionEvent on state change
- **Frequency**: Every selection modification
- **Complexity**: O(subscribers) - typically 4 views
- **Optimization**: SolidJS automatically batches effects within microtask

### 3. Derived State Calculation

- **Operation**: `selectedNodes()` - get full node objects
- **Frequency**: On every selection change
- **Complexity**: O(selection size) - typically 1-10 nodes
- **Optimization**: Use `createMemo` to cache results

### 4. Edge Emphasis

- **Operation**: `connectedEdges()` - find edges between selected nodes
- **Frequency**: On every selection change in graph view
- **Complexity**: O(edges × selection size) - worst case O(n²)
- **Optimization**: Use `createMemo` + early exit if selection size < 2

---

## Migration from Current Implementation

### Current State (Fragmented Selection)

```typescript
// App.tsx
const [selectedNodeId, setSelectedNodeId] = createSignal<string | null>(null);

// DependencyGraph (internal)
const [selectedNodeId, setSelectedNode] = createSignal<string | null>(null);

// LiveValuesPanel (internal)
const [selectedSignalId, setSelectedSignalId] = createSignal<string | null>(null);

// TimelineView (store)
selectedEventIds: Set<string>
```

### Target State (Centralized Selection)

```typescript
// App.tsx or selectionStore.ts
const selection = createSelectionStore();

// All views receive selection store
<DependencyGraph selection={selection} />
<OwnershipTree selection={selection} />
<TimelineView selection={selection} />
<LiveValuesPanel selection={selection} />
```

**Migration Steps**:
1. Create `selectionStore.ts` with centralized state
2. Remove local selection signals from individual views
3. Pass selection store to all views as prop
4. Update event handlers to use selection store methods
5. Test cross-view synchronization

---

**Document Status**: ✅ COMPLETE  
**Next Step**: Generate API contracts (`contracts/selection-store.ts`)
