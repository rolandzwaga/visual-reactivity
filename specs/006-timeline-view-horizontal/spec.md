# Feature Specification: Timeline View - Horizontal Timeline Visualization

**Feature Branch**: `006-timeline-view-horizontal`  
**Created**: 2026-01-09  
**Status**: Draft  
**Input**: User description: "Timeline View - Horizontal timeline visualization with swimlanes showing temporal sequence of reactive events, including event marks, batch grouping, temporal navigation (scrub through time), event filtering, and playback controls for debugging execution order"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Event Sequence on Timeline (Priority: P1)

As a developer debugging reactivity, I want to see all reactive events displayed chronologically on a horizontal timeline with swimlanes for each reactive node, so that I can understand the temporal sequence of signal updates, memo evaluations, and effect executions.

**Why this priority**: This is the core value of the timeline view. Without the basic timeline display showing when events occurred and in what order, developers cannot debug timing issues or understand execution sequences. This is the foundation that all other features build upon.

**Independent Test**: Can be fully tested by triggering reactive updates, verifying the timeline displays events in chronological order with correct timestamps, and confirming each node gets its own swimlane.

**Acceptance Scenarios**:

1. **Given** reactive events have been recorded, **When** I open the timeline view, **Then** events are displayed on a horizontal timeline from left (earliest) to right (latest)
2. **Given** multiple reactive nodes exist, **When** events occur, **Then** each node is assigned its own horizontal swimlane with a label showing the node name
3. **Given** events occur at different times, **When** viewing the timeline, **Then** event marks are positioned proportionally based on their timestamps relative to the full timeline duration
4. **Given** events overlap in time, **When** viewing the timeline, **Then** each event is visible in its respective swimlane without visual collision
5. **Given** a long event sequence, **When** viewing the timeline, **Then** I can horizontally scroll to see all events across the full time range

---

### User Story 2 - Inspect Event Details (Priority: P1)

As a developer debugging reactivity, I want to hover over or select event marks on the timeline to see detailed information about each event, so that I can inspect values, timestamps, and execution context without cluttering the main view.

**Why this priority**: The timeline provides overview, but developers need detailed information to actually debug issues. Without event inspection, the timeline is just pretty visualization without actionable data. This is essential for the feature to be useful.

**Independent Test**: Can be fully tested by hovering over event marks and verifying tooltips display, and by clicking events and verifying a details panel shows complete event information.

**Acceptance Scenarios**:

1. **Given** events are displayed on the timeline, **When** I hover over an event mark, **Then** a tooltip appears showing event type, timestamp, and primary details (e.g., signal value, execution duration)
2. **Given** an event mark exists, **When** I click on it, **Then** a details panel appears showing complete event information including node ID, event type, timestamp, previous/new values, and any associated metadata
3. **Given** multiple events are selected, **When** viewing the details panel, **Then** I can compare information across the selected events
4. **Given** a computation event (memo or effect), **When** inspecting it, **Then** I can see execution start time, end time, and total duration

---

### User Story 3 - Navigate Timeline with Scrubbing (Priority: P2)

As a developer analyzing execution flow, I want to scrub through time using a timeline cursor, so that I can step through the execution sequence event-by-event and see the state of the reactive graph at each moment.

**Why this priority**: Scrubbing enables step-by-step debugging of reactive flows. While not required for basic timeline viewing, it significantly enhances the ability to trace cause and effect through complex reactive chains.

**Independent Test**: Can be fully tested by dragging a timeline cursor and verifying it snaps to events, displays current time, and potentially triggers state updates in other views.

**Acceptance Scenarios**:

1. **Given** the timeline view is displayed, **When** I click or drag on the timeline, **Then** a vertical cursor line appears at that time position
2. **Given** the timeline cursor exists, **When** I drag it, **Then** it moves smoothly and displays the current timestamp
3. **Given** events exist on the timeline, **When** scrubbing near an event, **Then** the cursor snaps to the event timestamp for precise selection
4. **Given** the cursor is positioned at an event, **When** I use keyboard arrows, **Then** the cursor jumps to the previous/next event
5. **Given** the timeline cursor is positioned, **When** other views are visible (graph, values panel), **Then** those views update to reflect the state at the cursor's timestamp

---

### User Story 4 - Group Related Events into Batches (Priority: P2)

