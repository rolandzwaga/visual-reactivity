# Tasks: Timeline Integration & Event Replay System

**Input**: Design documents from `/specs/009-timeline-playback/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Test tasks included per Constitution Principle I (Test-First Development)

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US7)
- Include exact file paths in descriptions

## Path Conventions

Single project structure (from plan.md):
- `src/` - All source code
- Tests co-located in `src/__tests__/` directories

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and test infrastructure initialization

- [X] T001 [P] Create replay types in src/types/replay.ts (ReplayState, Recording, RecordingMetadata, HistoricalGraphState, PlaybackControlState, ExportOptions)
- [X] T002 [P] Export replay types from src/types/index.ts
- [X] T003 [P] Create IndexedDB types in src/types/storage.ts (DBSchema, ValidationError)
- [X] T004 **Commit type definitions** (Constitution Principle XXII - REQUIRED)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational Infrastructure ⚠️

> **CONSTITUTION REQUIREMENT (Principle XXI)**: Before writing ANY test code, you MUST:
> 1. Read `specs/TESTING-GUIDE.md` to understand testing patterns
> 2. Use centralized helpers from `src/__tests__/helpers`
> 3. Follow SolidJS testing patterns (NOT React patterns)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T005 **Read `specs/TESTING-GUIDE.md`** - Understand testing patterns and helpers (REQUIRED before any test code)
- [X] T006 [P] Unit test for ReplayStore in src/stores/__tests__/replayStore.spec.ts (test state transitions, cursor navigation)
- [X] T007 [P] Unit test for RecordingStore in src/stores/__tests__/recordingStore.spec.ts (test save/load/delete/validation)
- [X] T008 [P] Unit test for IndexedDB utilities in src/lib/__tests__/indexedDB.spec.ts (test open/read/write/delete)
- [X] T009 [P] Unit test for historicalState in src/lib/__tests__/historicalState.spec.ts (test reconstruction algorithm, snapshot caching)
- [X] T010 [P] Unit test for validation in src/lib/__tests__/validation.spec.ts (test name validation rules)
- [X] T011 **Commit foundational tests** (Constitution Principle XXII - REQUIRED)

### Implementation for Foundational Infrastructure

- [X] T012 [P] Implement IndexedDB utilities in src/lib/indexedDB.ts (openDB, saveRecording, loadRecording, deleteRecording, listRecordings)
- [X] T013 [P] Implement validation in src/lib/validation.ts (validateRecordingName, pattern: /^[a-zA-Z0-9 _-]{1,100}$/)
- [X] T014 Implement RecordingStore in src/stores/recordingStore.ts (uses IndexedDB utils, implements contracts/RecordingStore.ts API)
- [X] T015 Implement historicalState in src/lib/historicalState.ts (createStateReconstructor with LRU cache, implements contracts/HistoricalState.ts API)
- [X] T016 Implement ReplayStore in src/stores/replayStore.ts (state, setCursor, clearCursor, step methods, implements contracts/ReplayStore.ts API)
- [X] T017 Create useReplayState hook in src/visualization/hooks/useReplayState.ts (subscribes to ReplayStore)
- [X] T018 Run `npm run check && npm run typecheck` - Fix any errors
- [X] T019 Run `npx vitest run --no-watch` - Verify all foundational tests pass
- [X] T020 **Commit foundational infrastructure** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Access Timeline View from Main App (Priority: P1) 🎯 MVP

**Goal**: Integrate Timeline component into App.tsx navigation, enable view switching between Graph/Tree/Timeline

**Independent Test**: Click Timeline button, verify timeline renders with swimlanes/events/controls, switch back to Graph/Tree, verify state preserved

### Tests for User Story 1 ⚠️

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T005) before writing tests

- [X] T021 [P] [US1] Component test for App.tsx timeline integration in src/__tests__/App.spec.tsx (test view mode switching, store creation)
- [~] T022 [P] [US1] Integration test for view state preservation in src/visualization/__tests__/viewPersistence.spec.ts (test scroll/cursor/filter preservation)
- [X] T023 [US1] **Commit User Story 1 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 1

- [X] T024 [US1] Modify App.tsx: Add "timeline" to ViewMode type, create replayStore and recordingStore instances
- [X] T025 [US1] Modify App.tsx: Add Timeline navigation button, conditionally render TimelineView when viewMode === "timeline"
- [X] T026 [US1] Modify App.tsx: Pass replayStore to DependencyGraph, OwnershipTree, and TimelineView props
- [X] T027 [US1] Modify App.tsx: Pass recordingStore to TimelineView props
- [~] T028 [US1] Update TimelineView.tsx: Accept replayStore and recordingStore props, integrate with existing playback functionality
- [X] T029 [US1] Run `npx vitest run --no-watch` - Verify User Story 1 tests pass
- [X] T030 [US1] Run `npm run check && npm run typecheck` - Fix any errors
- [X] T031 [US1] **Commit completed User Story 1 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: At this point, Timeline is accessible via navigation and integrates with existing views

---

## Phase 4: User Story 2 - Step Through Events One at a Time (Priority: P1)

**Goal**: Add keyboard shortcuts (arrow keys) and UI buttons for single-step navigation through events

**Independent Test**: Press right arrow, verify cursor advances one event; press left arrow, verify cursor moves back; verify filters respected

### Tests for User Story 2 ⚠️

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T005) before writing tests

- [X] T032 [P] [US2] Unit test for useKeyboardNavigation hook in src/visualization/hooks/__tests__/useKeyboardNavigation.spec.ts (test arrow key handlers, filter respect)
- [X] T033 [P] [US2] Component test for PlaybackControls step buttons in src/visualization/timeline/__tests__/PlaybackControls.spec.ts (test step forward/back buttons)
- [X] T034 [P] [US2] Integration test for animation interruption in src/visualization/__tests__/animationInterruption.spec.ts (test rapid stepping cancels animations)
- [X] T035 [US2] **Commit User Story 2 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 2

- [X] T036 [P] [US2] Implement ReplayStore.stepForward() in src/stores/replayStore.ts (find next event after cursor, respect filters, return new timestamp or null)
- [X] T037 [P] [US2] Implement ReplayStore.stepBackward() in src/stores/replayStore.ts (find previous event before cursor, respect filters, return new timestamp or null)
- [X] T038 [P] [US2] Implement ReplayStore.jumpToStart() in src/stores/replayStore.ts (set cursor to first event timestamp)
- [X] T039 [P] [US2] Implement ReplayStore.jumpToEnd() in src/stores/replayStore.ts (set cursor to last event timestamp)
- [X] T040 [US2] Create useKeyboardNavigation hook in src/visualization/hooks/useKeyboardNavigation.ts (add keydown listener, call replayStore step methods on arrow keys)
- [X] T041 [US2] Modify PlaybackControls.tsx: Add step forward/backward buttons, wire to replayStore.stepForward/stepBackward
- [X] T042 [US2] Modify PlaybackControls.tsx: Add jump to start/end buttons, wire to replayStore.jumpToStart/jumpToEnd
- [X] T043 [US2] Integrate useKeyboardNavigation in TimelineView.tsx (call hook with replayStore and events)
- [X] T044 [US2] Run `npx vitest run --no-watch` - Verify User Story 2 tests pass
- [X] T045 [US2] Run `npm run check && npm run typecheck` - Fix any errors
- [X] T046 [US2] **Commit completed User Story 2 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: At this point, users can step through events one at a time via keyboard or UI controls

---

## Phase 5: User Story 3 - Replay Graph State at Historical Time Points (Priority: P1)

**Goal**: Subscribe Graph/Tree views to replay state, reconstruct historical state at cursor position, animate transitions

**Independent Test**: Position cursor on timeline, switch to Graph, verify only historical nodes/values displayed; step through events, verify animated transitions

### Tests for User Story 3 ⚠️

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T005) before writing tests

- [ ] T047 [P] [US3] Unit test for useHistoricalGraph hook in src/visualization/hooks/__tests__/useHistoricalGraph.spec.ts (test state reconstruction at various timestamps)
- [ ] T048 [P] [US3] Component test for DependencyGraph replay mode in src/visualization/__tests__/DependencyGraph.spec.tsx (test historical rendering, node visibility)
- [ ] T049 [P] [US3] Component test for OwnershipTree replay mode in src/visualization/__tests__/OwnershipTree.spec.tsx (test historical tree structure)
- [ ] T050 [P] [US3] Component test for DetailPanel historical values in src/visualization/__tests__/DetailPanel.spec.tsx (test past value display)
- [ ] T051 [US3] **Commit User Story 3 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 3

- [ ] T052 [P] [US3] Create useHistoricalGraph hook in src/visualization/hooks/useHistoricalGraph.ts (calls historicalState.reconstructAt with cursor timestamp)
- [ ] T053 [P] [US3] Create animation utilities in src/lib/animationUtils.ts (animateGraphTransition with D3 transition.interrupt(), 300ms duration)
- [ ] T054 [US3] Modify DependencyGraph.tsx: Subscribe to replayStore via useReplayState(), use useHistoricalGraph when replay active
- [ ] T055 [US3] Modify DependencyGraph.tsx: Implement graph data transformation from HistoricalGraphState to D3 format
- [ ] T056 [US3] Modify DependencyGraph.tsx: Integrate animateGraphTransition() for state changes, ensure interruption support (FR-019a)
- [ ] T057 [US3] Modify OwnershipTree.tsx: Subscribe to replayStore via useReplayState(), reconstruct historical tree when replay active
- [ ] T058 [US3] Modify OwnershipTree.tsx: Hide disposed nodes, show only nodes that existed at cursor timestamp
- [ ] T059 [US3] Modify DetailPanel.tsx: Accept replayStore prop, display historical node values when replay mode active
- [ ] T060 [US3] Modify DetailPanel.tsx: Show "Historical Value at [timestamp]" label when in replay mode
- [ ] T061 [US3] Run `npx vitest run --no-watch` - Verify User Story 3 tests pass
- [ ] T062 [US3] Run `npm run check && npm run typecheck` - Fix any errors
- [ ] T063 [US3] **Commit completed User Story 3 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: At this point, Graph and Tree views correctly display historical state during replay

---

## Phase 6: User Story 4 - Save and Load Event Recordings (Priority: P2)

**Goal**: Create UI for saving/loading/deleting recordings with name validation and IndexedDB persistence

**Independent Test**: Save recording with name, refresh page, verify recording persists and loads correctly with all events intact

### Tests for User Story 4 ⚠️

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T005) before writing tests

- [ ] T064 [P] [US4] Component test for RecordingManager in src/visualization/timeline/__tests__/RecordingManager.spec.tsx (test save/load/delete UI)
- [ ] T065 [P] [US4] Integration test for recording persistence in src/stores/__tests__/recordingPersistence.spec.ts (test save→refresh→load cycle)
- [ ] T066 [P] [US4] Integration test for name validation UI in src/visualization/timeline/__tests__/nameValidation.spec.tsx (test error messages for invalid/duplicate names)
- [ ] T067 [US4] **Commit User Story 4 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 4

- [ ] T068 [P] [US4] Create RecordingManager component in src/visualization/timeline/RecordingManager.tsx (list recordings, save/load/delete buttons)
- [ ] T069 [P] [US4] Create RecordingManager styles in src/visualization/timeline/RecordingManager.module.css
- [ ] T070 [US4] Implement RecordingManager save flow: prompt for name, validate with recordingStore.validateName(), check exists(), call recordingStore.save()
- [ ] T071 [US4] Implement RecordingManager load flow: display recording list with metadata (name, date, event count), handle click to load
- [ ] T072 [US4] Implement RecordingManager delete flow: show confirmation dialog, call recordingStore.delete(), refresh list
- [ ] T073 [US4] Implement RecordingManager error handling: display validation errors (empty, too long, invalid chars, duplicate) per FR-022b
- [ ] T074 [US4] Integrate RecordingManager into TimelineView.tsx: render above timeline, pass recordingStore prop
- [ ] T075 [US4] Wire RecordingManager load to replayStore: on load, call replayStore.loadRecording(recording)
- [ ] T076 [US4] Wire RecordingManager "View Live" button to replayStore.unloadRecording()
- [ ] T077 [US4] Run `npx vitest run --no-watch` - Verify User Story 4 tests pass
- [ ] T078 [US4] Run `npm run check && npm run lint:css` - Fix any errors
- [ ] T079 [US4] **Commit completed User Story 4 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: At this point, users can save recordings and reload them across sessions

---

## Phase 7: User Story 5 - Export and Import Recordings (Priority: P2)

**Goal**: Add export/import functionality with JSON serialization, version compatibility, and file operations

**Independent Test**: Export recording to JSON, import on different browser, verify all events/metadata preserved

### Tests for User Story 5 ⚠️

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T005) before writing tests

- [ ] T080 [P] [US5] Unit test for recordingSerializer in src/lib/__tests__/recordingSerializer.spec.ts (test toJSON/fromJSON, version compatibility, value truncation)
- [ ] T081 [P] [US5] Component test for ExportImportControls in src/visualization/timeline/__tests__/ExportImportControls.spec.tsx (test export/import buttons, file operations)
- [ ] T082 [P] [US5] Integration test for export options in src/lib/__tests__/exportOptions.spec.ts (test full/truncated/structure-only modes)
- [ ] T083 [US5] **Commit User Story 5 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 5

- [ ] T084 [P] [US5] Implement recordingSerializer in src/lib/recordingSerializer.ts (exportRecording, importRecording, validateFormat, version "1.0.0")
- [ ] T085 [P] [US5] Implement value truncation in recordingSerializer: apply ExportOptions, truncate values >10KB, add "[Truncated: X bytes]" markers
- [ ] T086 [P] [US5] Implement format validation in recordingSerializer: check formatVersion field, warn on mismatch, validate schema
- [ ] T087 [US5] Create ExportImportControls component in src/visualization/timeline/ExportImportControls.tsx (Export/Import buttons, file picker)
- [ ] T088 [US5] Create ExportImportControls styles in src/visualization/timeline/ExportImportControls.module.css
- [ ] T089 [US5] Implement export flow: call recordingSerializer.exportRecording(), create Blob, trigger download with recording name
- [ ] T090 [US5] Implement import flow: file picker, read file.text(), call recordingSerializer.importRecording(), save to RecordingStore
- [ ] T091 [US5] Implement import error handling: display user-friendly messages for invalid JSON, version mismatch, schema errors (FR-032)
- [ ] T092 [US5] Add export options UI to ExportImportControls: radio buttons for full/truncated/structure-only, default to truncated
- [ ] T093 [US5] Integrate ExportImportControls into RecordingManager: render alongside recording list
- [ ] T094 [US5] Run `npx vitest run --no-watch` - Verify User Story 5 tests pass
- [ ] T095 [US5] Run `npm run check && npm run typecheck` - Fix any errors
- [ ] T096 [US5] **Commit completed User Story 5 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: At this point, users can export and import recordings for collaboration/archival

---

## Phase 8: User Story 6 - Enhanced Playback Controls (Priority: P3)

**Goal**: Add loop mode, jump controls, and speed preset buttons to playback UI

**Independent Test**: Enable loop, verify playback restarts at end; click jump to start/end, verify cursor moves; click speed presets, verify playback speed changes

### Tests for User Story 6 ⚠️

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T005) before writing tests

- [ ] T097 [P] [US6] Component test for loop mode in src/visualization/timeline/__tests__/loopMode.spec.tsx (test playback restart at end)
- [ ] T098 [P] [US6] Component test for speed presets in src/visualization/timeline/__tests__/speedPresets.spec.tsx (test 0.25x, 0.5x, 1x, 2x, 5x)
- [ ] T099 [US6] **Commit User Story 6 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 6

- [ ] T100 [P] [US6] Add loop field to PlaybackControlState in src/types/timeline.ts (loop: boolean)
- [ ] T101 [P] [US6] Modify PlaybackControls.tsx: Add loop toggle button, wire to playback.loop state
- [ ] T102 [P] [US6] Modify PlaybackControls.tsx: Add speed preset buttons (0.25x, 0.5x, 1x, 2x, 5x), wire to handleSpeedChange
- [ ] T103 [US6] Modify TimelineView.tsx handlePlay(): Check if loop enabled, restart from beginning when reaching end (FR-008)
- [ ] T104 [US6] Modify PlaybackControls styles in src/visualization/timeline/PlaybackControls.module.css: Style loop toggle, speed presets
- [ ] T105 [US6] Run `npx vitest run --no-watch` - Verify User Story 6 tests pass
- [ ] T106 [US6] Run `npm run lint:css` - Fix any CSS errors
- [ ] T107 [US6] **Commit completed User Story 6 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: At this point, playback controls are fully featured with loop and speed control

---

## Phase 9: User Story 7 - Visual Replay Mode Indicators (Priority: P3)

**Goal**: Add visual indicators (badge/overlay) to all views showing when replay mode is active with current timestamp

**Independent Test**: Enter replay mode, verify indicator appears in Graph/Tree/DetailPanel with timestamp; exit replay, verify indicators disappear

### Tests for User Story 7 ⚠️

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T005) before writing tests

- [ ] T108 [P] [US7] Component test for ReplayModeIndicator in src/visualization/__tests__/ReplayModeIndicator.spec.tsx (test visibility, timestamp display)
- [ ] T109 [P] [US7] Integration test for indicator presence in src/visualization/__tests__/indicatorSync.spec.ts (test appears in all views)
- [ ] T110 [US7] **Commit User Story 7 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 7

- [ ] T111 [P] [US7] Create ReplayModeIndicator component in src/visualization/ReplayModeIndicator.tsx (badge showing "Replay Mode: [timestamp]")
- [ ] T112 [P] [US7] Create ReplayModeIndicator styles in src/visualization/ReplayModeIndicator.module.css (semi-transparent overlay or badge)
- [ ] T113 [US7] Integrate ReplayModeIndicator into DependencyGraph.tsx: show when replayState().active is true
- [ ] T114 [US7] Integrate ReplayModeIndicator into OwnershipTree.tsx: show when replayState().active is true
- [ ] T115 [US7] Integrate ReplayModeIndicator into DetailPanel.tsx: show "Historical Value" label when replay active
- [ ] T116 [US7] Add "Exit Replay / View Live" button to ReplayModeIndicator: calls replayStore.clearCursor() (FR-040)
- [ ] T117 [US7] Add "Live events pending" notification when new events occur during replay (FR-038)
- [ ] T118 [US7] Run `npx vitest run --no-watch` - Verify User Story 7 tests pass
- [ ] T119 [US7] Run `npm run lint:css` - Fix any CSS errors
- [ ] T120 [US7] **Commit completed User Story 7 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: All user stories are now complete and independently functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Quality verification, edge cases, optimizations affecting multiple user stories

- [ ] T121 [P] Implement large recording optimization (tier detection, aggregation, sampling) in src/lib/recordingOptimization.ts per research.md (addresses spec.md edge case: "very large recordings 100,000+ events")
- [ ] T122 [P] Add quota check before save in RecordingStore: call getQuota(), warn user if approaching limit (storage best practice)
- [ ] T123 [P] Optimize historicalState LRU cache: verify 100-snapshot limit, test eviction with large recordings (performance optimization for SC-010)
- [ ] T124 [P] Add edge case handling for archived nodes (nodes in recording not in current code) with visual indicator (addresses spec.md edge case: "nodes that no longer exist in current code")
- [ ] T125 [P] Add edge case handling for identical timestamps (sequence number tiebreaker) in historicalState (addresses spec.md edge case: "clock skew or timestamp precision issues")
- [ ] T126 **Run all tests**: `npx vitest run --no-watch` - ALL tests must pass (Constitution Principle XV)
- [ ] T127 **Run quality gates**: `npm run lint:css && npm run check && npm run typecheck` - Fix ALL errors/warnings (Constitution Principles III, XIX)
- [ ] T128 **Coverage verification**: `npx vitest run --coverage --no-watch` - Verify >=80% coverage on new code (Constitution Principle IV)
- [ ] T129 Update AGENTS.md with manual additions: document replay API patterns, recording serialization format
- [ ] T130 Validate quickstart.md examples: verify all code snippets execute correctly
- [ ] T131 **Commit polish and quality verification** (Constitution Principle XXII - REQUIRED)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1, US2, US3 (P1 stories) can proceed in parallel after Foundational
  - US4, US5 (P2 stories) can proceed in parallel after Foundational
  - US6, US7 (P3 stories) can proceed in parallel after Foundational
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 (Timeline must exist)
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 (Graph/Tree must accept replayStore)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on P1 stories
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Integrates with US4 (RecordingManager for UI)
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1 (PlaybackControls must exist)
- **User Story 7 (P3)**: Can start after US3 (replay subscription in Graph/Tree must exist)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Constitution Principle I)
- Stores before components
- Utilities before integration
- Core implementation before UI integration
- Story complete before moving to next priority

### Parallel Opportunities

#### Phase 1 (Setup): All tasks can run in parallel
- T001 (replay types)
- T002 (type exports)
- T003 (storage types)

#### Phase 2 (Foundational): Tests in parallel, then implementation in parallel
- **Test tasks in parallel** (after T005 - reading TESTING-GUIDE.md):
  - T006 (ReplayStore test)
  - T007 (RecordingStore test)
  - T008 (IndexedDB test)
  - T009 (historicalState test)
  - T010 (validation test)
- **Implementation tasks in parallel**:
  - T012 (IndexedDB utils)
  - T013 (validation)
- **After utilities complete, stores in parallel**:
  - T014 (RecordingStore)
  - T015 (historicalState)
  - T016 (ReplayStore)

#### Phase 3 (US1): Tests in parallel, then implementation mostly sequential
- **Test tasks in parallel**:
  - T021 (App test)
  - T022 (view persistence test)

#### Phase 4 (US2): Tests in parallel, then step methods in parallel
- **Test tasks in parallel**:
  - T032 (keyboard hook test)
  - T033 (PlaybackControls test)
  - T034 (animation interruption test)
- **Step methods in parallel**:
  - T036 (stepForward)
  - T037 (stepBackward)
  - T038 (jumpToStart)
  - T039 (jumpToEnd)

#### Phase 5 (US3): Tests in parallel, then hooks/utils in parallel
- **Test tasks in parallel**:
  - T047 (useHistoricalGraph test)
  - T048 (Graph test)
  - T049 (Tree test)
  - T050 (DetailPanel test)
- **Hooks/utils in parallel**:
  - T052 (useHistoricalGraph hook)
  - T053 (animation utils)

#### Phase 6 (US4): Tests in parallel, components in parallel
- **Test tasks in parallel**:
  - T064 (RecordingManager test)
  - T065 (persistence test)
  - T066 (validation UI test)
- **Component files in parallel**:
  - T068 (RecordingManager component)
  - T069 (RecordingManager styles)

#### Phase 7 (US5): Tests in parallel, serializer and component in parallel
- **Test tasks in parallel**:
  - T080 (serializer test)
  - T081 (controls test)
  - T082 (export options test)
- **Core implementations in parallel**:
  - T084-T086 (serializer)
  - T087-T088 (controls component + styles)

#### Phase 8 (US6): Tests in parallel, UI modifications in parallel
- **Test tasks in parallel**:
  - T097 (loop test)
  - T098 (speed test)
- **Type and UI in parallel**:
  - T100 (PlaybackControlState type)
  - T101-T102 (PlaybackControls UI)

#### Phase 9 (US7): Tests in parallel, component and integrations in parallel
- **Test tasks in parallel**:
  - T108 (indicator test)
  - T109 (sync test)
- **Component files in parallel**:
  - T111 (indicator component)
  - T112 (indicator styles)
- **Integrations in parallel**:
  - T113 (Graph integration)
  - T114 (Tree integration)
  - T115 (DetailPanel integration)

#### Phase 10 (Polish): Most optimizations in parallel
- **Optimization tasks in parallel**:
  - T121 (large recording optimization)
  - T122 (quota check)
  - T123 (cache optimization)
  - T124 (archived nodes)
  - T125 (timestamp handling)

---

## Parallel Example: Foundational Phase

```bash
# After reading TESTING-GUIDE.md (T005), launch all test tasks together:
Task: "Unit test for ReplayStore in src/stores/__tests__/replayStore.spec.ts"
Task: "Unit test for RecordingStore in src/stores/__tests__/recordingStore.spec.ts"
Task: "Unit test for IndexedDB utilities in src/lib/__tests__/indexedDB.spec.ts"
Task: "Unit test for historicalState in src/lib/__tests__/historicalState.spec.ts"
Task: "Unit test for validation in src/lib/__tests__/validation.spec.ts"

