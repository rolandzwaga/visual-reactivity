# Feature Specification: Educational Demo Examples

**Feature Branch**: `010-demo-examples`  
**Created**: 2026-01-09  
**Status**: Draft  
**Input**: User description: "create a spec for the demo examples"

## Clarifications

### Session 2026-01-09

- Q: Where should the demo selection menu be located? → A: Dedicated menu button in top navigation opens a modal/dropdown list
- Q: Where should the demo's interactive UI controls be displayed? → A: Dedicated demo panel (top or bottom of visualization area) that appears only when a demo is active
- Q: What should happen when a user selects a new demo from the menu? → A: Immediate switch without confirmation (demo menu closes, old demo unloads, new demo loads)
- Q: What should users see when they first open the visualizer application? → A: Empty visualization with a prominent welcome message prompting users to open the demo menu
- Q: How can users exit the current demo and return to the empty visualization? → A: "Close Demo" or "×" button in the demo panel header

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Simple Counter Demo (Priority: P1)

A user learning SolidJS reactivity opens the visualizer and selects the "Simple Counter" demo to understand the basic signal → effect relationship.

**Why this priority**: This is the foundational concept in fine-grained reactivity. Without understanding signal-to-effect data flow, users cannot comprehend more complex patterns. This must work first to validate the entire demo system.

**Independent Test**: Can be fully tested by loading the demo, clicking the increment button, and verifying that: (1) the signal node updates, (2) the edge animates, (3) the effect node pulses, (4) the counter value increments in both the demo UI and the live values panel.

**Acceptance Scenarios**:

1. **Given** the visualizer is open, **When** user selects "Simple Counter" from the demo menu, **Then** the graph displays one signal node labeled "count" and one effect node labeled "displayEffect" with a dependency edge between them
2. **Given** the Simple Counter demo is loaded, **When** user clicks the "Increment" button in the demo area, **Then** the signal node pulses, an animation travels along the edge, the effect node pulses, and the displayed count increments by 1
3. **Given** the Simple Counter demo is running, **When** user observes the live values panel, **Then** the panel shows the "count" signal with its current numeric value updating in real-time

---

### User Story 2 - Derived State Demo (Priority: P2)

A user wants to understand how memos cache computed values and only re-evaluate when dependencies change.

**Why this priority**: Memos are critical for performance optimization in reactive systems. This demo teaches when computations run vs. when they return cached values, which is essential for writing efficient reactive code.

**Independent Test**: Can be fully tested by loading the demo, incrementing the source signal, and verifying that: (1) the memo node only pulses when its dependency changes, (2) the memo shows "cached" vs "computing" states, (3) multiple reads of the memo don't cause re-computation.

**Acceptance Scenarios**:

1. **Given** the "Derived State" demo is loaded, **When** user views the graph, **Then** the graph displays a signal node "count", a memo node "doubled", and an effect node "logger" with appropriate dependency edges
2. **Given** the Derived State demo is running, **When** user increments the count, **Then** the memo node pulses once (showing re-computation), and subsequent effect reads show the memo returning cached values without re-computing
3. **Given** the memo has computed a value, **When** user hovers over the memo node, **Then** the detail panel shows execution count, last computed time, and indicates the value is cached

---

### User Story 3 - Diamond Pattern Demo (Priority: P3)

A user learning about glitch-free execution wants to see how SolidJS handles the diamond dependency problem (one signal feeding two memos that both feed one effect).

**Why this priority**: The diamond pattern demonstrates SolidJS's core strength—glitch-free synchronous updates. This is a key differentiator from other reactive systems and crucial for understanding why SolidJS guarantees consistency.

**Independent Test**: Can be fully tested by loading the demo, updating the source signal, and verifying that: (1) both memo branches update before the final effect runs, (2) the effect only executes once per signal change, (3) the animation shows the propagation pattern visually.

**Acceptance Scenarios**:

1. **Given** the "Diamond Pattern" demo is loaded, **When** user views the graph, **Then** the graph displays one signal "value" at the top, two memos "double" and "triple" in the middle, one effect "sum" at the bottom, forming a diamond shape
2. **Given** the Diamond Pattern demo is running, **When** user changes the value signal, **Then** animations show both memos updating simultaneously, followed by a single effect execution (not two)
3. **Given** the user is observing execution counts, **When** the value signal changes 5 times, **Then** each memo executes 5 times and the effect executes exactly 5 times (proving no duplicate/glitchy executions)

