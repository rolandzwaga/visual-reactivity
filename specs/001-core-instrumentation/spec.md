# Feature Specification: Core Instrumentation Layer

**Feature Branch**: `001-core-instrumentation`  
**Created**: 2026-01-08  
**Status**: Draft  
**Input**: User description: "Core Instrumentation Layer - ReactivityTracker class, instrumented primitives (createTrackedSignal, createTrackedMemo, createTrackedEffect), event system, and data types for tracking SolidJS reactive graph"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Track Signal Creation and Updates (Priority: P1)

As a developer using the visualizer, I want to create signals that automatically register themselves with the tracker and emit events when their values change, so that the visualization can display the reactive graph in real-time.

**Why this priority**: Signals are the foundational primitive in SolidJS reactivity. Without tracked signals, no other reactive nodes can be visualized. This is the core building block.

**Independent Test**: Can be fully tested by creating a tracked signal, reading and writing its value, and verifying that events are emitted and the tracker registry contains the correct node data.

**Acceptance Scenarios**:

1. **Given** an empty tracker, **When** I create a tracked signal with an initial value, **Then** the tracker registry contains a new signal node with correct metadata (id, type, name, value, timestamps)
2. **Given** a tracked signal exists, **When** I read its value, **Then** a "signal-read" event is emitted with the node ID and current value
3. **Given** a tracked signal exists, **When** I write a new value, **Then** a "signal-write" event is emitted with the previous and new values, and the node's value is updated in the registry

---

### User Story 2 - Track Memo Creation and Evaluation (Priority: P1)

As a developer using the visualizer, I want to create memos that automatically track their dependencies and emit events when they are evaluated, so that I can see the dependency relationships in the graph.

**Why this priority**: Memos demonstrate the dependency tracking system which is essential for visualizing the reactive graph. They show the relationship between signals and computed values.

**Independent Test**: Can be fully tested by creating tracked signals and a tracked memo that depends on them, then verifying the dependency edges are recorded and events are emitted on evaluation.

**Acceptance Scenarios**:

1. **Given** tracked signals exist, **When** I create a tracked memo that reads those signals, **Then** the tracker records dependency edges from the memo to each signal it reads
2. **Given** a tracked memo exists, **When** the memo function executes, **Then** "computation-execute-start" and "computation-execute-end" events are emitted
3. **Given** a tracked memo depends on signals, **When** a source signal changes and the memo re-evaluates, **Then** the memo's value is updated and new events are emitted

---

### User Story 3 - Track Effect Creation and Execution (Priority: P1)

As a developer using the visualizer, I want to create effects that automatically track their dependencies and emit events when they execute, so that I can see when side effects run in response to signal changes.

**Why this priority**: Effects complete the reactive primitive set. They demonstrate the full propagation cycle from signal write to effect execution.

**Independent Test**: Can be fully tested by creating tracked signals and a tracked effect, then writing to signals and verifying the effect executes and emits appropriate events.

**Acceptance Scenarios**:

1. **Given** tracked signals exist, **When** I create a tracked effect that reads those signals, **Then** the tracker records dependency edges from the effect to each signal it reads
2. **Given** a tracked effect exists, **When** the effect function executes, **Then** "computation-execute-start" and "computation-execute-end" events are emitted with execution timing
3. **Given** a tracked effect exists, **When** it is disposed, **Then** a "computation-dispose" event is emitted and the node is marked as disposed in the registry

---

### User Story 4 - Subscribe to Reactivity Events (Priority: P2)

As a visualization component, I want to subscribe to reactivity events from the tracker, so that I can update the visual display in real-time as the reactive graph changes.

**Why this priority**: Without event subscription, visualizations cannot react to changes. This bridges the instrumentation layer to the visualization layer.

**Independent Test**: Can be fully tested by subscribing to events, performing reactive operations, and verifying the subscriber receives all expected events in order.

**Acceptance Scenarios**:

1. **Given** a tracker instance, **When** I subscribe to events, **Then** I receive all subsequent events emitted by tracked primitives
2. **Given** multiple subscribers exist, **When** an event is emitted, **Then** all subscribers receive the event
3. **Given** a subscription exists, **When** I unsubscribe, **Then** I no longer receive events

---

### User Story 5 - Query Graph State (Priority: P2)

As a visualization component, I want to query the current state of the reactive graph, so that I can render the full graph on initial load or after reconnection.

**Why this priority**: Visualizations need to render the full graph state, not just react to changes. This enables initial rendering and state synchronization.

**Independent Test**: Can be fully tested by creating multiple tracked primitives with dependencies, then querying nodes and edges to verify the complete graph structure is returned.

**Acceptance Scenarios**:

