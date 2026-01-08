# Tasks: Animation System

**Input**: Design documents from `/specs/003-animation-system/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test-first development per constitution (Principle I). Tests written before implementation.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: Directory structure and D3 dependencies

- [x] T001 Create animation module directory structure: src/animation/__tests__/
- [x] T002 Create visualization controls directory: src/visualization/controls/__tests__/
- [x] T003 Verify D3 transition/ease/interpolate packages are installed (check package.json, add if missing)

---

## Phase 2: Foundational (Core Animation Infrastructure)

**Purpose**: Animation queue and types that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create animation types in src/animation/types.ts (copy from contracts/types.ts, adapt for implementation)
- [x] T005 [P] Write tests for AnimationQueue in src/animation/__tests__/AnimationQueue.spec.ts
- [x] T006 Implement AnimationQueue in src/animation/AnimationQueue.ts (queue management, coalescing, pause/resume)
- [x] T007 [P] Write tests for easing utilities in src/animation/__tests__/easing.spec.ts
- [x] T008 Implement easing utilities in src/animation/easing.ts (wrap D3 ease functions)
- [x] T009 Create barrel export in src/animation/index.ts

**Checkpoint**: Core animation infrastructure ready - user story implementation can begin

---

## Phase 3: User Story 1 - Signal Write Propagation (Priority: P1) MVP

**Goal**: Animate node pulses and edge particles when signals change

**Independent Test**: Change a signal value → observe node pulse and particle traveling along edge

### Tests for User Story 1

- [x] T010 [P] [US1] Write tests for NodeAnimator pulse in src/animation/__tests__/NodeAnimator.spec.ts
- [x] T011 [P] [US1] Write tests for EdgeAnimator particle in src/animation/__tests__/EdgeAnimator.spec.ts

### Implementation for User Story 1

- [x] T012 [US1] Implement NodeAnimator pulse animation in src/animation/NodeAnimator.ts
- [x] T013 [US1] Implement EdgeAnimator particle animation in src/animation/EdgeAnimator.ts
- [x] T014 [P] [US1] Write tests for useAnimationController in src/animation/__tests__/useAnimationController.spec.ts
- [x] T015 [US1] Implement useAnimationController hook in src/animation/useAnimationController.ts (subscribe to tracker events)
- [x] T016 [US1] Integrate animations into DependencyGraph.tsx (pass visual state to nodes/edges)
- [x] T017 [US1] Update SignalNode.tsx to accept and render pulse scale from visual state
- [x] T018 [US1] Update MemoNode.tsx to accept and render pulse scale from visual state
- [x] T019 [US1] Update EffectNode.tsx to accept and render pulse scale from visual state
- [x] T020 [US1] Add particle rendering to edge paths in DependencyGraph.tsx
- [x] T021 [US1] Update src/animation/index.ts exports

**Checkpoint**: Signal write → node pulse + edge particle animation working

---

## Phase 4: User Story 2 - Playback Controls (Priority: P2)

**Goal**: Pause/resume animations and control speed

**Independent Test**: Trigger animation → pause → resume → adjust speed slider

### Tests for User Story 2

- [ ] T022 [P] [US2] Write tests for PlaybackControls in src/visualization/controls/__tests__/PlaybackControls.spec.tsx

### Implementation for User Story 2

- [ ] T023 [US2] Create PlaybackControls.module.css in src/visualization/controls/
- [ ] T024 [US2] Implement PlaybackControls.tsx in src/visualization/controls/ (pause/play button, speed slider, pending count)
- [ ] T025 [US2] Create barrel export in src/visualization/controls/index.ts
- [ ] T026 [US2] Integrate PlaybackControls into App.tsx or DependencyGraph.tsx
- [ ] T027 [US2] Wire PlaybackController to AnimationQueue pause/resume/speed

**Checkpoint**: Playback controls functional - can pause, resume, adjust speed

---

## Phase 5: User Story 3 - Node State Transitions (Priority: P2)

**Goal**: Visual indicators for stale, executing, and fade-out states

**Independent Test**: Change signal → observe memo node shows stale → executing → fade-out sequence

### Tests for User Story 3

- [ ] T028 [P] [US3] Write tests for node state animations in src/animation/__tests__/NodeAnimator.spec.ts (extend existing)

### Implementation for User Story 3

- [ ] T029 [US3] Add stale indicator animation to NodeAnimator.ts
- [ ] T030 [US3] Add executing indicator animation to NodeAnimator.ts
- [ ] T031 [US3] Add fade-out animation to NodeAnimator.ts
- [ ] T032 [US3] Update node components to render stale/executing/highlight states from NodeVisualState
- [ ] T033 [US3] Subscribe to computation-execute-start/end events in useAnimationController.ts

**Checkpoint**: Node state transitions visible during reactive updates

---

## Phase 6: User Story 4 - Subscription Changes (Priority: P3)

**Goal**: Animate edge add/remove when dependencies change

**Independent Test**: Create memo with conditional dependency → toggle condition → observe edge fade-in/out

### Tests for User Story 4

- [ ] T034 [P] [US4] Write tests for edge add/remove animations in src/animation/__tests__/EdgeAnimator.spec.ts (extend existing)

### Implementation for User Story 4

- [ ] T035 [US4] Add edge draw-in animation to EdgeAnimator.ts
- [ ] T036 [US4] Add edge fade-out/retract animation to EdgeAnimator.ts
- [ ] T037 [US4] Subscribe to subscription-add/remove events in useAnimationController.ts
- [ ] T038 [US4] Update DependencyGraph.tsx to render edge add/remove progress

**Checkpoint**: Edge subscription changes animate smoothly

---

## Phase 7: User Story 5 - Disposal Animations (Priority: P3)

**Goal**: Animate node disposal with fade-to-gray and shrink

**Independent Test**: Dispose an effect → observe node grays out, shrinks, edges retract

### Tests for User Story 5

- [ ] T039 [P] [US5] Write tests for disposal animation in src/animation/__tests__/NodeAnimator.spec.ts (extend existing)

### Implementation for User Story 5

- [ ] T040 [US5] Add disposal animation to NodeAnimator.ts (fade-to-gray, shrink)
- [ ] T041 [US5] Coordinate edge retraction before node disposal in useAnimationController.ts
- [ ] T042 [US5] Subscribe to computation-dispose events in useAnimationController.ts
- [ ] T043 [US5] Update node components to render dispose progress (grayscale, scale)

**Checkpoint**: Disposal animations complete the reactive lifecycle visualization

---

## Phase 8: Polish & Quality Gates

**Purpose**: Performance optimization, batch support, final quality checks

- [ ] T044 [P] Add batch indicator animation support to useAnimationController.ts (parallel pulses with grouping)
- [ ] T045 [P] Create CSS module for animation visual effects in src/animation/animations.module.css
- [ ] T046 Performance test: verify 60fps with 50 concurrent animations
- [ ] T047 Run npm run check (Biome lint/format)
- [ ] T048 Run npm run typecheck (TypeScript)
- [ ] T049 Run npm run lint:css (Stylelint)
- [ ] T050 Run npx vitest run --coverage --no-watch (verify 80% coverage)
- [ ] T051 Update AGENTS.md if needed
- [ ] T052 Final integration test: complete reactive chain animation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on Foundational - MVP deliverable
- **User Story 2 (P2)**: Depends on Foundational + US1 (needs animations to control)
- **User Story 3 (P2)**: Depends on Foundational + US1 (extends node animations)
- **User Story 4 (P3)**: Depends on Foundational + US1 (extends edge animations)
- **User Story 5 (P3)**: Depends on Foundational + US1 (extends node animations)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Core animations before integration
- Integration before component updates

---

## Parallel Opportunities

### Phase 2 (Foundational)
```
Parallel: T004, T005, T007 (different files)
Sequential: T006 after T005, T008 after T007
```

### Phase 3 (US1)
```
Parallel: T010, T011 (test files)
Parallel: T017, T018, T019 (different node components)
Sequential: T012 after T010, T013 after T011
```

### Across User Stories
```
After Foundational complete:
- US2, US3, US4, US5 can proceed in parallel (different concerns)
- But US2-5 all benefit from US1 being complete first
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Signal write animates node pulse + edge particle
5. Demo MVP: Core animation system working

### Incremental Delivery

1. Setup + Foundational → Animation infrastructure ready
2. Add US1 → Signal propagation visible → Demo (MVP!)
3. Add US2 → Playback controls → User can pause and study
4. Add US3 → State transitions → Full node lifecycle visible
5. Add US4 → Subscription changes → Dynamic dependencies visible
6. Add US5 → Disposal → Complete lifecycle
7. Polish → Performance verified, quality gates pass

---

## Notes

- Constitution requires test-first: write tests before implementation
- All tasks include exact file paths
- [P] tasks can run in parallel (different files)
- Each checkpoint verifies independent functionality
- Quality gates (T047-T050) are NON-NEGOTIABLE per constitution
