# Tasks: Pattern Detection & Reactivity Analysis

**Input**: Design documents from `/specs/008-pattern-detection-analysis/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Test tasks are included per constitution requirement for test-first development.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each pattern type.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to repository root `/root/projects/visual-reactivity/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and type system setup for pattern detection

- [X] T001 Create type definitions in src/types/pattern.ts (Pattern, PatternType, PatternThreshold, PatternException, MetricsSummary)
- [X] T002 [P] Export pattern types from src/types/index.ts
- [X] T003 [P] Create src/analysis/ directory structure (patternDetector.ts, detectors/, __tests__/)
- [X] T004 [P] Create src/stores/patternStore.ts skeleton with SolidJS store structure
- [X] T005 [P] Create src/visualization/AnalysisPanel.tsx skeleton component
- [X] T006 [P] Create src/visualization/PatternBadge.tsx skeleton component
- [X] T007 [P] Create src/lib/patternUtils.ts utility module

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core pattern detection infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Create patternDetector factory in src/analysis/patternDetector.ts with debounce logic (300ms), event handling, and reset methods
- [X] T009 Implement patternStore in src/stores/patternStore.ts with reactive signals for patterns, exceptions, thresholds, metrics, and status
- [X] T010 Add localStorage persistence helpers to patternStore (loadFromStorage, saveToStorage with versioned schema)
- [X] T011 Create usePatternDetection hook in src/visualization/hooks/usePatternDetection.ts to connect detector to store with debounced analysis
- [X] T012 Implement PatternBadge.tsx component with SVG rendering, severity color mapping, and click handler props
- [X] T013 [P] Create PatternBadge.module.css with badge styles (positioned top-right, severity colors, hover states)
- [X] T014 Implement AnalysisPanel.tsx with collapsible sidebar following LiveValuesPanel architecture (expand/collapse, resizable width, pattern list)
- [X] T015 [P] Create AnalysisPanel.module.css with sidebar styles matching existing panel patterns
- [X] T016 Integrate AnalysisPanel into src/App.tsx with expand state, pattern click handler connecting to selectionStore

**Checkpoint**: Foundation ready - pattern detection infrastructure complete, user story detectors can now be added in parallel

---

## Phase 3: User Story 1 - Identify Orphaned Effects (Priority: P1) 🎯 MVP

**Goal**: Detect effects created without ownership context and flag them as memory leak risks with warning indicators

**Independent Test**: Create effect outside createRoot, verify flagged in visualization, check analysis panel shows remediation

### Tests for User Story 1

> **CONSTITUTION REQUIREMENT (Principle XXI)**: Before writing ANY test code, you MUST:
> 1. Read `specs/TESTING-GUIDE.md` to understand testing patterns
> 2. Use centralized helpers from `src/__tests__/helpers`
> 3. Follow SolidJS testing patterns (NOT React patterns)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T017 [US1] **Read `specs/TESTING-GUIDE.md`** - Understand testing patterns and helpers (REQUIRED before any test code)
- [X] T018 [P] [US1] Unit test for orphanedEffects detector in src/analysis/detectors/__tests__/orphanedEffects.spec.ts (test null owner detection, severity high, correct pattern ID generation)
- [X] T019 [P] [US1] Component test for PatternBadge in src/visualization/__tests__/PatternBadge.spec.tsx (test orphaned-effect badge renders with correct color, shows count, click triggers handler)
- [X] T020 [P] [US1] Component test for AnalysisPanel in src/visualization/__tests__/AnalysisPanel.spec.tsx (test orphaned effect listed, description shown, remediation text present)

### Implementation for User Story 1

- [X] T021 [US1] Implement orphanedEffects detector in src/analysis/detectors/orphanedEffects.ts (scan nodes for type=effect && owner=null, return Pattern[])
- [X] T022 [US1] Integrate orphanedEffects detector into patternDetector.runAnalysis() execution order (first detector, O(n) scan)
- [X] T023 [US1] Add orphaned-effect pattern description and remediation text to patternUtils.ts (explanation: memory leak risk, remediation: wrap in createRoot)
- [X] T024 [US1] Update DependencyGraph.tsx to render PatternBadge overlays on nodes with orphaned-effect patterns (calculate badge position top-right of node)
- [X] T025 [US1] Wire orphaned-effect pattern click in AnalysisPanel to highlight affected nodes via selectionStore
- [X] T026 [P] [US1] Integration test for orphaned effect workflow in tests/integration/pattern-detection.spec.tsx (create orphaned effect → verify badge → click → verify selection)

