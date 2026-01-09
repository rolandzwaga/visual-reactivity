# Feature Specification: Live Values Panel

**Feature Branch**: `004-live-values-panel`
**Created**: 2026-01-09
**Status**: Draft
**Input**: User description: "Live Values Panel - Sidebar list/table for inspecting and editing signal values in real-time with search, filter, and sparkline history"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View All Signal Values (Priority: P1)

As a developer debugging my application, I want to see a list of all signals with their current values, so that I can quickly understand the current state of my reactive system without inspecting individual graph nodes.

**Why this priority**: Without the ability to view signal values, the panel has no purpose. This is the foundational feature that makes the panel useful for debugging. Users need immediate visibility into their reactive state.

**Independent Test**: Can be fully tested by creating tracked signals and verifying they appear in the panel with correct names and current values. Delivers immediate debugging value by showing all reactive state in one place.

**Acceptance Scenarios**:

1. **Given** tracked signals exist in the application, **When** I view the Live Values Panel, **Then** I see a list of all signals with their names and current values displayed.
2. **Given** a signal's value changes, **When** the update occurs, **Then** the panel automatically updates to show the new value within 50ms.
3. **Given** multiple signals exist, **When** I view the panel, **Then** signals are sorted alphabetically by name for easy scanning.
4. **Given** a signal has no name provided, **When** I view the panel, **Then** it displays with its generated ID as the identifier.

---

### User Story 2 - Edit Signal Values (Priority: P1)

As a developer testing my application, I want to directly edit signal values from the panel, so that I can quickly test different states and see how my application responds without modifying code or using the UI.

**Why this priority**: Direct value editing is the key interactive debugging capability. This transforms the panel from read-only inspection to an active debugging tool, enabling rapid state exploration.

**Independent Test**: Can be fully tested by clicking a signal value, entering a new value, and verifying the signal updates and dependent computations re-run. Delivers immediate value for testing edge cases.

**Acceptance Scenarios**:

1. **Given** a signal is displayed in the panel, **When** I click on its value, **Then** an inline editor appears allowing me to modify the value.
2. **Given** the inline editor is open, **When** I enter a new value and press Enter or click outside, **Then** the signal's setter is called with the new value and the editor closes.
3. **Given** I am editing a value, **When** I press Escape, **Then** the edit is cancelled and the editor closes without changing the value.
4. **Given** I enter an invalid value for the signal's expected type, **When** I attempt to save, **Then** the system shows an error message and prevents the update.
5. **Given** a signal's value is edited, **When** the update occurs, **Then** dependent memos and effects re-execute and their updates are visible in the graph visualization.

---

### User Story 3 - Search and Filter Signals (Priority: P2)

As a developer working with a complex application, I want to search and filter the signal list, so that I can quickly find specific signals in applications with many reactive primitives.

**Why this priority**: With more than 10-15 signals, scanning becomes tedious. Search and filter capabilities make the panel practical for real-world applications. This is important but not critical for the MVP.

**Independent Test**: Can be fully tested by creating many signals, entering search terms, and verifying only matching signals are displayed. Delivers value for applications with complex state.

**Acceptance Scenarios**:

1. **Given** the Live Values Panel displays multiple signals, **When** I enter text in the search box, **Then** the list filters to show only signals whose names contain the search text (case-insensitive).
2. **Given** a search filter is active, **When** I clear the search box, **Then** all signals are displayed again.
3. **Given** the panel displays signals, **When** I use the type filter dropdown, **Then** I can filter to show only signals, only memos, or all reactive primitives.
4. **Given** a filter is active and a new signal is created that matches the filter, **When** the signal is registered, **Then** it appears in the filtered list.

---

### User Story 4 - View Value History (Priority: P2)

As a developer analyzing reactive behavior over time, I want to see a sparkline visualization of how each signal's value has changed recently, so that I can identify patterns and frequency of updates.

**Why this priority**: Sparklines provide at-a-glance insight into update patterns and help identify "hot" signals that update frequently. This enhances debugging but is not essential for basic inspection.

**Independent Test**: Can be fully tested by changing signal values multiple times and verifying a sparkline chart appears showing the history of changes. Delivers value for understanding update patterns.

**Acceptance Scenarios**:

