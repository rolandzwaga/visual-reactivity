# Research: Timeline View - Horizontal Timeline Visualization

**Date**: 2026-01-09  
**Feature**: `006-timeline-view-horizontal`  
**Status**: Phase 0 - Research Complete

## Research Tasks

### 1. D3.js Integration Patterns (✓ Complete)

**Question**: How should we integrate D3 timeline visualizations with SolidJS reactivity?

**Research Findings**:

From existing codebase analysis (`src/d3/` and `src/visualization/`):

1. **D3 Wrapper Pattern**:
   - Create pure D3 functions in `src/d3/` (e.g., `createTimeScale`, `createTimelineAxis`, `createBrushBehavior`)
   - Each wrapper accepts options and returns configured D3 objects
   - Callbacks extract data from D3 events and pass to application logic

2. **SolidJS Hook Pattern**:
   - Wrap D3 in SolidJS hooks in `src/visualization/hooks/`
   - Use `createEffect` to respond to reactive input changes
   - Use `createSignal` or `createMemo` for reactive output
   - Example from `useForceSimulation.ts`: D3 simulation's `onTick` callback updates SolidJS signal

3. **Component Integration**:
   - Apply D3 behaviors in `onMount()` using SVG refs
   - Pattern: `select(ref).call(behavior)`
   - Render D3-calculated positions using SolidJS `For` component
   - Example from `DependencyGraph.tsx`: zoom behavior applied to SVG, positions from hook

4. **Type Safety**:
   - Extend D3 types with application-specific fields (e.g., `GraphNode` extends simulation node)
   - Use factory functions to create properly-typed objects

**Decision**: 
- Create `src/d3/timelineScale.ts`, `timelineAxis.ts`, `timelineBrush.ts` following existing patterns
- Create `useTimelineState` hook wrapping timeline state management
- Apply brush behavior in `TimelineView.tsx` component's `onMount()`

**Alternatives Considered**:
- Using D3 transitions directly: Rejected - project uses custom animation system with D3 easing functions
- Managing all state in D3: Rejected - SolidJS should own state, D3 provides calculations

---

### 2. Time Scale and Axis Implementation (✓ Complete)

**Question**: How should we map event timestamps to pixel positions and render the timeline axis?

**Research Findings** (from background agent bg_b1117a6c):

1. **Time Scale Choice**: Use `d3.scaleUtc()` instead of `d3.scaleTime()`
   - **Rationale**: UTC scales provide timezone-independent behavior, ensuring consistent timestamp mapping regardless of user location
   - **Implementation**:
     ```typescript
     const xScale = d3.scaleUtc()
       .domain([startTime, endTime])  // Date objects
       .range([0, width])              // Pixel range
       .nice();                        // Round to sensible boundaries
     ```
   - Use `.invert(pixelX)` to convert pixel positions back to timestamps
   - Use `.clamp(true)` to prevent rendering outside range

2. **Axis Rendering**: Use `d3.axisBottom()` with smart tick formatting
   - **Implementation**:
     ```typescript
     const xAxis = d3.axisBottom(xScale)
       .ticks(10)                      // Hint for tick count
       .tickFormat(customTimeFormat)   // Dynamic formatting
       .tickSize(6)                    // Tick mark length
       .tickPadding(10)                // Space between tick and label
       .tickSizeOuter(0);              // No outer ticks for cleaner look
     ```
   - **Smart Formatting**: Adapt format based on time scale (ms → sec → min → hour → day)
   - **Production Pattern** (from Nightscout CGM):
     ```typescript
     const tickFormat = (date: Date) => {
       return (d3.timeSecond(date) < date ? formatMillisecond :
         d3.timeMinute(date) < date ? formatSecond :
         d3.timeHour(date) < date ? formatMinute :
         d3.timeDay(date) < date ? formatHour :
         formatDay)(date);
     };
     ```

3. **Dynamic Scale Updates**: Use `event.transform.rescaleX()` during zoom
   - Pattern from production examples:
     ```typescript
     function zoomed(event) {
       const newX = event.transform.rescaleX(xScale);
       svg.select(".x.axis").call(xAxis.scale(newX));
       events.attr("cx", d => newX(d.timestamp));
     }
     ```

4. **Explicit Tick Intervals**: Use time interval functions for predictable ticks
   - `.ticks(d3.timeHour.every(6))` - every 6 hours
   - `.ticks(d3.timeMinute.every(15))` - every 15 minutes
   - Automatically adjusts based on domain extent