**Checkpoint**: Orphaned effect detection fully functional - developers can identify memory leak risks in <5 seconds

---

## Phase 4: User Story 2a - Detect Deep Dependency Chains (Priority: P2)

**Goal**: Identify dependency chains exceeding 5 levels and highlight them with performance warning indicators

**Independent Test**: Create 7-level memo chain, verify flagged, check chain path visualization

### Tests for User Story 2a

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T017) before writing tests

- [X] T027 [P] [US2] Unit test for deepChains detector in src/analysis/detectors/__tests__/deepChains.spec.ts (test BFS depth calculation, threshold=5, chain path extraction)
- [X] T028 [P] [US2] Component test for deep-chain pattern display in AnalysisPanel (verify depth metrics shown, chain path listed)

### Implementation for User Story 2a

- [X] T029 [US2] Implement deepChains detector in src/analysis/detectors/deepChains.ts (BFS from root nodes, track depth, flag chains > threshold, capture path)
- [X] T030 [US2] Integrate deepChains detector into patternDetector.runAnalysis() (4th detector, O(V+E) complexity)
- [X] T031 [US2] Add deep-chain pattern description to patternUtils.ts (explanation: cascading re-computation overhead, remediation: flatten chain or add batching)
- [X] T032 [US2] Update DependencyGraph.tsx to highlight all nodes in deep chain path when badge clicked (use selection API to select multiple nodes)
- [X] T033 [P] [US2] Integration test for deep chain detection workflow in tests/integration/pattern-detection.spec.tsx (create 7-level chain → verify badge → verify path in panel)

**Checkpoint**: Deep chain detection functional - developers can identify performance bottlenecks from excessive propagation

---

## Phase 5: User Story 2b - Visualize Diamond Patterns (Priority: P2)

**Goal**: Detect convergent dependency paths (diamond patterns) and visualize execution order guarantees

**Independent Test**: Create A→B→D, A→C→D diamond, verify detected, check convergence node highlighted

### Tests for User Story 2b

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T017) before writing tests

- [X] T034 [P] [US3] Unit test for diamondPatterns detector in src/analysis/detectors/__tests__/diamondPatterns.spec.ts (test convergence detection, path counting, multi-path validation)
- [X] T035 [P] [US3] Component test for diamond pattern display in AnalysisPanel (verify path count shown, convergence node identified)

### Implementation for User Story 2b

- [X] T036 [US3] Implement diamondPatterns detector in src/analysis/detectors/diamondPatterns.ts (find nodes with 2+ upstream paths, capture all paths, O(V*E) complexity)
- [X] T037 [US3] Integrate diamondPatterns detector into patternDetector.runAnalysis() (6th detector, slowest so runs last)
- [X] T038 [US3] Add diamond-pattern description to patternUtils.ts (explanation: convergent execution, glitch-free guarantee, remediation: informational only)
- [X] T039 [US3] Update DependencyGraph.tsx to highlight convergent paths when diamond badge clicked (draw distinct path visualizations)
- [X] T040 [P] [US3] Integration test for diamond pattern detection in tests/integration/pattern-detection.spec.tsx (create A→B→D, A→C→D → verify badge → verify paths)

**Checkpoint**: Diamond pattern detection functional - developers understand convergent reactivity flow

---

## Phase 6: User Story 4 - Monitor Hot Paths (Priority: P3)

**Goal**: Detect nodes updating >10 times/second and flag as hot paths with update frequency metrics

**Independent Test**: Create signal updating 15x/sec via setInterval, verify flagged with frequency chart

### Tests for User Story 4

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T017) before writing tests

- [X] T041 [P] [US4] Unit test for hotPaths detector in src/analysis/detectors/__tests__/hotPaths.spec.ts (test sliding window logic, threshold=10/sec, frequency calculation using useMockDate helper)
- [X] T042 [P] [US4] Component test for hot-path pattern display in AnalysisPanel (verify update frequency shown, debounce suggestion present)

### Implementation for User Story 4

- [X] T043 [US4] Implement hotPaths detector in src/analysis/detectors/hotPaths.ts (maintain sliding 1-second window of update events, count frequency per node, O(1) per update)
- [X] T044 [US4] Integrate hotPaths detector into patternDetector.runAnalysis() (5th detector) and handleEvent() for update tracking
- [X] T045 [US4] Add hot-path pattern description to patternUtils.ts (explanation: excessive updates, remediation: add debouncing or throttling)
- [X] T046 [US4] Update DependencyGraph.tsx to render "heat" visual indicator for hot path badges (animated pulse effect)
- [X] T047 [P] [US4] Integration test for hot path detection in tests/integration/pattern-detection.spec.tsx (simulate 15 updates/sec → verify badge → verify frequency metrics)