As a developer understanding batch updates, I want to see events that occur within the same reactive batch grouped together visually, so that I can understand which updates happened synchronously versus asynchronously.

**Why this priority**: Reactive systems often batch synchronous updates for efficiency. Visualizing these batches helps developers understand update patterns and identify potential performance issues. This is valuable for optimization but not critical for basic debugging.

**Independent Test**: Can be fully tested by triggering batched reactive updates and verifying grouped events are visually highlighted or connected on the timeline.

**Acceptance Scenarios**:

1. **Given** multiple events occur within the same tick/batch, **When** viewing the timeline, **Then** those events are visually grouped with a background highlight or bracket spanning the batch duration
2. **Given** batched events exist, **When** hovering over the batch indicator, **Then** a tooltip shows the batch ID, event count, and duration
3. **Given** batched and non-batched events exist, **When** viewing the timeline, **Then** batch boundaries are clearly distinguishable from asynchronous event sequences
4. **Given** nested batches occur, **When** viewing the timeline, **Then** nested batch relationships are visually represented through indentation or nesting indicators

---

### User Story 5 - Filter Events by Type and Node (Priority: P3)

As a developer focusing on specific reactive nodes or event types, I want to filter the timeline to show only relevant events, so that I can reduce visual noise and focus on the specific behavior I'm debugging.

**Why this priority**: While filtering improves focus for complex applications, the core timeline value exists without it. Developers can gain significant insights even with all events visible, especially in smaller applications or isolated test cases.

**Independent Test**: Can be fully tested by applying filters and verifying only matching events and swimlanes are displayed, with the ability to clear filters and restore full view.

**Acceptance Scenarios**:

1. **Given** events of different types exist, **When** I select an event type filter (signal-read, signal-write, computation-execute), **Then** only events matching that type are displayed on the timeline
2. **Given** multiple nodes exist, **When** I select specific nodes to show, **Then** only swimlanes for those nodes are displayed
3. **Given** filters are active, **When** I hover over the filter indicator, **Then** I see a summary of active filters and event counts
4. **Given** filters are applied, **When** I click "Clear filters", **Then** all events and swimlanes are restored to the view
5. **Given** filtering by node, **When** a filtered node has dependencies, **Then** I can optionally show related nodes automatically

---

### User Story 6 - Control Playback Speed and Animation (Priority: P3)

As a developer analyzing complex reactive sequences, I want playback controls to automatically advance the timeline cursor through events at adjustable speeds, so that I can watch the execution flow like an animation rather than manually scrubbing.

**Why this priority**: Playback is a nice-to-have feature for presentation and pattern recognition but not essential for debugging. Manual scrubbing and static timeline inspection provide the core value. Playback enhances the experience but is not required for the feature to be useful.

**Independent Test**: Can be fully tested by clicking play, verifying the cursor automatically advances through events, and testing speed controls (play, pause, speed adjustment).

**Acceptance Scenarios**:

1. **Given** the timeline view is displayed, **When** I click the play button, **Then** the timeline cursor automatically advances through events in chronological order
2. **Given** playback is active, **When** I adjust the speed slider, **Then** the cursor advances faster or slower accordingly (e.g., 0.5x, 1x, 2x, 5x speed)
3. **Given** playback is active, **When** I click pause, **Then** the cursor stops at the current position
4. **Given** the cursor reaches the end of the timeline, **When** playback completes, **Then** the controls reset to the beginning and pause automatically
5. **Given** playback is active, **When** I manually scrub the timeline, **Then** playback pauses and the cursor moves to the scrubbed position

---

### Edge Cases

