# Data Model: Timeline Integration & Event Replay System

**Feature**: 009-timeline-playback
**Date**: 2026-01-09

---

## Core Entities

### 1. ReplayState

Represents the current replay mode state and cursor position.

**Attributes**:
- `active: boolean` - Whether replay mode is currently active
- `cursorTimestamp: number | null` - Current cursor position (ms since epoch), null if not positioned
- `recordingId: number | null` - ID of loaded recording, null if viewing live events
- `mode: 'live' | 'replay'` - Current mode (live = current events, replay = loaded recording)

**Relationships**:
- Has zero or one Recording (via recordingId)

**State Transitions**:
```
Initial: { active: false, cursorTimestamp: null, recordingId: null, mode: 'live' }

1. User positions cursor on timeline
   → { active: true, cursorTimestamp: T, recordingId: null, mode: 'live' }

2. User loads a recording
   → { active: false, cursorTimestamp: null, recordingId: R, mode: 'replay' }
   
3. User positions cursor in loaded recording
   → { active: true, cursorTimestamp: T, recordingId: R, mode: 'replay' }
   
4. User clicks "View Live"
   → { active: false, cursorTimestamp: null, recordingId: null, mode: 'live' }
```

**Validation Rules**:
- `cursorTimestamp` must be >= 0 if not null
- `active` is true ⟺ `cursorTimestamp` is not null (clarification Q2: replay activates on cursor positioning)
- `mode` is 'replay' ⟺ `recordingId` is not null

---

### 2. Recording

Represents a saved event sequence with metadata.

**Attributes**:
- `id: number` - Auto-generated IndexedDB key
- `name: string` - User-provided name (1-100 chars, alphanumeric + dash/underscore/space, unique)
- `dateCreated: number` - Creation timestamp (ms since epoch)
- `eventCount: number` - Total number of events (cached)
- `duration: number` - Time span from first to last event (milliseconds)
- `version: string` - Serialization format version (semver, e.g., "1.0.0")
- `events: ReactivityEvent[]` - Full event array

**Relationships**:
- Contains many ReactivityEvent objects
- Referenced by zero or one ReplayState (if currently loaded)

**Lifecycle**:
```
1. Created: User clicks "Save Recording", provides name
2. Stored: Written to IndexedDB "recordings" object store
3. Loaded: User selects from recording list
4. Deleted: User confirms deletion, removed from IndexedDB
```

**Validation Rules**:
- `name` matches pattern: `/^[a-zA-Z0-9 _-]{1,100}$/` (clarification Q4)
- `name` is unique across all recordings (enforced by IndexedDB unique index)
- `eventCount` === `events.length`
- `duration` === `events[events.length - 1].timestamp - events[0].timestamp`
- `events` array is sorted by timestamp ascending
- `version` follows semver format (major.minor.patch)

---

### 3. RecordingMetadata

Summary information about a recording (subset of Recording, used for list display).

**Attributes**:
- `id: number` - Recording ID
- `name: string` - Recording name
- `dateCreated: number` - Creation timestamp
- `eventCount: number` - Total events
- `duration: number` - Duration in milliseconds
- `nodeTypes: string[]` - Unique node types in recording (e.g., ["signal", "memo", "effect"])
- `appVersion: string` - Application version when recording was created

**Purpose**: Lightweight representation for displaying recording list without loading full event arrays.

**Derived From**: Recording entity (subset of fields + computed nodeTypes)

---

### 4. HistoricalGraphState

Reconstruction of the reactive graph at a specific point in time.

**Attributes**:
- `timestamp: number` - Point in time this state represents (ms)
- `activeNodes: Map<string, HistoricalNode>` - Nodes that existed at this timestamp
- `edges: ReactiveEdge[]` - Dependency edges that existed at this timestamp
- `disposedNodeIds: Set<string>` - Nodes that had been disposed before this timestamp

**HistoricalNode Structure**:
```typescript
{
  node: ReactiveNode;      // Node metadata (id, name, type)
  value: any;              // Value at this timestamp (most recent update before timestamp)
  lastUpdateTime: number;  // When this value was set
  createdAt: number;       // When node was created
}
```

**Relationships**:
- Contains many ReactiveNode references
- Contains many ReactiveEdge references
- Built from ReactivityEvent history via reconstruction algorithm

**Construction**:
```typescript
// Pseudo-algorithm
function reconstructGraphAt(timestamp: number): HistoricalGraphState {
  const events = getEventsUpTo(timestamp);
  const state = new HistoricalGraphState(timestamp);
  
  for (const event of events) {
    switch (event.type) {
      case 'node-create':
        state.activeNodes.set(event.nodeId, { node: event.node, value: undefined, ... });
        break;
      case 'signal-write':
        state.activeNodes.get(event.nodeId).value = event.newValue;
        break;
      case 'edge-create':
        state.edges.push(event.edge);
        break;
      case 'node-dispose':
        state.activeNodes.delete(event.nodeId);
        state.disposedNodeIds.add(event.nodeId);
        break;
    }
  }
  
  return state;
}
```

**Performance**: Uses memoized snapshots (LRU cache) to avoid full replay on every step. See research.md for details.

---

### 5. PlaybackControlState

Extended state from Feature 006 with new playback features.

