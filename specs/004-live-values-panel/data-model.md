# Data Model: Live Values Panel

**Feature**: 004-live-values-panel
**Date**: 2026-01-09

## Overview

This document defines the data structures, entities, and relationships for the Live Values Panel feature.

---

## Core Entities

### SignalEntry

Represents a single signal displayed in the panel list.

**Purpose**: Track metadata and state for each displayed signal

**Fields**:
```typescript
interface SignalEntry {
  id: string;                    // Unique identifier from tracker
  name: string | null;           // User-provided name or null
  type: 'signal' | 'memo';       // Node type (effects excluded from panel)
  currentValue: unknown;         // Current signal/memo value
  serializedValue: string | null; // JSON-serialized value or null if unserializable
  isEditable: boolean;           // true for signals, false for memos
  updateCount: number;           // Total number of value changes
  lastUpdatedAt: number;         // Timestamp of last update (ms since epoch)
  valueHistory: ValueHistoryPoint[]; // Last 20 value changes for sparkline
}
```

**Lifecycle**:
- Created when signal-create event received from tracker
- Updated when signal-write event received
- Removed when computation-dispose event received
- History cleared on disposal (each instance independent)

**Validation Rules**:
- id: non-empty string
- name: string or null (generated ID used if null)
- currentValue: any valid JavaScript value
- serializedValue: valid JSON string or null
- updateCount: non-negative integer
- lastUpdatedAt: positive number (timestamp)
- valueHistory: max 20 entries, ordered by timestamp ascending

---

### ValueHistoryPoint

Represents a single point in the value history for sparkline rendering.

**Purpose**: Store historical values for trend visualization

**Fields**:
```typescript
interface ValueHistoryPoint {
  timestamp: number;           // When value changed (ms since epoch)
  value: unknown;              // Original value at this point
  numericValue: number;        // Numeric representation for plotting
  serializedValue: string | null; // JSON serialized for tooltip display
}
```

**Lifecycle**:
- Created on each signal-write event
- Added to SignalEntry.valueHistory array
- Oldest entry removed if history exceeds 20 points
- All entries cleared on signal disposal

**Numeric Representation**:
- Numbers: use value directly
- Booleans: true=1, false=0
- Strings: hash code (sum of char codes)
- Objects/Arrays: hash code of serialized value
- Null/undefined: 0

---

### FilterState

Tracks current search and filter criteria.

**Purpose**: Manage panel filtering and search state

**Fields**:
```typescript
interface FilterState {
  searchText: string;            // Current search query (case-insensitive)
  typeFilter: 'all' | 'signals' | 'memos'; // Type filter selection
  sortOrder: 'name-asc' | 'name-desc' | 'recent'; // Sort criteria
}
```

**Initial Values**:
```typescript
{
  searchText: '',
  typeFilter: 'all',
  sortOrder: 'name-asc'
}
```

**Behavior**:
- searchText: substring match on signal name/ID (case-insensitive)
- typeFilter: filters SignalEntry by type field
- sortOrder: determines list ordering (alphabetical or by lastUpdatedAt)

---

### PanelPreferences

Stores user preferences persisted to localStorage.

**Purpose**: Remember panel state across sessions

**Fields**:
```typescript
interface PanelPreferences {
  isVisible: boolean;  // Panel visibility state
  width: number;       // Panel width in pixels
}
```

**Storage**:
- Key: `visual-reactivity:panel-prefs`
- Format: JSON string
- Size: ~50 bytes

**Default Values**:
```typescript
{
  isVisible: true,
  width: 350
}
```

**Constraints**:
- width: min 200px, max 50% of viewport width
- isVisible: boolean only

---

### SelectionState

Tracks cross-view selection between graph and panel.

**Purpose**: Synchronize selection highlighting between views

**Fields**:
```typescript
interface SelectionState {
  selectedId: string | null;       // ID of selected signal or null
  selectionSource: 'graph' | 'panel' | 'none'; // Where selection originated
}
```

**Behavior**:
- When graph node clicked: set selectedId + source='graph'
- When panel row clicked: set selectedId + source='panel'
- Both views highlight matching node/row based on selectedId
- Click elsewhere: reset to { selectedId: null, selectionSource: 'none' }

---

## Derived Data

### FilteredSignalList

Computed from SignalEntry[], FilterState.

**Purpose**: Provide filtered and sorted list for display

**Computation**:
```typescript
const filteredSignals = () => {
  let result = allSignals();

  // Apply type filter
  if (filterState().typeFilter !== 'all') {
    result = result.filter(s => s.type === filterState().typeFilter.slice(0, -1));
  }

  // Apply search text
  if (filterState().searchText) {
    const query = filterState().searchText.toLowerCase();
    result = result.filter(s =>
      (s.name || s.id).toLowerCase().includes(query)
    );
  }

  // Apply sort order
  if (filterState().sortOrder === 'name-asc') {
    result.sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
  } else if (filterState().sortOrder === 'name-desc') {
    result.sort((a, b) => (b.name || b.id).localeCompare(a.name || a.id));
  } else {
    result.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
  }

  return result;
};
```

---

### VisibleSignalList

Computed from FilteredSignalList, virtual scroll position.

**Purpose**: Determine which signals to render (virtual scrolling)

