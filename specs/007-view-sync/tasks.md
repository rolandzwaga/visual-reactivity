# Tasks: View Synchronization and Cross-View Selection

**Input**: Design documents from `/specs/007-view-sync/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: This feature follows test-first development (TDD). ALL tests must be written FIRST and FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (co-located with source)
- All paths assume TypeScript + SolidJS project structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type system and core utilities needed by all user stories

- [ ] T001 [P] Create selection types in src/types/selection.ts (ViewType, SelectionState, SelectionEvent, SelectionEventType, SelectionAction, KeyboardNavigationContext, ScrollTarget)
- [ ] T002 [P] Create selection utilities in src/lib/selectionUtils.ts (validation helpers, Set operations, node ID validation)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core selection store that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational Layer

> **CONSTITUTION REQUIREMENT (Principle XXI)**: Before writing ANY test code, you MUST:
> 1. Read `specs/TESTING-GUIDE.md` to understand testing patterns
> 2. Use centralized helpers from `src/__tests__/helpers`
> 3. Follow SolidJS testing patterns (NOT React patterns)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T003 **Read `specs/TESTING-GUIDE.md`** - Understand testing patterns and helpers (REQUIRED before any test code)
- [ ] T004 [P] Unit test: createSelectionStore initialization in src/stores/__tests__/selectionStore.spec.ts (test default state: empty Set, null hover)
- [ ] T005 [P] Unit test: single selection (selectNode with multiSelect=false) replaces existing selection
- [ ] T006 [P] Unit test: multi-selection (selectNode with multiSelect=true) adds to existing selection
- [ ] T007 [P] Unit test: toggleNodeSelection adds if not selected, removes if selected
- [ ] T008 [P] Unit test: clearSelection resets to empty state
- [ ] T009 [P] Unit test: setHoveredNode updates hover state
- [ ] T010 [P] Unit test: isNodeSelected returns correct boolean for O(1) lookup
- [ ] T011 [P] Unit test: immutable Set updates (verify new Set reference on each change)
- [ ] T012 [P] Unit test: selection event emission (subscribe callback receives SelectionEvent with correct delta)
- [ ] T013 [P] Unit test: multiple subscribers all receive events
- [ ] T014 [P] Unit test: unsubscribe stops receiving events
- [ ] T015 [P] Unit test: batch() groups multiple signal updates into single effect run
- [ ] T016 [P] Unit test: createSelector reduces updates from O(n) to O(2) for list selections

### Implementation for Foundational Layer

- [ ] T017 Implement createSelectionStore in src/stores/selectionStore.ts (using createSignal for selectedNodeIds Set, hoveredNodeId, selectionSource, lastSelectionTime)
- [ ] T018 Add selectNode action (immutable Set update with batch())
- [ ] T019 Add deselectNode action (immutable Set removal)
- [ ] T020 Add toggleNodeSelection action (add if absent, remove if present)
- [ ] T021 Add clearSelection action (reset to empty Set)
- [ ] T022 Add setHoveredNode action
- [ ] T023 Add isNodeSelected getter (O(1) Set.has() lookup)
- [ ] T024 Add selectionCount computed signal (createMemo from selectedNodeIds.size)
- [ ] T025 Add subscribe/unsubscribe mechanism (Map of callbacks, emit SelectionEvent on changes)
- [ ] T026 Add createSelector for O(2) list item selection checks
- [ ] T027 Integrate with ReactivityTracker for automatic disposed node cleanup (subscribe to disposal events)

**Checkpoint**: Foundation ready - all tests passing, selection store fully functional

---

## Phase 3: User Story 1 - Select Node in Any View to Highlight Across All Views (Priority: P1) 🎯 MVP

**Goal**: Enable single-selection cross-view synchronization. Clicking any node in any view highlights it in all other views instantly.

**Independent Test**: Select a signal node in dependency graph → verify highlighted in ownership tree, timeline swimlane highlighted, values panel entry highlighted and scrolled into view.

### Tests for User Story 1

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T003) before writing tests

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T028 [P] [US1] Hook test: useSelectionSync returns isNodeSelected and handleNodeClick in src/visualization/hooks/__tests__/useSelectionSync.spec.ts
- [ ] T029 [P] [US1] Hook test: handleNodeClick with no modifier selects node (single-select)
- [ ] T030 [P] [US1] Hook test: handleNodeClick calls selection.selectNode with correct viewType source
- [ ] T031 [P] [US1] Component test: DependencyGraph node click triggers selection in src/visualization/__tests__/DependencyGraph.spec.tsx
- [ ] T032 [P] [US1] Component test: DependencyGraph applies stroke-width=3 when node is selected
- [ ] T033 [P] [US1] Component test: OwnershipTree node click triggers selection in src/visualization/__tests__/OwnershipTree.spec.tsx
- [ ] T034 [P] [US1] Component test: OwnershipTree highlights selected node with .selected CSS class and expands parent nodes to make selected node visible (FR-010)
- [ ] T035 [P] [US1] Component test: TimelineView swimlane click triggers selection in src/visualization/__tests__/TimelineView.spec.tsx
- [ ] T036 [P] [US1] Component test: TimelineView highlights selected node's swimlane
- [ ] T037 [P] [US1] Component test: LiveValuesPanel row click triggers selection in src/visualization/__tests__/LiveValuesPanel.spec.tsx
- [ ] T038 [P] [US1] Component test: LiveValuesPanel highlights selected row with .selected CSS class
- [ ] T039 [P] [US1] Integration test: Select in DependencyGraph → verify highlight in OwnershipTree, TimelineView, LiveValuesPanel (cross-view sync)
- [ ] T040 [P] [US1] Integration test: Select different node → previous selection cleared, new node highlighted across all views

### Implementation for User Story 1

- [ ] T041 [US1] Implement useSelectionSync hook in src/visualization/hooks/useSelectionSync.ts (exposes isNodeSelected, handleNodeClick with Ctrl/Cmd detection, highlightedNodeIds accessor)
- [ ] T042 [P] [US1] Add selection prop to DependencyGraph component in src/visualization/DependencyGraph.tsx (integrate useSelectionSync hook)
- [ ] T043 [US1] Add node click handler to DependencyGraph (call sync.handleNodeClick on circle click)
- [ ] T044 [US1] Add selection highlighting to DependencyGraph nodes (strokeWidth increases to 3 when isNodeSelected returns true)
- [ ] T045 [US1] Add createEffect to DependencyGraph for reactive highlighting updates (re-apply stroke-width when selectedNodeIds changes)
- [ ] T046 [P] [US1] Add selection prop to OwnershipTree component in src/visualization/OwnershipTree.tsx (integrate useSelectionSync hook)
- [ ] T047 [US1] Add node click handler to OwnershipTree (call sync.handleNodeClick on g element click)
- [ ] T048 [US1] Add selection highlighting to OwnershipTree nodes (apply .selected CSS class when isNodeSelected returns true)
- [ ] T049 [US1] Add createEffect to OwnershipTree for reactive highlighting updates and auto-expand parent nodes when child is selected (FR-010)
- [ ] T050 [P] [US1] Add selection prop to TimelineView component in src/visualization/TimelineView.tsx (integrate useSelectionSync hook)
- [ ] T051 [US1] Add swimlane click handler to TimelineView (call sync.handleNodeClick on Swimlane click)
- [ ] T052 [US1] Add swimlane highlighting to TimelineView (pass isSelected prop to Swimlane component)
- [ ] T053 [US1] Update Swimlane component to accept and render isSelected state (apply highlight background color)
- [ ] T054 [P] [US1] Add selection prop to LiveValuesPanel component in src/visualization/LiveValuesPanel.tsx (integrate useSelectionSync hook)
- [ ] T055 [US1] Add row click handler to LiveValuesPanel (call sync.handleNodeClick on SignalRow click)
- [ ] T056 [US1] Add row highlighting to SignalRow component (apply .selected CSS class when isSelected prop is true)
- [ ] T057 [US1] Update SignalList to pass isSelected prop to each SignalRow
- [ ] T058 [US1] Lift selection store to App.tsx (create single selectionStore instance, pass to all 4 views as prop)

**Checkpoint**: User Story 1 fully functional - single-selection works across all 4 views with instant synchronization

---

## Phase 4: User Story 2 - Multi-Select Nodes for Comparison Across Views (Priority: P2)

**Goal**: Enable multi-selection with Ctrl/Cmd+click. Multiple nodes can be selected simultaneously and all appear highlighted across all views.

**Independent Test**: Ctrl+click two nodes in dependency graph → verify both highlighted in all views, edges between them emphasized, both timeline swimlanes highlighted.

### Tests for User Story 2

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T003) before writing tests

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T059 [P] [US2] Hook test: handleNodeClick with Ctrl key adds to selection (multi-select) in src/visualization/hooks/__tests__/useSelectionSync.spec.ts
- [ ] T060 [P] [US2] Hook test: handleNodeClick with Cmd key (metaKey) adds to selection on Mac
- [ ] T061 [P] [US2] Hook test: Ctrl+click on already selected node removes it (toggle)
- [ ] T062 [P] [US2] Component test: DependencyGraph Ctrl+click adds second node without clearing first
- [ ] T063 [P] [US2] Component test: DependencyGraph emphasizes edges between selected nodes in src/visualization/__tests__/DependencyGraph.spec.tsx
- [ ] T064 [P] [US2] Component test: TimelineView highlights multiple swimlanes when multiple nodes selected in src/visualization/__tests__/TimelineView.spec.tsx
- [ ] T065 [P] [US2] Component test: LiveValuesPanel highlights multiple rows when multiple nodes selected in src/visualization/__tests__/LiveValuesPanel.spec.tsx
- [ ] T066 [P] [US2] Integration test: Click node → Ctrl+click second node → both highlighted across all views
- [ ] T067 [P] [US2] Integration test: Ctrl+click selected node → node deselected, other selections remain
- [ ] T068 [P] [US2] Integration test: Click without modifier clears all, selects only clicked node

### Implementation for User Story 2

- [ ] T069 [US2] Update useSelectionSync handleNodeClick to detect Ctrl/Cmd modifier keys (event.ctrlKey || event.metaKey)
- [ ] T070 [US2] Pass multiSelect=true to selection.selectNode when Ctrl/Cmd held
- [ ] T071 [US2] Add edge emphasis logic to DependencyGraph (createMemo to compute connectedEdges from selectedNodeIds)
- [ ] T072 [US2] Apply emphasized stroke-width to edges connecting selected nodes in DependencyGraph
- [ ] T073 [US2] Update TimelineView to highlight all swimlanes for selected nodes (map selectedNodeIds to swimlane IDs)
- [ ] T074 [US2] Update LiveValuesPanel to highlight multiple rows (SignalList iterates selectedNodeIds, passes isSelected to each row)

**Checkpoint**: User Story 2 fully functional - multi-selection works, edge emphasis works, all views show multiple selections

---

## Phase 5: User Story 3 - Keyboard Navigation for Selection (Priority: P3)

**Goal**: Enable keyboard navigation with arrow keys (Left/Right for graph, Up/Down for tree) and Escape to clear.

**Independent Test**: Select node → press Right arrow → selection moves to observer node, all views update.

### Tests for User Story 3

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T003) before writing tests

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T075 [P] [US3] Hook test: useKeyboardNav returns handleKeyDown and navContext in src/visualization/hooks/__tests__/useKeyboardNav.spec.ts
- [ ] T076 [P] [US3] Hook test: Right arrow calls navigateToNextObserver when activeView is 'graph'
- [ ] T077 [P] [US3] Hook test: Left arrow calls navigateToNextSource when activeView is 'graph'
- [ ] T078 [P] [US3] Hook test: Down arrow calls navigateToFirstChild when activeView is 'tree'
- [ ] T079 [P] [US3] Hook test: Up arrow calls navigateToOwner when activeView is 'tree'
- [ ] T080 [P] [US3] Hook test: Escape key calls clearSelection
- [ ] T081 [P] [US3] Store test: navigateToNextObserver returns first observer ID in src/stores/__tests__/selectionStore.spec.ts
- [ ] T082 [P] [US3] Store test: navigateToNextSource returns first source ID
- [ ] T083 [P] [US3] Store test: navigateToOwner returns owner ID from ReactiveNode
- [ ] T084 [P] [US3] Store test: navigateToFirstChild returns first owned child ID
- [ ] T085 [P] [US3] Store test: navigation methods return null if no neighbors/parent/children
- [ ] T086 [P] [US3] Component test: DependencyGraph onKeyDown triggers navigation in src/visualization/__tests__/DependencyGraph.spec.tsx
- [ ] T087 [P] [US3] Component test: OwnershipTree onKeyDown triggers navigation in src/visualization/__tests__/OwnershipTree.spec.tsx
- [ ] T088 [P] [US3] Integration test: Select node → Right arrow → new node selected, all views updated
- [ ] T089 [P] [US3] Integration test: Escape clears selection across all views

### Implementation for User Story 3

- [ ] T090 [US3] Add keyboard navigation methods to selectionStore in src/stores/selectionStore.ts (navigateToNextObserver, navigateToNextSource, navigateToOwner, navigateToFirstChild)
- [ ] T091 [US3] Implement navigateToNextObserver (get current node from tracker, return first observer ID or null)
- [ ] T092 [US3] Implement navigateToNextSource (get current node from tracker, return first source ID or null)
- [ ] T093 [US3] Implement navigateToOwner (get current node from tracker, return owner ID or null)
- [ ] T094 [US3] Implement navigateToFirstChild (get current node from tracker, return first owned[0] ID or null)
- [ ] T095 [US3] Implement useKeyboardNav hook in src/visualization/hooks/useKeyboardNav.ts (exposes handleKeyDown and navContext accessor)
- [ ] T096 [US3] Add keyboard event handler to useKeyboardNav (switch on event.key: ArrowRight/Left/Up/Down/Escape)
- [ ] T097 [US3] Map arrow keys to navigation methods based on activeView ('graph' uses observer/source, 'tree' uses owner/child)
- [ ] T098 [US3] Call selection.selectNode with navigated node ID (single-select)
- [ ] T099 [US3] Add keyboard navigation to DependencyGraph (integrate useKeyboardNav hook, attach handleKeyDown to svg element with tabindex=0)
- [ ] T100 [US3] Add keyboard navigation to OwnershipTree (integrate useKeyboardNav hook, attach handleKeyDown to svg element with tabindex=0)

**Checkpoint**: User Story 3 fully functional - keyboard navigation works in graph and tree, Escape clears selection

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that enhance all user stories

### Scroll-to-Selected Feature

- [ ] T101 [P] Add scroll-to-selected for LiveValuesPanel (createEffect watches selectedNodeIds, calls scrollIntoView on selected row element)
- [ ] T102 [P] Add scroll-to-selected for OwnershipTree (createEffect watches selectedNodeIds, queries data-node-id attribute, calls scrollIntoView with behavior: smooth, block: center)
- [ ] T103 [P] Add scroll-to-selected for DependencyGraph using D3 zoom (createEffect watches selectedNodeIds, calculates node center, applies zoom.transform with 300ms transition)
- [ ] T104 [P] Add scrollend detection to prevent conflict with user scrolling (add isScrolling flag, setTimeout pattern with 150ms debounce)

### Performance Optimization

- [ ] T105 [P] Verify createSelector usage in LiveValuesPanel for O(2) updates (ensure isSelected uses createSelector, not direct comparison)
- [ ] T106 [P] Add batch() wrapper to multi-store updates in selectionStore (group selectedNodeIds + selectionSource + lastSelectionTime updates)
- [ ] T107 [P] Add createMemo for connectedEdges in DependencyGraph (cache edge filtering computation)

### Edge Case Handling

- [ ] T108 [P] Add disposed node visual indicator to DependencyGraph (apply .disposed CSS class, grayscale filter)
- [ ] T109 [P] Add disposed node visual indicator to OwnershipTree (apply .disposed CSS class)
- [ ] T110 [P] Handle off-screen node selection with smooth scroll (integrate scroll-to-selected from T101-T103)
- [ ] T111 [P] Add rapid selection debouncing (verify batch() prevents UI thrashing, test with 100+ rapid arrow key presses)
- [ ] T111a [P] Integration test: Selection persistence across view hide/show (hide TimelineView → select node → show TimelineView → verify selection restored, FR-015)

### Documentation & Validation

- [ ] T112 Update quickstart.md examples with real code from implementation (replace placeholders with actual file paths and working examples)
- [ ] T113 Run all quality gates (npm run lint:css, npm run check, npm run typecheck) and fix any violations
- [ ] T114 Run full test suite (npm test) and verify 100% passing (zero failing tests - BLOCKER)
- [ ] T115 Performance validation: Measure selection-to-highlight time (target: <100ms across all views)
- [ ] T116 Performance validation: Test multi-selection with 10 nodes (target: no visible lag or frame drops)
- [ ] T117 Performance validation: Test rapid selection changes (100+ arrow key presses, target: no UI freezing)
- [ ] T118 Edge case validation: Verify all 5 edge cases from spec.md are handled correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Builds on US1 but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Test-First Development)
- Hook tests before hook implementation
- Component tests before component modifications
- Integration tests verify cross-view synchronization
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T002) marked [P] can run in parallel
- All Foundational unit tests (T004-T016) can run in parallel after T003
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests within a user story marked [P] can run in parallel
- All component modifications marked [P] within a story can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all hook/component tests for User Story 1 together:
Task: "Hook test: useSelectionSync returns isNodeSelected and handleNodeClick"
Task: "Component test: DependencyGraph node click triggers selection"
Task: "Component test: OwnershipTree node click triggers selection"
Task: "Component test: TimelineView swimlane click triggers selection"
Task: "Component test: LiveValuesPanel row click triggers selection"

# Launch all component modifications for User Story 1 together:
Task: "Add selection prop to DependencyGraph"
Task: "Add selection prop to OwnershipTree"
Task: "Add selection prop to TimelineView"
Task: "Add selection prop to LiveValuesPanel"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T027) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T028-T058)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Run quality gates and verify all tests pass
6. Deploy/demo if ready - MVP complete!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (multi-selection)
4. Add User Story 3 → Test independently → Deploy/Demo (keyboard navigation)
5. Add Polish (Phase 6) → Final optimizations and edge cases
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (tests → implementation)
   - Developer B: User Story 2 (tests → implementation)
   - Developer C: User Story 3 (tests → implementation)
3. Stories complete and integrate independently
4. Team collaborates on Polish phase

---

## Critical Performance Patterns

Based on research findings, these patterns are ESSENTIAL:

1. **createSelector for list selections** (T026, T105)
   - Reduces updates from O(n) to O(2)
   - MUST use in LiveValuesPanel: `const isSelected = createSelector(selectedId)`
   
2. **batch() for multi-store updates** (T106)
   - Groups multiple signal updates
   - All effects run once after batch completes
   
3. **Immutable Set updates** (T011, throughout)
   - Always `new Set(prev)` for SolidJS reactivity
   - Never mutate existing Set
   
4. **createMemo for expensive derivations** (T107)
   - Cache filtered lists, edge computations
   - Only recalculate when dependencies change

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (RED → GREEN → REFACTOR)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution requirements enforced: test-first, zero failing tests, quality gates