- What happens when thousands of events occur in milliseconds (event density)? The timeline should aggregate or sample events at high density, showing summaries like "250 events in 5ms" with ability to zoom in for detail.
- How does the timeline handle events with identical timestamps? Events at the same timestamp should be stacked vertically within their swimlane or have microsecond offset applied for visual separation.
- What happens when a node is disposed while viewing historical timeline? The swimlane should remain visible with a visual indicator (e.g., grayed out) showing when the node was disposed.
- How does scrubbing work when the cursor is between events? The cursor can be positioned between events, and state views should show the last known state before that point in time.
- What happens when filtering removes all events? Display an empty state message indicating active filters and suggesting to clear them.
- How does the timeline handle real-time events during playback? New events should be added to the timeline but playback should not automatically extend - the user must restart playback or scrub to see new events.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display reactive events on a horizontal timeline with time flowing from left to right
- **FR-002**: System MUST create a separate horizontal swimlane for each reactive node (signal, memo, effect)
- **FR-003**: System MUST position event marks on the timeline proportional to their actual timestamps
- **FR-004**: System MUST display swimlane labels showing node names and types
- **FR-005**: System MUST provide horizontal scrolling to view events across the full time range
- **FR-006**: System MUST show event details in a tooltip when hovering over event marks
- **FR-007**: System MUST display a details panel when clicking on event marks showing complete event information
- **FR-008**: System MUST render a draggable timeline cursor that shows the current selected time position
- **FR-009**: System MUST snap the cursor to nearby event timestamps when scrubbing for precise selection
- **FR-010**: System MUST provide keyboard navigation (arrow keys) to jump between events
- **FR-011**: System MUST visually group events that occur within the same reactive batch
- **FR-012**: System MUST show batch metadata (ID, event count, duration) when hovering over batch indicators
- **FR-013**: System MUST provide filters for event types (signal-read, signal-write, computation-execute-start, computation-execute-end, computation-dispose)
- **FR-014**: System MUST provide filters for specific reactive nodes to show/hide swimlanes
- **FR-015**: System MUST display active filter indicators with ability to clear all filters
- **FR-016**: System MUST provide playback controls (play, pause, speed adjustment)
- **FR-017**: System MUST automatically advance the timeline cursor during playback at the selected speed
- **FR-018**: System MUST pause playback when the cursor reaches the end of the timeline
- **FR-019**: System MUST handle high-density event scenarios by aggregating or sampling events with zoom capability
- **FR-020**: System MUST visually distinguish disposed nodes from active nodes on the timeline

### Key Entities

- **TimelineEvent**: Represents a single reactive event with timestamp, node ID, event type, and event-specific data (values, durations, etc.)
- **Swimlane**: Represents a horizontal track for a specific reactive node, containing all events for that node
- **EventBatch**: Represents a group of events that occurred synchronously within the same reactive tick, with batch ID, start/end times, and event list
- **TimelineCursor**: Represents the current time position on the timeline with timestamp and position coordinates
- **TimelineFilter**: Configuration for which events and nodes are visible, including event type selections and node selections
- **PlaybackState**: Configuration for playback including playing/paused status, speed multiplier, and current position

## Testing Requirements

**Testing Guide Consultation**: [ ] Read `specs/TESTING-GUIDE.md` before implementing tests

**Test Coverage Requirements**:
- [ ] Component tests for timeline rendering with various event densities
- [ ] Component tests for swimlane creation and labeling
- [ ] Component tests for event mark positioning and scaling
- [ ] Interaction tests for event hover and click behaviors
- [ ] Interaction tests for timeline cursor dragging and keyboard navigation
- [ ] Integration tests for batch grouping visualization
- [ ] Integration tests for event filtering with type and node filters
- [ ] Integration tests for playback controls and speed adjustment
- [ ] Edge case tests for high-density events and timestamp collisions
- [ ] Edge case tests for disposed nodes and empty filter states

**Testing Patterns to Follow** (from TESTING-GUIDE.md):
- Use `testInRoot()` for signal/store tests
- Use `useMockDate()` for date mocking
- Flush microtasks with `await Promise.resolve()` when using fake timers
- Use `mouseDown` + `mouseUp` for selection events (not `click()`)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify the temporal sequence of reactive events within 10 seconds of opening the timeline view
- **SC-002**: Users can inspect individual event details (type, timestamp, values) within 2 clicks or hovers
- **SC-003**: Users can scrub through event history and jump between events using keyboard navigation with no lag (< 50ms response time)
- **SC-004**: Timeline handles at least 1000 events across 50 nodes without performance degradation (60fps scrolling)
- **SC-005**: Users can identify batched updates and understand synchronous execution boundaries through visual grouping
- **SC-006**: Users can reduce visual noise by filtering to relevant events, decreasing time to find specific events by at least 70% (from ~30s to <9s)
- **SC-007**: Users can watch animated playback of reactive sequences at adjustable speeds (0.5x to 5x) for pattern recognition and demonstration purposes
