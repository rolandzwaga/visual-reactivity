# Tasks: Ownership Tree View

**Input**: Design documents from `/specs/005-ownership-tree-view/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Following Test-First Development per constitution - ALL implementation files require tests written FIRST

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Repository root: `/root/projects/visual-reactivity/`
- Source: `src/`
- Tests: Co-located with source files (`.spec.ts` or `.spec.tsx`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Review existing visualization architecture in src/visualization/DependencyGraph.tsx and hooks patterns
- [x] T002 [P] Review existing D3 utilities in src/d3/forceSimulation.ts and src/d3/zoom.ts
- [x] T003 [P] Review existing node components in src/visualization/nodes/ directory
- [x] T004 [P] Verify D3 hierarchy modules available (d3-hierarchy already installed from Feature 002)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and hooks that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Test for D3 hierarchy layout utility in src/d3/hierarchyLayout.spec.ts
- [x] T006 [P] Implement D3 hierarchy layout utility in src/d3/hierarchyLayout.ts (tree layout factory, nodeSize configuration, separation function)
- [x] T007 [P] Test for tree state hook in src/visualization/hooks/useTreeState.spec.ts
- [x] T008 [P] Implement tree state hook in src/visualization/hooks/useTreeState.ts (expansion signals, visible nodes computation, disposal tracking)
- [x] T009 Test for hierarchy layout hook in src/visualization/hooks/useHierarchyLayout.spec.ts
- [x] T010 Implement hierarchy layout hook in src/visualization/hooks/useHierarchyLayout.ts (D3 integration, multiple tree arrangement, dimension calculation)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Ownership Hierarchy (Priority: P1) 🎯 MVP

**Goal**: Display hierarchical tree showing ownership relationships between reactive primitives with real-time updates

**Independent Test**: Create nested reactive contexts and verify tree displays correct parent-child relationships with proper visual encoding and real-time updates within 50ms

### Tests for User Story 1 (Test-First)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T011 [P] [US1] Test for OwnershipTree component skeleton in src/visualization/OwnershipTree.spec.tsx (render, tracker subscription)
- [x] T012 [P] [US1] Integration test for tree building from tracker nodes in tests/integration/ownership-tree-updates.spec.ts

### Implementation for User Story 1

- [x] T013 [US1] Create OwnershipTree component skeleton in src/visualization/OwnershipTree.tsx (import hooks, subscribe to tracker, basic structure)
- [x] T014 [US1] Create CSS module in src/visualization/OwnershipTree.module.css (container with overflow-x, node/edge styles)
- [x] T015 [US1] Implement tree data building from tracker in OwnershipTree.tsx (filter root nodes by owner === null, build hierarchy using d3.hierarchy)
- [x] T016 [US1] Implement tree layout computation in OwnershipTree.tsx (apply useHierarchyLayout hook, handle multiple roots with vertical stacking)
- [x] T017 [US1] Implement node rendering in OwnershipTree.tsx (reuse SignalNode, MemoNode, EffectNode components with proper positioning)
- [x] T018 [US1] Implement edge rendering in OwnershipTree.tsx (SVG paths connecting parent to children using ownership edges)
- [x] T019 [US1] Implement tracker event subscription in OwnershipTree.tsx (onMount with signal-create, computation-create, computation-dispose handlers)
- [x] T020 [US1] Implement real-time tree updates in OwnershipTree.tsx (add/remove nodes based on tracker events, maintain <50ms update time)

**Checkpoint**: At this point, User Story 1 should be fully functional - tree displays ownership hierarchy with real-time updates

---

## Phase 4: User Story 2 - Interact with Tree Structure (Priority: P1)

**Goal**: Enable expand/collapse interactions, default 2-level expansion, selection synchronization, and proper sibling ordering

**Independent Test**: Create deep ownership hierarchy (5+ levels) and verify expand/collapse works, initial 2-level expansion, selection sync with DependencyGraph, and timestamp-based sibling sort

### Tests for User Story 2 (Test-First)

- [x] T021 [P] [US2] Test for expand/collapse functionality in src/visualization/OwnershipTree.spec.tsx (toggle expansion, visibility updates)
- [x] T022 [P] [US2] Test for default expansion depth in src/visualization/hooks/useTreeState.spec.ts (verify 2 levels expanded initially)
- [x] T023 [P] [US2] Test for selection synchronization in tests/integration/cross-view-selection.spec.ts

### Implementation for User Story 2

- [x] T024 [US2] Implement expand/collapse icon rendering in OwnershipTree.tsx (chevron indicator for nodes with children)
- [x] T025 [US2] Implement expand/collapse click handler in OwnershipTree.tsx (call useTreeState.toggleExpanded on icon click)
- [x] T026 [US2] Implement default 2-level expansion in useTreeState.ts (initialize expandedNodes signal with nodes at depth < 2)
- [x] T027 [US2] Implement visible node filtering in useTreeState.ts (compute visibleNodes based on expandedNodes set)
- [x] T028 [US2] Implement sibling sort by createdAt in useHierarchyLayout.ts (sort children array by node.createdAt timestamp)
- [x] T029 [US2] Implement selection synchronization in OwnershipTree.tsx (accept selectedNodeId prop, sync with DependencyGraph via shared signal)
- [x] T030 [US2] Implement scroll-to-selected behavior in OwnershipTree.tsx (when selectedNodeId changes, scroll node into view using SVGElement.scrollIntoView)
- [x] T031 [US2] Update CSS in OwnershipTree.module.css (expand/collapse icon styles, selected node highlight styles)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - tree is interactive with expand/collapse and selection sync

---

## Phase 5: User Story 3 - Inspect Node Details from Tree (Priority: P2)

**Goal**: Enable node click to open shared DetailPanel, hover tooltips with child counts, disposed node styling with 5-second auto-removal

**Independent Test**: Click nodes to verify DetailPanel opens with ownership metadata, hover for tooltips, dispose nodes and verify 5-second removal with distinct styling

### Tests for User Story 3 (Test-First)

- [x] T032 [P] [US3] Test for node click handler in src/visualization/OwnershipTree.spec.tsx (verify DetailPanel opens with correct data)
- [x] T033 [P] [US3] Test for hover tooltip in src/visualization/OwnershipTree.spec.tsx (verify tooltip shows child counts)
- [x] T034 [P] [US3] Test for disposed node styling in src/visualization/OwnershipTree.spec.tsx (grayscale, "Disposed" label)
- [x] T035 [P] [US3] Test for 5-second auto-removal in src/visualization/hooks/useTreeState.spec.ts (setTimeout cleanup)

### Implementation for User Story 3

- [x] T036 [US3] Implement node click handler in OwnershipTree.tsx (set selectedNodeId to trigger DetailPanel from App.tsx)
- [x] T037 [US3] Verify DetailPanel integration in App.tsx (ensure DetailPanel receives nodeId and displays ownership metadata: owner ID, owned count)
- [x] T038 [US3] Implement hover tooltip in OwnershipTree.tsx (use native title attribute or custom tooltip showing name, type, direct children count, total descendants count)
- [x] T039 [US3] Implement disposed node detection in OwnershipTree.tsx (check node.disposedAt !== null)
- [x] T040 [US3] Implement disposed node styling in OwnershipTree.tsx (apply grayscale CSS filter, add "Disposed" text label with timestamp)
- [x] T041 [US3] Implement 5-second auto-removal timer in useTreeState.ts (createEffect with setTimeout(5000) on disposedAt change, onCleanup to clearTimeout)
- [x] T042 [US3] Implement removal from tree in useTreeState.ts (remove node ID from visible set after timer expires)
- [x] T043 [US3] Update CSS in OwnershipTree.module.css (disposed node styles: grayscale filter, opacity fade, "Disposed" label styling)

**Checkpoint**: User Stories 1-3 complete - tree is interactive with detail inspection and disposal visualization

---

## Phase 6: User Story 4 - Manually Test Disposal (Priority: P3)

**Goal**: Enable manual disposal of root context nodes with confirmation dialog, prevent non-root disposal, show disposal count notification

**Independent Test**: Right-click root node to trigger disposal, verify descendants cascade, try non-root node and verify disabled, check notification shows correct count

### Tests for User Story 4 (Test-First)

- [x] T044 [P] [US4] Test for manual disposal action in src/visualization/OwnershipTree.spec.tsx (right-click menu, confirmation dialog)
- [x] T045 [P] [US4] Test for root-only disposal restriction in src/visualization/OwnershipTree.spec.tsx (non-root nodes disabled)
- [x] T046 [P] [US4] Test for disposal notification in src/visualization/OwnershipTree.spec.tsx (shows disposed count)

### Implementation for User Story 4

- [x] T047 [US4] Implement context menu handler in OwnershipTree.tsx (onContextMenu event, show menu only for root nodes where owner === null)
- [x] T048 [US4] Implement confirmation dialog component in src/visualization/ConfirmDialog.tsx (reusable dialog with message, confirm/cancel buttons)
- [x] T049 [US4] Test for ConfirmDialog component in src/visualization/ConfirmDialog.spec.tsx
- [x] T050 [US4] Integrate confirmation dialog in OwnershipTree.tsx (show dialog on "Dispose" context menu click, await user confirmation)
- [x] T051 [US4] Implement manual disposal logic in OwnershipTree.tsx (call tracker disposal method for root node if confirmed)
- [x] T052 [US4] Implement disposal cascade detection in OwnershipTree.tsx (count node and all descendants that will be disposed)
- [x] T053 [US4] Implement notification component in src/visualization/Notification.tsx (toast-style notification with auto-dismiss)
- [x] T054 [US4] Test for Notification component in src/visualization/Notification.spec.tsx
- [x] T055 [US4] Integrate notification in OwnershipTree.tsx (show notification after disposal with message "Disposed N root and M children")
- [x] T056 [US4] Implement non-root disposal prevention in OwnershipTree.tsx (disable "Dispose" option for nodes with owner !== null, show tooltip "Only root contexts can be manually disposed")
- [x] T057 [US4] Update CSS in OwnershipTree.module.css (context menu styles, disabled menu item styles)

**Checkpoint**: All user stories complete - full ownership tree visualization with manual disposal testing capability

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Integration, edge cases, performance optimization, and quality gates

- [x] T058 [P] Integrate OwnershipTree into App.tsx (add view toggle button between Graph and Tree views)
- [x] T059 [P] Implement edge case: empty tree handling in OwnershipTree.tsx (show message "No ownership relationships - all nodes are independent" when no trees exist)
- [x] T060 [P] Implement edge case: circular ownership detection in useHierarchyLayout.ts (detect cycles, display error message "Circular ownership detected - tracker bug")
- [x] T061 [P] Implement edge case: deep tree handling in OwnershipTree.tsx (add "Show all" button when tree depth > 10 levels)
- [x] T062 [P] Implement edge case: wide tree horizontal scrolling in OwnershipTree.module.css (verify overflow-x: auto works correctly for 20+ sibling nodes)
- [x] T063 [P] Performance test for 100+ nodes in tests/performance/large-tree.spec.ts (verify 60 FPS, no UI freezing)
- [x] T064 [P] Performance test for 20-level deep tree in tests/performance/deep-tree.spec.ts (verify 60 FPS, <50ms updates)
- [x] T065 [P] Update AGENTS.md with OwnershipTree usage patterns (add to "manual additions" section)
- [x] T066 Run quality gates: npm run lint:css
- [x] T067 Run quality gates: npm run check
- [x] T068 Run quality gates: npm run typecheck
- [x] T069 Verify 80% test coverage for business logic: npx vitest run --coverage --no-watch
- [x] T070 Run all tests to ensure zero failures: npx vitest run --no-watch
- [x] T071 Manual validation: Test with demo examples from quickstart.md (counter, diamond pattern, nested effects)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (P1): Can start after Phase 2
  - US2 (P1): Can start after Phase 2, integrates with US1
  - US3 (P2): Requires US1 complete (needs tree rendering)
  - US4 (P3): Requires US1 complete (needs tree rendering)
- **Polish (Phase 7)**: Depends on desired user stories being complete (US1-US2 for MVP, US1-US4 for full)

### User Story Dependencies

- **User Story 1 (P1)**: Foundational phase complete → Can implement independently
- **User Story 2 (P1)**: Foundational phase complete, integrates with US1 tree rendering → Should wait for US1 T013-T020
- **User Story 3 (P2)**: Requires US1 complete (needs tree nodes to click) → Wait for US1 checkpoint
- **User Story 4 (P3)**: Requires US1 complete (needs tree nodes for disposal) → Wait for US1 checkpoint

### Within Each User Story

Per Test-First Development (Constitution):
1. Write tests FIRST (verify they FAIL)
2. Implement code to pass tests
3. Verify tests PASS
4. Refactor while keeping tests green
5. Move to next task

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002, T003, T004 can all run in parallel (different files)

**Phase 2 (Foundational)**:
- T005+T006 (hierarchyLayout) can run parallel with T007+T008 (useTreeState)
- T009+T010 (useHierarchyLayout) must wait for T006 and T008 complete

**Phase 3 (US1)**:
- T011, T012 tests can run in parallel
- T014 (CSS) can run parallel with T013 (component skeleton)

**Phase 4 (US2)**:
- T021, T022, T023 tests can run in parallel
- T031 (CSS) can run parallel with logic tasks

**Phase 5 (US3)**:
- T032, T033, T034, T035 tests can run in parallel
- T043 (CSS) can run parallel with logic tasks

**Phase 6 (US4)**:
- T044, T045, T046 tests can run in parallel
- T048+T049 (ConfirmDialog) can run parallel with T053+T054 (Notification)

**Phase 7 (Polish)**:
- T058-T065 can all run in parallel (different files)
- T066-T068 quality gates run sequentially after code complete

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Test for OwnershipTree component skeleton in src/visualization/OwnershipTree.spec.tsx"
Task: "Integration test for tree building in tests/integration/ownership-tree-updates.spec.ts"

# After tests written, implementation tasks:
Task: "Create OwnershipTree component skeleton in src/visualization/OwnershipTree.tsx"
Task: "Create CSS module in src/visualization/OwnershipTree.module.css"
```

