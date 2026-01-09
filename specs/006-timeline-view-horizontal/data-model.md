# Data Model: Timeline View - Horizontal Timeline Visualization

**Feature**: `006-timeline-view-horizontal`  
**Date**: 2026-01-09  
**Status**: Phase 1 - Design

## Entity Definitions

### 1. TimelineEvent

Represents a single reactive event on the timeline.

**Fields**:
- `timestamp` (number): Unix timestamp (milliseconds) when event occurred
- `nodeId` (string): ID of reactive node that generated this event
- `type` (ReactivityEventType): Event type (signal-read, signal-write, computation-execute-start, etc.)
- `data` (object): Event-specific data (values, durations, metadata)
- `batchId` (string | null): Batch identifier for grouping synchronous events
- `id` (string): Unique event identifier

**Relationships**:
- belongs to one `ReactiveNode` (via `nodeId`)
- belongs to zero or one `EventBatch` (via `batchId`)

**Validation Rules**:
- `timestamp` must be positive number
- `nodeId` must reference existing node
- `type` must be valid ReactivityEventType
- `id` must be unique across all events

**State Transitions**: N/A (immutable once created)

**Example**:
```typescript
{
  id: "evt-1736434980123-signal-1",
  timestamp: 1736434980123,
  nodeId: "signal-1",
  type: "signal-write",
  data: { prevValue: 0, newValue: 1 },
  batchId: "batch-1736434980120"
}
```

---

### 2. Swimlane

Represents a horizontal track for a specific reactive node's events.

**Fields**:
- `nodeId` (string): ID of reactive node
- `nodeName` (string | null): Human-readable node name
- `nodeType` (NodeType): Type of node (signal, memo, effect)
- `yPosition` (number): Vertical pixel position (calculated by d3.scaleBand)
- `height` (number): Swimlane height in pixels (from scaleBand.bandwidth())
- `isDisposed` (boolean): Whether node has been disposed
- `disposalTime` (number | null): Timestamp when node was disposed
- `color` (string): Swimlane color based on node type

**Relationships**:
- represents one `ReactiveNode`
- contains multiple `TimelineEvent` instances

**Validation Rules**:
- `nodeId` must be unique
- `yPosition` and `height` must be non-negative
- `disposalTime` must be null if `isDisposed` is false
- `disposalTime` must be >= node creation time if present

**State Transitions**:
- Active → Disposed (when node is disposed)

**Example**:
```typescript
{
  nodeId: "signal-1",
  nodeName: "count",
  nodeType: "signal",
  yPosition: 0,
  height: 45,
  isDisposed: false,
  disposalTime: null,
  color: "#4FC08D"
}
```

---

### 3. EventBatch

Represents a group of events that occurred synchronously.

**Fields**:
- `id` (string): Unique batch identifier
- `startTime` (number): Timestamp of first event in batch
- `endTime` (number): Timestamp of last event in batch
- `duration` (number): Duration in milliseconds (endTime - startTime)
- `eventIds` (string[]): Array of event IDs in this batch
- `eventCount` (number): Number of events in batch

**Relationships**:
- contains multiple `TimelineEvent` instances

**Validation Rules**:
- `id` must be unique
- `startTime` <= `endTime`
- `duration` = `endTime - startTime`
- `eventCount` = `eventIds.length`
- `eventCount` >= 1 (batches must have at least one event)
- `duration` <= 50ms (batching threshold)

**State Transitions**: N/A (immutable once created)

**Example**:
```typescript
{
  id: "batch-1736434980120",
  startTime: 1736434980120,
  endTime: 1736434980125,
  duration: 5,
  eventIds: ["evt-1736434980120-signal-1", "evt-1736434980122-memo-1", "evt-1736434980125-effect-1"],
  eventCount: 3
}
```

---

### 4. TimelineCursor

Represents the current time position on the timeline.

**Fields**:
- `time` (number): Current cursor timestamp
- `x` (number): Cursor X position in pixels (calculated from time scale)
- `snappedEventId` (string | null): ID of event cursor is snapped to
- `isSnapped` (boolean): Whether cursor is snapped to an event

**Relationships**:
- optionally snapped to one `TimelineEvent`

**Validation Rules**:
- `time` must be within timeline start/end range
- `x` must be within viewport range
- `snappedEventId` must reference existing event if not null
- `isSnapped` must be true if `snappedEventId` is not null

