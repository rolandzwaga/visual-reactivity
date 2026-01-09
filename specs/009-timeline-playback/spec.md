# Feature Specification: Timeline Integration & Event Replay System

**Feature Branch**: `009-timeline-playback`  
**Created**: 2026-01-09  
**Status**: Draft  
**Input**: User description: "Timeline Integration & Event Replay System - integrates the existing Timeline component into App.tsx and adds playback controls + event replay capabilities"

## Clarifications

### Session 2026-01-09

- Q: Which browser storage mechanism should be used for persisting recordings? → A: IndexedDB
- Q: When should replay mode automatically activate? → A: Any cursor positioning (by click, step, scrub, or loaded recording)
- Q: What should be the target animation duration when stepping between events? → A: 300ms
- Q: What validation rules should apply to recording names? → A: Alphanumeric + common symbols (dash, underscore, space), 1-100 characters, unique names required
- Q: Can users interrupt the 300ms animation by rapidly pressing arrow keys? → A: Yes, cancel ongoing animation and immediately start next transition

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Timeline View from Main App (Priority: P1)

As a developer using the visual-reactivity tool, I want to access the timeline view through a navigation button in the main application interface, so that I can switch between dependency graph, ownership tree, and timeline visualizations based on my debugging needs.

**Why this priority**: The timeline component exists but is not accessible to users. Without integration into the main app navigation, all timeline functionality (viewing event sequences, playback, etc.) is unusable. This is the foundation that makes all other timeline features accessible.

**Independent Test**: Can be fully tested by clicking the Timeline button in the navigation bar and verifying the timeline view renders with all its components (swimlanes, events, controls) replacing the graph/tree view.

**Acceptance Scenarios**:

1. **Given** the app is running with graph view visible, **When** I click the "Timeline" navigation button, **Then** the timeline view replaces the graph view and displays all recorded reactive events
2. **Given** the timeline view is active, **When** I click the "Dependency Graph" button, **Then** the graph view replaces the timeline view while preserving the current selection state
3. **Given** the timeline view is active, **When** I click the "Ownership Tree" button, **Then** the tree view replaces the timeline view
4. **Given** I switch between views multiple times, **When** returning to the timeline, **Then** the timeline preserves my scroll position, cursor position, and active filters
5. **Given** the timeline view is active, **When** new reactive events occur, **Then** the timeline automatically updates to show new events without disrupting my current view

---

### User Story 2 - Step Through Events One at a Time (Priority: P1)

As a developer debugging a reactive chain, I want to step forward and backward through events one at a time using keyboard shortcuts or UI controls, so that I can precisely examine each step in the execution sequence without auto-playing through all events.

**Why this priority**: Auto-play shows the overall flow but doesn't allow detailed inspection. Single-step navigation is the most common debugging pattern - developers need to pause at each event, inspect state, then proceed to the next event. This is essential for understanding cause-and-effect relationships.

**Independent Test**: Can be fully tested by pressing arrow keys or clicking step buttons and verifying the timeline cursor moves exactly one event forward or backward, with the event details updating accordingly.

**Acceptance Scenarios**:

1. **Given** the timeline has recorded events, **When** I press the right arrow key, **Then** the cursor advances to the next event in chronological order
2. **Given** the cursor is positioned at an event, **When** I press the left arrow key, **Then** the cursor moves back to the previous event
3. **Given** the cursor is at the last event, **When** I press right arrow, **Then** the cursor remains at the last event and provides visual/audio feedback that end is reached
4. **Given** the cursor is at the first event, **When** I press left arrow, **Then** the cursor remains at the first event
5. **Given** playback is active, **When** I press any arrow key, **Then** playback pauses and the cursor moves to the adjacent event
6. **Given** filters are hiding some events, **When** stepping through events, **Then** the cursor skips hidden events and only navigates through visible ones
7. **Given** a graph transition animation is in progress, **When** I press an arrow key to step to another event, **Then** the current animation is immediately canceled and the next transition begins

---

### User Story 3 - Replay Graph State at Historical Time Points (Priority: P1)

As a developer analyzing past reactive behavior, I want the dependency graph and ownership tree views to reconstruct and display the historical state of the reactive system at the timeline cursor's position, so that I can see exactly what the graph looked like at that moment in execution history.

