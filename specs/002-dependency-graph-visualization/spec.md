# Feature Specification: Dependency Graph Visualization

**Feature Branch**: `002-dependency-graph-visualization`  
**Created**: 2026-01-08  
**Status**: Draft  
**Input**: User description: "D3 force-directed graph visualization of the reactive dependency graph with nodes (signals, memos, effects), edges, basic interactions (hover, click, drag, zoom), and a detail panel for node inspection. Integrates with the tracker event subscription for real-time updates."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Reactive Graph (Priority: P1)

As a developer learning SolidJS reactivity, I want to see a visual representation of my reactive primitives as a graph, so that I can understand the dependency relationships between signals, memos, and effects.

**Why this priority**: Without a visible graph, there is nothing to interact with. This is the foundational feature that makes the visualizer useful.

**Independent Test**: Can be fully tested by creating tracked primitives and verifying that nodes appear on screen with correct shapes and colors, connected by edges representing dependencies.

**Acceptance Scenarios**:

1. **Given** tracked signals, memos, and effects exist, **When** I view the visualizer, **Then** I see nodes representing each primitive with distinct shapes (circles for signals, diamonds for memos, squares for effects)
2. **Given** a memo depends on two signals, **When** I view the graph, **Then** I see directed edges from the signal nodes to the memo node
3. **Given** the graph has multiple nodes, **When** I view the visualizer, **Then** nodes are arranged using force-directed layout that minimizes edge crossings and spreads nodes apart

---

### User Story 2 - Interact with Graph (Priority: P1)

As a developer debugging my application, I want to interact with the graph using standard gestures, so that I can explore complex graphs efficiently.

**Why this priority**: A static graph becomes unusable with more than a few nodes. Basic interactions are essential for practical use.

**Independent Test**: Can be fully tested by loading a graph and verifying that pan, zoom, and drag operations work as expected.

**Acceptance Scenarios**:

1. **Given** a graph is displayed, **When** I scroll/pinch, **Then** the view zooms in or out centered on the cursor position
2. **Given** a graph is displayed, **When** I drag on empty space, **Then** the view pans in the drag direction
3. **Given** a node is visible, **When** I drag the node, **Then** the node moves and connected edges follow, and the force simulation adjusts
4. **Given** multiple nodes exist, **When** I hover over a node, **Then** that node and its connected edges are visually highlighted

---

### User Story 3 - Real-Time Updates (Priority: P1)

As a developer testing my application, I want the graph to update in real-time as I interact with my app, so that I can see how reactive changes propagate.

**Why this priority**: The visualizer must reflect the current state of the reactive system. Without real-time updates, developers would see stale information.

**Independent Test**: Can be fully tested by creating new primitives or changing dependencies while watching the graph, and verifying that nodes/edges appear, disappear, or change accordingly.

**Acceptance Scenarios**:

1. **Given** the visualizer is displayed, **When** I create a new tracked signal in my app, **Then** a new signal node appears in the graph
2. **Given** the visualizer is displayed, **When** a computation is disposed, **Then** its node and associated edges are removed from the graph
3. **Given** a memo exists, **When** its dependencies change during re-evaluation, **Then** edges are added or removed to reflect the new dependencies

---

### User Story 4 - Inspect Node Details (Priority: P2)

As a developer debugging a specific reactive primitive, I want to click on a node to see detailed information about it, so that I can understand its current state, value, and relationships.

**Why this priority**: While viewing the graph shows structure, inspecting details is necessary for debugging. This is secondary to having the graph visible and interactive.

**Independent Test**: Can be fully tested by clicking on nodes of each type and verifying the detail panel shows correct information.

**Acceptance Scenarios**:

1. **Given** a signal node exists, **When** I click on it, **Then** a detail panel appears showing: node type, name (if provided), current value, list of observers, creation timestamp
2. **Given** a memo node exists, **When** I click on it, **Then** the detail panel shows: node type, name, current computed value, list of sources (dependencies), list of observers, execution count
3. **Given** an effect node exists, **When** I click on it, **Then** the detail panel shows: node type, name, list of sources, execution count, last executed timestamp
4. **Given** a detail panel is open, **When** I click elsewhere or press Escape, **Then** the detail panel closes

---

### User Story 5 - Visual Distinction by Node Type (Priority: P2)

As a developer viewing the graph, I want nodes to be visually distinct by type, so that I can quickly identify signals, memos, and effects at a glance.