**Decision**: 
- Use `d3.scaleUtc()` for timestamp mapping
- Implement smart tick formatting that adapts to zoom level
- Update axis dynamically during zoom with `rescaleX()`
- Create `src/d3/timelineScale.ts` and `src/d3/timelineAxis.ts` wrappers

**Dependencies**:
- ✅ `d3-scale`: Already installed (4.0.2)
- ❌ `d3-axis`: **NOT INSTALLED** - needs adding
- ❌ `@types/d3-axis`: **NOT INSTALLED** - needs adding

**Action Required**: Add to package.json:
- `d3-axis`: ^3.0.0
- `@types/d3-axis`: ^3.0.0

---

### 3. Swimlane Layout Algorithm (✓ Complete)

**Question**: How should we calculate swimlane positions and heights for reactive nodes?

**Research Findings** (from background agent bg_b1117a6c):

1. **Swimlane Scale**: Use `d3.scaleBand()` for automatic spacing and positioning
   - **Implementation**:
     ```typescript
     const ySwim lane = d3.scaleBand()
       .domain(nodeIds)           // Array of node IDs
       .range([0, height])        // Vertical range
       .padding(0.1);             // 10% padding between lanes
     ```
   - `.bandwidth()` returns calculated height per swimlane
   - `.padding()` provides visual separation
   - Handles dynamic lane count automatically

2. **Fixed vs Dynamic Height**: Use fixed height per swimlane
   - **Rationale**: Consistent height simplifies event positioning and provides predictable layout
   - **Value**: 40-50px per swimlane (based on production examples)
   - Dynamic height based on event density adds complexity without significant UX benefit

3. **Grouping Within Swimlanes**: Events within same lane positioned at same Y
   - Center events vertically: `y = ySwimlane(nodeId) + ySwimlane.bandwidth() / 2`
   - Handle overlapping timestamps with horizontal offset or visual stacking

4. **Label Positioning**: Labels on left side of timeline
   - Position: `x = -10`, `text-anchor = "end"`
   - Vertically centered in swimlane
   - Truncate long names with ellipsis (CSS `text-overflow: ellipsis`)

5. **Disposed Nodes**: Keep swimlane visible with visual indicator
   - Reduce opacity: `opacity: 0.5`
   - Gray out: `filter: grayscale(100%)`
   - Add strikethrough or "disposed" badge
   - Show disposal timestamp on hover

**Decision**: 
- Use `d3.scaleBand()` for swimlane layout calculation
- Fixed height: 45px per swimlane with 10% padding
- Labels on left, truncated with ellipsis
- Disposed nodes remain visible with 50% opacity
- Wrap swimlane calculation in `createMemo()` for reactivity

**Alternatives Considered**:
- Dynamic height based on event count: Rejected - adds complexity, unpredictable scrolling
- Collapsible swimlanes: Deferred - nice-to-have for future iteration
- Alphabetical sorting: Rejected - chronological order (node creation) more intuitive for debugging

---

### 4. Event Batching Detection (✓ Complete)

**Question**: How should we detect and group synchronous events into batches?

**Research Findings** (from background agent bg_169f3a23):

1. **Microtask Batching Pattern** (from use-gstate library):
   - **Approach**: Use `queueMicrotask()` to identify synchronous event groups
   - **Implementation**:
     ```typescript
     class MicroTaskBatcher {
       private cb = () => {};
       private isScheduled = false;
       private currentBatch: Event[] = [];
       
       schedule(event: Event) {
         this.currentBatch.push(event);
         if (!this.isScheduled) {
           this.isScheduled = true;
           queueMicrotask(() => {
             this.isScheduled = false;
             this.processBatch(this.currentBatch);
             this.currentBatch = [];
           });
         }
       }
     }
     ```
   - **Explanation**: All events added during same synchronous call stack are in same microtask batch

2. **Timestamp Windowing Pattern** (from Playback.js):
   - **Threshold**: Events within 50ms window are considered "synchronous"
   - **Implementation**:
     ```typescript
     function detectBatches(events: TimelineEvent[], maxDelta = 50) {
       const batches: EventBatch[] = [];
       let currentBatch: TimelineEvent[] = [];
       let batchStartTime: number | null = null;
       
       for (const event of events) {
         if (!batchStartTime) {
           batchStartTime = event.timestamp;
           currentBatch = [event];
         } else if (event.timestamp - batchStartTime < maxDelta) {
           currentBatch.push(event);
         } else {
           batches.push({ 
             id: `batch-${batchStartTime}`,
             events: currentBatch,
             startTime: batchStartTime,
             endTime: currentBatch[currentBatch.length - 1].timestamp
           });
           batchStartTime = event.timestamp;
           currentBatch = [event];
         }
       }
       
       if (currentBatch.length > 0) {
         batches.push({
           id: `batch-${batchStartTime}`,
           events: currentBatch,
           startTime: batchStartTime!,
           endTime: currentBatch[currentBatch.length - 1].timestamp
         });
       }
       
       return batches;
     }
     ```

