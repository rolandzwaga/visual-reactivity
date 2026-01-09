# Feature Specification: Ownership Tree View

**Feature Branch**: `005-ownership-tree-view`  
**Created**: 2026-01-09  
**Status**: Draft  
**Input**: User description: "Ownership Tree View - Hierarchical tree visualization showing disposal hierarchy and parent-child ownership relationships using D3 hierarchy layout"

## Clarifications

### Session 2026-01-09

- Q: Should the ownership tree grow vertically (top-to-bottom with roots at top) or horizontally (left-to-right with roots at left)? → A: Vertical (top-to-bottom): Roots at top, children below
- Q: Should disposed nodes remain visible in the tree permanently (until page refresh), or automatically be removed after some time? → A: Timed removal: Auto-remove disposed nodes after 5 seconds
- Q: When there are multiple root contexts (multiple separate trees), how should they be arranged in the view? → A: Vertical stack: Arrange root trees one above the other
- Q: Should the tree view reuse the existing detail panel from the Dependency Graph View, or have its own dedicated detail panel? → A: Shared panel: Reuse the existing Dependency Graph detail panel
- Q: When a tree level has many sibling nodes (e.g., 20+ children under one parent), should the layout compress spacing or allow horizontal scrolling? → A: Horizontal scroll: Maintain spacing, enable horizontal scrolling when needed

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Ownership Hierarchy (Priority: P1)

As a developer debugging memory leaks and understanding component lifecycle, I want to see the ownership tree that shows which reactive primitives own other primitives, so that I can understand what will be cleaned up when a parent computation disposes.

**Why this priority**: Understanding ownership is fundamental to SolidJS's automatic cleanup system. Without visualizing ownership, developers cannot predict or debug disposal behavior, leading to memory leaks or unexpected cleanup. This is the core value of the feature.

**Independent Test**: Can be fully tested by creating nested reactive contexts (effects owning signals, effects owning other effects) and verifying that the tree displays the correct parent-child relationships. Delivers immediate value by making the invisible ownership structure visible.

**Acceptance Scenarios**:

1. **Given** reactive primitives with ownership relationships exist (e.g., an effect that creates signals inside it), **When** I view the Ownership Tree View, **Then** I see a hierarchical tree where parent nodes visually contain or connect to their owned children.

2. **Given** multiple root contexts exist (e.g., separate createRoot calls), **When** I view the tree, **Then** I see multiple separate trees arranged vertically (stacked one above the other), each rooted at a different owner.

3. **Given** a complex ownership hierarchy exists, **When** I view the tree, **Then** nodes use the same visual encoding as the dependency graph (circles for signals, diamonds for memos, squares for effects) so I can identify node types at a glance.

4. **Given** the ownership tree is displayed, **When** the tracker state updates with new nodes or disposal events, **Then** the tree automatically updates to reflect current ownership structure within 50ms.

---

### User Story 2 - Interact with Tree Structure (Priority: P1)

As a developer exploring a complex reactive application, I want to expand, collapse, and navigate the ownership tree, so that I can focus on specific parts of the hierarchy without being overwhelmed by the full structure.

**Why this priority**: Without basic interactions, large ownership trees become unreadable. This is essential for practical use with real applications that have deep or wide ownership hierarchies.

**Independent Test**: Can be tested by creating a deep ownership hierarchy and verifying that collapse/expand operations work, tree navigation is smooth, and the UI remains usable with many nodes.

**Acceptance Scenarios**:

1. **Given** a node has children in the ownership tree, **When** I click on the node or its expand/collapse indicator, **Then** the subtree under that node collapses (hides children) or expands (shows children).

2. **Given** the tree has multiple levels of depth, **When** I view the tree initially, **Then** nodes are expanded by default up to 2 levels deep, with deeper levels collapsed to avoid overwhelming the view.

3. **Given** a node is selected in the Dependency Graph View, **When** I switch to the Ownership Tree View, **Then** the corresponding node in the tree is highlighted and scrolled into view.

4. **Given** multiple nodes exist at the same hierarchy level, **When** I view the tree, **Then** sibling nodes are sorted by creation timestamp (oldest first) for predictable ordering.

---

### User Story 3 - Inspect Node Details from Tree (Priority: P2)

As a developer debugging ownership issues, I want to click on nodes in the tree to see detailed information, so that I can understand the context and state of each node without switching views.

**Why this priority**: Enhances the tree view's utility by providing contextual information, but the tree is useful even without detailed inspection (developers can switch to the graph view for details).

**Independent Test**: Can be tested by clicking various nodes and verifying that correct details appear, including ownership metadata like owned count and disposal status.

**Acceptance Scenarios**:

1. **Given** I am viewing the ownership tree, **When** I click on a node, **Then** the shared detail panel (same as used by Dependency Graph View) opens showing node metadata (id, type, name, value if applicable, creation time, disposal status, owner ID, count of owned children).

2. **Given** a node owns multiple children, **When** I hover over the node, **Then** a tooltip shows the count of direct children and total descendants.