# Then launch utility implementations in parallel:
Task: "Implement IndexedDB utilities in src/lib/indexedDB.ts"
Task: "Implement validation in src/lib/validation.ts"

# Then launch store implementations in parallel (after utilities complete):
Task: "Implement RecordingStore in src/stores/recordingStore.ts"
Task: "Implement historicalState in src/lib/historicalState.ts"
Task: "Implement ReplayStore in src/stores/replayStore.ts"
```

---

## Parallel Example: User Story 3

```bash
# Launch all US3 tests together:
Task: "Unit test for useHistoricalGraph hook in src/visualization/hooks/__tests__/useHistoricalGraph.spec.ts"
Task: "Component test for DependencyGraph replay mode in src/visualization/__tests__/DependencyGraph.spec.tsx"
Task: "Component test for OwnershipTree replay mode in src/visualization/__tests__/OwnershipTree.spec.tsx"
Task: "Component test for DetailPanel historical values in src/visualization/__tests__/DetailPanel.spec.tsx"

# Launch hook and utils in parallel:
Task: "Create useHistoricalGraph hook in src/visualization/hooks/useHistoricalGraph.ts"
Task: "Create animation utilities in src/lib/animationUtils.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only - All P1)

1. Complete Phase 1: Setup (type definitions)
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Timeline Integration)
4. Complete Phase 4: User Story 2 (Single-Step Navigation)
5. Complete Phase 5: User Story 3 (Historical State Replay)
6. **STOP and VALIDATE**: Test US1-US3 together as complete MVP
7. Run quality gates, verify coverage, deploy/demo