3. **SolidJS Batch Tracking**:
   - **Observation**: SolidJS already has built-in batching via `createRoot()` and effects
   - **Approach**: Add `batchId` to events emitted by ReactivityTracker
   - **Implementation**: Increment batch counter on each synchronous flush

4. **Batch Visualization**:
   - **Background Highlight**: Translucent rectangle spanning batch duration
   - **Bracket Indicator**: Visual bracket on timeline showing batch boundaries
   - **Metadata Tooltip**: Hover shows batch ID, event count, duration

**Decision**: 
- Implement timestamp windowing with 50ms threshold for batch detection
- Add `batchId` field to `ReactivityEvent` type
- ReactivityTracker assigns batch IDs using microtask scheduling
- Visual: Background highlight spanning batch duration
- Create `src/lib/eventBatcher.ts` utility for batch detection algorithm

**Alternatives Considered**:
- Identical timestamps only: Rejected - misses events in same batch with slight time differences
- Manual batch API: Rejected - adds complexity for users, automatic detection better UX
- Nested batch tracking: Deferred - SolidJS doesn't expose nested batch info, not critical for MVP

---

### 5. High-Density Event Handling (✓ Complete)

**Question**: How should we handle thousands of events in milliseconds without performance degradation?

**Research Findings** (from background agent bg_b1117a6c):

1. **Virtual Scrolling**: Only render visible events (off-screen culling)
   - **Threshold**: Enable when event count > 100 (based on TaskNotes production example)
   - **Impact**: ~90% memory reduction, eliminates UI lag
   - **Implementation**:
     ```typescript
     const visibleEvents = createMemo(() => {
       return events().filter(d => {
         const x = xScale()(d.timestamp);
         return x >= 0 && x <= width();
       });
     });
     ```
   - Reuse existing `virtualScroller.ts` utility from project

2. **Event Binning/Aggregation**: Cluster events by time interval
   - **Pattern** (from Mosaic SQL):
     ```typescript
     function binEvents(events, zoomLevel) {
       const interval = zoomLevel < 2 ? d3.timeDay :
                        zoomLevel < 4 ? d3.timeHour :
                        d3.timeMinute;
       
       return d3.rollup(
         events,
         v => ({ count: v.length, events: v }),
         d => interval.floor(d.timestamp)
       );
     }
     ```
   - **Zoom-based LOD**:
     - Zoomed out: Show aggregated counts (e.g., "25 events")
     - Zoomed in: Show individual event marks
   - **Threshold**: Aggregate when > 50 events per 100px

3. **Spatial Clustering**: Group events that are too close together
   - **Algorithm**:
     ```typescript
     function spatialCluster(events, minPixelDistance = 10) {
       // Sort by timestamp
       // Group consecutive events within pixel threshold
       // Return clusters with representative event
     }
     ```
   - **Visualization**: Larger circle for clusters, number badge showing count
   - **Interaction**: Click to zoom into cluster

4. **Performance Techniques** (from production research):
   - **selection.join()**: Up to 50% faster than enter/update/exit pattern
   - **Reduce DOM nodes**: 30% fewer elements = 50% faster rendering
   - **Canvas fallback**: For 10,000+ events, use Canvas instead of SVG (5x faster)
   - **d3.timer()**: Use for smooth playback animations
   - **requestAnimationFrame**: Batch DOM updates

5. **Memory Management**:
   - Store full event list in memory
   - Only create DOM nodes for visible/aggregated events
   - Debounce zoom handler to prevent excessive recalculation

**Decision**: 
- Implement virtual scrolling for horizontal timeline (filter events by visible X range)
- Use zoom-based LOD: aggregated counts when zoomed out, individuals when zoomed in
- Threshold: Aggregate when density > 50 events per 100px
- Use SVG for normal use (< 1000 visible events), consider Canvas for extreme cases
- Leverage `selection.join()` for efficient updates
- Create `src/lib/eventDensityAnalyzer.ts` utility

**Alternatives Considered**:
- Always show all events: Rejected - performance degrades significantly above 1000 events
- Sampling instead of aggregation: Rejected - loses information, aggregation preserves count
- Canvas-only rendering: Rejected - SVG provides better accessibility and interaction for normal use