3. **Given** a node has been disposed, **When** I view it in the tree, **Then** it appears with a distinct visual style (grayed out, with "Disposed" label and disposal timestamp) and remains visible for 5 seconds before being automatically removed from the tree.

4. **Given** I am viewing node details, **When** I click "View in Graph", **Then** the Dependency Graph View opens and focuses on the selected node with its connections highlighted.

---

### User Story 4 - Manually Test Disposal (Priority: P3)

As a developer learning SolidJS's ownership system, I want to manually dispose a root context from the tree view, so that I can observe how disposal cascades through the ownership hierarchy.

**Why this priority**: Educational feature that helps developers understand disposal behavior. Not critical for visualization but valuable for learning and testing.

**Independent Test**: Can be tested by creating an ownership tree, manually triggering disposal on a parent node, and verifying that all descendants are marked as disposed and the tree updates correctly.

**Acceptance Scenarios**:

1. **Given** I am viewing a root context node in the tree, **When** I right-click or use a "Dispose" button, **Then** a confirmation dialog appears asking if I want to dispose this context.

2. **Given** I confirm disposal, **When** the disposal executes, **Then** the node and all its descendants are marked as disposed (grayed out) and disposal animations play in the Dependency Graph View.

3. **Given** a non-root node is selected, **When** I attempt to trigger disposal, **Then** the option is disabled with a tooltip explaining "Only root contexts can be manually disposed".

4. **Given** disposal is triggered, **When** the operation completes, **Then** a notification shows the count of nodes that were disposed (e.g., "Disposed 1 root and 5 children").

---

### Edge Cases

- What happens when there are no ownership relationships (all nodes are roots)? Display a flat list or message indicating all nodes are independent.
- How does the system handle circular ownership (should be impossible in SolidJS)? Detect and display an error if circular ownership is somehow detected, as this indicates a tracker bug.
- What happens when the tree depth exceeds 10 levels? Provide a "Show all" option for deeply nested nodes beyond the initial display depth.
- How does the tree display nodes created during disposal? Show them with special "transient" styling since they may be immediately cleaned up.
- What happens when a tree level has many siblings (20+ nodes)? Enable horizontal scrolling to maintain readable node spacing rather than compressing nodes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all reactive nodes in a hierarchical tree structure based on ownership relationships (owner → owned)
- **FR-002**: System MUST render nodes using the same visual encoding as the dependency graph (circles for signals, diamonds for memos, squares for effects, with consistent colors)
- **FR-003**: System MUST use D3 hierarchy layout (tree or dendrogram) with vertical orientation (roots at top, children below) to compute node positions and connections, maintaining consistent node spacing with horizontal scrolling enabled when tree width exceeds viewport
- **FR-004**: System MUST support expand/collapse operations on nodes with children
- **FR-005**: System MUST update the tree in real-time when nodes are created or disposed based on tracker events
- **FR-006**: System MUST handle multiple root contexts by displaying multiple separate trees arranged vertically (stacked one above the other)
- **FR-007**: System MUST show disposed nodes with distinct styling (grayed out with "Disposed" label and disposal timestamp) for 5 seconds before automatically removing them from the tree
- **FR-008**: System MUST provide visual indication of which nodes have children (expand/collapse icon)
- **FR-009**: System MUST synchronize selection between Ownership Tree View and Dependency Graph View
- **FR-010**: System MUST display tooltips on hover showing node summary (name, type, child count)
- **FR-011**: System MUST open the shared detail panel (same as Dependency Graph View) when a node is clicked, showing full metadata including ownership information
- **FR-012**: System MUST allow manual disposal of root context nodes with confirmation
- **FR-013**: System MUST prevent manual disposal of non-root nodes
- **FR-014**: System MUST apply default expansion depth of 2 levels to avoid overwhelming users with large trees
- **FR-015**: System MUST sort sibling nodes by creation timestamp (oldest first)

### Key Entities

- **Ownership Edge**: Represents a parent-child ownership relationship between two reactive nodes. Attributes include parent node ID, child node ID, and the timestamp when the ownership was established.
- **Hierarchy Level**: Represents the depth of a node in the ownership tree (distance from root). Used for determining default expansion state and visual layout.
- **Tree Root**: A reactive node with no owner (owner is null). Represents the top of an ownership hierarchy, typically created by `createRoot` or at component boundaries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can identify which nodes will be cleaned up when a parent disposes by visually tracing the ownership tree from parent to children.
- **SC-002**: The tree view handles ownership hierarchies up to 20 levels deep without performance degradation (60 FPS interaction).
- **SC-003**: Ownership tree updates appear within 50ms of tracker events (node creation or disposal).
- **SC-004**: Users can successfully navigate a tree with 100+ nodes using expand/collapse without UI freezing.
- **SC-005**: Disposed nodes are clearly distinguishable from active nodes at a glance (90% of test users identify disposed nodes correctly without instruction).
