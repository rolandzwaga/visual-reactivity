# Tasks: Dependency Graph Visualization

**Input**: Design documents from `/specs/002-dependency-graph-visualization/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Constitution requires Test-First Development. All tests written before implementation.

**Organization**: Tasks grouped by user story. Each story independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Install dependencies and create directory structure

- [ ] T001 Install D3 dependencies: d3-force, d3-selection, d3-zoom, d3-drag and @types/*
- [ ] T002 Create directory structure: src/visualization/, src/visualization/nodes/, src/visualization/hooks/, src/d3/
- [ ] T003 [P] Create visualization types in specs/002-dependency-graph-visualization/contracts/types.ts (copy to src/visualization/types.ts)
- [ ] T004 [P] Create barrel exports in src/visualization/index.ts
- [ ] T005 [P] Create barrel exports in src/d3/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: D3 utilities and graph state management that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### D3 Force Simulation

- [ ] T006 Write test for createForceSimulation in src/d3/forceSimulation.spec.ts
- [ ] T007 Implement createForceSimulation in src/d3/forceSimulation.ts
- [ ] T008 Write test for simulation tick updates in src/d3/forceSimulation.spec.ts
- [ ] T009 Implement simulation node/edge update methods in src/d3/forceSimulation.ts

### D3 Zoom Behavior

- [ ] T010 Write test for createZoomBehavior in src/d3/zoom.spec.ts
- [ ] T011 Implement createZoomBehavior in src/d3/zoom.ts

### Graph State Hook

- [ ] T012 Write test for useGraphState in src/visualization/hooks/useGraphState.spec.ts
- [ ] T013 Implement useGraphState (nodes, edges, selection, hover) in src/visualization/hooks/useGraphState.ts
- [ ] T014 Write test for useForceSimulation in src/visualization/hooks/useForceSimulation.spec.ts
- [ ] T015 Implement useForceSimulation (wraps D3 simulation with SolidJS signals) in src/visualization/hooks/useForceSimulation.ts

**Checkpoint**: Core D3 utilities and state management ready. User stories can now proceed.

---

## Phase 3: User Story 1 - View Reactive Graph (Priority: P1) 🎯 MVP

**Goal**: Display reactive primitives as nodes with edges in a force-directed layout

**Independent Test**: Create tracked primitives and verify nodes appear with correct shapes/colors connected by edges

### Tests for User Story 1

- [ ] T016 [P] [US1] Write test: graph renders signal nodes as blue circles in src/visualization/nodes/SignalNode.spec.tsx
- [ ] T017 [P] [US1] Write test: graph renders memo nodes as purple diamonds in src/visualization/nodes/MemoNode.spec.tsx
- [ ] T018 [P] [US1] Write test: graph renders effect nodes as green squares in src/visualization/nodes/EffectNode.spec.tsx
- [ ] T019 [P] [US1] Write test: graph renders edges between connected nodes in src/visualization/DependencyGraph.spec.tsx
- [ ] T020 [P] [US1] Write test: graph uses force-directed layout in src/visualization/DependencyGraph.spec.tsx

### Implementation for User Story 1

- [ ] T021 [P] [US1] Implement SignalNode component in src/visualization/nodes/SignalNode.tsx
- [ ] T022 [P] [US1] Implement MemoNode component in src/visualization/nodes/MemoNode.tsx
- [ ] T023 [P] [US1] Implement EffectNode component in src/visualization/nodes/EffectNode.tsx
- [ ] T024 [US1] Create nodes barrel export in src/visualization/nodes/index.ts
- [ ] T025 [US1] Implement DependencyGraph component (SVG container, renders nodes/edges) in src/visualization/DependencyGraph.tsx
- [ ] T026 [US1] Create DependencyGraph styles in src/visualization/DependencyGraph.module.css
- [ ] T027 [US1] Add SVG arrow marker definition for directed edges in src/visualization/DependencyGraph.tsx
- [ ] T028 [US1] Verify all US1 tests pass, run quality gates

**Checkpoint**: Graph displays nodes and edges with force-directed layout. Can demo visualization independently.

---

## Phase 4: User Story 2 - Interact with Graph (Priority: P1)

**Goal**: Enable zoom, pan, drag interactions for exploring complex graphs

**Independent Test**: Load a graph and verify zoom/pan/drag operations work as expected

### Tests for User Story 2

- [ ] T029 [P] [US2] Write test: scroll wheel zooms graph in/out in src/visualization/DependencyGraph.spec.tsx
- [ ] T030 [P] [US2] Write test: drag on empty space pans the view in src/visualization/DependencyGraph.spec.tsx
- [ ] T031 [P] [US2] Write test: drag on node moves the node in src/visualization/DependencyGraph.spec.tsx
- [ ] T032 [P] [US2] Write test: hover on node highlights node and edges in src/visualization/DependencyGraph.spec.tsx

### Implementation for User Story 2

- [ ] T033 [US2] Implement zoom behavior integration in src/visualization/DependencyGraph.tsx
- [ ] T034 [US2] Implement pan behavior on SVG background in src/visualization/DependencyGraph.tsx
- [ ] T035 [US2] Write test for node drag in src/d3/drag.spec.ts
- [ ] T036 [US2] Implement createDragBehavior in src/d3/drag.ts
- [ ] T037 [US2] Integrate node drag behavior with simulation in src/visualization/DependencyGraph.tsx
- [ ] T038 [US2] Implement hover highlight (node + connected edges) in src/visualization/DependencyGraph.tsx
- [ ] T039 [US2] Add hover/highlight styles in src/visualization/DependencyGraph.module.css
- [ ] T040 [US2] Verify all US2 tests pass, run quality gates

**Checkpoint**: Graph is fully interactive with zoom/pan/drag/hover.

---

## Phase 5: User Story 3 - Real-Time Updates (Priority: P1)

**Goal**: Graph updates automatically when reactive primitives are created/disposed

**Independent Test**: Create/dispose primitives while watching graph, verify nodes/edges update accordingly

### Tests for User Story 3

- [ ] T041 [P] [US3] Write test: new signal creates node in graph in src/visualization/DependencyGraph.spec.tsx
- [ ] T042 [P] [US3] Write test: disposed computation removes node from graph in src/visualization/DependencyGraph.spec.tsx
- [ ] T043 [P] [US3] Write test: subscription-add creates edge in graph in src/visualization/DependencyGraph.spec.tsx
- [ ] T044 [P] [US3] Write test: subscription-remove deletes edge from graph in src/visualization/DependencyGraph.spec.tsx

### Implementation for User Story 3

- [ ] T045 [US3] Implement tracker event subscription on mount in src/visualization/hooks/useGraphState.ts
- [ ] T046 [US3] Implement addNode handler for signal-create/computation-create events in src/visualization/hooks/useGraphState.ts
- [ ] T047 [US3] Implement removeNode handler for computation-dispose event in src/visualization/hooks/useGraphState.ts
- [ ] T048 [US3] Implement addEdge/removeEdge handlers for subscription events in src/visualization/hooks/useGraphState.ts
- [ ] T049 [US3] Implement simulation update on node/edge changes in src/visualization/hooks/useForceSimulation.ts
- [ ] T050 [US3] Implement initial graph load from tracker.getNodes()/getEdges() in src/visualization/hooks/useGraphState.ts
- [ ] T051 [US3] Verify all US3 tests pass, run quality gates

**Checkpoint**: Graph reflects real-time changes to reactive system.

---

## Phase 6: User Story 4 - Inspect Node Details (Priority: P2)

**Goal**: Click node to show detail panel with node information

**Independent Test**: Click on nodes of each type and verify detail panel shows correct information

### Tests for User Story 4

- [ ] T052 [P] [US4] Write test: click node opens detail panel in src/visualization/DetailPanel.spec.tsx
- [ ] T053 [P] [US4] Write test: detail panel shows signal value and observers in src/visualization/DetailPanel.spec.tsx
- [ ] T054 [P] [US4] Write test: detail panel shows memo sources and observers in src/visualization/DetailPanel.spec.tsx
- [ ] T055 [P] [US4] Write test: detail panel shows effect sources and execution count in src/visualization/DetailPanel.spec.tsx
- [ ] T056 [P] [US4] Write test: click elsewhere or Escape closes panel in src/visualization/DetailPanel.spec.tsx

### Implementation for User Story 4

- [ ] T057 [US4] Implement DetailPanel component in src/visualization/DetailPanel.tsx
- [ ] T058 [US4] Create DetailPanel styles in src/visualization/DetailPanel.module.css
- [ ] T059 [US4] Implement value display with truncation for large values in src/visualization/DetailPanel.tsx
- [ ] T060 [US4] Implement sources/observers list display in src/visualization/DetailPanel.tsx
- [ ] T061 [US4] Implement execution count and timestamp display in src/visualization/DetailPanel.tsx
- [ ] T062 [US4] Integrate DetailPanel with DependencyGraph (onClick handler, Escape key) in src/visualization/DependencyGraph.tsx
- [ ] T063 [US4] Verify all US4 tests pass, run quality gates

**Checkpoint**: Detail panel provides complete node inspection.

---

## Phase 7: User Story 5 - Visual Distinction by Node Type (Priority: P2)

**Goal**: Nodes are visually distinct by type (shape, color, labels)

**Independent Test**: Create one of each node type and verify distinct shapes, colors, and labels

### Tests for User Story 5

- [ ] T064 [P] [US5] Write test: signal node has blue fill in src/visualization/nodes/SignalNode.spec.tsx
- [ ] T065 [P] [US5] Write test: memo node has purple fill in src/visualization/nodes/MemoNode.spec.tsx
- [ ] T066 [P] [US5] Write test: effect node has green fill in src/visualization/nodes/EffectNode.spec.tsx
- [ ] T067 [P] [US5] Write test: nodes display name labels in src/visualization/DependencyGraph.spec.tsx

### Implementation for User Story 5

- [ ] T068 [US5] Add color constants and apply fills in node components in src/visualization/nodes/*.tsx
- [ ] T069 [US5] Implement node label rendering in DependencyGraph in src/visualization/DependencyGraph.tsx
- [ ] T070 [US5] Add label visibility based on zoom level in src/visualization/DependencyGraph.tsx
- [ ] T071 [US5] Verify all US5 tests pass, run quality gates

**Checkpoint**: All node types are visually distinguishable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, integration, quality gates

- [ ] T072 [P] Write test: empty graph shows empty state message in src/visualization/DependencyGraph.spec.tsx
- [ ] T073 [P] Implement empty state message in src/visualization/DependencyGraph.tsx
- [ ] T074 [P] Write integration test: full graph lifecycle in tests/integration/graph-updates.spec.ts
- [ ] T075 Update App.tsx to include DependencyGraph component
- [ ] T076 Update src/visualization/index.ts with all public exports
- [ ] T077 Run full test suite, verify 80% coverage threshold
- [ ] T078 Run quality gates: npm run check && npm run typecheck && npm run lint:css
- [ ] T079 Validate quickstart.md examples work correctly

---

## Phase Final-1: Quality Gates

**Purpose**: Mandatory quality verification before spec completion

- [ ] T080 Run `npm run lint:css` - verify zero errors/warnings
- [ ] T081 Run `npm run check` - verify Biome passes
- [ ] T082 Run `npm run typecheck` - verify TypeScript passes
- [ ] T083 Run `npx vitest run --no-watch` - verify all tests pass
- [ ] T084 Run `npx vitest run --coverage --no-watch` - verify 80% coverage on visualization code

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Phase 2 completion
  - US1, US2, US3 are all P1 priority but have internal dependencies
  - US4, US5 are P2 priority, can start after US1-US3 complete
- **Polish (Phase 8)**: After all user stories complete
- **Quality Gates (Final-1)**: After Polish phase

### User Story Dependencies

- **US1 (View Graph)**: After Phase 2 - No dependencies on other stories
- **US2 (Interactions)**: After US1 - Uses graph rendering from US1
- **US3 (Real-Time Updates)**: After US1 - Uses graph from US1, independent of US2
- **US4 (Detail Panel)**: After US1 - Uses node click from US2 (soft dependency)
- **US5 (Visual Distinction)**: After US1 - Enhances node rendering

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Implementation follows test requirements
3. Quality gates run after story completion
4. Story complete before marking checkpoint

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003, T004, T005 can run in parallel (different files)

**Phase 2 (Foundational)**:
- T006/T007 and T010/T011 can run in parallel (different D3 utilities)
- T012/T013 and T014/T015 can run in parallel (different hooks)

**Phase 3-7 (User Stories)**:
- All [P] tests within a story can run in parallel
- Node components (T021, T022, T023) can run in parallel
- Test tasks within each phase can run in parallel

**Phase 8 (Polish)**:
- T072/T073 and T074 can run in parallel

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# Launch all US1 tests in parallel:
Task: "Write test: graph renders signal nodes in src/visualization/nodes/SignalNode.spec.tsx"
Task: "Write test: graph renders memo nodes in src/visualization/nodes/MemoNode.spec.tsx"
Task: "Write test: graph renders effect nodes in src/visualization/nodes/EffectNode.spec.tsx"
Task: "Write test: graph renders edges in src/visualization/DependencyGraph.spec.tsx"
Task: "Write test: graph uses force-directed layout in src/visualization/DependencyGraph.spec.tsx"

# Launch all node components in parallel:
Task: "Implement SignalNode component in src/visualization/nodes/SignalNode.tsx"
Task: "Implement MemoNode component in src/visualization/nodes/MemoNode.tsx"
Task: "Implement EffectNode component in src/visualization/nodes/EffectNode.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (dependencies, directories)
2. Complete Phase 2: Foundational (D3 utilities, hooks)
3. Complete Phase 3: User Story 1 (graph rendering)
4. **STOP and VALIDATE**: Demo graph with nodes and edges
5. Proceed to remaining stories

### Incremental Delivery

1. Setup + Foundational → Core infrastructure ready
2. Add US1 (View Graph) → MVP: basic graph works
3. Add US2 (Interactions) → Graph is interactive
4. Add US3 (Real-Time) → Graph updates live
5. Add US4 (Detail Panel) → Node inspection available
6. Add US5 (Visual Distinction) → Polished appearance

### Recommended Order

Given P1 stories (US1, US2, US3) have dependencies:
1. **Must do sequentially**: US1 → US2 → US3 (each builds on previous)
2. **Can parallelize**: US4 and US5 (after US1, independent of each other)
3. **Final**: Polish + Quality Gates

---

## Notes

- Constitution requires Test-First: Write failing tests before implementation
- Co-locate tests with source: Component.spec.tsx next to Component.tsx
- Each checkpoint = independently demonstrable functionality
- 80% coverage required on all visualization code
- Quality gates must pass before spec completion