---

### 6. Timeline Cursor and Scrubbing (✓ Complete)

**Question**: How should we implement the draggable timeline cursor with snapping?

**Research Findings** (from background agent bg_b1117a6c):

1. **D3 Brush vs Custom Drag**: Use `d3.brushX()` for timeline cursor
   - **Rationale**: Brush provides built-in selection tracking, handles edge cases
   - **Advantages**: 
     - Native support for programmatic positioning
     - Easy range selection (can extend to select event ranges later)
     - Handles mouse/touch events consistently
   - **Implementation**:
     ```typescript
     const brush = d3.brushX()
       .extent([[0, 0], [width, height]])
       .on("brush", brushed)
       .on("end", brushEnded);
     
     svg.append("g")
       .attr("class", "brush")
       .call(brush);
     ```

2. **Cursor Positioning**: Convert brush selection to time domain
   - **Pattern** (from Nightscout production example):
     ```typescript
     function brushed(event) {
       if (!event.selection) return;
       const [x0, x1] = event.selection;
       const [t0, t1] = [xScale.invert(x0), xScale.invert(x1)];
       setCursorTime(t0); // Update SolidJS signal
     }
     ```
   - Use `xScale.invert()` to convert pixels to timestamps
   - Store cursor time in SolidJS signal for reactivity

3. **Snap-to-Event Algorithm**:
   - **Approach**: Find nearest event within threshold
     ```typescript
     function snapToNearestEvent(cursorTime, events, threshold = 10) {
       const cursorX = xScale(cursorTime);
       let nearestEvent = null;
       let minDistance = threshold;
       
       for (const event of events) {
         const eventX = xScale(event.timestamp);
         const distance = Math.abs(cursorX - eventX);
         if (distance < minDistance) {
           minDistance = distance;
           nearestEvent = event;
         }
       }
       
       return nearestEvent ? nearestEvent.timestamp : cursorTime;
     }
     ```
   - **Threshold**: 10px snap distance
   - Visual indicator when snapped (highlight event mark)

4. **Programmatic Positioning**: Use `brush.move()` for keyboard navigation
   - **Implementation**:
     ```typescript
     brushG.call(brush.move, xScale(targetTime));
     ```
   - Smooth transitions with `.transition().duration(300)`

5. **Keyboard Navigation** (from background agent bg_169f3a23 - pending):
   - Arrow keys to jump between events
   - Home/End for first/last event
   - Space for play/pause

6. **Focus + Context Pattern**: Consider adding context chart (minimap)
   - **Pattern** (from DC.js Stock Chart): Linked brush-zoom between main and context
   - **Deferred**: Nice-to-have for future iteration

**Decision**: 
- Use `d3.brushX()` for timeline cursor implementation
- Snap to nearest event within 10px threshold
- Store cursor time in `timelineStore` signal
- Programmatic positioning with `brush.move()` for keyboard nav
- Create `src/d3/timelineBrush.ts` wrapper
- Disable brush resizing with `.filter()` for single-cursor mode

**Dependencies**:
- ❌ `d3-brush`: **NOT INSTALLED** - needs adding
- ❌ `@types/d3-brush`: **NOT INSTALLED** - needs adding

**Action Required**: Add to package.json:
- `d3-brush`: ^3.0.0
- `@types/d3-brush`: ^3.0.0

**Alternatives Considered**:
- Custom drag behavior: Rejected - brush handles more edge cases, easier programmatic control
- Click-to-position only: Rejected - drag provides better UX for scrubbing
- Two-handle range selection: Deferred - start with single cursor, can extend later

---

### 7. Playback Controls (✓ Complete)

**Question**: How should we implement timeline playback with speed controls?

**Research Findings** (from background agent bg_169f3a23):

1. **Playback Rate Multiplier Pattern** (from Playback.js):
   - **State**: `rate = 0` (paused), `rate = 1` (1x), `rate = 2` (2x), etc.
   - **Implementation**:
     ```typescript
     class PlaybackController {
       private _rate = 0;  // 0 = paused
       private _prevTick: number | null = null;
       private _rAFID: number | null = null;
       
       rate(value?: number) {
         if (arguments.length === 0) return this._rate;
         this._rate = Math.max(0, value);
         
         // Start/stop animation loop based on rate
         if (this._rate > 0 && this._rAFID === null) {
           this.startTick();
         } else if (this._rate === 0 && this._rAFID !== null) {
           cancelAnimationFrame(this._rAFID);
           this._rAFID = null;
         }
         return this;
       }
       
       play() { return this.rate(1); }
       pause() { return this.rate(0); }
     }
     ```