**MVP Delivers**: Timeline navigation, step-by-step debugging, time-travel debugging (core debugging features)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Timeline accessible (basic increment)
3. Add User Story 2 → Test independently → Step navigation works (debugging increment)
4. Add User Story 3 → Test independently → Time-travel works (MVP complete! 🎯)
5. Add User Story 4 → Test independently → Recordings persist (persistence increment)
6. Add User Story 5 → Test independently → Export/import works (collaboration increment)
7. Add User Story 6 → Test independently → Enhanced playback (polish increment)
8. Add User Story 7 → Test independently → Visual indicators (UX increment)
9. Polish phase → Production ready

**Each story adds value without breaking previous stories**

### Parallel Team Strategy

With 3 developers after Foundational completes:

**Sprint 1 (P1 stories in parallel)**:
- Developer A: User Story 1 (Timeline Integration)
- Developer B: User Story 2 (Step Navigation)
- Developer C: User Story 3 (Historical Replay)

**Sprint 2 (P2 stories in parallel)**:
- Developer A: User Story 4 (Recording Management)
- Developer B: User Story 5 (Export/Import)
- Developer C: Start Polish tasks

**Sprint 3 (P3 stories in parallel)**:
- Developer A: User Story 6 (Enhanced Playback)
- Developer B: User Story 7 (Visual Indicators)
- Developer C: Complete Polish tasks

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [US#] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (RED-GREEN-REFACTOR)
- **CRITICAL (Constitution Principle XXII)**: The LAST task item in EVERY phase MUST explicitly state "Commit [description]"
- Commit after each phase completion - NEVER skip the commit task
- **CRITICAL (Constitution Principle XV)**: ALL tests MUST pass before declaring feature complete
- **CRITICAL (Constitution Principles III, XIX)**: ALL quality gates (lint:css, check, typecheck) MUST pass with zero errors/warnings
- Stop at any checkpoint to validate story independently
- Constitution Principle I: Test-first development (RED-GREEN-REFACTOR) is MANDATORY
- Constitution Principle XXI: Read TESTING-GUIDE.md (T005) BEFORE writing any test code
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

**Total Tasks**: 131
**Setup**: 4 tasks
**Foundational**: 16 tasks (CRITICAL BLOCKER)
**User Story 1 (P1)**: 11 tasks
**User Story 2 (P1)**: 15 tasks
**User Story 3 (P1)**: 17 tasks
**User Story 4 (P2)**: 16 tasks
**User Story 5 (P2)**: 17 tasks
**User Story 6 (P3)**: 11 tasks
**User Story 7 (P3)**: 13 tasks
**Polish**: 11 tasks

**Parallel Opportunities**: 58 tasks marked [P] (44% parallelizable)
**Test Tasks**: 41 tasks (31% of total - comprehensive test coverage)
**Commit Tasks**: 11 explicit commit tasks (one per phase - Constitution Principle XXII)
