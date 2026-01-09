# Tasks: Educational Demo Examples

**Input**: Design documents from `/specs/010-demo-examples/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are REQUIRED per Constitution Principle I (Test-First Development). All tests must be written FIRST before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each demo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3...)
- Include exact file paths in descriptions

## Path Conventions

Project structure: `src/` at repository root (single SolidJS web application)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure initialization (minimal - most structure already exists)

- [x] T001 Create demo module directories: `src/demos/`, `src/demos/__tests__/`, `src/visualization/__tests__/` for demo components
- [ ] T002 **Commit project setup** (Constitution Principle XXII - REQUIRED)

---

## Phase 2: Foundational (Demo Infrastructure)

**Purpose**: Core demo system infrastructure that ALL 8 demos depend on. MUST be complete before ANY demo implementation can begin.

**⚠️ CRITICAL**: No demo work can begin until this phase is complete.

### Tests for Foundational Infrastructure

> **CONSTITUTION REQUIREMENT (Principle XXI)**: Before writing ANY test code, you MUST:
> 1. Read `specs/TESTING-GUIDE.md` to understand testing patterns
> 2. Use centralized helpers from `src/__tests__/helpers`
> 3. Follow SolidJS testing patterns (NOT React patterns)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T003 **Read `specs/TESTING-GUIDE.md`** - Understand testing patterns and helpers (REQUIRED before any test code)
- [ ] T004 [P] Unit test for DemoContext in `src/demos/__tests__/DemoContext.spec.ts` (test createRoot isolation, cleanup verification)
- [ ] T005 [P] Unit test for demoRegistry in `src/demos/__tests__/demoRegistry.spec.ts` (test registry lookup, DEMO_LIST iteration)
- [ ] T006 [P] Component test for DemoMenu in `src/visualization/__tests__/DemoMenu.spec.tsx` (test menu open/close, demo selection, active demo highlighting)
- [ ] T007 [P] Component test for DemoPanel in `src/visualization/__tests__/DemoPanel.spec.tsx` (test panel visibility, close button, reset button)
- [ ] T008 [P] Component test for WelcomeMessage in `src/visualization/__tests__/WelcomeMessage.spec.tsx` (test welcome message display, open menu button)
- [ ] T009 Integration test for App.tsx demo integration in `src/__tests__/App.spec.tsx` (test demo menu button, demo loading, cleanup on switch)
- [ ] T009a [P] Integration test for error handling in `src/__tests__/DemoErrorHandling.spec.tsx` (test demo initialization error displays error message, demo execution error shows error state, error recovery allows returning to menu per FR-050, FR-051, FR-052)
- [ ] T010 **Commit foundational infrastructure tests** (Constitution Principle XXII - REQUIRED)

### Implementation for Foundational Infrastructure

- [ ] T011 [P] Create Demo types in `src/demos/types.ts` (Demo, DemoMetadata, DemoContext, DemoRegistry interfaces)
- [ ] T012 [P] Implement DemoContext in `src/demos/DemoContext.tsx` (createRoot wrapper, cleanup function, disposal tracking)
- [ ] T013 Create empty demoRegistry in `src/demos/demoRegistry.ts` (DEMO_REGISTRY object, DEMO_LIST array, export structure - no demos yet)
- [ ] T014 [P] Implement DemoMenu component in `src/visualization/DemoMenu.tsx` with `src/visualization/DemoMenu.module.css` (modal/dropdown, demo list rendering, selection handler)
- [ ] T015 [P] Implement DemoPanel component in `src/visualization/DemoPanel.tsx` with `src/visualization/DemoPanel.module.css` (panel container, close button, reset button, metadata display)
- [ ] T016 [P] Implement WelcomeMessage component in `src/visualization/WelcomeMessage.tsx` with `src/visualization/WelcomeMessage.module.css` (welcome prompt, open menu button)
- [ ] T016a [P] Implement DemoErrorFallback component in `src/visualization/DemoErrorFallback.tsx` with `src/visualization/DemoErrorFallback.module.css` (error message display, close button, retry button per FR-050)
- [ ] T017 Integrate demo system into App.tsx in `src/App.tsx` (add Demos button to navigation, demo menu state, demo panel with ErrorBoundary wrapper, demo lifecycle management)
- [ ] T018 Update App.module.css in `src/App.module.css` (demo panel layout styles, demo button styles)
- [ ] T019 **Commit completed foundational infrastructure** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: Foundation ready - demo implementation can now begin in parallel

---

## Phase 3: User Story 1 - Simple Counter Demo (Priority: P1) 🎯 MVP

**Goal**: Demonstrate basic signal → effect relationship with interactive increment button

**Independent Test**: Load demo, click increment button, verify: (1) signal node updates, (2) edge animates, (3) effect node pulses, (4) counter value increments in demo UI and live values panel

### Tests for User Story 1

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T003) before writing tests

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T020 [US1] Component test for SimpleCounter in `src/demos/__tests__/SimpleCounter.spec.tsx` (test demo creates 1 signal + 1 effect, increment button updates count, nodes have correct names)
- [ ] T021 [US1] **Commit User Story 1 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 1

- [ ] T022 [US1] Implement SimpleCounter component in `src/demos/SimpleCounter.tsx` (createTrackedSignal for count, createTrackedEffect for display, increment button, count display)
- [ ] T023 [US1] Register SimpleCounter in `src/demos/demoRegistry.ts` (add 'simple-counter' entry with metadata: name="Simple Counter", concept="Signal → Effect", description, instructions)
- [ ] T024 [US1] **Commit completed User Story 1 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: Simple Counter demo should be fully functional and independently testable via demo menu

---

## Phase 4: User Story 2 - Derived State Demo (Priority: P2)

**Goal**: Demonstrate memo caching by showing that memos only re-evaluate when dependencies change, not on every read

**Independent Test**: Load demo, increment source signal, verify: (1) memo node pulses once per dependency change, (2) memo shows "cached" state, (3) multiple reads don't cause re-computation

### Tests for User Story 2

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T003) before writing tests

- [ ] T025 [US2] Component test for DerivedState in `src/demos/__tests__/DerivedState.spec.tsx` (test demo creates signal + memo + effect, verify memo caching behavior, execution count tracking)
- [ ] T026 [US2] **Commit User Story 2 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 2

- [ ] T027 [US2] Implement DerivedState component in `src/demos/DerivedState.tsx` (createTrackedSignal for count, createTrackedMemo for doubled, createTrackedEffect for logger, increment button, read memo button, display count and doubled value)
- [ ] T028 [US2] Register DerivedState in `src/demos/demoRegistry.ts` (add 'derived-state' entry with metadata: name="Derived State", concept="Signal → Memo → Effect", description, instructions)
- [ ] T029 [US2] **Commit completed User Story 2 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: Derived State demo should work independently, showing memo caching behavior

---

## Phase 5: User Story 3 - Diamond Pattern Demo (Priority: P3)

**Goal**: Demonstrate glitch-free execution where one signal feeds two memos that both feed one effect, proving effect runs only once per signal change

**Independent Test**: Load demo, update source signal, verify: (1) both memo branches update before final effect, (2) effect executes exactly once per signal change, (3) animation shows simultaneous memo updates

### Tests for User Story 3

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T003) before writing tests

- [ ] T030 [US3] Component test for DiamondPattern in `src/demos/__tests__/DiamondPattern.spec.tsx` (test demo creates diamond structure: 1 signal → 2 memos → 1 effect, verify effect executes once per signal update, execution count verification)
- [ ] T031 [US3] **Commit User Story 3 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 3

- [ ] T032 [US3] Implement DiamondPattern component in `src/demos/DiamondPattern.tsx` (createTrackedSignal for value, createTrackedMemo for double and triple, createTrackedEffect for sum, input control to change value, display value and sum)
- [ ] T033 [US3] Register DiamondPattern in `src/demos/demoRegistry.ts` (add 'diamond-pattern' entry with metadata: name="Diamond Pattern", concept="Glitch-Free Execution", description, instructions)
- [ ] T034 [US3] **Commit completed User Story 3 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: Diamond Pattern demo should work independently, proving glitch-free synchronous updates

---

## Phase 6: User Story 4 - Batch Updates Demo (Priority: P4)

**Goal**: Demonstrate how batch() groups multiple signal writes so dependent effects execute only once instead of multiple times

**Independent Test**: Load demo, click "Update All" button, verify: (1) all three signals update, (2) effect executes exactly once (not three times), (3) timeline shows batch boundary grouping events

### Tests for User Story 4

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T003) before writing tests

- [ ] T035 [US4] Component test for BatchUpdates in `src/demos/__tests__/BatchUpdates.spec.tsx` (test demo creates 3 signals + 1 effect, verify batched updates execute effect once, non-batched updates execute effect three times)
- [ ] T036 [US4] **Commit User Story 4 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 4

- [ ] T037 [US4] Implement BatchUpdates component in `src/demos/BatchUpdates.tsx` (createTrackedSignal for firstName, lastName, age, createTrackedEffect for userProfile, "Update All (Batched)" button with batch(), "Update Individually" button without batch(), display all values)
- [ ] T038 [US4] Register BatchUpdates in `src/demos/demoRegistry.ts` (add 'batch-updates' entry with metadata: name="Batch Updates", concept="Batching", description, instructions)
- [ ] T039 [US4] **Commit completed User Story 4 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: Batch Updates demo should work independently, showing batching vs individual update behavior

---

## Phase 7: User Story 5 - Nested Effects Demo (Priority: P5)

**Goal**: Demonstrate ownership tree and automatic disposal of nested computations when parent re-runs

**Independent Test**: Load demo, switch to ownership tree view, toggle condition signal, verify: (1) tree shows parent-child relationships, (2) old child effects fade out on parent re-run, (3) new child effects appear in ownership tree

### Tests for User Story 5

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T003) before writing tests

- [ ] T040 [US5] Component test for NestedEffects in `src/demos/__tests__/NestedEffects.spec.tsx` (test demo creates parent effect with conditional child effects, verify disposal of old children, creation of new children on condition toggle)
- [ ] T041 [US5] **Commit User Story 5 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 5

- [ ] T042 [US5] Implement NestedEffects component in `src/demos/NestedEffects.tsx` (createTrackedSignal for toggle, createTrackedEffect parent that conditionally creates child effects based on toggle, toggle button, display toggle state)
- [ ] T043 [US5] Register NestedEffects in `src/demos/demoRegistry.ts` (add 'nested-effects' entry with metadata: name="Nested Effects", concept="Ownership & Disposal", description, instructions)
- [ ] T044 [US5] **Commit completed User Story 5 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: Nested Effects demo should work independently, showing ownership hierarchy and disposal

---

## Phase 8: User Story 6 - Conditional Dependencies Demo (Priority: P6)

**Goal**: Demonstrate dynamic dependency tracking where edges change at runtime based on conditional logic

**Independent Test**: Load demo, toggle condition, verify: (1) edges change when condition changes, (2) old edges fade out, (3) new edges connect with animation, (4) only active dependencies trigger updates

### Tests for User Story 6

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T003) before writing tests

- [ ] T045 [US6] Component test for ConditionalDependencies in `src/demos/__tests__/ConditionalDependencies.spec.tsx` (test demo creates 2 signals + 1 conditional effect, verify effect depends on signalA when useA=true, depends on signalB when useA=false, inactive dependencies don't trigger effect)
- [ ] T046 [US6] **Commit User Story 6 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 6

- [ ] T047 [US6] Implement ConditionalDependencies component in `src/demos/ConditionalDependencies.tsx` (createTrackedSignal for signalA, signalB, useA toggle, createTrackedEffect that conditionally reads signalA or signalB based on useA, toggle button, update buttons for both signals, display all values)
- [ ] T048 [US6] Register ConditionalDependencies in `src/demos/demoRegistry.ts` (add 'conditional-dependencies' entry with metadata: name="Conditional Dependencies", concept="Dynamic Dependencies", description, instructions)
- [ ] T049 [US6] **Commit completed User Story 6 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: Conditional Dependencies demo should work independently, showing dynamic edge changes

---

## Phase 9: User Story 7 - Deep Chain Demo (Priority: P7)

**Goal**: Demonstrate synchronous propagation through a long chain of dependent computations with visible cascade animation

**Independent Test**: Load demo, update source signal, verify: (1) animation cascades through all 5 nodes in sequence, (2) timeline shows execution order clearly, (3) execution counts increment for all nodes

### Tests for User Story 7

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T003) before writing tests

- [ ] T050 [US7] Component test for DeepChain in `src/demos/__tests__/DeepChain.spec.tsx` (test demo creates 5-node chain: signalA → memoB → memoC → memoD → effectE, verify all nodes execute in sequence when signalA updates)
- [ ] T051 [US7] **Commit User Story 7 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 7

- [ ] T052 [US7] Implement DeepChain component in `src/demos/DeepChain.tsx` (createTrackedSignal for signalA, createTrackedMemo chain for memoB→memoC→memoD, createTrackedEffect for effectE, input control to update signalA, display all intermediate values)
- [ ] T053 [US7] Register DeepChain in `src/demos/demoRegistry.ts` (add 'deep-chain' entry with metadata: name="Deep Chain", concept="Propagation Depth", description, instructions)
- [ ] T054 [US7] **Commit completed User Story 7 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: Deep Chain demo should work independently, showing long propagation sequences

---

## Phase 10: User Story 8 - Component Tree Demo (Priority: P8)

**Goal**: Demonstrate realistic component hierarchy with shared state, showing how multiple components interact and dispose properly

**Independent Test**: Load demo, add/delete todo items, update shared theme signal, verify: (1) ownership tree reflects component hierarchy, (2) component disposal cleans up effects, (3) shared signals trigger multiple component effects

### Tests for User Story 8

> **REMINDER**: Consult `specs/TESTING-GUIDE.md` (from T003) before writing tests

- [ ] T055 [US8] Component test for ComponentTree in `src/demos/__tests__/ComponentTree.spec.tsx` (test demo creates component hierarchy with Header, TodoList, TodoItem components, verify shared theme signal affects multiple components, verify component disposal on item delete)
- [ ] T056 [US8] **Commit User Story 8 tests** (Constitution Principle XXII - REQUIRED)

### Implementation for User Story 8

- [ ] T057 [US8] Implement ComponentTree component in `src/demos/ComponentTree.tsx` (createTrackedSignal for theme and todos, Header/TodoList/TodoItem sub-components with local effects, add/delete todo buttons, theme toggle, display component tree)
- [ ] T058 [US8] Register ComponentTree in `src/demos/demoRegistry.ts` (add 'component-tree' entry with metadata: name="Component Tree", concept="Component Hierarchy", description, instructions)
- [ ] T059 [US8] **Commit completed User Story 8 implementation** (Constitution Principle XXII - REQUIRED)

**Checkpoint**: Component Tree demo should work independently, showing real-world component patterns

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple demos and overall system quality

- [ ] T060 [P] Run quality gates: `npm run check` (must pass with 0 errors/warnings)
- [ ] T061 [P] Run quality gates: `npm run lint:css` (must pass with 0 errors/warnings)
- [ ] T062 [P] Run quality gates: `npm run typecheck` (must pass with 0 errors)
- [ ] T063 Run all tests: `npx vitest run --no-watch` (ALL 617+ tests must pass)
- [ ] T064 Verify all 52 functional requirements met (FR-001 through FR-052 from spec.md)
- [ ] T065 Verify all 8 success criteria measurable and passing (SC-001 through SC-008 from spec.md)
- [ ] T066 Update AGENTS.md with demo system architecture and patterns (document demo creation workflow, isolation strategy, registry pattern)
- [ ] T067 **Commit polish and cross-cutting improvements** (Constitution Principle XXII - REQUIRED)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-10)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed) or sequentially in priority order
  - Each story is independently testable and deployable
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1) - Simple Counter**: Can start after Foundational - No dependencies on other demos
- **US2 (P2) - Derived State**: Can start after Foundational - Independent of US1
- **US3 (P3) - Diamond Pattern**: Can start after Foundational - Independent of US1-2
- **US4 (P4) - Batch Updates**: Can start after Foundational - Independent of US1-3
- **US5 (P5) - Nested Effects**: Can start after Foundational - Independent of US1-4
- **US6 (P6) - Conditional Dependencies**: Can start after Foundational - Independent of US1-5
- **US7 (P7) - Deep Chain**: Can start after Foundational - Independent of US1-6
- **US8 (P8) - Component Tree**: Can start after Foundational - Independent of US1-7

**All demos are fully independent and can be implemented in any order once Foundational is complete**

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Test-First Development)
- Demo component implementation depends on tests being written
- Registry registration depends on demo component existing
- Commit after tests, commit after implementation (Principle XXII)

### Parallel Opportunities

- **Phase 1 (Setup)**: T001 (single task, no parallelization)
- **Phase 2 (Foundational)**: 
  - All test tasks T004-T008 can run in parallel (different test files)
  - Implementation tasks T011-T016 can run in parallel (different component files)
- **Phases 3-10 (User Stories)**: 
  - Once Foundational completes, ALL 8 user stories can start in parallel (different demo files)
  - Within each story, test and implementation are sequential
- **Phase 11 (Polish)**:
  - Quality gate tasks T060-T062 can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# After T003 (reading TESTING-GUIDE.md), launch all foundational tests together:
Task: "Unit test for DemoContext in src/demos/__tests__/DemoContext.spec.ts"
Task: "Unit test for demoRegistry in src/demos/__tests__/demoRegistry.spec.ts"
Task: "Component test for DemoMenu in src/visualization/__tests__/DemoMenu.spec.tsx"
Task: "Component test for DemoPanel in src/visualization/__tests__/DemoPanel.spec.tsx"
Task: "Component test for WelcomeMessage in src/visualization/__tests__/WelcomeMessage.spec.tsx"
Task: "Integration test for error handling in src/__tests__/DemoErrorHandling.spec.tsx"

# After tests pass, launch all foundational implementation tasks together:
Task: "Create Demo types in src/demos/types.ts"
Task: "Implement DemoContext in src/demos/DemoContext.tsx"
Task: "Implement DemoMenu component in src/visualization/DemoMenu.tsx"
Task: "Implement DemoPanel component in src/visualization/DemoPanel.tsx"
Task: "Implement WelcomeMessage component in src/visualization/WelcomeMessage.tsx"
Task: "Implement DemoErrorFallback component in src/visualization/DemoErrorFallback.tsx"
```