**Checkpoint**: Hot path detection functional - developers can identify over-computation and apply debouncing

---

## Phase 7: User Story 5 - Flag High Subscription Counts (Priority: P3)

**Goal**: Detect nodes with >50 observers and flag with subscription count warnings

**Independent Test**: Create signal with 60 observers, verify flagged with observer breakdown

### Tests for User Story 5

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T017) before writing tests

- [X] T048 [P] [US5] Unit test for highSubscriptions detector in src/analysis/detectors/__tests__/highSubscriptions.spec.ts (test observer count threshold=50, observer ID capture, O(n) scan)
- [X] T049 [P] [US5] Component test for high-subscriptions pattern display in AnalysisPanel (verify observer count shown, breakdown by type displayed)

### Implementation for User Story 5

- [X] T050 [US5] Implement highSubscriptions detector in src/analysis/detectors/highSubscriptions.ts (scan nodes for observers.length > threshold, capture observer IDs)
- [X] T051 [US5] Integrate highSubscriptions detector into patternDetector.runAnalysis() (2nd detector, O(n) fast scan)
- [X] T052 [US5] Add high-subscriptions pattern description to patternUtils.ts (explanation: high fan-out, remediation: verify intentional or refactor)
- [X] T053 [US5] Update AnalysisPanel to show observer breakdown (effects vs memos count) for high-subscription patterns
- [X] T054 [P] [US5] Integration test for high subscriptions detection in tests/integration/pattern-detection.spec.tsx (create signal with 60 observers → verify badge → verify breakdown)

**Checkpoint**: High subscription detection functional - developers can assess observer fan-out

---

## Phase 8: User Story 6 - Identify Stale Memos (Priority: P3)

**Goal**: Detect memos with zero observers and flag as unused/removable

**Independent Test**: Create memo with no consumers, verify flagged with removal suggestion

### Tests for User Story 6

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T017) before writing tests

- [X] T055 [P] [US6] Unit test for staleMemos detector in src/analysis/detectors/__tests__/staleMemos.spec.ts (test zero observer detection, type filtering for memos only)
- [X] T056 [P] [US6] Component test for stale-memo pattern display in AnalysisPanel (verify removal suggestion shown)

### Implementation for User Story 6

- [X] T057 [US6] Implement staleMemos detector in src/analysis/detectors/staleMemos.ts (filter nodes for type=memo && observers.length===0, O(n) scan)
- [X] T058 [US6] Integrate staleMemos detector into patternDetector.runAnalysis() (3rd detector, O(n) fast scan)
- [X] T059 [US6] Add stale-memo pattern description to patternUtils.ts (explanation: unused computation, remediation: remove or add consumers)
- [X] T060 [US6] Update AnalysisPanel to show "Never read" status for stale memos
- [X] T061 [P] [US6] Integration test for stale memo detection in tests/integration/pattern-detection.spec.tsx (create unused memo → verify badge → verify removal suggestion)

**Checkpoint**: Stale memo detection functional - developers can clean up unused computations

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting all pattern types and overall system quality

