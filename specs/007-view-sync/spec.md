# Feature Specification: View Synchronization and Cross-View Selection

**Feature Branch**: `007-view-sync`  
**Created**: 2026-01-09  
**Status**: Draft  
**Input**: User description: "View synchronization and cross-view selection"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select Node in Any View to Highlight Across All Views (Priority: P1)

As a developer debugging reactive code, I want to select a reactive node in any visualization view and see it automatically highlighted in all other open views, so that I can understand how that node appears in different contexts (dependency graph, ownership tree, timeline, and values panel) without manually searching for it.

**Why this priority**: This is the core value proposition of view synchronization. Without cross-view selection, developers must manually correlate nodes across views, which is error-prone and time-consuming. This enables the "single source of truth" mental model where one selection controls all views.

**Independent Test**: Can be fully tested by selecting any node in the dependency graph and verifying it appears highlighted in the ownership tree (if present), timeline (showing its events), and values panel (showing its current value). This delivers immediate value by eliminating manual node correlation.

**Acceptance Scenarios**:

1. **Given** the dependency graph, ownership tree, timeline, and values panel are all visible, **When** I click a signal node in the dependency graph, **Then** that signal is highlighted in all views: outlined/emphasized in the graph, highlighted in the tree (if present), its event swimlane is highlighted in the timeline, and its entry is highlighted/scrolled-to in the values panel
2. **Given** multiple nodes are visible in the ownership tree, **When** I click a memo node in the tree, **Then** that memo node is highlighted in the dependency graph with its connections emphasized, its timeline swimlane is highlighted, and its value appears in the values panel
3. **Given** the timeline shows multiple swimlanes, **When** I click an event mark on a specific node's swimlane, **Then** that node is selected and highlighted across all views, with the dependency graph centered on that node and the values panel showing its value at the event timestamp
4. **Given** I have a node selected in one view, **When** I click a different node in another view, **Then** the previous selection is cleared and the new node becomes highlighted in all views
5. **Given** multiple visualizations are open, **When** I select a disposed node in the ownership tree, **Then** the node appears highlighted (but visually marked as disposed) in all views, with the timeline showing its disposal event

---

### User Story 2 - Multi-Select Nodes for Comparison Across Views (Priority: P2)

As a developer analyzing reactive patterns, I want to select multiple nodes simultaneously (using Ctrl/Cmd+click) and see them all highlighted together in all views, so that I can compare related nodes and understand their relationships across different visualization perspectives.

**Why this priority**: While single-selection covers the basic use case, developers often need to compare multiple nodes simultaneously (e.g., a signal and all its dependent memos, or two nodes in a diamond pattern). This enhances the debugging experience but isn't required for basic functionality.

**Independent Test**: Can be tested by Ctrl+clicking two nodes in the dependency graph and verifying both appear highlighted in all views, with the timeline showing both swimlanes emphasized and the values panel showing both entries.

**Acceptance Scenarios**:

1. **Given** one node is already selected, **When** I Ctrl+click (Cmd+click on Mac) a second node in any view, **Then** both nodes remain highlighted across all views without clearing the previous selection
2. **Given** three nodes are selected, **When** I Ctrl+click one of the selected nodes again, **Then** that node is deselected while the other two remain highlighted in all views
3. **Given** multiple nodes are selected, **When** I click anywhere without holding Ctrl/Cmd, **Then** all selections are cleared and only the newly clicked node (if any) is selected
4. **Given** I have selected multiple nodes, **When** I view the dependency graph, **Then** all edges connecting the selected nodes are emphasized to show relationships
5. **Given** multiple nodes are selected, **When** I view the timeline, **Then** all selected nodes' swimlanes are highlighted, making it easy to compare their event patterns side-by-side

---

### User Story 3 - Keyboard Navigation for Selection (Priority: P3)

As a developer working efficiently, I want to navigate between selected nodes using keyboard shortcuts (arrow keys), so that I can quickly explore the reactive graph without switching between mouse and keyboard.

**Why this priority**: Keyboard navigation enhances productivity for power users but isn't essential for the core cross-view selection functionality. Most users can effectively use mouse-based selection.

**Independent Test**: Can be tested by selecting a node, then using arrow keys to navigate to connected nodes in the dependency graph, verifying that each navigation updates selection across all views.

**Acceptance Scenarios**:

1. **Given** a node is selected in the dependency graph, **When** I press the Right arrow key, **Then** selection moves to the next observer (downstream dependent), and all views update to highlight the new node
2. **Given** a node is selected in the dependency graph, **When** I press the Left arrow key, **Then** selection moves to the next source (upstream dependency), and all views update accordingly
3. **Given** a node is selected in the ownership tree, **When** I press the Down arrow key, **Then** selection moves to the first owned child, and all views highlight the child node
4. **Given** a node is selected in the ownership tree, **When** I press the Up arrow key, **Then** selection moves to the owner (parent), and all views highlight the parent node
5. **Given** nodes are selected, **When** I press Escape, **Then** all selections are cleared across all views

---

### Edge Cases