**State Transitions**:
- Free → Snapped (when dragged within 10px of event)
- Snapped → Free (when dragged away from event)

**Example**:
```typescript
{
  time: 1736434980123,
  x: 450.5,
  snappedEventId: "evt-1736434980123-signal-1",
  isSnapped: true
}
```

---

### 5. TimelineFilter

Configuration for which events and nodes are visible.

**Fields**:
- `enabledEventTypes` (Set<ReactivityEventType>): Set of enabled event types
- `selectedNodeIds` (Set<string> | null): Set of selected node IDs (null = show all)
- `searchQuery` (string): Text search query (empty = no search filter)

**Relationships**: N/A (configuration entity)

**Validation Rules**:
- `enabledEventTypes` must contain valid ReactivityEventType values
- `selectedNodeIds` must reference existing nodes if not null
- `searchQuery` must be trimmed string

**State Transitions**: Mutable (updated by user interactions)

**Example**:
```typescript
{
  enabledEventTypes: new Set(["signal-read", "signal-write", "computation-execute-start"]),
  selectedNodeIds: new Set(["signal-1", "memo-2"]),
  searchQuery: ""
}
```

---

### 6. PlaybackState

Configuration for timeline playback controls.

**Fields**:
- `isPlaying` (boolean): Whether playback is active
- `speed` (number): Playback speed multiplier (0.5, 1, 2, 5)
- `mode` (PlaybackMode): Playback mode ("manual" | "playing" | "paused")
- `lastTickTime` (number | null): Timestamp of last animation frame
- `rafId` (number | null): requestAnimationFrame ID (for cancellation)

**Relationships**: N/A (configuration entity)

**Validation Rules**:
- `speed` must be one of [0.5, 1, 2, 5]
- `isPlaying` must be true when `mode` is "playing"
- `isPlaying` must be false when `mode` is "manual" or "paused"
- `rafId` must be non-null when `isPlaying` is true

**State Transitions**:
- Manual → Playing (user clicks play button)
- Playing → Paused (user clicks pause or playback reaches end)
- Paused → Playing (user clicks play to resume)
- Playing/Paused → Manual (user manually scrubs cursor)

**Example**:
```typescript
{
  isPlaying: true,
  speed: 2,
  mode: "playing",
  lastTickTime: 1736434980500,
  rafId: 12345
}
```

---

### 7. TimelineScale

Represents the D3 time scale for timestamp-to-pixel mapping.

**Fields**:
- `startTime` (number): Timeline start timestamp (domain start)
- `endTime` (number): Timeline end timestamp (domain end)
- `width` (number): Timeline width in pixels (range end)
- `scale` (ScaleTime<number, number>): D3 time scale instance

**Relationships**: N/A (computational entity)

**Validation Rules**:
- `startTime` < `endTime`
- `width` > 0
- `scale.domain()` = `[startTime, endTime]`
- `scale.range()` = `[0, width]`

**State Transitions**: Updated when timeline is zoomed or resized

**Derived Values**:
- `timeToX(timestamp)`: Convert timestamp to pixel X position
- `xToTime(x)`: Convert pixel X position to timestamp

**Example**:
```typescript
{
  startTime: 1736434980000,
  endTime: 1736434990000,
  width: 1200,
  scale: d3.scaleUtc()
    .domain([1736434980000, 1736434990000])
    .range([0, 1200])
}
```

---

### 8. EventCluster

Represents aggregated events when density exceeds threshold.

**Fields**:
- `id` (string): Unique cluster identifier
- `centerTime` (number): Representative timestamp (center of cluster)
- `timeRange` ([number, number]): [startTime, endTime] of clustered events
- `eventIds` (string[]): Array of event IDs in this cluster
- `eventCount` (number): Number of events in cluster
- `nodeId` (string): Node ID (all events in cluster from same node)

**Relationships**:
- contains multiple `TimelineEvent` instances
- belongs to one `Swimlane`

**Validation Rules**:
- `eventCount` >= 2 (clusters must have multiple events)
- `timeRange[0]` <= `centerTime` <= `timeRange[1]`
- All events must have same `nodeId`
- Cluster created only when pixel density > 50 events per 100px

**State Transitions**:
- Created when zoomed out (high density)
- Expanded to individual events when zoomed in

**Example**:
```typescript
{
  id: "cluster-signal-1-1736434980000",
  centerTime: 1736434980500,
  timeRange: [1736434980000, 1736434981000],
  eventIds: ["evt-1", "evt-2", "evt-3", ...],
  eventCount: 25,
  nodeId: "signal-1"
}
```