---

### User Story 4 - Batch Updates Demo (Priority: P4)

A user wants to understand how multiple signal writes within a batch result in only one downstream effect execution.

**Why this priority**: Batching is essential for performance when updating multiple related signals. This demo teaches users when and how to use batching to avoid unnecessary work.

**Independent Test**: Can be fully tested by loading the demo, clicking "Update All" to batch-write three signals, and verifying that: (1) all three signals update, (2) dependent effects execute only once (not three times), (3) the batch boundary is visually indicated in the timeline.

**Acceptance Scenarios**:

1. **Given** the "Batch Updates" demo is loaded, **When** user views the graph, **Then** the graph displays three signals "firstName", "lastName", "age" and one effect "userProfile" that depends on all three
2. **Given** the Batch Updates demo is running, **When** user clicks "Update All" (batched), **Then** all three signals update and the effect executes exactly once
3. **Given** the Batch Updates demo is running, **When** user clicks "Update Individually" (not batched), **Then** all three signals update and the effect executes three separate times
4. **Given** the user is viewing the timeline, **When** a batch update occurs, **Then** the timeline shows a visual batch boundary grouping the three signal writes together

---

### User Story 5 - Nested Effects Demo (Priority: P5)

A user wants to understand the ownership tree and how nested computations are automatically disposed when their parent re-runs.

**Why this priority**: Ownership and disposal are critical for preventing memory leaks in reactive applications. This demo teaches proper resource cleanup and the ownership hierarchy.

**Independent Test**: Can be fully tested by loading the demo, switching between view modes, and verifying that: (1) the ownership tree view shows parent-child relationships, (2) when a parent effect re-runs, its child effects are disposed (nodes fade out), (3) new child effects are created in the ownership tree.

**Acceptance Scenarios**:

1. **Given** the "Nested Effects" demo is loaded, **When** user switches to ownership tree view, **Then** the tree displays a root node with a parent effect "parentEffect" containing nested child effects "childEffect1" and "childEffect2"
2. **Given** the Nested Effects demo is running, **When** the parent effect re-runs (due to dependency change), **Then** the visualization shows old child effects fading out (disposal), followed by new child effects being created
3. **Given** the user toggles a condition signal, **When** the parent effect executes with a different condition, **Then** the ownership tree dynamically updates to show different child effects based on the condition

---

### User Story 6 - Conditional Dependencies Demo (Priority: P6)

A user wants to see how dependencies can change dynamically based on conditional logic within computations.

**Why this priority**: Dynamic dependencies are a powerful but complex feature. This demo helps users understand that the dependency graph is not static and can change at runtime.

**Independent Test**: Can be fully tested by loading the demo, toggling a condition, and verifying that: (1) edges in the graph change when the condition changes, (2) old edges disconnect and fade out, (3) new edges connect with animation, (4) only active dependencies trigger updates.

**Acceptance Scenarios**:

1. **Given** the "Conditional Dependencies" demo is loaded, **When** user views the graph with useA=true, **Then** the effect node shows a dependency edge to signal "signalA" but not "signalB"
2. **Given** the Conditional Dependencies demo is running with useA=true, **When** user toggles the condition to useA=false, **Then** the edge to "signalA" disconnects and fades, a new edge to "signalB" connects with animation
3. **Given** useA=false, **When** user updates signalA, **Then** the effect does not execute (no edge animation), proving dynamic dependency tracking
4. **Given** useA=false, **When** user updates signalB, **Then** the effect executes and pulses, confirming the new dependency is active

---

### User Story 7 - Deep Chain Demo (Priority: P7)

A user wants to observe how updates propagate through a long chain of dependent computations to understand synchronous propagation depth.

**Why this priority**: Long chains can impact performance and help users understand propagation overhead. This demo also showcases the animation system's ability to sequence multi-step propagation.