**Existing Attributes** (from Feature 006):
- `isPlaying: boolean` - Whether auto-playback is active
- `speed: number` - Playback speed multiplier (0.25x, 0.5x, 1x, 2x, 5x)
- `mode: 'manual' | 'auto'` - Playback mode
- `lastTickTime: number | null` - Last animation frame timestamp
- `rafId: number | null` - RequestAnimationFrame ID for cancellation

**New Attributes** (Feature 009):
- `loop: boolean` - Whether to restart from beginning when reaching end
- `stepMode: boolean` - Whether in single-step mode (vs continuous playback)

**State Transitions**:
```
Initial: { isPlaying: false, speed: 1, loop: false, stepMode: false, ... }

1. User clicks "Play"
   → { isPlaying: true, stepMode: false, ... }

2. User presses arrow key during playback
   → { isPlaying: false, stepMode: true, ... } (pauses and enters step mode)

3. User clicks "Loop" toggle
   → { loop: !loop, ... }

4. User reaches end while loop enabled
   → Cursor resets to start, playback continues
```

**Validation Rules**:
- `speed` must be one of: [0.25, 0.5, 1, 2, 5]
- `isPlaying` and `stepMode` are mutually exclusive (both cannot be true)
- `rafId` is not null ⟺ `isPlaying` is true

---

### 6. ExportOptions

Configuration for recording export operations.

**Attributes**:
- `valueInclusion: 'full' | 'truncated' | 'structure-only'` - How to handle event values
- `truncationLimit: number` - Max bytes per value when truncated (default: 10240 = 10KB)
- `includeMetadata: boolean` - Whether to include full metadata object (default: true)

**Default Configuration**:
```typescript
const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  valueInclusion: 'truncated',  // Balance between size and usefulness
  truncationLimit: 10240,       // 10KB per value (prevents huge arrays/objects)
  includeMetadata: true,        // Always include for diagnostics
};
```

**Behavior by Value Inclusion**:

| Mode | Behavior | Use Case | File Size |
|------|----------|----------|-----------|
| `full` | All values exported as-is | Full fidelity replay, small datasets | Large (10-100MB for complex values) |
| `truncated` | Values >10KB replaced with `"[Truncated: 15360 bytes]"` | Balance size/utility | Medium (1-10MB) |
| `structure-only` | All values replaced with type info only | Structure analysis, minimal size | Small (<1MB) |

**Validation Rules**:
- `truncationLimit` must be >= 1024 (1KB minimum)
- `truncationLimit` must be <= 1048576 (1MB maximum)

---

## Type Hierarchy

```
ReplayState
├── recordingId: number? → Recording
└── cursorTimestamp: number? → HistoricalGraphState

Recording
├── events: ReactivityEvent[] (from Feature 001)
└── metadata → RecordingMetadata (derived)

HistoricalGraphState
├── activeNodes: Map<string, HistoricalNode>
│   └── node: ReactiveNode (from Feature 001)
└── edges: ReactiveEdge[] (from Feature 001)

PlaybackControlState (extends Feature 006)
├── isPlaying, speed, mode (existing)
└── loop, stepMode (new)

ExportOptions
└── Configuration only (no relationships)
```

---

## Validation Summary

### Recording Name Validation (FR-022a, Q4)

**Pattern**: `/^[a-zA-Z0-9 _-]{1,100}$/`

**Valid Examples**:
- "cart-bug-2024-01-09"
- "Payment_Flow_Test"
- "Recording 123"
- "simple"

**Invalid Examples**:
- "" (empty - too short)
- "a".repeat(101) (too long - >100 chars)
- "test@email" (contains @)
- "test/path" (contains /)
- "test\\path" (contains \\)

**Error Messages**:
- Empty: "Recording name cannot be empty"
- Too long: "Recording name must be 100 characters or less (currently: {length})"
- Invalid characters: "Recording name can only contain letters, numbers, spaces, dashes, and underscores"
- Duplicate: "A recording with name '{name}' already exists. Try '{name} 2' or '{name} {timestamp}'"

---

## Data Flow Diagram

```
User Action              Store Updates           Component Reactions
─────────────────────────────────────────────────────────────────────

1. Click Timeline        
   ↓
   ReplayStore.setCursor(T)
   ↓
   ReplayState: { active: true, cursorTimestamp: T }
                                ↓
                                Graph/Tree subscribe
                                ↓
                                HistoricalState.reconstructAt(T)
                                ↓
                                Render historical graph

2. Click "Save Recording"
   ↓
   RecordingStore.save(name, events)
   ↓
   IndexedDB: recordings.add({ name, events, ... })
                                ↓
                                Recording list refreshes
                                ↓
                                Show success message

3. Press Right Arrow
   ↓
   ReplayStore.stepForward()
   ↓
   Find next event, setCursor(nextTime)
   ↓
   (same as #1: trigger reconstruction + render)

4. Click "Export"
   ↓
   RecordingSerializer.toJSON(recording, options)
   ↓
   Download JSON file
   
5. Click "Import"
   ↓
   RecordingSerializer.fromJSON(file)
   ↓
   Validate format
   ↓
   RecordingStore.save(recording)
   ↓
   (same as #2: add to IndexedDB)
```

---

**Data Model Complete**: 2026-01-09
**Next**: Create API contracts in contracts/ directory