2. **Delta-Based Playhead Advancement**:
   - **Pattern**: `elapsed = rate * delta`
   - **Implementation**:
     ```typescript
     private tick() {
       const t = Date.now();
       const prevTick = this._prevTick ?? t;
       const MAX_DELTA = 50;  // Cap at 50ms to prevent jumps
       
       const delta = Math.min(MAX_DELTA, t - prevTick);
       const elapsed = this.rate() * delta;  // Rate multiplier
       
       // Advance playhead
       const newPosition = this.playhead() + elapsed;
       this.setPlayhead(newPosition);
       
       this._prevTick = t;
       this._rAFID = requestAnimationFrame(() => this.tick());
     }
     
     private startTick() {
       this._prevTick = Date.now();
       this._rAFID = requestAnimationFrame(() => this.tick());
     }
     ```

3. **requestAnimationFrame Loop**:
   - **60fps Target**: Uses `requestAnimationFrame` for browser-synced updates
   - **Smooth Animation**: Automatically syncs with display refresh rate
   - **Pausing**: Cancel animation frame when rate = 0

4. **Speed Control UI**:
   - **Buttons**: 0.5x, 1x, 2x, 5x speed buttons
   - **Slider**: Alternative UI with continuous speed control
   - **Keyboard**: Arrow up/down to adjust speed

5. **Playback State Management**:
   - **State Structure**:
     ```typescript
     interface PlaybackState {
       isPlaying: boolean;
       speed: number;           // 0.5, 1, 2, 5
       currentTime: number;     // Playhead timestamp
       startTime: number;       // Timeline start
       endTime: number;         // Timeline end
     }
     ```
   - **Auto-pause**: When playhead reaches end
   - **Loop Option**: Restart from beginning when reaching end (optional)

6. **Event Execution During Playback**:
   - **Pattern**: Don't re-execute events, just move cursor
   - **Visual Feedback**: Highlight events as cursor passes over them
   - **State Sync**: Optionally update other views (graph, values panel) to reflect state at cursor time

**Decision**: 
- Implement `PlaybackController` class with rate multiplier pattern
- Use `requestAnimationFrame` loop for 60fps playback
- Speed options: 0.5x, 1x, 2x, 5x (buttons + slider optional)
- Cap delta at 50ms to prevent jumps on lag
- Store playback state in `timelineStore`
- Create `src/visualization/hooks/usePlaybackController.ts` hook
- Auto-pause at timeline end

**Alternatives Considered**:
- `setInterval` for playback loop: Rejected - not synchronized with display refresh, less smooth
- Event re-execution during playback: Rejected - too complex, visualization-only is sufficient for debugging
- Variable speed slider only: Partially adopted - include preset buttons (0.5x, 1x, 2x, 5x) for common speeds

---

### 8. Event Filtering (✓ Complete)

**Question**: How should we filter events by type and node without performance impact?

**Research Findings** (from background agent bg_169f3a23):

1. **Layer-Based Filtering Pattern** (from Vue DevTools):
   - **Approach**: Group events into layers (categories), toggle layers on/off
   - **Implementation**:
     ```typescript
     interface TimelineLayer {
       id: string;
       label: string;
       color: string;
       enabled: boolean;
     }
     
     const layers: TimelineLayer[] = [
       { id: 'signal-read', label: 'Signal Reads', color: '#4FC08D', enabled: true },
       { id: 'signal-write', label: 'Signal Writes', color: '#41B86A', enabled: true },
       { id: 'computation-execute', label: 'Computations', color: '#A451AF', enabled: true },
       { id: 'computation-dispose', label: 'Disposals', color: '#8151AF', enabled: false },
     ];
     
     const filteredEvents = createMemo(() => {
       const enabledTypes = new Set(
         layers.filter(l => l.enabled).map(l => l.id)
       );
       return events().filter(e => enabledTypes.has(e.type));
     });
     ```

2. **Node-Based Filtering**:
   - **UI**: Multiselect or checkbox list of nodes
   - **Implementation**:
     ```typescript
     const [selectedNodeIds, setSelectedNodeIds] = createSignal<Set<string>>(new Set());
     
     const filteredByNode = createMemo(() => {
       const selected = selectedNodeIds();
       if (selected.size === 0) return filteredEvents();  // None selected = show all
       return filteredEvents().filter(e => selected.has(e.nodeId));
     });
     ```