**Independent Test**: Can be fully tested by loading the demo, updating the source signal, and verifying that: (1) the animation cascades through all five nodes in sequence, (2) the timeline shows the execution order clearly, (3) execution counts increment for all nodes in the chain.

**Acceptance Scenarios**:

1. **Given** the "Deep Chain" demo is loaded, **When** user views the graph, **Then** the graph displays five nodes in a linear chain: signalA → memoB → memoC → memoD → effectE
2. **Given** the Deep Chain demo is running, **When** user updates signalA, **Then** the animation cascades from left to right through all five nodes with visible propagation delay for educational clarity
3. **Given** the user is viewing the timeline, **When** signalA updates, **Then** the timeline displays five sequential events showing the exact order and timing of each computation's execution

---

### User Story 8 - Component Tree Demo (Priority: P8)

A user wants to see a realistic example with multiple components sharing state to understand how the visualizer helps debug real-world applications.

**Why this priority**: This bridges the gap between educational demos and real-world usage. It shows how the visualizer handles complex component hierarchies and shared state patterns that developers encounter in production.

**Independent Test**: Can be fully tested by loading the demo, interacting with multiple UI components, and verifying that: (1) the graph shows signals shared across components, (2) the ownership tree reflects the component hierarchy, (3) component disposal cleans up effects properly.

**Acceptance Scenarios**:

1. **Given** the "Component Tree" demo is loaded, **When** user views the ownership tree, **Then** the tree displays a root node with multiple component nodes (Header, TodoList, TodoItem) each containing their local effects
2. **Given** the Component Tree demo is running, **When** user adds a new todo item, **Then** the ownership tree shows a new child component node appearing with its associated effects
3. **Given** the user is viewing the dependency graph, **When** user updates a shared signal "theme", **Then** multiple component effects across the tree pulse simultaneously, showing cross-component reactivity
4. **Given** the demo has multiple todo items, **When** user deletes a todo item, **Then** the ownership tree shows the corresponding component node and its effects being disposed with fade-out animation

---

### Edge Cases

- What happens when a user rapidly switches between demos (should clean up previous demo state before loading new one)?
- How does the system handle when a demo throws an error during execution (should show error state without crashing the visualizer)?
- What happens when a user clicks the close button on an errored demo (should still clean up properly and return to welcome state)?
- How are demos affected by global visualizer settings like animation speed or paused state (should respect global settings)?
- What happens if a demo creates a very large graph exceeding typical demo complexity (should warn users this is a demo limitation)?

## Requirements *(mandatory)*

### Functional Requirements

**Demo Infrastructure**:
- **FR-001**: System MUST provide a demo selection menu accessible via a dedicated button in the top navigation that opens a modal or dropdown list displaying all 8 demo examples by name
- **FR-001a**: On initial application launch, system MUST display an empty visualization area with a prominent welcome message that prompts users to open the demo menu to explore examples
- **FR-002**: System MUST allow users to switch between demos immediately upon selection without confirmation dialogs, closing the demo menu and transitioning directly to the new demo
- **FR-003**: System MUST completely clean up (dispose all effects, clear graph state) when switching from one demo to another
- **FR-004**: System MUST reset the visualizer state (clear event history, reset timeline) when loading a new demo
- **FR-005**: Each demo MUST run in isolation with its own reactive context to prevent interference between demos
- **FR-005a**: System MUST display a dedicated demo panel (positioned at top or bottom of visualization area) that contains the active demo's interactive controls and appears only when a demo is loaded
- **FR-005b**: Demo panel MUST include a close button ("Close Demo" or "×") in the panel header that unloads the current demo, cleans up all demo state, and returns to the empty visualization with welcome message

**Demo 1 - Simple Counter**:
- **FR-006**: Demo MUST create one signal named "count" initialized to 0
- **FR-007**: Demo MUST create one effect named "displayEffect" that reads the count signal
- **FR-008**: Demo MUST provide a button labeled "Increment" that increases the count by 1
- **FR-009**: Demo UI MUST display the current count value that updates reactively

**Demo 2 - Derived State**:
- **FR-010**: Demo MUST create one signal "count", one memo "doubled" that computes count * 2, and one effect "logger"
- **FR-011**: Demo MUST demonstrate memo caching by showing execution counts (memo executes once per count change, not on every read)
- **FR-012**: Demo UI MUST display both the source count and the doubled value
- **FR-013**: Demo MUST provide buttons to increment count and manually trigger memo read