1. **Given** a signal has changed values multiple times, **When** I view it in the panel, **Then** a small sparkline chart appears next to the value showing the recent value history (last 20 updates).
2. **Given** a signal's sparkline is displayed, **When** I hover over the sparkline, **Then** I see a tooltip showing the timestamp and value for that point in the history.
3. **Given** a signal has not changed since creation, **When** I view it in the panel, **Then** no sparkline is displayed (or a flat line indicating no changes).
4. **Given** a signal updates frequently, **When** viewing the sparkline, **Then** the update pattern is clearly visible (e.g., steady increases, oscillations, spikes).

---

### User Story 5 - Sync with Graph Selection (Priority: P3)

As a developer using both the graph view and values panel, I want the panel to highlight signals when I select them in the graph and vice versa, so that I can easily correlate visual nodes with their values.

**Why this priority**: This creates a cohesive experience between the two main views but is not essential for either view to function independently. It enhances UX but can be added later.

**Independent Test**: Can be fully tested by selecting a node in the graph and verifying it highlights in the panel, and selecting a signal in the panel and verifying it highlights in the graph. Delivers improved navigation.

**Acceptance Scenarios**:

1. **Given** both the graph view and values panel are visible, **When** I click a signal node in the graph, **Then** the corresponding signal is highlighted and scrolled into view in the values panel.
2. **Given** both views are visible, **When** I click a signal in the values panel, **Then** the corresponding node is highlighted in the graph view.
3. **Given** a signal is selected in one view, **When** I click elsewhere, **Then** the highlight is removed from both views.

---

### Edge Cases

- What happens when there are no tracked signals? Display an empty state message prompting the user to create tracked signals in their application.
- What happens when a signal's value is a complex object or function? Display a JSON stringified representation for objects (with depth limit). If serialization fails (e.g., circular references), display `[Unserializable]` with an error tooltip. Display `[Function]` for functions with a tooltip showing function name if available.
- What happens when editing a value to a different type than the signal currently holds? Allow the change (SolidJS signals are not type-enforced at runtime), but show a warning indicator if type changes.
- What happens when many signals (100+) exist? Implement virtual scrolling to maintain performance. Only render visible rows in the viewport.
- What happens when a signal is disposed while visible in the panel? Remove the signal from the list immediately and clear its value history. If a new signal with the same name is created later, it starts with a fresh history.
- What happens when search returns no results? Display a "No signals match your search" message with an option to clear filters.
- What happens when a signal updates rapidly (multiple times per second)? Throttle UI updates to a maximum of 60fps to avoid performance issues while maintaining accurate current values.
- How are memo values handled differently from signals? Memos are displayed as read-only (no inline editing) since they are computed values. Show their sources in a tooltip.
- What about effect nodes? Effects don't have values to display. If the filter includes effects, show them with "N/A" for value and indicate they are side effects.

## Requirements *(mandatory)*

### Functional Requirements

#### Panel Visibility

- **FR-001**: System MUST provide a toggle button in the toolbar to show/hide the Live Values Panel
- **FR-002**: System MUST support a keyboard shortcut (Ctrl+Shift+V on Windows/Linux, Cmd+Shift+V on macOS) to toggle panel visibility
- **FR-003**: System MUST remember panel visibility state when toggled (open or closed)
- **FR-003a**: System MUST provide a resize handle allowing users to drag and adjust panel width
- **FR-003b**: System MUST remember the user's chosen panel width between sessions
- **FR-003c**: System MUST enforce minimum width (200px) and maximum width (50% of viewport) constraints during resizing

#### Display and Real-Time Updates

- **FR-004**: System MUST display a list/table of all tracked signals with their current values in real-time
- **FR-005**: System MUST update displayed values within 50ms when signals change
- **FR-006**: System MUST display signal names (or generated IDs if no name provided) as identifiers
- **FR-007**: System MUST sort signals alphabetically by name by default
- **FR-008**: System MUST subscribe to tracker events on mount and unsubscribe on unmount to receive value updates

#### Value Editing

- **FR-009**: System MUST provide an inline editor for signal values that appears when a user clicks on a value
- **FR-010**: System MUST call the signal's setter function when a user saves an edited value
- **FR-011**: System MUST support cancelling edits via Escape key or by clicking outside the editor
- **FR-012**: System MUST validate edited values using JSON.parse() and show error messages for invalid JSON syntax
- **FR-013**: System MUST prevent editing computed values (memos) and indicate they are read-only

#### Search and Filtering