---

## Implementation Strategy

### MVP First (User Stories 1-2 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T010) - **CRITICAL**
3. Complete Phase 3: User Story 1 (T011-T020) - Basic tree visualization
4. Complete Phase 4: User Story 2 (T021-T031) - Interactions
5. **STOP and VALIDATE**: Test US1+US2 independently
6. Run quality gates (T066-T068)
7. Deploy/demo if ready - **MVP Complete**

### Incremental Delivery

1. Setup + Foundational (Phase 1-2) → Foundation ready
2. Add User Story 1 (Phase 3) → Test independently → **MVP Demo**
3. Add User Story 2 (Phase 4) → Test independently → **Enhanced MVP**
4. Add User Story 3 (Phase 5) → Test independently → **Detail Inspection Feature**
5. Add User Story 4 (Phase 6) → Test independently → **Full Feature**
6. Polish (Phase 7) → Final quality pass → **Production Ready**

### Parallel Team Strategy

With multiple developers (after Foundational Phase 2 complete):

1. **Developer A**: User Story 1 (T011-T020) - Core tree visualization
2. **Developer B**: User Story 2 (T021-T031) - Start after US1 T013-T017 complete
3. **Developer C**: Prepare US3/US4 tests (T032-T046) while US1/US2 in progress

Integration happens at checkpoints where user stories merge.

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Test-First**: Per constitution, write tests BEFORE implementation
- **Each user story**: Should be independently completable and testable
- **Verify tests fail**: Before implementing (RED phase of TDD)
- **Commit frequency**: After each task or logical test-implementation pair
- **Stop at checkpoints**: Validate story independently before proceeding
- **Quality gates**: Must pass with ZERO errors/warnings (Constitution Principle XIX)
- **Reuse over create**: Use existing components (DetailPanel, node shapes, NODE_STYLES)
- **Avoid**: Vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Count Summary

- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 6 tasks (3 pairs of test+implementation)
- **Phase 3 (US1)**: 10 tasks (2 tests + 8 implementation)
- **Phase 4 (US2)**: 11 tasks (3 tests + 8 implementation)
- **Phase 5 (US3)**: 12 tasks (4 tests + 8 implementation)
- **Phase 6 (US4)**: 14 tasks (3 tests + 11 implementation)
- **Phase 7 (Polish)**: 14 tasks
- **Total**: 71 tasks

**MVP Scope** (US1+US2): 31 tasks (T001-T031)
**Full Feature**: 71 tasks (T001-T071)

**Parallel Opportunities**: 25+ tasks can run in parallel across phases

**Independent Tests**: Each user story checkpoint enables validation without subsequent stories