1. **Given** multiple tracked primitives exist, **When** I query all nodes, **Then** I receive a collection of all registered nodes with their current state
2. **Given** dependencies exist between primitives, **When** I query all edges, **Then** I receive a collection of all dependency relationships
3. **Given** a specific node ID, **When** I query that node, **Then** I receive the complete node data including sources and observers

---

### Edge Cases

- What happens when a tracked primitive is created without a name? (System generates a unique ID, name is null)
- What happens when a memo's dependencies change during re-evaluation? (Old edges are removed, new edges are added, subscription-add/remove events emitted)
- What happens when reading a disposed node's value? (Returns last known value, node remains in registry marked as disposed)
- What happens when the tracker is reset/cleared? (All nodes and edges are removed, subscribers notified)
- What happens when circular dependencies are attempted? (SolidJS prevents this at runtime; tracker reflects whatever SolidJS allows)

## Requirements *(mandatory)*

### Functional Requirements

#### ReactivityTracker Core

- **FR-001**: System MUST maintain a registry of all reactive nodes (signals, memos, effects) with unique identifiers
- **FR-002**: System MUST track dependency edges between nodes (which nodes depend on which)
- **FR-003**: System MUST track ownership edges between nodes (parent-child disposal relationships)
- **FR-004**: System MUST provide methods to query all nodes, all edges, and individual nodes by ID
- **FR-005**: System MUST provide a method to reset/clear all tracked state
- **FR-005a**: System MUST use a single global tracker instance (module-level singleton) that all tracked primitives register with

#### Instrumented Primitives

- **FR-006**: System MUST provide `createTrackedSignal` that wraps SolidJS `createSignal` and emits events
- **FR-007**: System MUST provide `createTrackedMemo` that wraps SolidJS `createMemo` and emits events
- **FR-008**: System MUST provide `createTrackedEffect` that wraps SolidJS `createEffect` and emits events
- **FR-009**: Tracked primitives MUST accept an optional name parameter for identification in the visualizer
- **FR-010**: Tracked primitives MUST automatically register themselves with the tracker on creation
- **FR-011**: Tracked primitives MUST emit events for creation, reads, writes, execution, and disposal

#### Event System

- **FR-012**: System MUST support subscribing to reactivity events with a callback function
- **FR-013**: System MUST support unsubscribing from events
- **FR-014**: System MUST emit events synchronously when reactive operations occur (no performance overhead target; this is development tooling where observability is prioritized over runtime speed)
- **FR-015**: Events MUST include: event type, timestamp, node ID, and relevant data (values, source IDs, etc.)

#### Node Data

- **FR-016**: Each node MUST track: id, type, name, current value (for signals/memos), execution count, creation timestamp
- **FR-017**: Each node MUST track: sources (upstream dependencies), observers (downstream dependents)
- **FR-018**: Each node MUST track: owner (parent in ownership tree), owned (children in ownership tree)
- **FR-019**: Each node MUST track: isStale, isExecuting, lastExecutedAt, disposedAt flags/timestamps

#### Edge Data

- **FR-020**: Each edge MUST track: id, type (dependency or ownership), source node ID, target node ID
- **FR-021**: Dependency edges MUST track: lastTriggeredAt timestamp, triggerCount

### Key Entities

- **ReactiveNode**: Represents a signal, memo, or effect in the reactive graph. Contains identity (id, type, name), state (value, isStale, isExecuting), relationships (sources, observers, owner, owned), and metadata (timestamps, execution count).

- **ReactiveEdge**: Represents a relationship between two nodes. Can be a dependency edge (data flows from source to target) or ownership edge (source owns target for disposal purposes).

- **ReactivityEvent**: Represents a single occurrence in the reactive system. Contains event type, timestamp, associated node ID, and event-specific data (values, related node IDs).

- **ReactivityTracker**: The central registry that maintains the graph state, handles event emission, and provides query methods.

## Clarifications

### Session 2026-01-08

- Q: Tracker instance scope (singleton vs multiple)? → A: Single global tracker (module-level singleton)
- Q: Event emission performance overhead target? → A: No overhead target (accept any perf impact in dev mode)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All tracked primitive operations (create, read, write, execute, dispose) emit corresponding events within the same synchronous execution frame
- **SC-002**: The tracker accurately reflects the dependency graph with zero false edges and zero missing edges after any sequence of reactive operations
- **SC-003**: Querying all nodes and edges returns complete graph state that matches the actual reactive relationships
- **SC-004**: Multiple subscribers receive events in the order they were emitted, with no dropped events
- **SC-005**: Tracked primitives behave identically to their non-tracked counterparts (same return values, same reactive behavior)
- **SC-006**: 80% or higher test coverage on all instrumentation code