- **FR-014**: System MUST provide a search input that filters signals by name (case-insensitive substring matching)
- **FR-015**: System MUST provide a type filter to show signals only, memos only, or all reactive primitives
- **FR-016**: System MUST maintain filter state when new signals are created, showing them if they match the active filter
- **FR-017**: System MUST provide a clear button to remove active search and filter criteria

#### Value History

- **FR-018**: System MUST track and store the last 20 value changes for each signal, clearing the history when the signal is disposed
- **FR-019**: System MUST display a sparkline visualization next to each signal showing its value history
- **FR-020**: System MUST show tooltips on sparkline hover displaying timestamp and value for each point
- **FR-021**: System MUST handle numeric values in sparklines by plotting them directly, and non-numeric values by assigning numeric representations (e.g., hash codes)

#### Graph Synchronization

- **FR-022**: System MUST highlight the corresponding signal in the panel when a node is selected in the graph view
- **FR-023**: System MUST highlight the corresponding node in the graph view when a signal is selected in the panel
- **FR-024**: System MUST scroll the selected signal into view when highlighted via graph selection
- **FR-025**: System MUST clear selection highlights when clicking outside selected elements in either view

#### Performance and Scalability

- **FR-026**: System MUST implement virtual scrolling for lists with more than 50 signals to maintain performance
- **FR-027**: System MUST throttle value update rendering to a maximum of 60fps to prevent performance degradation
- **FR-028**: System MUST handle complex object values by displaying a stringified JSON representation with depth limiting, and display "[Unserializable]" with error tooltip for values that cannot be serialized (e.g., circular references)
- **FR-029**: System MUST display function values as `[Function]` with a tooltip showing function name if available

### Key Entities

- **SignalEntry**: Represents a signal in the panel list. Contains: signal ID, name (or null), current value, value type, update count, last updated timestamp, value history array (last 20 values with timestamps), is editable flag.

- **ValueHistoryPoint**: A single point in the value history for sparkline rendering. Contains: timestamp, value, numeric representation (for plotting).

- **FilterState**: Current search and filter criteria. Contains: search text string, type filter selection (signals/memos/all), sort order.

- **SelectionState**: Tracks which signal or node is currently selected for cross-view synchronization. Contains: selected signal ID (or null), selection source (graph/panel/none).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view all signal values in the panel within 100ms of opening the panel
- **SC-002**: Value changes are reflected in the panel within 50ms of the signal update occurring
- **SC-003**: Users can edit a signal value and see dependent computations update within 200ms of saving the edit
- **SC-004**: Search filtering returns results within 50ms for lists up to 100 signals
- **SC-005**: Panel maintains smooth scrolling performance (60fps) with up to 200 signals using virtual scrolling
- **SC-006**: Sparkline visualizations render within 100ms and accurately represent the last 20 value changes
- **SC-007**: Cross-view selection synchronization occurs within 50ms of selection in either view
- **SC-008**: 80% or higher test coverage on all panel components and logic

## Clarifications

### Session 2026-01-09

- Q: How do users show/hide the Live Values Panel? → A: Toggle button in toolbar + keyboard shortcut (e.g., Ctrl+Shift+V)
- Q: What validation should be performed when editing signal values? → A: JSON parse validation only (must be valid JSON)
- Q: How should the panel width behave? → A: Fixed width with resize handle (user can drag to adjust)
- Q: How should the system handle values that can't be serialized to JSON? → A: Show "[Unserializable]" with error tooltip explaining the issue
- Q: Should sparkline history persist for recreated signals with the same name? → A: Clear history on disposal (each signal instance starts fresh)

## Assumptions

- The existing ReactivityTracker (Feature 001) provides event subscription for signal creation, updates, and disposal
- The existing DependencyGraph component (Feature 002) provides selection events that can be subscribed to
- Default value serialization uses JSON.stringify with a depth limit of 3 levels for complex objects
- Value history is stored in memory only (not persisted between sessions)
- Inline editing uses a text input field that accepts string input and parses it as JSON (allowing strings, numbers, booleans, objects, arrays, null)
- Sparklines use a simple line chart visualization scaled to fit the available space (height ~20-30px)
- The panel is positioned as a sidebar (default right side) with a default width of 350px, resizable by the user via drag handle (min: 200px, max: 50% of viewport)
- Virtual scrolling uses a standard windowing technique rendering only visible items plus a buffer