**Why this priority**: The timeline shows when events happened, but developers need to see what the graph looked like at those moments. Without state reconstruction, the timeline is just a log - with it, developers can time-travel through execution to understand complex state transitions and identify when problems first appeared.

**Independent Test**: Can be fully tested by positioning the timeline cursor at a historical event, switching to graph view, and verifying that only nodes and edges that existed at that point in time are displayed, with correct values and relationships.

**Acceptance Scenarios**:

1. **Given** the timeline is displaying events, **When** I position the cursor (by clicking, stepping, or scrubbing), **Then** replay mode automatically activates and visual indicators appear in all views
2. **Given** the timeline cursor is positioned at time T, **When** I switch to the dependency graph view, **Then** the graph displays only nodes that existed at time T and their dependency edges
3. **Given** the cursor is at time T, **When** I hover over a node in the graph, **Then** the node displays the value it had at time T, not the current value
4. **Given** the cursor is at time T before a node was created, **When** viewing the graph, **Then** that node is not visible
5. **Given** the cursor is at time T after a node was disposed, **When** viewing the graph, **Then** that node is not visible
6. **Given** the cursor is at time T between two signal updates, **When** viewing the graph, **Then** the signal node shows the value from the most recent update before T
7. **Given** replay mode is active with cursor at time T, **When** I click on a node in the historical graph, **Then** the detail panel shows historical node information (past value, past dependencies, execution count up to time T)
8. **Given** replay mode is active, **When** I step through events, **Then** the graph animates transitions showing nodes being created, values changing, and edges forming/breaking

---

### User Story 4 - Save and Load Event Recordings (Priority: P2)

As a developer investigating intermittent issues, I want to capture reactive event sequences as named recordings and save them for later analysis or sharing with teammates, so that I can reproduce and debug issues that only occur under specific conditions.

**Why this priority**: While less critical than viewing and stepping through events, the ability to save recordings enables debugging of non-deterministic issues, comparison of different execution paths, and collaboration with team members. This transforms the timeline from a transient debugging tool into a permanent artifact.

**Independent Test**: Can be fully tested by recording events, saving the recording with a name, refreshing the page, and verifying the recording can be loaded with all events and metadata intact.

**Acceptance Scenarios**:

1. **Given** reactive events have been captured, **When** I click "Save Recording" and provide a valid name (alphanumeric plus dash, underscore, space, 1-100 chars), **Then** the recording is saved with that name and appears in the recordings list
2. **Given** I attempt to save a recording, **When** I provide an invalid name (empty, >100 chars, or containing special characters), **Then** an error message displays explaining the constraint violated
3. **Given** I attempt to save a recording, **When** I provide a name that already exists, **Then** an error message displays indicating the duplicate and suggests appending a timestamp
4. **Given** multiple recordings exist, **When** I select a recording from the list, **Then** the timeline loads those events and clears any current events
5. **Given** a recording is loaded, **When** I trigger new reactive events, **Then** I can switch between "live" mode (showing new events) and "replay" mode (showing the loaded recording)
6. **Given** a saved recording exists, **When** I click the delete button, **Then** the recording is removed from the list after confirmation
7. **Given** I have saved recordings, **When** I close and reopen the application, **Then** the recordings list persists and I can load any saved recording
8. **Given** a recording is loaded, **When** I step through events or use playback controls, **Then** the replay behaves identically to when the events were originally captured

---

### User Story 5 - Export and Import Recordings (Priority: P2)

As a developer collaborating with teammates or documenting issues, I want to export recordings to JSON files and import recordings from files, so that I can share execution traces across machines, attach them to bug reports, or archive them for future reference.

**Why this priority**: Export/import enables collaboration and documentation. While not essential for solo debugging, it's valuable for team environments, bug reporting, and creating reproducible test cases. This is a natural extension of the save/load functionality.

**Independent Test**: Can be fully tested by exporting a recording to a file, importing it on a different browser session or machine, and verifying all events, timing, and metadata are preserved.

**Acceptance Scenarios**:

1. **Given** a recording is loaded or events exist, **When** I click "Export Recording", **Then** a JSON file downloads containing all events with timestamps, node information, and recording metadata
2. **Given** I have a JSON recording file, **When** I click "Import Recording" and select the file, **Then** the events are loaded into the timeline and available for replay
3. **Given** I import a recording, **When** the import succeeds, **Then** the recording is automatically added to my saved recordings list with the original name
4. **Given** an invalid or corrupted JSON file, **When** I attempt to import it, **Then** an error message displays explaining the issue without crashing the application
5. **Given** I export a recording with 10,000+ events, **When** the export completes, **Then** the JSON file is properly formatted and can be successfully imported back

---

### User Story 6 - Enhanced Playback Controls (Priority: P3)

As a developer demonstrating reactive behavior, I want advanced playback controls including loop mode, jump to start/end, and playback speed presets, so that I can efficiently navigate long event sequences and present reactive flows in different contexts.

**Why this priority**: Basic playback exists from Feature 006. Enhanced controls improve usability but aren't essential for debugging. They're quality-of-life improvements that make the tool more polished and efficient for power users.

**Independent Test**: Can be fully tested by using each control (loop, jump to start/end, speed presets) and verifying the cursor and playback state respond correctly.

**Acceptance Scenarios**:

1. **Given** playback reaches the end of the timeline, **When** loop mode is enabled, **Then** playback automatically restarts from the beginning
2. **Given** the cursor is in the middle of the timeline, **When** I click "Jump to Start", **Then** the cursor moves to the first event
3. **Given** the cursor is in the middle of the timeline, **When** I click "Jump to End", **Then** the cursor moves to the last event
4. **Given** playback controls are visible, **When** I click a speed preset (0.25x, 0.5x, 1x, 2x, 5x), **Then** playback speed changes immediately to that multiplier
5. **Given** I'm at event 500 of 1000, **When** I use the timeline scrubber/slider, **Then** the cursor jumps directly to the scrubbed position without playing through intermediate events

---

### User Story 7 - Visual Replay Mode Indicators (Priority: P3)

As a developer using replay mode, I want clear visual indicators showing when I'm viewing historical state versus live state, so that I don't confuse past behavior with current behavior.

**Why this priority**: While important for avoiding confusion, this is a UI polish feature. Users can infer replay mode from the timeline cursor position, but explicit indicators improve user experience and reduce cognitive load.

**Independent Test**: Can be fully tested by entering replay mode and verifying visual indicators (badges, overlays, status bar) appear in all views, then exiting replay mode and verifying indicators disappear.

**Acceptance Scenarios**:

1. **Given** the timeline cursor is positioned at a historical time, **When** I view the dependency graph, **Then** a visual overlay or badge indicates "Replay Mode: [timestamp]"
2. **Given** replay mode is active, **When** I view the ownership tree, **Then** the tree view displays the replay indicator
3. **Given** replay mode is active, **When** I inspect a node, **Then** the detail panel clearly indicates the displayed values are historical, not current
4. **Given** replay mode is active, **When** new live events occur, **Then** an indicator shows "Live events pending" with option to exit replay and view live state
5. **Given** I exit replay mode by clicking "View Live", **Then** all views update to current state and replay indicators disappear

---

### Edge Cases

- What happens when replay mode is active and a new live event occurs for a node being viewed? The system should maintain replay mode by default but show a notification badge that new events have occurred. Users can explicitly exit replay mode to see live state.
- How does the system handle very large recordings (100,000+ events)? Implement virtualization for the timeline view, lazy-load events during replay, and provide sampling options when loading large recordings.
- What happens if a loaded recording references nodes that no longer exist in the current code? Display the historical nodes as "archived" nodes with a special visual indicator. They can still be viewed in replay mode but are clearly marked as no longer part of the live system.
- How does replay work when the timeline cursor is positioned between events (not snapped to an event)? Show the state immediately after the most recent event before the cursor position. All views reflect the "as-of" state at that timestamp.
- What happens when exporting a recording that includes very large values (e.g., huge arrays or objects in signals)? Provide options during export: (1) Include full values (large file), (2) Truncate values over X KB, (3) Exclude values entirely (structure only). Default to option 2 with 10KB limit.
- How does the system handle clock skew or timestamp precision issues when events occur in rapid succession? Events with identical timestamps are ordered by capture sequence. The system uses monotonically increasing sequence numbers as a tiebreaker to guarantee deterministic replay order.
- What happens when trying to import a recording created with an incompatible version of the tool? Include a version field in exported JSON. If the version is incompatible, show a warning but attempt import anyway. Provide migration utilities for known breaking changes.
- What happens when a user tries to save a recording with a duplicate name? Display an error message indicating the name already exists and suggest appending a timestamp or number suffix. Do not allow overwriting without explicit confirmation.