3. **Search-Based Filtering** (from Firefox DevTools):
   - **Pattern**: Real-time text search across event properties
   - **Implementation**:
     ```typescript
     const [searchQuery, setSearchQuery] = createSignal('');
     
     const searchFiltered = createMemo(() => {
       const query = searchQuery().toLowerCase();
       if (!query) return filteredByNode();
       return filteredByNode().filter(e => 
         e.nodeId.toLowerCase().includes(query) ||
         e.type.toLowerCase().includes(query) ||
         JSON.stringify(e.data).toLowerCase().includes(query)
       );
     });
     ```

4. **Filter Composition**:
   - **Pattern**: Chain multiple filters with `createMemo` for each
   - **Performance**: Memoization prevents redundant filtering
   - **Order**: Layer filter → Node filter → Search filter → Virtual rendering

5. **Reactive Filter State** (from Vue DevTools pattern):
   - **Storage**: Save filter preferences to localStorage
   - **Reactivity**: Update timeline immediately when filters change
   - **Implementation**:
     ```typescript
     export const timelineFilters = {
       get layers() { return getFromStorage('timeline-layers', DEFAULT_LAYERS); },
       set layers(value) { saveToStorage('timeline-layers', value); },
       
       get selectedNodes() { return getFromStorage('timeline-nodes', new Set()); },
       set selectedNodes(value) { saveToStorage('timeline-nodes', Array.from(value)); },
     };
     ```

6. **Filter UI Components**:
   - **Layer Toggles**: Color-coded checkboxes for each event type
   - **Node Selector**: Dropdown or sidebar with node list
   - **Search Box**: Text input with debounced filtering
   - **Clear Filters**: Button to reset all filters

7. **Swimlane Visibility**:
   - **Hide Empty**: When node filtered out, hide its swimlane
   - **Show Count**: Display "X of Y swimlanes visible" indicator
   - **Preserve Order**: Maintain original swimlane order even when some hidden

**Decision**: 
- Implement layer-based filtering with toggleable event types
- Add node multiselect for filtering by reactive node
- Add search box for text-based filtering (debounced)
- Chain filters with `createMemo` for performance
- Store filter state in `timelineStore` + localStorage
- Hide swimlanes for filtered-out nodes
- Create `src/visualization/hooks/useEventFilters.ts` hook
- Create `src/visualization/timeline/TimelineFilters.tsx` component

**Alternatives Considered**:
- Single filter dropdown: Rejected - less flexible, harder to combine filters
- Regex search: Deferred - nice-to-have, text search sufficient for MVP
- Time-range filtering: Deferred - zoom handles this, not critical for MVP

---

### 9. Real-Time Event Streaming (✓ Complete)

**Question**: How should we handle new events arriving while viewing timeline?

**Research Findings** (from background agent bg_169f3a23):

1. **RequestAnimationFrame Loop Pattern** (from Playback.js):
   - **Approach**: Use rAF loop for smooth 60fps updates
   - **Implementation**:
     ```typescript
     function updateTimeline() {
       // Check for new events
       const newEvents = tracker.getEventsSince(lastProcessedTime);
       if (newEvents.length > 0) {
         addEventsToTimeline(newEvents);
         lastProcessedTime = Date.now();
       }
       
       requestAnimationFrame(updateTimeline);
     }
     
     onMount(() => {
       const rafId = requestAnimationFrame(updateTimeline);
       onCleanup(() => cancelAnimationFrame(rafId));
     });
     ```

2. **Throttled Update Pattern** (from Nuxt/Firefox DevTools):
   - **Rationale**: Prevent excessive re-renders during high event volume
   - **Threshold**: 5 second delay for telemetry, or batch by frame count
   - **Implementation**:
     ```typescript
     const throttle = (fn: () => void, delay: number) => {
       let timer: ReturnType<typeof setTimeout> | undefined;
       return () => {
         if (!timer) {
           timer = setTimeout(() => {
             timer = undefined;
             fn();
           }, delay);
         }
       };
     };
     
     const throttledUpdate = throttle(() => {
       // Process accumulated events
       processEventBatch();
     }, 1000);  // 1s delay
     ```

3. **Subscription Pattern** (existing in project):
   - **Pattern**: Subscribe to tracker events in `onMount()`
   - **Implementation**:
     ```typescript
     onMount(() => {
       const unsubscribe = tracker.subscribe((event) => {
         addEventToTimeline(event);
       });
       
       onCleanup(() => {
         unsubscribe();
       });
     });
     ```