**Why this priority**: Clear visual encoding reduces cognitive load and makes the graph easier to read. This enhances the core viewing experience.

**Independent Test**: Can be fully tested by creating one of each node type and verifying each has a distinct shape and color.

**Acceptance Scenarios**:

1. **Given** a signal node exists, **When** I view it in the graph, **Then** it appears as a blue circle
2. **Given** a memo node exists, **When** I view it in the graph, **Then** it appears as a purple diamond
3. **Given** an effect node exists, **When** I view it in the graph, **Then** it appears as a green square
4. **Given** a node has a name, **When** I view it in the graph, **Then** the name is displayed as a label near the node

---

### Edge Cases

- What happens when the graph is empty (no tracked primitives)? Display an empty state message prompting the user to create tracked primitives.
- What happens when a node is created and immediately disposed? Node appears briefly then is removed; graph remains consistent.
- What happens when there are many nodes (50+)? Graph may become crowded; force simulation spreads nodes out, user can zoom/pan to navigate.
- What happens when edges form cycles? SolidJS prevents true cycles; if detected, display normally (graph handles any valid edge set).
- What happens when a node's value is a complex object or function? Display a truncated/summarized representation in the detail panel.
- What happens when the user zooms out very far? Nodes become small but remain visible; labels may be hidden at extreme zoom levels.
- What about keyboard accessibility? Nodes can be focused with Tab, selected with Enter/Space, detail panel navigable with arrow keys.
- Is undo/redo needed for node drag operations? No - node positions are transient visualization state, not persisted data. Dragged nodes return to simulation-controlled positions when released.

## Requirements *(mandatory)*

### Functional Requirements

#### Graph Rendering

- **FR-001**: System MUST render reactive nodes as SVG shapes using D3.js force-directed layout
- **FR-002**: System MUST render dependency edges as directed lines/arrows connecting source nodes to target nodes
- **FR-003**: System MUST use distinct visual encodings for each node type: signals (blue circles), memos (purple diamonds), effects (green squares)
- **FR-004**: System MUST display node names as labels when provided
- **FR-005**: System MUST use D3 force simulation to automatically position nodes, minimizing overlaps and edge crossings

#### Interactions

- **FR-006**: System MUST support zooming via scroll wheel or pinch gesture
- **FR-007**: System MUST support panning via drag on empty canvas area
- **FR-008**: System MUST support dragging individual nodes to reposition them
- **FR-009**: System MUST highlight a node and its connected edges when the user hovers over the node
- **FR-010**: System MUST open a detail panel when the user clicks on a node
- **FR-011**: System MUST close the detail panel when the user clicks elsewhere or presses Escape

#### Real-Time Updates

- **FR-012**: System MUST subscribe to tracker events on mount and unsubscribe on unmount
- **FR-013**: System MUST add new nodes to the graph when signal-create, computation-create events are received
- **FR-014**: System MUST remove nodes from the graph when computation-dispose events are received
- **FR-015**: System MUST add/remove edges when subscription-add, subscription-remove events are received
- **FR-016**: System MUST update the force simulation when nodes or edges change

#### Detail Panel

- **FR-017**: Detail panel MUST display node ID, type, and name (if present)
- **FR-018**: Detail panel MUST display current value for signals and memos (with truncation for large values)
- **FR-019**: Detail panel MUST display list of source node names/IDs (dependencies)
- **FR-020**: Detail panel MUST display list of observer node names/IDs (dependents)
- **FR-021**: Detail panel MUST display execution count and timestamps for memos and effects

### Key Entities

- **GraphNode**: Visual representation of a ReactiveNode. Contains position (x, y), velocity for simulation, reference to underlying ReactiveNode data.

- **GraphEdge**: Visual representation of a ReactiveEdge. Contains references to source and target GraphNodes.

- **DetailPanelState**: Currently selected node (if any), panel visibility, position on screen.

## Clarifications

### Session 2026-01-08

(To be filled during clarification phase)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Graph renders and displays all tracked nodes within 100ms of initial load
- **SC-002**: New nodes appear in the graph within 50ms of creation
- **SC-003**: Node disposal removes the node from the graph within 50ms
- **SC-004**: Zoom and pan interactions feel smooth (60fps) with graphs up to 100 nodes
- **SC-005**: Users can identify node types by shape and color without reading labels
- **SC-006**: Detail panel displays complete node information within 50ms of clicking
- **SC-007**: 80% or higher test coverage on visualization components