- [X] T062 [P] Implement pattern exception marking in patternStore (markAsExpected method with reason and expiry timestamp)
- [X] T063 [P] Add "Mark as Expected" UI in AnalysisPanel pattern list items (modal dialog with reason textarea)
- [X] T064 [P] Implement pattern filtering in AnalysisPanel (filter by type, severity, expected status)
- [ ] T065 [P] Implement pattern sorting in AnalysisPanel (sort by severity, timestamp, affected node count)
- [ ] T066 [P] Add MetricsSummary computation to patternStore (aggregate counts by type/severity, calculate most problematic nodes)
- [ ] T067 [P] Create metrics dashboard section in AnalysisPanel header (total counts, severity distribution pie chart)
- [ ] T068 [P] Implement multi-pattern badge rendering with count overlay (when node has >1 pattern, show highest severity + count)
- [ ] T069 [P] Add pattern detection status indicator to UI (analyzing, X patterns found, last analyzed timestamp, error state)
- [ ] T070 [P] Implement error handling in patternDetector with timeout (5000ms max analysis time, partial results on timeout)
- [ ] T071 [P] Add console logging for pattern detection errors (PatternDetectionError with code and details)
- [ ] T072 [P] Implement localStorage persistence for pattern exceptions and thresholds (versioned schema, migration on load)
- [ ] T073 [P] Add panel expand/collapse state persistence to localStorage (key: visual-reactivity:analysis-panel-state)
- [ ] T074 [P] Implement threshold customization UI in AnalysisPanel settings section (sliders for numeric thresholds, toggles for enable/disable)
- [ ] T075 [P] Add color-blind friendly visual indicators (use shapes + colors + labels for pattern badges)
- [ ] T076 [P] Performance optimization: implement incremental analysis with dirty node tracking (only re-analyze changed subgraph, O(k) vs O(n))
- [ ] T077 [P] Unit test for patternStore in src/stores/__tests__/patternStore.spec.ts (test reactive updates, localStorage persistence, exception handling)
- [ ] T078 [P] Unit test for usePatternDetection hook in src/visualization/hooks/__tests__/usePatternDetection.spec.ts (test debouncing, store integration, cleanup)
- [ ] T079 [P] Unit test for patternDetector core in src/analysis/__tests__/patternDetector.spec.ts (test runAnalysis orchestration, handleEvent debouncing, reset behavior)
- [ ] T080 [P] Performance validation test (create 100-node graph, run analysis, verify <200ms duration)
- [ ] T081 [P] Edge case test for overlapping patterns (node with orphaned-effect + hot-path, verify both detected, badge shows count=2)
- [ ] T082 [P] Edge case test for rapid updates (trigger 10 updates in 100ms, verify single debounced analysis at 300ms)
- [ ] T083 [P] Edge case test for large graphs (create 200-node graph, verify no performance degradation, <200ms analysis time)
- [ ] T084 [P] Edge case test for analysis timeout (mock slow detector >5000ms, verify partial results returned, error logged)
- [ ] T085 [P] Update quickstart.md validation (manually test all code examples work, fix any broken snippets)
- [ ] T086 Run quality gates (npm run lint:css && npm run check && npm run typecheck)
- [ ] T087 Run full test suite (npx vitest run --no-watch) and verify 100% passing
- [ ] T088 Run test coverage (npx vitest run --coverage --no-watch) and verify >80% for business logic

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (different detector files)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5 → US6)
- **Polish (Phase 9)**: Depends on at least US1 completion for MVP; all stories for full polish

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories ✅ MVP READY
- **User Story 2a (P2)**: Can start after Foundational - Independent detector ✅
- **User Story 2b (P2)**: Can start after Foundational - Independent detector ✅
- **User Story 4 (P3)**: Can start after Foundational - Independent detector ✅
- **User Story 5 (P3)**: Can start after Foundational - Independent detector ✅
- **User Story 6 (P3)**: Can start after Foundational - Independent detector ✅

### Within Each User Story

1. **Read TESTING-GUIDE.md first** (T017 - BLOCKING for all test tasks)
2. Tests MUST be written and FAIL before implementation (RED phase)
3. Detectors before integration into patternDetector.runAnalysis()
4. Pattern descriptions before UI integration
5. Component integration before end-to-end integration tests
6. Story complete and independently validated before moving to next priority

### Parallel Opportunities

**Phase 1 - Setup** (all tasks can run in parallel):
- T002, T003, T004, T005, T006, T007 (different files)

**Phase 2 - Foundational** (parallel after T008):
- T009, T011 can run after T008
- T012, T013, T014, T015 can run in parallel (different files)
- T016 depends on T014

**Phase 3 - US1 Tests** (parallel after T017):
- T018, T019, T020 (different test files)

**Phases 4-8** (entire user stories can run in parallel after Phase 2):
- US1 (T017-T026), US2a (T027-T033), US2b (T034-T040), US4 (T041-T047), US5 (T048-T054), US6 (T055-T061)
- All detectors are independent - 6 developers could work on 6 pattern types simultaneously

**Phase 9 - Polish** (most tasks parallel):
- T062-T085 all marked [P] (different files, different concerns)
- T086, T087, T088 must run sequentially at end

---

## Parallel Example: User Story 1

```bash
# After reading TESTING-GUIDE.md (T017), launch all US1 tests in parallel:
Task T018: "Unit test for orphanedEffects detector in src/analysis/detectors/__tests__/orphanedEffects.spec.ts"
Task T019: "Component test for PatternBadge in src/visualization/__tests__/PatternBadge.spec.tsx"
Task T020: "Component test for AnalysisPanel in src/visualization/__tests__/AnalysisPanel.spec.tsx"

# After tests written and RED, launch implementation:
Task T021: "Implement orphanedEffects detector in src/analysis/detectors/orphanedEffects.ts"
# (T022-T026 follow sequentially as they integrate the detector)
```