**Demo 3 - Diamond Pattern**:
- **FR-014**: Demo MUST create the diamond structure: one signal "value" → two memos "double" and "triple" → one effect "sum"
- **FR-015**: Demo MUST ensure the final effect sees consistent state from both memo branches (glitch-free execution)
- **FR-016**: Demo UI MUST display the source value and the final sum
- **FR-017**: Demo MUST provide input controls to change the source value
- **FR-018**: System MUST visually indicate in the timeline that the effect executes only once per signal change

**Demo 4 - Batch Updates**:
- **FR-019**: Demo MUST create three signals "firstName", "lastName", "age" and one effect "userProfile" depending on all three
- **FR-020**: Demo MUST provide an "Update All (Batched)" button that writes all three signals within a batch
- **FR-021**: Demo MUST provide an "Update Individually" button that writes all three signals sequentially without batching
- **FR-022**: System MUST show in the timeline that batched updates result in one effect execution vs. individual updates result in three executions
- **FR-023**: Timeline view MUST visually group batched events with a batch boundary indicator

**Demo 5 - Nested Effects**:
- **FR-024**: Demo MUST create a parent effect that conditionally creates child effects based on a toggle signal
- **FR-025**: Ownership tree view MUST display the parent-child relationship between the parent effect and its nested child effects
- **FR-026**: System MUST animate disposal (fade out) of old child effects when the parent re-runs
- **FR-027**: System MUST animate creation (fade in) of new child effects in the ownership tree
- **FR-028**: Demo UI MUST provide a toggle button to trigger parent effect re-execution

**Demo 6 - Conditional Dependencies**:
- **FR-029**: Demo MUST create two signals "signalA" and "signalB" and one effect that conditionally reads either signalA or signalB based on a "useA" toggle
- **FR-030**: Dependency graph MUST show edges dynamically appearing and disappearing based on the active branch
- **FR-031**: System MUST animate edge disconnection (fade out) when a dependency becomes inactive
- **FR-032**: System MUST animate edge connection (draw in) when a new dependency becomes active
- **FR-033**: Demo UI MUST provide controls to toggle the condition and update both signals independently

**Demo 7 - Deep Chain**:
- **FR-034**: Demo MUST create a chain of five nodes: signalA → memoB → memoC → memoD → effectE
- **FR-035**: System MUST animate the propagation sequence with visible timing showing the cascade from source to final effect
- **FR-036**: Timeline view MUST display all five execution events in order with timestamps
- **FR-037**: Demo UI MUST provide input controls to update the source signal

**Demo 8 - Component Tree**:
- **FR-038**: Demo MUST create a component hierarchy with at least three component types (e.g., App, List, Item)
- **FR-039**: Demo MUST include at least one signal shared across multiple components (e.g., "theme", "user")
- **FR-040**: Demo MUST include component-local effects that are owned by their respective components
- **FR-041**: Ownership tree view MUST reflect the component hierarchy with components as parent nodes owning their effects
- **FR-042**: Demo MUST allow adding new component instances dynamically (e.g., adding list items)
- **FR-043**: Demo MUST allow removing component instances dynamically with proper disposal animation
- **FR-044**: Dependency graph MUST show shared signals connected to multiple component effects

**Demo Metadata & UI**:
- **FR-045**: Each demo MUST include a description explaining what reactivity concept it demonstrates
- **FR-046**: Each demo MUST include usage instructions (e.g., "Click Increment to see signal propagation")
- **FR-047**: Demo selection menu MUST indicate which demo is currently active
- **FR-048**: System MUST display the demo description and instructions within the demo panel when a demo is loaded
- **FR-049**: System MUST provide a "Reset Demo" button within the demo panel that reloads the current demo from its initial state

**Error Handling**:
- **FR-050**: If a demo throws an error during initialization, system MUST display an error message and prevent the visualizer from crashing
- **FR-051**: If a demo throws an error during execution, system MUST log the error and highlight the erroring node in red in the graph
- **FR-052**: System MUST allow users to return to the demo menu even if the current demo is in an error state