- What happens when a selected node exists in some views but not others (e.g., a node without events won't appear in the timeline)?
  - **Expected**: The node is highlighted in views where it exists, and gracefully absent from views where it doesn't. No errors or empty states.

- How does the system handle selecting a node that's currently off-screen in a particular view?
  - **Expected**: The view should scroll/pan to bring the selected node into view with smooth animation, or provide a visual indicator that the selected node is off-screen with direction hint.

- What happens when I quickly select multiple nodes in rapid succession?
  - **Expected**: Selection updates are debounced or queued to prevent UI thrashing. The final selection state reflects the last completed action.

- How does selection behave when a node is disposed while selected?
  - **Expected**: The selection persists but the node's visual state updates to show it's disposed (grayed out, marked with disposal timestamp). User can still inspect its historical data.

- What happens when I select nodes across different reactive roots (e.g., from separate computation trees)?
  - **Expected**: Multi-selection works across roots. Views show all selected nodes even if they're not connected in the graph.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST maintain a centralized selection state that tracks currently selected node IDs across all visualization views
- **FR-002**: System MUST synchronize selection state in real-time, updating all visible views within 16ms (one frame at 60fps) when selection changes
- **FR-003**: System MUST support single-selection mode where clicking a node in any view selects that node and deselects all others
- **FR-004**: System MUST support multi-selection mode where Ctrl+click (Cmd+click on Mac) adds or removes nodes from the selection set without clearing existing selections
- **FR-005**: System MUST clear all selections when the user clicks an empty area (not on a node) without modifier keys held
- **FR-006**: System MUST visually distinguish selected nodes in each view using consistent visual treatment (e.g., highlight color, border, glow)
- **FR-007**: Dependency graph view MUST emphasize edges connecting selected nodes when multiple nodes are selected
- **FR-008**: Timeline view MUST highlight swimlanes corresponding to selected nodes and scroll them into view if necessary
- **FR-009**: Values panel MUST highlight selected nodes' entries and scroll them into view if off-screen
- **FR-010**: Ownership tree MUST highlight selected nodes and expand parent nodes if necessary to make selected nodes visible
- **FR-011**: System MUST support keyboard navigation with arrow keys to move selection between connected nodes in the dependency graph
- **FR-012**: System MUST support keyboard navigation with Up/Down arrows to move selection between parent/child nodes in the ownership tree
- **FR-013**: System MUST support Escape key to clear all selections across all views
- **FR-014**: System MUST handle selection of disposed nodes by showing them with visual indicators of their disposed state while maintaining selection
- **FR-015**: System MUST persist selection state when users switch between view visibility (e.g., hiding then showing the timeline should restore selection highlighting)
- **FR-016**: System MUST provide smooth scroll/pan animations when bringing off-screen selected nodes into view (max 300ms animation duration)
- **FR-017**: System MUST handle rapid selection changes by debouncing or queuing updates to prevent UI performance degradation
- **FR-018**: System MUST emit selection-changed events that views can subscribe to for reactive updates
- **FR-019**: System MUST validate that selected node IDs exist in the current graph state before attempting to highlight them
- **FR-020**: System MUST provide a programmatic API for external code to get/set the current selection state

### Key Entities

- **Selection State**: Represents the current set of selected node IDs, tracked centrally. Contains: set of node IDs, selection timestamp, selection source (which view initiated the selection)
- **Selection Event**: Represents a change in selection state. Contains: added node IDs, removed node IDs, event timestamp, triggering action (click, keyboard, programmatic)
- **View Subscription**: Represents a view's subscription to selection state changes. Contains: view identifier, callback function, highlighting strategy

## Testing Requirements

**Testing Guide Consultation**: [x] Read `specs/TESTING-GUIDE.md` before implementing tests

**Test Coverage Requirements**:
- [x] Unit tests for selection state management (add/remove nodes, clear selection)
- [x] Unit tests for selection event emission and subscription
- [x] Component tests for click-to-select interactions in each view
- [x] Component tests for Ctrl+click multi-select behavior
- [x] Component tests for keyboard navigation (arrow keys, Escape)
- [x] Integration tests for cross-view synchronization (select in view A, verify highlight in view B)
- [x] Edge case testing for disposed nodes, rapid selection changes, off-screen nodes

**Testing Patterns to Follow** (from TESTING-GUIDE.md):
- Use `testInRoot()` for signal/store tests related to selection state
- Use mouse event patterns (`mouseDown` + `mouseUp`) for click selection tests
- Flush microtasks with `await Promise.resolve()` when testing async selection updates
- Test keyboard events with proper key codes and modifier key flags

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can select a node in any view and see it highlighted in all other visible views within 100ms (perceived instant feedback)
- **SC-002**: Multi-selection of up to 10 nodes performs smoothly with no visible lag or frame drops across all views
- **SC-003**: Keyboard navigation allows developers to traverse the entire reactive graph without using the mouse, completing common debugging tasks 40% faster than mouse-only interaction
- **SC-004**: 95% of selection actions (click, keyboard, programmatic) correctly synchronize across all views without errors or inconsistent state
- **SC-005**: When selecting off-screen nodes, views automatically scroll to show the selection within 300ms with smooth animation
- **SC-006**: Developers can distinguish selected nodes from unselected nodes at a glance in all views (verified through user testing with 90% accuracy within 1 second)
- **SC-007**: System handles 100+ rapid selection changes (e.g., arrow key held down) without UI freezing or becoming unresponsive