---

## Parallel Example: All User Stories (After Foundational Complete)

```bash
# With 6-person team, after Phase 2 completion:
Developer A: Phase 3 (US1 - Orphaned Effects) - T017 to T026
Developer B: Phase 4 (US2a - Deep Chains) - T027 to T033
Developer C: Phase 5 (US2b - Diamond Patterns) - T034 to T040
Developer D: Phase 6 (US4 - Hot Paths) - T041 to T047
Developer E: Phase 7 (US5 - High Subscriptions) - T048 to T054
Developer F: Phase 8 (US6 - Stale Memos) - T055 to T061

# All developers work independently on separate detector files
# No merge conflicts, no blocking dependencies
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - RECOMMENDED

1. Complete Phase 1: Setup (T001-T007) → ~1 hour
2. Complete Phase 2: Foundational (T008-T016) → ~4 hours (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (T017-T026) → ~3 hours
4. **STOP and VALIDATE**: 
   - Test orphaned effect detection independently
   - Verify badge renders, panel shows details, selection works
   - Run quality gates (T086-T088)
5. **MVP READY**: Developers can now identify memory leak risks in production

**Total MVP Time Estimate**: ~8 hours (1 developer, sequential)

### Incremental Delivery

1. **Foundation** (T001-T016) → All infrastructure ready ✅
2. **MVP**: Add US1 (T017-T026) → Orphaned effects detection ✅ → **DEPLOY**
3. **v1.1**: Add US2a (T027-T033) → Deep chains detection ✅ → **DEPLOY**
4. **v1.2**: Add US2b (T034-T040) → Diamond patterns ✅ → **DEPLOY**
5. **v1.3**: Add US4 (T041-T047) → Hot paths ✅ → **DEPLOY**
6. **v1.4**: Add US5 (T048-T054) → High subscriptions ✅ → **DEPLOY**
7. **v1.5**: Add US6 (T055-T061) → Stale memos ✅ → **DEPLOY**
8. **v2.0**: Add Polish (T062-T088) → Full feature set ✅ → **DEPLOY**

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With 6 developers after Foundational phase complete:

1. **Team completes Setup + Foundational together** (T001-T016) → ~5 hours
2. **Once Foundational done, parallel user stories**:
   - Dev A: US1 (orphaned effects)
   - Dev B: US2a (deep chains)
   - Dev C: US2b (diamonds)
   - Dev D: US4 (hot paths)
   - Dev E: US5 (subscriptions)
   - Dev F: US6 (stale memos)
3. **Each developer completes independently** → ~3 hours each
4. **Merge all stories** → All 6 pattern types ready simultaneously
5. **Team completes Polish together** (T062-T088) → ~4 hours

**Total Time with 6 Developers**: ~12 hours (wall-clock time)
**Total Time with 1 Developer**: ~40 hours (all stories + polish)

---

## Task Count Summary

- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 9 tasks (BLOCKING)
- **Phase 3 (US1 - Orphaned Effects)**: 10 tasks (MVP)
- **Phase 4 (US2a - Deep Chains)**: 7 tasks
- **Phase 5 (US2b - Diamond Patterns)**: 7 tasks
- **Phase 6 (US4 - Hot Paths)**: 7 tasks
- **Phase 7 (US5 - High Subscriptions)**: 7 tasks
- **Phase 8 (US6 - Stale Memos)**: 7 tasks
- **Phase 9 (Polish)**: 27 tasks

**Total**: 88 tasks

**Parallel Opportunities**:
- Setup: 6/7 tasks parallel
- Foundational: 5/9 tasks parallel
- User Stories: All 6 stories can run in parallel (42 tasks total)
- Polish: 25/27 tasks parallel

**MVP Scope**: 26 tasks (Setup + Foundational + US1)
**Full Feature**: 88 tasks (all user stories + polish)

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label (US1-US6) maps task to specific user story for traceability
- Each user story is independently completable and testable
- All tests follow constitution requirement: Read TESTING-GUIDE.md first (T017)
- Verify tests fail (RED) before implementing (GREEN) for test-first development
- Stop at any checkpoint to validate story independently
- Run quality gates after each story completion to catch issues early
- Constitution Principle XV: Zero failing tests - ALL tests MUST pass before declaring spec complete
