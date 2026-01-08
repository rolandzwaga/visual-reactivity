# Tasks: Core Instrumentation Layer

**Input**: Design documents from `/specs/001-core-instrumentation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Constitution requires Test-First Development. All tests written before implementation.

**Organization**: Tasks grouped by user story. Each story independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project structure and type definitions

- [x] T001 Create directory structure: src/instrumentation/, src/types/
- [x] T002 [P] Create type definitions for ReactiveNode in src/types/nodes.ts
- [x] T003 [P] Create type definitions for ReactiveEdge in src/types/edges.ts
- [x] T004 [P] Create type definitions for ReactivityEvent in src/types/events.ts
- [x] T005 Create barrel export in src/types/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core tracker infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Write test for ReactivityTracker node registry in src/instrumentation/tracker.spec.ts
- [x] T007 Implement ReactivityTracker singleton with node registry in src/instrumentation/tracker.ts
- [x] T008 Write test for edge registry in src/instrumentation/tracker.spec.ts
- [x] T009 Implement edge registry (addEdge, removeEdge, getEdges) in src/instrumentation/tracker.ts
- [x] T010 Write test for ID generation in src/instrumentation/tracker.spec.ts
- [x] T011 Implement ID generation (generateNodeId, generateEdgeId, generateEventId) in src/instrumentation/tracker.ts
- [x] T012 Write test for event emission in src/instrumentation/events.spec.ts
- [x] T013 Implement event emitter (subscribe, unsubscribe, emit) in src/instrumentation/events.ts
- [x] T014 Integrate event emitter into tracker in src/instrumentation/tracker.ts
- [x] T015 Write test for tracker reset in src/instrumentation/tracker.spec.ts
- [x] T016 Implement tracker.reset() method in src/instrumentation/tracker.ts

**Checkpoint**: Core tracker infrastructure ready. User stories can now proceed.

---

## Phase 3: User Story 1 - Track Signal Creation and Updates (P1) 🎯 MVP

**Goal**: Create signals that register with tracker and emit events on value changes

**Independent Test**: Create tracked signal, read/write values, verify events emitted and registry updated

### Tests for User Story 1

- [x] T017 [P] [US1] Write test: signal creation registers node in src/instrumentation/primitives.spec.ts
- [x] T018 [P] [US1] Write test: signal read emits signal-read event in src/instrumentation/primitives.spec.ts
- [x] T019 [P] [US1] Write test: signal write emits signal-write event in src/instrumentation/primitives.spec.ts
- [x] T020 [P] [US1] Write test: signal with custom name in src/instrumentation/primitives.spec.ts

### Implementation for User Story 1

- [x] T021 [US1] Implement createTrackedSignal wrapper in src/instrumentation/primitives.ts
- [x] T022 [US1] Implement signal-create event emission in src/instrumentation/primitives.ts
- [x] T023 [US1] Implement wrapped getter with signal-read event in src/instrumentation/primitives.ts
- [x] T024 [US1] Implement wrapped setter with signal-write event in src/instrumentation/primitives.ts
- [x] T025 [US1] Verify all US1 tests pass, run quality gates

**Checkpoint**: createTrackedSignal fully functional. Can demo signal tracking independently.

---

## Phase 4: User Story 2 - Track Memo Creation and Evaluation (P1)

**Goal**: Create memos that track dependencies and emit events on evaluation

**Independent Test**: Create signals + memo, verify dependency edges recorded, events emitted on evaluation

### Tests for User Story 2

- [x] T026 [P] [US2] Write test: memo creation registers node in src/instrumentation/primitives.spec.ts
- [x] T027 [P] [US2] Write test: memo execution emits start/end events in src/instrumentation/primitives.spec.ts
- [x] T028 [P] [US2] Write test: memo records dependency edges in src/instrumentation/primitives.spec.ts
- [x] T029 [P] [US2] Write test: memo re-evaluation on signal change in src/instrumentation/primitives.spec.ts

### Implementation for User Story 2

- [x] T030 [US2] Implement dependency tracking context (currentComputation) in src/instrumentation/primitives.ts
- [x] T031 [US2] Update signal getter to record dependency when read inside computation in src/instrumentation/primitives.ts
- [x] T032 [US2] Implement createTrackedMemo wrapper in src/instrumentation/primitives.ts
- [x] T033 [US2] Implement computation-execute-start/end events in src/instrumentation/primitives.ts
- [x] T034 [US2] Implement subscription-add event on dependency detection in src/instrumentation/primitives.ts
- [x] T035 [US2] Verify all US2 tests pass, run quality gates

**Checkpoint**: createTrackedMemo fully functional. Dependency graph visible.

---

## Phase 5: User Story 3 - Track Effect Creation and Execution (P1)

**Goal**: Create effects that track dependencies, emit events, handle disposal

**Independent Test**: Create signals + effect, verify events on execution and disposal

### Tests for User Story 3

- [x] T036 [P] [US3] Write test: effect creation registers node in src/instrumentation/primitives.spec.ts
- [x] T037 [P] [US3] Write test: effect execution emits start/end events in src/instrumentation/primitives.spec.ts
- [x] T038 [P] [US3] Write test: effect records dependency edges in src/instrumentation/primitives.spec.ts
- [x] T039 [P] [US3] Write test: effect disposal emits computation-dispose event in src/instrumentation/primitives.spec.ts
- [x] T039a [P] [US3] Write test: ownership edge created between parent and child computation in src/instrumentation/primitives.spec.ts

### Implementation for User Story 3

- [x] T040 [US3] Implement createTrackedEffect wrapper in src/instrumentation/primitives.ts
- [x] T041 [US3] Implement onCleanup hook for disposal tracking in src/instrumentation/primitives.ts
- [x] T042 [US3] Implement computation-dispose event and node.disposedAt update in src/instrumentation/primitives.ts
- [x] T042a [US3] Implement ownership edge creation (owner/owned fields) when computation created inside another in src/instrumentation/primitives.ts
- [x] T043 [US3] Verify all US3 tests pass, run quality gates

**Checkpoint**: All three primitives (signal, memo, effect) fully instrumented.

---

## Phase 6: User Story 4 - Subscribe to Reactivity Events (P2)

**Goal**: Pub/sub system for real-time visualization updates

**Independent Test**: Subscribe, perform operations, verify events received in order

### Tests for User Story 4

- [x] T044 [P] [US4] Write test: subscribe receives events in src/instrumentation/events.spec.ts
- [x] T045 [P] [US4] Write test: multiple subscribers receive same event in src/instrumentation/events.spec.ts
- [x] T046 [P] [US4] Write test: unsubscribe stops event delivery in src/instrumentation/events.spec.ts
- [x] T047 [P] [US4] Write test: events received in emission order in src/instrumentation/events.spec.ts

### Implementation for User Story 4

- [x] T048 [US4] Verify event emitter from Phase 2 meets all US4 requirements
- [x] T049 [US4] Add integration test: full reactive chain emits ordered events in src/instrumentation/integration.spec.ts
- [x] T050 [US4] Verify all US4 tests pass, run quality gates

**Checkpoint**: Event subscription fully functional.

---

## Phase 7: User Story 5 - Query Graph State (P2)

**Goal**: Query methods for visualization to render full graph

**Independent Test**: Create primitives, query nodes/edges, verify complete structure

### Tests for User Story 5

- [x] T051 [P] [US5] Write test: getNodes returns all nodes in src/instrumentation/tracker.spec.ts
- [x] T052 [P] [US5] Write test: getNode returns single node by ID in src/instrumentation/tracker.spec.ts
- [x] T053 [P] [US5] Write test: getEdges returns all edges in src/instrumentation/tracker.spec.ts
- [x] T054 [P] [US5] Write test: getEdgesByType filters correctly in src/instrumentation/tracker.spec.ts
- [x] T055 [P] [US5] Write test: getEdgesForNode returns related edges in src/instrumentation/tracker.spec.ts

### Implementation for User Story 5

- [x] T056 [US5] Implement getNodes() method in src/instrumentation/tracker.ts
- [x] T057 [US5] Implement getNode(id) method in src/instrumentation/tracker.ts
- [x] T058 [US5] Implement getEdges() method in src/instrumentation/tracker.ts
- [x] T059 [US5] Implement getEdgesByType(type) method in src/instrumentation/tracker.ts
- [x] T060 [US5] Implement getEdgesForNode(nodeId) method in src/instrumentation/tracker.ts
- [x] T061 [US5] Verify all US5 tests pass, run quality gates

**Checkpoint**: Full query API available for visualization layer.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, exports, quality gates

- [x] T062 [P] Create public exports in src/instrumentation/index.ts
- [x] T063 [P] Write integration test: diamond dependency pattern in src/instrumentation/integration.spec.ts
- [x] T064 [P] Write integration test: conditional dependencies in src/instrumentation/integration.spec.ts
- [x] T065 [P] Write edge case test: primitive without name in src/instrumentation/primitives.spec.ts
- [x] T066 [P] Write edge case test: dependency changes during re-evaluation in src/instrumentation/primitives.spec.ts
- [x] T067 Run full test suite, verify 80% coverage threshold
- [x] T068 Run quality gates: npm run check && npm run typecheck
- [x] T069 Validate quickstart.md examples work correctly
- [x] T070 Update CLAUDE.md with new utilities and patterns

---

## Phase Final-1: Quality Gates

**Purpose**: Mandatory quality verification before spec completion

- [x] T071 Run `npm run lint:css` - verify zero errors/warnings (no CSS files in instrumentation)
- [x] T072 Run `npm run check` - verify Biome passes (2 warnings in non-instrumentation code)
- [x] T073 Run `npm run typecheck` - verify TypeScript passes
- [x] T074 Run `npm test` - verify all tests pass (38 tests)
- [x] T075 Verify 80% test coverage on instrumentation code (94.32% achieved)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Phase 2 completion
  - US1-US3 are all P1 priority but have internal dependencies
  - US4-US5 are P2 priority, can start after Phase 2
- **Polish (Phase 8)**: After all user stories complete
- **Quality Gates (Final-1)**: After Polish phase

### User Story Dependencies

- **US1 (Signal)**: After Phase 2 - No dependencies on other stories
- **US2 (Memo)**: After Phase 2 - Uses dependency tracking from US1 implementation
- **US3 (Effect)**: After Phase 2 - Uses patterns from US1/US2
- **US4 (Subscribe)**: After Phase 2 - Independent, uses foundational event system
- **US5 (Query)**: After Phase 2 - Independent, uses foundational tracker

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Implementation follows test requirements
3. Quality gates run after story completion
4. Story complete before marking checkpoint

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002, T003, T004 can run in parallel (different type files)

**Phase 2 (Foundational)**:
- Sequential due to incremental tracker development

**Phase 3-7 (User Stories)**:
- All [P] tests within a story can run in parallel
- US1, US4, US5 could theoretically run in parallel (different concerns)
- US2, US3 depend on patterns established in US1

**Phase 8 (Polish)**:
- T062, T063, T064, T065, T066 can run in parallel

---

## Parallel Example: Phase 1

```bash
# Launch all type definitions in parallel:
Task: "Create type definitions for ReactiveNode in src/types/nodes.ts"
Task: "Create type definitions for ReactiveEdge in src/types/edges.ts"
Task: "Create type definitions for ReactivityEvent in src/types/events.ts"
```

## Parallel Example: User Story 1 Tests

```bash
# Launch all US1 tests in parallel:
Task: "Write test: signal creation registers node"
Task: "Write test: signal read emits signal-read event"
Task: "Write test: signal write emits signal-write event"
Task: "Write test: signal with custom name"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types)
2. Complete Phase 2: Foundational (tracker core)
3. Complete Phase 3: User Story 1 (createTrackedSignal)
4. **STOP and VALIDATE**: Demo signal tracking works
5. Proceed to remaining stories

### Incremental Delivery

1. Setup + Foundational → Core infrastructure ready
2. Add US1 (Signal) → MVP: basic signal tracking works
3. Add US2 (Memo) → Dependency graph visible
4. Add US3 (Effect) → Full reactive cycle tracked
5. Add US4 (Subscribe) → Real-time updates available
6. Add US5 (Query) → Full API for visualization

### Recommended Order

Given all P1 stories build on each other:
1. **Must do sequentially**: US1 → US2 → US3
2. **Can parallelize**: US4 and US5 (after Phase 2)
3. **Final**: Polish + Quality Gates

---

## Notes

- Constitution requires Test-First: Write failing tests before implementation
- Co-locate tests with source: primitives.spec.ts next to primitives.ts
- Each checkpoint = independently demonstrable functionality
- 80% coverage required on all instrumentation code
- Quality gates must pass before spec completion
