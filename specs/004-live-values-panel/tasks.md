# Tasks: Live Values Panel

**Input**: Design documents from `/specs/004-live-values-panel/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Test-first development per constitution (Principle I). Tests written before implementation.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: Project initialization and type definitions

- [ ] T001 Copy type contracts from specs/004-live-values-panel/contracts/types.ts to src/types/panel.ts
- [ ] T002 [P] Verify D3.js already installed (d3-scale, d3-shape) from Feature 002
- [ ] T003 [P] Verify Biome, Stylelint, TypeScript configurations from constitution

---

## Phase 2: Foundational (Core Utilities & Infrastructure)

**Purpose**: Utilities and stores that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Write tests for valueSerializer in src/lib/__tests__/valueSerializer.spec.ts
- [ ] T005 Implement valueSerializer in src/lib/valueSerializer.ts (JSON serialization with depth limiting)
- [ ] T006 [P] Write tests for jsonValidator in src/lib/__tests__/jsonValidator.spec.ts
- [ ] T007 Implement jsonValidator in src/lib/jsonValidator.ts (JSON.parse with validation)
- [ ] T008 [P] Write tests for virtualScroller in src/lib/__tests__/virtualScroller.spec.ts
- [ ] T009 Implement virtualScroller in src/lib/virtualScroller.ts (virtual scroll calculations)
- [ ] T010 [P] Write tests for panelStore in src/stores/__tests__/panelStore.spec.ts
- [ ] T011 Implement panelStore in src/stores/panelStore.ts (localStorage persistence)
- [ ] T012 Create barrel exports in src/lib/index.ts
- [ ] T013 Create barrel exports in src/stores/index.ts

**Checkpoint**: Core infrastructure ready - user story implementation can begin

---

## Phase 3: User Story 1 - View All Signal Values (Priority: P1) 🎯 MVP

**Goal**: Display list of all tracked signals with real-time value updates

**Independent Test**: Create tracked signals and verify they appear in panel with correct names and values. Delivers immediate debugging value by showing all reactive state in one place.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T014 [P] [US1] Write tests for usePanelState in src/visualization/hooks/__tests__/usePanelState.spec.ts
- [ ] T015 [P] [US1] Write tests for useSignalList in src/visualization/hooks/__tests__/useSignalList.spec.ts
- [ ] T016 [P] [US1] Write tests for SignalRow in src/visualization/list/__tests__/SignalRow.spec.tsx
- [ ] T017 [P] [US1] Write tests for SignalList in src/visualization/list/__tests__/SignalList.spec.tsx
- [ ] T018 [P] [US1] Write tests for LiveValuesPanel in src/visualization/__tests__/LiveValuesPanel.spec.tsx

### Implementation for User Story 1

- [ ] T019 [P] [US1] Implement usePanelState in src/visualization/hooks/usePanelState.ts
- [ ] T020 [P] [US1] Implement useSignalList in src/visualization/hooks/useSignalList.ts (subscribe to tracker events, throttle updates per T082)
- [ ] T021 [US1] Implement SignalRow in src/visualization/list/SignalRow.tsx (displays name, value, selection)
- [ ] T022 [US1] Create SignalRow styles in src/visualization/list/SignalRow.module.css
- [ ] T023 [US1] Implement SignalList in src/visualization/list/SignalList.tsx (virtual scrolling container)
- [ ] T024 [US1] Create SignalList styles in src/visualization/list/SignalList.module.css
- [ ] T025 [US1] Implement LiveValuesPanel in src/visualization/LiveValuesPanel.tsx (main container)
- [ ] T026 [US1] Create LiveValuesPanel styles in src/visualization/LiveValuesPanel.module.css
- [ ] T027 [US1] Create barrel exports in src/visualization/hooks/index.ts
- [ ] T028 [US1] Create barrel exports in src/visualization/list/index.ts

**Checkpoint**: Signal list displays with real-time updates - MVP COMPLETE

---

## Phase 4: User Story 2 - Edit Signal Values (Priority: P1)

**Goal**: Enable inline value editing with JSON validation

**Independent Test**: Click signal value, enter new value, verify signal updates and dependent computations re-run. Delivers immediate value for testing edge cases.

### Tests for User Story 2

- [ ] T029 [P] [US2] Write tests for ValueEditor in src/visualization/list/__tests__/ValueEditor.spec.tsx
- [ ] T030 [US2] Update SignalRow tests to include edit flow in src/visualization/list/__tests__/SignalRow.spec.tsx

### Implementation for User Story 2

- [ ] T031 [US2] Implement ValueEditor in src/visualization/list/ValueEditor.tsx (inline JSON editor)
- [ ] T032 [US2] Create ValueEditor styles in src/visualization/list/ValueEditor.module.css
- [ ] T033 [US2] Update SignalRow to integrate ValueEditor (click to edit, save/cancel)
- [ ] T034 [US2] Update SignalRow styles for editing state
- [ ] T035 [US2] Add validation error display in ValueEditor
- [ ] T036 [US2] Add read-only indicator for memos in SignalRow

**Checkpoint**: Inline editing functional with validation

---

## Phase 5: User Story 3 - Search and Filter Signals (Priority: P2)

**Goal**: Add search and filter controls for finding signals in complex apps

**Independent Test**: Create many signals, enter search terms, verify only matching signals displayed. Delivers value for applications with complex state.

### Tests for User Story 3

- [ ] T037 [P] [US3] Write tests for SearchFilter in src/visualization/controls/__tests__/SearchFilter.spec.tsx
- [ ] T038 [US3] Update LiveValuesPanel tests to include filtering in src/visualization/__tests__/LiveValuesPanel.spec.tsx

### Implementation for User Story 3

- [ ] T039 [US3] Implement SearchFilter in src/visualization/controls/SearchFilter.tsx
- [ ] T040 [US3] Create SearchFilter styles in src/visualization/controls/SearchFilter.module.css
- [ ] T041 [US3] Update useSignalList to support filtering (search text, type filter, sort order)
- [ ] T041a [US3] Handle effect nodes in filter (display 'N/A' for value, indicate side effect type)
- [ ] T042 [US3] Integrate SearchFilter into LiveValuesPanel
- [ ] T043 [US3] Update LiveValuesPanel styles for search controls
- [ ] T044 [US3] Implement clear filters button
- [ ] T045 [US3] Add empty results state ("No signals match your search")

**Checkpoint**: Search and filter fully functional

---

## Phase 6: User Story 4 - View Value History (Priority: P2)

**Goal**: Visualize value changes over time with sparklines

**Independent Test**: Change signal values multiple times, verify sparkline chart shows history. Delivers value for understanding update patterns.

### Tests for User Story 4

- [ ] T046 [P] [US4] Write tests for useValueHistory in src/visualization/hooks/__tests__/useValueHistory.spec.ts
- [ ] T047 [P] [US4] Write tests for Sparkline in src/visualization/list/__tests__/Sparkline.spec.tsx
- [ ] T048 [US4] Update SignalRow tests to include sparkline in src/visualization/list/__tests__/SignalRow.spec.tsx

### Implementation for User Story 4

- [ ] T049 [US4] Implement useValueHistory in src/visualization/hooks/useValueHistory.ts
- [ ] T050 [US4] Implement Sparkline in src/visualization/list/Sparkline.tsx (D3 scales + SVG)
- [ ] T051 [US4] Create Sparkline styles in src/visualization/list/Sparkline.module.css
- [ ] T052 [US4] Update useSignalList to track value history (last 20 values)
- [ ] T053 [US4] Integrate Sparkline into SignalRow
- [ ] T054 [US4] Add sparkline tooltip on hover (timestamp + value)
- [ ] T055 [US4] Handle numeric conversion for non-numeric values (hash codes)
- [ ] T056 [US4] Clear history on signal disposal

**Checkpoint**: Sparkline visualization showing value trends

---

## Phase 7: User Story 5 - Sync with Graph Selection (Priority: P3)

**Goal**: Bidirectional selection highlighting between graph and panel

**Independent Test**: Select node in graph, verify it highlights in panel. Select signal in panel, verify it highlights in graph. Delivers improved navigation.

### Tests for User Story 5

- [ ] T057 [US5] Update LiveValuesPanel tests for selection sync in src/visualization/__tests__/LiveValuesPanel.spec.tsx
- [ ] T058 [US5] Update SignalRow tests for selection events in src/visualization/list/__tests__/SignalRow.spec.tsx

### Implementation for User Story 5

- [ ] T059 [US5] Add selectionState to panelStore in src/stores/panelStore.ts
- [ ] T060 [US5] Update useSignalList to manage selection state
- [ ] T061 [US5] Update LiveValuesPanel to subscribe to graph selection events
- [ ] T062 [US5] Update SignalRow to emit selection events on click
- [ ] T063 [US5] Add scroll-into-view behavior for selected signals
- [ ] T064 [US5] Update DependencyGraph to listen for panel selection events (existing file)
- [ ] T065 [US5] Add selection highlight styles to SignalRow
- [ ] T066 [US5] Implement clear selection on outside click

**Checkpoint**: Cross-view selection fully synchronized

---

## Phase 8: Panel Visibility & Toggle (All User Stories Complete)

**Goal**: Add panel toggle controls and keyboard shortcut

**Purpose**: Enable showing/hiding the panel and remembering state

### Tests for Panel Toggle

- [ ] T067 [P] Write tests for PanelToggle in src/visualization/controls/__tests__/PanelToggle.spec.tsx
- [ ] T068 Update App tests to include keyboard shortcut in src/__tests__/App.spec.tsx

### Implementation for Panel Toggle

- [ ] T069 Implement PanelToggle in src/visualization/controls/PanelToggle.tsx
- [ ] T070 Create PanelToggle styles in src/visualization/controls/PanelToggle.module.css
- [ ] T071 Create barrel exports in src/visualization/controls/index.ts
- [ ] T072 Integrate PanelToggle into App.tsx toolbar
- [ ] T073 Add keyboard shortcut listener (Ctrl+Shift+V / Cmd+Shift+V) in App.tsx
- [ ] T074 Update usePanelState to persist visibility to localStorage
- [ ] T075 Add panel resize handle to LiveValuesPanel
- [ ] T076 Implement drag-to-resize logic (200px min, 50% viewport max)
- [ ] T077 Persist panel width to localStorage
- [ ] T078 Update App styles for panel toggle button

**Checkpoint**: Panel fully controllable with toggle and keyboard shortcut

---

## Phase 9: Polish & Quality Gates

**Purpose**: Final quality checks and optimizations

- [ ] T079 [P] Add panel empty state message when no signals exist
- [ ] T080 [P] Add "[Unserializable]" display for unserializable values with error tooltip
- [ ] T081 [P] Add type change warning indicator when editing changes value type
- [ ] T082 [P] Implement 60fps throttling for rapid signal updates
- [ ] T083 [P] Add performance optimization for 200+ signals test
- [ ] T084 Run npm run lint:css (Stylelint - MUST pass with zero errors/warnings)
- [ ] T085 Run npm run check (Biome lint/format - MUST pass with zero errors/warnings)
- [ ] T086 Run npm run typecheck (TypeScript - MUST pass with zero errors)
- [ ] T087 Run npx vitest run --coverage --no-watch (verify 80%+ coverage)
- [ ] T088 [P] Update CLAUDE.md with new utilities and patterns
- [ ] T089 Final integration test: complete workflow (view → filter → edit → history → sync)
- [ ] T090a [P] Validate SC-001 & SC-002 (panel open <100ms, value updates <50ms)
- [ ] T090b [P] Validate SC-003 & SC-004 (edit updates <200ms, search results <50ms)
- [ ] T090c [P] Validate SC-005 & SC-006 (60fps scrolling with 200 signals, sparkline render <100ms)
- [ ] T090d [P] Validate SC-007 (cross-view selection sync <50ms)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (View): Independent, start first
  - US2 (Edit): Depends on US1 (extends SignalRow)
  - US3 (Search): Independent of US2, can run parallel
  - US4 (Sparkline): Independent of US2/US3, can run parallel
  - US5 (Selection): Depends on US1 (needs panel to exist)
- **Panel Toggle (Phase 8)**: Depends on US1 (needs panel to toggle)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - can start after Foundational
- **User Story 2 (P1)**: Depends on US1 (edits signals in list)
- **User Story 3 (P2)**: Independent - can run parallel with US2
- **User Story 4 (P2)**: Independent - can run parallel with US2/US3
- **User Story 5 (P3)**: Depends on US1 (needs panel UI to exist)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Hooks before components
- Components before integration
- Styles alongside components

---

## Parallel Opportunities

### Phase 2 (Foundational)
```
Parallel: T004, T006, T008, T010 (different test files)
Sequential: T005 after T004, T007 after T006, T009 after T008, T011 after T010
```

### Phase 3 (US1)
```
Parallel: T014, T015, T016, T017, T018 (all test files)
Parallel: T019, T020 (different hooks)
Parallel: T021, T025 (SignalRow, LiveValuesPanel - different files)
```

### Phase 4 (US2)
```
Parallel: T029, T030 (different test files)
Parallel: T031, T032 (ValueEditor component and styles - different files)
Sequential: T033 after T031 (SignalRow integration depends on ValueEditor completion)
```

### Phase 5 (US3)
```
Parallel: T037, T038 (different test files)
Parallel: T039, T041 (SearchFilter component, useSignalList hook)
```

### Phase 6 (US4)
```
Parallel: T046, T047, T048 (different test files)
Parallel: T049, T050 (different files: hook, component)
```

### Across User Stories
```
After Foundational complete:
- US2, US3, US4 can proceed in parallel (different components)
- US1 must complete before US2, US5
```

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write tests for usePanelState in src/visualization/hooks/__tests__/usePanelState.spec.ts"
Task: "Write tests for useSignalList in src/visualization/hooks/__tests__/useSignalList.spec.ts"
Task: "Write tests for SignalRow in src/visualization/list/__tests__/SignalRow.spec.tsx"
Task: "Write tests for SignalList in src/visualization/list/__tests__/SignalList.spec.tsx"
Task: "Write tests for LiveValuesPanel in src/visualization/__tests__/LiveValuesPanel.spec.tsx"

# Launch parallel implementation tasks:
Task: "Implement usePanelState in src/visualization/hooks/usePanelState.ts"
Task: "Implement useSignalList in src/visualization/hooks/useSignalList.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (View Signals)
4. **STOP and VALIDATE**: Test signal list with real-time updates
5. Demo MVP: Basic panel showing all signals

### Incremental Delivery

1. Setup + Foundational → Core infrastructure ready
2. Add US1 → Signal list visible → Demo (MVP!)
3. Add US2 → Inline editing works → Demo enhanced debugging
4. Add US3 → Search/filter added → Demo scalability
5. Add US4 → Sparklines visible → Demo value trends
6. Add US5 → Selection sync works → Demo integration
7. Add Phase 8 → Toggle controls → Demo UX polish
8. Polish → Performance verified, quality gates pass

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (blocking for US2, US5)
3. Once US1 complete:
   - Developer A: User Story 2 (edit)
   - Developer B: User Story 3 (search) in parallel
   - Developer C: User Story 4 (sparklines) in parallel
4. Once US1 complete:
   - Developer D: User Story 5 (selection sync)
5. All converge on Panel Toggle and Polish

---

## Notes

- Constitution requires test-first: write tests before implementation
- All tasks include exact file paths
- [P] tasks can run in parallel (different files)
- Each checkpoint verifies independent functionality
- Quality gates (T084-T086) are NON-NEGOTIABLE per constitution
- Coverage threshold: 80% minimum (T087)