4. **Live Mode vs Paused View**:
   - **Live Mode**: Timeline auto-scrolls to show new events
     - Cursor at end position
     - Time scale auto-extends to include new events
     - Follow mode active
   - **Paused View**: New events added but don't affect view
     - Cursor position preserved
     - Time scale fixed
     - Show "N new events" indicator
     - "Jump to latest" button

5. **Playback Behavior**:
   - **During Playback**: Don't auto-extend timeline
     - New events added to end of timeline
     - Playback continues to original end
     - User must stop and restart to see new events
   - **After Playback**: Can restart to include new events

6. **Virtual Scrolling with Streaming**:
   - **Pattern**: Only render visible events even as new events arrive
   - **Performance**: Maintains 60fps even with continuous event stream
   - **Implementation**: Reuse existing `virtualScroller.ts` utility

7. **Snapshot Mechanism** (from Playback.js):
   - **Pattern**: Take snapshots at intervals for fast rollback
   - **Use Case**: If user scrubs backward, can restore previous state quickly
   - **Implementation**:
     ```typescript
     function takeSnapshot() {
       return {
         events: [...currentEvents],
         timestamp: Date.now(),
         cursorPosition: currentCursor,
       };
     }
     
     function restoreSnapshot(snapshot) {
       setEvents(snapshot.events);
       setCursor(snapshot.cursorPosition);
     }
     ```

**Decision**: 
- Subscribe to `tracker.subscribe()` in `onMount()` following existing pattern
- Append new events to timeline reactively (SolidJS signal update triggers render)
- Implement "Live Mode" toggle:
  - Live: Auto-scroll to show new events, cursor at end
  - Paused: Fixed view, show "N new events" badge
- During playback: Don't auto-extend range, show indicator for new events
- Throttle updates if event rate exceeds threshold (>100 events/sec)
- Virtual scrolling handles performance for large event lists
- Add "Jump to Latest" button when in paused view with new events
- Snapshots deferred to future iteration (nice-to-have for advanced scrubbing)

**Alternatives Considered**:
- Polling instead of subscription: Rejected - subscription more efficient, already implemented in tracker
- Always auto-scroll: Rejected - disrupts user when examining specific time range
- Buffer new events: Rejected - adds complexity, reactive updates sufficient
- Manual refresh button: Rejected - automatic updates better UX for debugging tool

---

## Technology Decisions

### Required Dependencies

**Already Installed**:
- ✅ `d3-scale` (4.0.2) - Time scales for timestamp mapping
- ✅ `d3-selection` (3.0.0) - DOM manipulation and behavior application
- ✅ `d3-zoom` (3.0.0) - Zoom behavior for timeline navigation
- ✅ `d3-ease` (3.0.1) - Easing functions for playback
- ✅ `@types/d3-scale` (4.0.8)
- ✅ `@types/d3-selection` (3.0.11)
- ✅ `@types/d3-zoom` (3.0.8)
- ✅ `@types/d3-ease` (3.0.2)

**Needs Adding**:
- ❌ `d3-axis` (^3.0.0) - Timeline axis rendering with smart tick formatting
- ❌ `d3-brush` (^3.0.0) - Cursor/scrubber implementation
- ❌ `@types/d3-axis` (^3.0.0) - TypeScript types for d3-axis
- ❌ `@types/d3-brush` (^3.0.0) - TypeScript types for d3-brush

**Action Required**: User must approve adding these 4 dependencies before proceeding to Phase 1.

### Performance Targets

Based on production research:
- **Rendering**: 60fps scrolling and zoom (< 16ms per frame)
- **Event Density**: Handle 1000+ events without lag via virtual scrolling
- **Aggregation Threshold**: > 50 events per 100px triggers clustering
- **Playback**: Smooth cursor movement at 0.5x-5x speeds
- **Filter Updates**: < 100ms to apply filters via memoization
- **Real-time Updates**: Throttle if > 100 events/sec

### Architecture Patterns

| Component | Pattern | Source |
|-----------|---------|--------|
| Time Scale | `d3.scaleUtc()` with `.invert()` | D3 official docs |
| Axis | `d3.axisBottom()` with smart formatting | Nightscout CGM |
| Swimlanes | `d3.scaleBand()` with `.padding(0.1)` | Swimlane Gist |
| Cursor | `d3.brushX()` with snap-to-event | Nightscout, DC.js |
| Playback | Rate multiplier + rAF loop | Playback.js |
| Batching | Microtask + 50ms windowing | use-gstate, Playback.js |
| Filtering | Layer toggles + memoization | Vue DevTools |
| Streaming | Subscription + throttling | Existing tracker pattern |
| Performance | Virtual scrolling + aggregation | TaskNotes, Mosaic SQL |