## Requirements *(mandatory)*

### Functional Requirements

**Timeline Integration**

- **FR-001**: System MUST add a "Timeline" button to the main application navigation that switches the active view to timeline mode
- **FR-002**: System MUST preserve view-specific state (scroll position, cursor position, filters) when switching between graph, tree, and timeline views
- **FR-003**: System MUST synchronize the current selection state across all three views (graph, tree, timeline)
- **FR-004**: Timeline view MUST display all components from Feature 006 (swimlanes, events, filters, basic playback controls)

**Enhanced Playback Controls**

- **FR-005**: System MUST provide keyboard shortcuts (left/right arrows) to step backward/forward one event at a time
- **FR-006**: System MUST provide UI buttons for single-step navigation (previous event, next event)
- **FR-007**: System MUST provide "Jump to Start" and "Jump to End" controls that move the cursor to the first/last event
- **FR-008**: System MUST support loop mode where playback automatically restarts from the beginning when reaching the end
- **FR-009**: System MUST provide speed preset buttons (0.25x, 0.5x, 1x, 2x, 5x) for quick playback speed changes
- **FR-010**: System MUST pause playback when user manually steps through events or scrubs the timeline
- **FR-011**: When filters are active, stepping through events MUST skip hidden events and navigate only through visible events

**Event Replay / Time Travel**

- **FR-012**: System MUST automatically activate replay mode whenever the timeline cursor is positioned (by clicking timeline, stepping through events, scrubbing, or loading a recording)
- **FR-013**: System MUST reconstruct the dependency graph state at the timeline cursor's position, showing only nodes that existed at that point in time
- **FR-014**: System MUST reconstruct the ownership tree state at the timeline cursor's position
- **FR-015**: System MUST display historical node values (from the most recent update before cursor time) when in replay mode
- **FR-016**: System MUST hide nodes that had not yet been created at the cursor's time position
- **FR-017**: System MUST hide nodes that had been disposed before the cursor's time position
- **FR-018**: System MUST update the detail panel to show historical node information when inspecting nodes in replay mode
- **FR-019**: System MUST animate graph/tree transitions when stepping through events, showing nodes being created, values changing, and edges forming/breaking, with animation duration of 300ms
- **FR-019a**: System MUST allow users to interrupt ongoing animations by pressing arrow keys or using step controls, immediately canceling the current animation and starting the next transition
- **FR-020**: System MUST display clear visual indicators (overlay, badge, or status bar) in all views when replay mode is active
- **FR-021**: System MUST show the timestamp or relative time of the current replay position in the replay mode indicator

**Recording Management**

- **FR-022**: System MUST allow users to save the current event sequence as a named recording
- **FR-022a**: System MUST validate recording names to contain only alphanumeric characters plus dash, underscore, and space, with length between 1-100 characters, and enforce unique names
- **FR-022b**: System MUST display clear error messages when recording name validation fails, indicating which constraint was violated
- **FR-023**: System MUST maintain a list of all saved recordings with names, timestamps, and event counts
- **FR-024**: System MUST allow users to load a saved recording, replacing the current timeline events
- **FR-025**: System MUST allow users to delete saved recordings after confirmation
- **FR-026**: System MUST persist saved recordings across browser sessions using IndexedDB
- **FR-027**: System MUST support switching between "live mode" (showing current events) and "replay mode" (showing loaded recording events)
- **FR-028**: When a recording is loaded, system MUST preserve all event metadata including timestamps, node IDs, values, and batch information

**Export/Import**