## Parallel Example: User Stories (After Foundational Complete)

```bash
# All 8 demos can be implemented in parallel by different developers:
Developer A: Phase 3 (US1 - Simple Counter)
Developer B: Phase 4 (US2 - Derived State)
Developer C: Phase 5 (US3 - Diamond Pattern)
Developer D: Phase 6 (US4 - Batch Updates)
Developer E: Phase 7 (US5 - Nested Effects)
Developer F: Phase 8 (US6 - Conditional Dependencies)
Developer G: Phase 9 (US7 - Deep Chain)
Developer H: Phase 10 (US8 - Component Tree)

# Or sequentially by priority if single developer:
Complete US1 (Simple Counter) → Test independently → Deploy as MVP
Complete US2 (Derived State) → Test independently → Deploy
... continue through US8
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T019, including T009a and T016a) - CRITICAL foundation
3. Complete Phase 3: User Story 1 - Simple Counter (T020-T024)
4. **STOP and VALIDATE**: Test Simple Counter independently via demo menu
5. Run quality gates (check, lint:css, typecheck)
6. Deploy/demo if ready - you now have a working demo system with 1 educational example

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Demo system infrastructure ready
2. Add US1 (Simple Counter) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Derived State) → Test independently → Deploy/Demo
4. Add US3 (Diamond Pattern) → Test independently → Deploy/Demo
5. Continue through US8 - each demo adds educational value without breaking previous demos
6. Each demo is independently testable and deployable

### Parallel Team Strategy

With multiple developers (8+ team):

1. Team completes Setup + Foundational together (blocking phase)
2. Once Foundational is done (after T019):
   - Developer 1: US1 (Simple Counter)
   - Developer 2: US2 (Derived State)
   - Developer 3: US3 (Diamond Pattern)
   - Developer 4: US4 (Batch Updates)
   - Developer 5: US5 (Nested Effects)
   - Developer 6: US6 (Conditional Dependencies)
   - Developer 7: US7 (Deep Chain)
   - Developer 8: US8 (Component Tree)
3. All demos complete independently and integrate seamlessly (no merge conflicts - different files)

---

## Task Count Summary

- **Total Tasks**: 69
- **Setup (Phase 1)**: 2 tasks
- **Foundational (Phase 2)**: 19 tasks (8 tests + 10 implementation + 1 commit)
- **User Story 1 (Phase 3)**: 5 tasks (1 test + 3 implementation + 1 commit)
- **User Story 2 (Phase 4)**: 5 tasks (1 test + 3 implementation + 1 commit)
- **User Story 3 (Phase 5)**: 5 tasks (1 test + 3 implementation + 1 commit)
- **User Story 4 (Phase 6)**: 5 tasks (1 test + 3 implementation + 1 commit)
- **User Story 5 (Phase 7)**: 5 tasks (1 test + 3 implementation + 1 commit)
- **User Story 6 (Phase 8)**: 5 tasks (1 test + 3 implementation + 1 commit)
- **User Story 7 (Phase 9)**: 5 tasks (1 test + 3 implementation + 1 commit)
- **User Story 8 (Phase 10)**: 5 tasks (1 test + 3 implementation + 1 commit)
- **Polish (Phase 11)**: 8 tasks

**Parallel Opportunities**: 24 tasks marked [P] can run in parallel within their phases

**Suggested MVP Scope**: Setup + Foundational + US1 (26 tasks total for minimal viable demo system)

---

## Format Validation

✅ **ALL tasks follow required checklist format**:
- All tasks start with `- [ ]` checkbox
- All tasks have sequential Task ID (T001-T069, including T009a and T016a)
- All parallelizable tasks marked with `[P]`
- All user story tasks marked with `[Story]` label (US1-US8)
- All tasks include exact file paths
- All phase groups end with explicit commit task (Principle XXII compliance)

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each demo is independently completable and testable
- Tests MUST fail before implementing (Test-First Development)
- **CRITICAL (Constitution Principle XXII)**: Every phase ends with explicit "Commit [description]" task
- Commit after each phase completion - NEVER skip commit tasks
- Stop at any checkpoint to validate demo independently
- All 8 demos use same infrastructure but are fully independent implementations