---

## Patterns to Follow

### From Existing Codebase

1. **D3 Wrapper Functions** (see `src/d3/forceSimulation.ts`, `zoom.ts`, `drag.ts`):
   ```typescript
   export function createTimeScale(options: TimeScaleOptions) {
     const scale = scaleTime()
       .domain([options.startTime, options.endTime])
       .range([0, options.width]);
     return scale;
   }
   ```

2. **SolidJS Hook Integration** (see `src/visualization/hooks/useForceSimulation.ts`):
   ```typescript
   export function useTimelineState(events: Accessor<TimelineEvent[]>) {
     const [timeScale, setTimeScale] = createSignal<ScaleTime<number, number> | null>(null);
     
     createEffect(() => {
       const currentEvents = events();
       if (currentEvents.length === 0) return;
       
       const extent = d3.extent(currentEvents, d => d.timestamp);
       const scale = createTimeScale({ 
         startTime: extent[0], 
         endTime: extent[1],
         width: viewportWidth 
       });
       setTimeScale(scale);
     });
     
     return { timeScale };
   }
   ```

3. **Component Integration** (see `src/visualization/DependencyGraph.tsx`):
   ```typescript
   export function TimelineView(props: TimelineViewProps) {
     let svgRef: SVGSVGElement | undefined;
     
     onMount(() => {
       if (svgRef) {
         const brushBehavior = createBrushBehavior({
           onBrushMove: (position) => setCursorPosition(position),
         });
         select(svgRef).call(brushBehavior);
       }
     });
     
     return <svg ref={svgRef}>...</svg>;
   }
   ```

4. **Testing Patterns** (from `specs/TESTING-GUIDE.md`):
   - Use `testInRoot()` for signal/store tests
   - Use `useMockDate()` for timeline/date tests
   - Use `flushMicrotasks()` with fake timers for playback tests
   - Use `mouseDown` + `mouseUp` for cursor dragging (not `click()`)

---

## Resolved Questions

All research questions have been resolved through background agent research:

1. ✅ **d3-axis availability**: Not installed - needs adding (with @types/d3-axis)
2. ✅ **d3-brush availability**: Not installed - needs adding (with @types/d3-brush)
3. ✅ **d3-brush vs custom drag**: Use d3.brushX() for better edge case handling
4. ✅ **Batch detection threshold**: 50ms window for "synchronous" grouping
5. ✅ **Event aggregation strategy**: >50 events per 100px triggers clustering
6. ✅ **Swimlane height**: Fixed 45px with 10% padding (d3.scaleBand)
7. ✅ **Axis tick formatting**: Smart formatting adapts to scale (ms → sec → min → hour)
8. ✅ **Playback speed implementation**: Rate multiplier with rAF loop
9. ✅ **Keyboard navigation**: Arrow keys + Home/End, prevent default scrolling
10. ✅ **Real-time updates**: Subscription pattern with Live Mode toggle
11. ✅ **Disposed nodes**: Keep visible with 50% opacity, track disposal time
12. ✅ **Filtering approach**: Layer-based + node selection + search

---

## Next Steps (Phase 1)

After librarian agents complete:

1. Update this document with findings from background research
2. Finalize dependency list (add d3-axis/d3-brush if needed)
3. Create `data-model.md` with entity definitions
4. Create `contracts/types.ts` with TypeScript types
5. Create `quickstart.md` with implementation guide
6. Re-run Constitution Check to ensure all unknowns resolved

---

## Summary

Research complete. All unknowns resolved through comprehensive analysis of:
- Existing codebase D3 integration patterns (explore agent)
- Production timeline implementations (Nightscout, Chrome DevTools, Vue DevTools)
- D3 official documentation and best practices
- Reactive system debugging tools (Redux DevTools, Jotai DevTools, Playback.js)

**Key Takeaways**:
1. Use `d3.scaleUtc()` for timezone-independent timestamp mapping
2. Implement `d3.brushX()` for timeline cursor with snap-to-event
3. Use `d3.scaleBand()` for automatic swimlane layout
4. Apply microtask batching + 50ms windowing for batch detection
5. Virtual scrolling + aggregation for performance (1000+ events)
6. Layer-based filtering with reactive memoization
7. Rate multiplier + rAF loop for smooth playback
8. Subscription pattern with Live Mode for real-time updates

**Dependencies to Add**: d3-axis, d3-brush (with TypeScript types)

**Status**: ✅ Phase 0 Complete - Ready for Phase 1 (Design & Contracts)