- **FR-029**: System MUST export recordings to JSON files containing all events, timestamps, node information, and recording metadata
- **FR-030**: System MUST import recordings from JSON files and validate file structure before loading
- **FR-031**: System MUST include a version identifier in exported JSON to enable compatibility checking
- **FR-032**: System MUST automatically add successfully imported recordings to the saved recordings list
- **FR-033**: System MUST display clear error messages when import fails due to invalid or corrupted files
- **FR-034**: System MUST handle large recordings (10,000+ events) efficiently during export and import operations (see SC-005 for specific targets: <2s for <10MB, <10s for <100MB)
- **FR-035**: System MUST provide options during export to control value inclusion (full values, truncated values, or structure only)

**State Synchronization**

- **FR-036**: System MUST emit replay state changes (current time, replay mode active/inactive) as events that other components can subscribe to
- **FR-037**: Graph and tree views MUST subscribe to replay state and update their display based on cursor time
- **FR-038**: System MUST maintain separate state for "current live state" and "replay state at time T" without mixing them
- **FR-039**: When new live events occur during replay mode, system MUST show a notification without automatically exiting replay mode
- **FR-040**: System MUST provide an explicit "Exit Replay / View Live" control that returns all views to current state and deactivates replay mode

### Key Entities

- **ReplayState**: Represents the current replay mode state including active/inactive status, cursor timestamp, and associated recording metadata
- **Recording**: Represents a saved event sequence with name, creation timestamp, event count, duration, and serialized event data
- **RecordingMetadata**: Summary information about a recording including name, date saved, event count, duration, node types involved, and application version
- **HistoricalGraphState**: Reconstruction of the reactive graph at a specific point in time, including active nodes, edges, and node values as they existed at that timestamp
- **PlaybackControlState**: Extended state from Feature 006's PlaybackState, adding new fields for loop mode, step mode, and enhanced speed controls
- **ExportOptions**: Configuration for export operations including value truncation limits, format version, and metadata inclusion preferences

## Testing Requirements

**Testing Guide Consultation**: [ ] Read `specs/TESTING-GUIDE.md` before implementing tests

**Test Coverage Requirements**:
- [ ] Component tests for Timeline navigation button integration in App.tsx
- [ ] Component tests for enhanced playback controls (step, jump, loop, speed presets)
- [ ] Integration tests for view switching with state preservation
- [ ] Integration tests for historical graph state reconstruction at various cursor positions
- [ ] Integration tests for single-step navigation with filters active
- [ ] Integration tests for recording save/load/delete operations
- [ ] Integration tests for export/import with various file sizes and edge cases
- [ ] Unit tests for replay state management and synchronization
- [ ] Unit tests for recording serialization/deserialization
- [ ] Edge case tests for large recordings (10,000+ events)
- [ ] Edge case tests for missing nodes during replay
- [ ] Edge case tests for events with identical timestamps
- [ ] Edge case tests for version compatibility during import

**Testing Patterns to Follow** (from TESTING-GUIDE.md):
- Use `testInRoot()` for signal/store tests
- Use `useMockDate()` for date mocking  
- Flush microtasks with `await Promise.resolve()` when using fake timers
- Use `mouseDown` + `mouseUp` for selection events (not `click()`)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access the timeline view from the main navigation within 1 click and see all reactive events displayed
- **SC-002**: Users can step through individual events using keyboard shortcuts or UI controls, advancing exactly one event per action with <50ms response time
- **SC-003**: Users can view historical graph state at any point in the timeline, with the graph correctly displaying only nodes and values that existed at that timestamp
- **SC-004**: Users can save recordings and reload them in future sessions with 100% fidelity (all events, timestamps, and metadata preserved)
- **SC-005**: Users can export and import recordings with files <10MB processing in <2 seconds, and files <100MB processing in <10 seconds
- **SC-006**: Users can replay recordings with 1,000+ events while maintaining smooth playback at all speed settings (0.25x to 5x) with 60fps animation
- **SC-007**: Users can clearly distinguish between replay mode and live mode through visual indicators present in all views
- **SC-008**: Users can navigate between graph, tree, and timeline views without losing their current position, selection, or cursor state
- **SC-009**: Users can load recordings containing 10,000+ events with <5 second load time and smooth scrubbing performance
- **SC-010**: System can reconstruct historical graph state with <100ms latency when stepping between events or scrubbing the timeline