---

## Entity Relationships Diagram

```
ReactiveNode (existing)
    |
    | 1:N
    v
Swimlane
    |
    | 1:N
    v
TimelineEvent
    |
    | N:1
    v
EventBatch

TimelineCursor
    |
    | 0..1:1
    v
TimelineEvent

TimelineScale
    |
    | (uses)
    v
TimelineEvent
    |
    | (maps to)
    v
Pixel Position (x, y)

TimelineFilter
    |
    | (filters)
    v
TimelineEvent + Swimlane

EventCluster
    |
    | 1:N
    v
TimelineEvent
```

---

## Data Flow

### Event Creation Flow
1. User interacts with tracked signals/memos/effects
2. ReactivityTracker emits event with timestamp
3. EventBatcher assigns batch ID (within 50ms window)
4. TimelineEvent created and added to event list
5. Timeline view reactively updates to show new event

### Cursor Movement Flow
1. User drags cursor on timeline
2. Brush behavior emits position (pixels)
3. TimelineScale converts pixels to timestamp via `.invert()`
4. Check for nearby events within 10px snap threshold
5. Update TimelineCursor state (snapped or free)
6. Render cursor at new position

### Playback Flow
1. User clicks play button
2. PlaybackState transitions to "playing" mode
3. `requestAnimationFrame` loop starts
4. Each frame: advance cursor by `speed * delta`
5. Update TimelineCursor time
6. Render updates via reactive signals
7. Pause when cursor reaches timeline end

### Filtering Flow
1. User toggles event type or selects nodes
2. TimelineFilter state updated
3. `createMemo` recomputes filtered events
4. Virtual scroller updates visible range
5. Render only filtered, visible events

### Aggregation Flow
1. Zoom out on timeline
2. Calculate pixel density (events per 100px)
3. If density > 50: create EventClusters
4. Replace individual TimelineEvents with EventClusters in render
5. Zoom in: expand clusters back to individual events

---

## Storage Strategy

### In-Memory (SolidJS Signals/Stores)
- `TimelineEvent[]` - Full event history
- `Swimlane[]` - Current swimlane layout
- `EventBatch[]` - Detected batches
- `TimelineCursor` - Current cursor state
- `PlaybackState` - Playback configuration
- `TimelineScale` - Current time scale
- `EventCluster[]` - Aggregated events (when zoomed out)

### Local Storage (Persisted Preferences)
- `TimelineFilter` - Filter preferences (enabled types, selected nodes)
- `PanelPreferences` - Visibility, height, position
- `PlaybackSpeed` - Last used playback speed

### Ephemeral (Component State)
- Hover state (tooltip visibility)
- Drag state (cursor dragging)
- Focus state (keyboard navigation)

---

## Performance Considerations

### Memory Management
- **Event Retention**: Keep all events in memory (unbounded for MVP)
- **Future**: Implement sliding window (keep last N events or last M minutes)
- **Virtual Scrolling**: Only create DOM nodes for visible events

### Indexing Strategies
- **By Time**: Keep events sorted by timestamp for binary search
- **By Node**: Map<nodeId, TimelineEvent[]> for fast node filtering
- **By Batch**: Map<batchId, EventBatch> for batch lookup

### Computation Caching
- Use `createMemo` for:
  - Filtered event list
  - Visible event list (virtual scrolling)
  - Swimlane positions
  - Aggregated clusters
- Prevents redundant recalculation on reactive updates

---

## Validation & Invariants

### Global Invariants
1. All event timestamps must be monotonically increasing (or equal)
2. Cursor time must be within [timeline.startTime, timeline.endTime]
3. Swimlane Y positions must not overlap
4. Batch duration must be <= 50ms
5. Event clusters only exist when pixel density > 50/100px

### Consistency Checks
- Event `nodeId` references must resolve to existing ReactiveNode
- Batch `eventIds` must all reference existing TimelineEvents
- Cursor `snappedEventId` must reference existing event if not null
- Filter `selectedNodeIds` must all reference existing nodes

### Error Handling
- Invalid timestamp: Log warning, skip event
- Missing node: Log warning, show as "Unknown Node"
- Corrupt batch: Log warning, treat events as unbatched
- Out-of-range cursor: Clamp to valid range

---

**Status**: ✅ Data model complete - Ready for contracts generation