**Computation**:
```typescript
const visibleSignals = () => {
  const filtered = filteredSignals();
  const itemHeight = 50;
  const scrollTop = scrollPosition();
  const viewportHeight = containerHeight();

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + viewportHeight) / itemHeight);
  const bufferSize = 5; // Render extra rows above/below viewport

  return filtered.slice(
    Math.max(0, startIndex - bufferSize),
    Math.min(filtered.length, endIndex + bufferSize)
  );
};
```

---

## Data Flow

### Tracker Events → SignalEntry Updates

```
ReactivityTracker emits event
  ↓
useSignalList hook receives event
  ↓
Update SignalEntry in store
  ↓
SolidJS reactivity propagates change
  ↓
SignalList re-renders affected rows
```

### User Edit → Signal Setter Call

```
User clicks value in panel
  ↓
ValueEditor component opens
  ↓
User enters new value
  ↓
JSON validation (parseJSON utility)
  ↓
If valid: call signal setter
  ↓
Tracker emits signal-write event
  ↓
Panel updates to show new value
```

### Panel Resize → LocalStorage Persist

```
User drags resize handle
  ↓
mousemove handler updates panel width
  ↓
SolidJS effect watches width change
  ↓
savePanelPreferences(width)
  ↓
localStorage.setItem()
```

---

## State Management Strategy

### Store Organization

```typescript
// panelStore.ts
const [preferences, setPreferences] = createStore<PanelPreferences>(
  loadPanelPreferences()
);

const [filterState, setFilterState] = createStore<FilterState>({
  searchText: '',
  typeFilter: 'all',
  sortOrder: 'name-asc'
});

const [selectionState, setSelectionState] = createStore<SelectionState>({
  selectedId: null,
  selectionSource: 'none'
});
```

### Signal List Management

```typescript
// useSignalList.ts
const [signalEntries, setSignalEntries] = createSignal<Map<string, SignalEntry>>(new Map());

// Subscribe to tracker events
createEffect(() => {
  const unsubscribe = tracker.subscribe(event => {
    if (event.type === 'signal-create') {
      // Add new entry
    } else if (event.type === 'signal-write') {
      // Update existing entry + history
    } else if (event.type === 'computation-dispose') {
      // Remove entry
    }
  });
  onCleanup(unsubscribe);
});
```

---

## Entity Relationships

```
SignalEntry (1) ----contains----> (N) ValueHistoryPoint
      ↓
  filtered by
      ↓
FilterState --> produces --> FilteredSignalList
                                    ↓
                                sliced by
                                    ↓
                          VirtualScrollState --> VisibleSignalList
                                                       ↓
                                                   rendered in
                                                       ↓
                                                   SignalRow

SelectionState <--syncs--> SignalRow
                    ↕
            DependencyGraph node
```

---

## Validation & Constraints

### SignalEntry Constraints

- id: must match a tracked node ID
- name: max 100 characters (display truncated beyond)
- serializedValue: max 1000 characters in panel display (full value in tooltip)
- valueHistory: exactly last 20 points (FIFO)
- updateCount: increments on each write, never decrements

### FilterState Constraints

- searchText: max 200 characters (reasonable search query length)
- typeFilter: enum validation, only 3 allowed values
- sortOrder: enum validation, only 3 allowed values

### PanelPreferences Constraints

- width: min 200px, max 50% of window.innerWidth
- isVisible: boolean only, no other values

### ValueHistoryPoint Constraints

- timestamp: must be <= Date.now() (no future timestamps)
- numericValue: must be finite number (no Infinity, NaN)

---

## Performance Considerations

### Memory Usage

- SignalEntry: ~500 bytes each (including history)
- 200 signals: ~100KB total
- ValueHistory: 20 points × 100 bytes = 2KB per signal
- FilteredSignalList: reference to SignalEntry (no copies)
- VisibleSignalList: reference to SignalEntry (no copies)

### Update Frequency

- Signal writes: throttled to 60fps (16.67ms intervals)
- Virtual scroll: debounced to 16ms (60fps)
- Search filter: debounced to 150ms
- localStorage writes: debounced to 500ms

### Optimization Strategies

1. **Virtual Scrolling**: Only render ~20 visible rows (not all 200)
2. **Memoization**: Use createMemo for filtered/sorted lists
3. **Throttling**: Limit update frequency to 60fps
4. **Lazy Serialization**: Only serialize values when displayed or edited
5. **Reference Sharing**: FilteredSignalList and VisibleSignalList reference same SignalEntry objects

---

## Migration & Versioning

### LocalStorage Schema Evolution

If PanelPreferences schema changes:
- Add version field: `{ version: 1, ... }`
- Detect old schema on load
- Migrate to new schema
- Save with new version

### Backward Compatibility

- Old localStorage values (without version) default to v1
- Missing fields get default values
- Invalid values reset to defaults (graceful degradation)

---

## Testing Strategy

### Entity Testing

- SignalEntry: creation, updates, serialization edge cases
- ValueHistoryPoint: numeric conversion for all types
- FilterState: search matching, type filtering, sorting
- PanelPreferences: localStorage save/load, quota errors
- SelectionState: cross-view synchronization

### Data Flow Testing

- Tracker event → SignalEntry update pipeline
- User edit → validation → setter call pipeline
- Resize → persist → reload pipeline

### Integration Testing

- 200+ signals: memory and performance
- Rapid updates: throttling effectiveness
- localStorage failure: graceful degradation