### Key Entities

- **Demo**: Represents an educational example scenario with a name, description, initialization function, and UI component
- **DemoMetadata**: Descriptive information including title, concept taught, difficulty level, and usage instructions
- **DemoContext**: Isolated reactive context that encapsulates all signals, memos, and effects created by a demo to enable proper cleanup

## Testing Requirements

**Testing Guide Consultation**: [x] Read `specs/TESTING-GUIDE.md` before implementing tests

**Test Coverage Requirements**:
- [x] Unit tests for business logic (demo initialization, cleanup, state isolation)
- [x] Component tests for UI interactions (demo selection, control buttons, state display)
- [x] Integration tests for workflows (loading demo, interacting, switching demos, cleanup verification)
- [x] Edge case and error path testing (rapid switching, error handling, empty states)

**Testing Patterns to Follow** (from TESTING-GUIDE.md):
- Use `testInRoot()` for signal/store tests in demo contexts
- Use `useMockDate()` for timestamp testing in timeline views of demos
- Flush microtasks with `await Promise.resolve()` when testing demo effects with fake timers
- Verify proper disposal by checking node counts after demo unload

**Specific Test Scenarios**:
- Test that switching demos disposes all nodes from the previous demo
- Test that each demo creates the expected number and type of nodes
- Test that demo UI controls trigger expected reactive updates
- Test that error in one demo doesn't affect demo switching capability
- Test that global visualizer settings (animation speed, pause) are respected by demos

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can understand the demonstrated reactivity concept after viewing the demo (measured by: each demo includes clear before/after state that illustrates the concept)
- **SC-002**: Demos load and become interactive in under 1 second after selection
- **SC-003**: Each demo creates a visually distinct graph structure recognizable from its description (e.g., diamond shape for diamond pattern demo)
- **SC-004**: Users can switch between all 8 demos without encountering errors or leftover state from previous demos
- **SC-005**: Each demo's UI controls respond to user interaction with immediate visual feedback (within 100ms)
- **SC-006**: 100% of demos successfully demonstrate their intended concept as verified by acceptance scenarios
- **SC-007**: Demo descriptions and instructions are clear enough that users do not require external documentation to understand how to interact with the demo
- **SC-008**: Timeline and ownership tree views accurately reflect demo structure and update sequences for all 8 demos

## Assumptions *(mandatory)*

- Demos will be built using the existing instrumented primitives (`createTrackedSignal`, `createTrackedMemo`, `createTrackedEffect`)
- Demos will use the existing visualizer views (dependency graph, ownership tree, timeline, live values) without requiring new visualization features
- Each demo will be self-contained and not require external data or API calls
- Demos will run synchronously (no async effects or timers) to keep propagation sequences clear and educational
- Demo complexity will be kept small (each demo creates fewer than 20 nodes) to maintain clarity and readability
- Demos are educational tools, not production code, so code simplicity and clarity are prioritized over performance optimization
- Users have already learned to navigate the visualizer interface (zoom, pan, view switching) before exploring demos

## Out of Scope *(mandatory)*

- Interactive code editor allowing users to modify demo code in real-time
- User-created custom demos or demo persistence
- Demos requiring async operations, timers, or external APIs
- Demos demonstrating advanced SolidJS features like stores, context, or resources (focusing on core reactivity only)
- Performance benchmarking or profiling tools within demos
- Exporting or sharing demo states with other users
- Guided tutorials or step-by-step walkthroughs overlaying the demos
- Demos for comparing SolidJS with other reactive frameworks

## Dependencies

- Feature 001 (Core Instrumentation): Provides instrumented primitives for demos
- Feature 002 (Dependency Graph Visualization): Provides graph rendering for visualizing demo reactive graphs
- Feature 003 (Animation System): Provides propagation animations for demos
- Feature 005 (Ownership Tree View): Provides tree view for nested effects demo
- Feature 006 (Timeline View): Provides timeline for observing event sequences in demos
- Feature 004 (Live Values Panel): Provides value inspection for signals in demos

## Open Questions

None. All requirements are fully specified based on ROADMAP Section 9 scenarios and visualizer capabilities.
