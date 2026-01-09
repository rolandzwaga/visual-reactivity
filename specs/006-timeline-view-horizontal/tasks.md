# Implementation Tasks: Timeline View - Horizontal Timeline Visualization

**Feature**: 006-timeline-view-horizontal  
**Branch**: `006-timeline-view-horizontal`  
**Generated**: 2026-01-09

---

## Overview

This task list implements a horizontal timeline visualization with swimlanes for debugging reactive event sequences. Tasks are organized by user story to enable independent, parallelized implementation.

**Total User Stories**: 6 (4 P1, 2 P2, 1 P3)  
**Estimated Total Tasks**: 75+  
**Test Strategy**: Test-first development (Constitution Principle I)

---

## Implementation Strategy

### MVP Scope (Recommended First Increment)

**User Story 1 Only**: View Event Sequence on Timeline
- Delivers core value: chronological event display with swimlanes
- Independently testable and demoable
- Foundation for all other stories

### Incremental Delivery Order

1. **Increment 1** (MVP): US1 - Basic timeline visualization
2. **Increment 2**: US2 - Event inspection (tooltips + details panel)
3. **Increment 3**: US3 + US4 - Cursor scrubbing + batch grouping (complementary features)
4. **Increment 4**: US5 + US6 - Filtering + playback (nice-to-have features)

---

## User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3+ (User Stories)
                                           ├─ US1 (P1) ← Required for all others
                                           ├─ US2 (P1) ← Depends on US1
                                           ├─ US3 (P2) ← Depends on US1
                                           ├─ US4 (P2) ← Depends on US1
                                           ├─ US5 (P3) ← Depends on US1
                                           └─ US6 (P3) ← Depends on US1, US3
```

**Note**: US2-US6 all depend on US1 (basic timeline). US6 (playback) also depends on US3 (cursor).

---

## Phase 1: Setup & Dependencies

**Goal**: Install dependencies and create type definitions

- [ ] T001 Install d3-axis and d3-brush dependencies with `npm install d3-axis@^3.0.0 d3-brush@^3.0.0 @types/d3-axis@^3.0.0 @types/d3-brush@^3.0.0`
- [ ] T002 [P] Create timeline type definitions in src/types/timeline.ts (copy from specs/006-timeline-view-horizontal/contracts/types.ts)
- [ ] T003 [P] Export timeline types from src/types/index.ts
- [ ] T004 Run typecheck to verify type definitions compile correctly

---

## Phase 2: Foundation (Blocking Prerequisites)

**Goal**: Create pure utility functions and D3 wrappers needed by all user stories

### Utilities (Test-First)

- [ ] T005 [P] Write tests for event batch detection in src/lib/__tests__/eventBatcher.spec.ts
- [ ] T006 [P] Implement eventBatcher utility in src/lib/eventBatcher.ts (50ms windowing algorithm)
- [ ] T007 [P] Write tests for event density analyzer in src/lib/__tests__/eventDensityAnalyzer.spec.ts
- [ ] T008 [P] Implement eventDensityAnalyzer utility in src/lib/eventDensityAnalyzer.ts (>50 events/100px clustering)
- [ ] T009 [P] Write tests for keyboard navigation in src/lib/__tests__/timelineNavigation.spec.ts
- [ ] T010 [P] Implement timelineNavigation utility in src/lib/timelineNavigation.ts (arrow keys, Home/End, Space)

### D3 Wrappers (Test-First)

- [ ] T011 [P] Write tests for time scale wrapper in src/d3/__tests__/timelineScale.spec.ts
- [ ] T012 [P] Implement timelineScale wrapper in src/d3/timelineScale.ts (d3.scaleUtc for timezone independence)
- [ ] T013 [P] Write tests for axis wrapper in src/d3/__tests__/timelineAxis.spec.ts
- [ ] T014 [P] Implement timelineAxis wrapper in src/d3/timelineAxis.ts (d3.axisBottom with smart tick formatting)
- [ ] T015 [P] Write tests for brush behavior wrapper in src/d3/__tests__/timelineBrush.spec.ts
- [ ] T016 [P] Implement timelineBrush wrapper in src/d3/timelineBrush.ts (d3.brushX with snap-to-event)

### State Management (Test-First)

- [ ] T017 Write tests for timeline store in src/stores/__tests__/timelineStore.spec.ts
- [ ] T018 Implement timelineStore in src/stores/timelineStore.ts (cursor, filters, playback, liveMode state)
- [ ] T019 [P] Write tests for timeline state hook in src/visualization/hooks/__tests__/useTimelineState.spec.ts (use testInRoot helper)
- [ ] T020 [P] Implement useTimelineState hook in src/visualization/hooks/useTimelineState.ts (wrap timelineStore with actions)
- [ ] T021 [P] Write tests for layout hook in src/visualization/hooks/__tests__/useTimelineLayout.spec.ts (use testInRoot helper)
- [ ] T022 [P] Implement useTimelineLayout hook in src/visualization/hooks/useTimelineLayout.ts (d3.scaleBand for swimlane positions)

**Checkpoint**: Run `npm test` - All foundation tests must pass before proceeding to user stories

---

## Phase 3: User Story 1 - View Event Sequence on Timeline (P1)

**Goal**: Display reactive events chronologically on horizontal timeline with swimlanes

**Independent Test Criteria**:
- Trigger reactive updates, verify timeline displays events in chronological order
- Confirm each reactive node gets its own swimlane with label
- Verify event marks positioned proportionally by timestamp
- Test horizontal scrolling for long event sequences

**Why US1 First**: Core value - foundation for all other features

### US1: Core Components (Test-First)

- [ ] T023 [P] [US1] Write tests for EventMark component in src/visualization/timeline/__tests__/EventMark.spec.tsx
- [ ] T024 [P] [US1] Implement EventMark component in src/visualization/timeline/EventMark.tsx (SVG circle/rect at x,y position)
- [ ] T025 [P] [US1] Create EventMark styles in src/visualization/timeline/EventMark.module.css
- [ ] T026 [P] [US1] Write tests for Swimlane component in src/visualization/timeline/__tests__/Swimlane.spec.tsx
- [ ] T027 [P] [US1] Implement Swimlane component in src/visualization/timeline/Swimlane.tsx (SVG group with label + events)
- [ ] T028 [P] [US1] Create Swimlane styles in src/visualization/timeline/Swimlane.module.css
- [ ] T029 [P] [US1] Write tests for TimelineAxis component in src/visualization/timeline/__tests__/TimelineAxis.spec.tsx
- [ ] T030 [P] [US1] Implement TimelineAxis component in src/visualization/timeline/TimelineAxis.tsx (apply D3 axis in onMount with ref)
- [ ] T031 [P] [US1] Create TimelineAxis styles in src/visualization/timeline/TimelineAxis.module.css

### US1: Main Timeline View (Test-First)

- [ ] T032 [US1] Write tests for TimelineView component in src/visualization/__tests__/TimelineView.spec.tsx
- [ ] T033 [US1] Implement TimelineView component in src/visualization/TimelineView.tsx (SVG container integrating swimlanes, axis, zoom)
- [ ] T034 [US1] Create TimelineView styles in src/visualization/TimelineView.module.css
- [ ] T035 [US1] Subscribe to ReactivityTracker events in TimelineView onMount (append new events to timeline)
- [ ] T036 [US1] Implement horizontal scrolling for timeline viewport
- [ ] T037 [US1] Implement virtual scrolling for off-screen event culling (>1000 events performance)
- [ ] T038 [P] [US1] Implement event aggregation for high-density regions (>50 events per 100px, create EventCluster instances) [FR-019 - MUST requirement]

### US1: Integration & Verification

- [ ] T039 [US1] Run quality gates: `npm run lint:css && npm run check && npm run typecheck`
- [ ] T040 [US1] Create manual test: sample app with 50+ tracked signals generating 1000+ events
- [ ] T041 [US1] Verify US1 acceptance criteria: events chronological, swimlanes per node, proportional positioning, scrolling works
- [ ] T042 [US1] Verify 60fps performance with 1000+ events (measure frame time <16ms)
- [ ] T043 [US1] Integrate TimelineView into main app layout (add to src/App.tsx or create src/DevTools.tsx wrapper)

**US1 Parallel Opportunities**:
- EventMark, Swimlane, TimelineAxis components can be built in parallel (T023-T031)
- CSS files can be created in parallel with tests
- Event aggregation (T038) can be developed in parallel with main timeline view (T032-T037)

---

## Phase 4: User Story 2 - Inspect Event Details (P1)

**Goal**: Hover/click event marks to see detailed information

**Independent Test Criteria**:
- Hover over event mark, verify tooltip appears with event type, timestamp, values
- Click event mark, verify details panel shows complete event information
- Test tooltip positioning and panel updates

**Why US2 Second**: Essential for debugging value - timeline without details is just visualization

### US2: Tooltip & Details Panel (Test-First)

- [ ] T044 [P] [US2] Write tests for EventTooltip component in src/visualization/timeline/__tests__/EventTooltip.spec.tsx
- [ ] T045 [P] [US2] Implement EventTooltip component in src/visualization/timeline/EventTooltip.tsx (positioned overlay with event summary)
- [ ] T046 [P] [US2] Create EventTooltip styles in src/visualization/timeline/EventTooltip.module.css
- [ ] T047 [P] [US2] Write tests for EventDetailsPanel component in src/visualization/timeline/__tests__/EventDetailsPanel.spec.tsx
- [ ] T048 [P] [US2] Implement EventDetailsPanel component in src/visualization/timeline/EventDetailsPanel.tsx (sidebar with full event metadata)
- [ ] T049 [P] [US2] Create EventDetailsPanel styles in src/visualization/timeline/EventDetailsPanel.module.css

### US2: Event Interaction (Test-First)

- [ ] T050 [US2] Add hover handlers to EventMark component (show tooltip on mouseenter/mouseleave)
- [ ] T051 [US2] Add click handlers to EventMark component (select event, open details panel)
- [ ] T052 [US2] Implement event selection state in timelineStore (selectedEventIds)
- [ ] T053 [US2] Display execution duration for computation events (start time, end time, total duration)
- [ ] T054 [US2] Implement multi-event selection for comparison (Ctrl+click to select multiple)

### US2: Integration & Verification

- [ ] T055 [US2] Run quality gates: `npm run lint:css && npm run check && npm run typecheck`
- [ ] T056 [US2] Verify US2 acceptance criteria: tooltip on hover, details panel on click, duration display for computations
- [ ] T057 [US2] Test with various event types: signal-read, signal-write, computation-execute, computation-dispose

**US2 Parallel Opportunities**:
- EventTooltip and EventDetailsPanel components can be built in parallel (T044-T049)

---

## Phase 5: User Story 3 - Navigate Timeline with Scrubbing (P2)

**Goal**: Scrub through time with draggable cursor, keyboard navigation

**Independent Test Criteria**:
- Drag cursor on timeline, verify it moves smoothly and displays timestamp
- Test snap-to-event within 10px threshold
- Use arrow keys, verify cursor jumps to prev/next event
- Verify state views update to reflect cursor timestamp (if other views visible)

**Why US3 Third**: Enhances debugging capability, enables step-by-step execution analysis

### US3: Timeline Cursor (Test-First)

- [ ] T058 [P] [US3] Write tests for TimelineCursor component in src/visualization/timeline/__tests__/TimelineCursor.spec.tsx
- [ ] T059 [P] [US3] Implement TimelineCursor component in src/visualization/timeline/TimelineCursor.tsx (apply D3 brush in onMount)
- [ ] T060 [P] [US3] Create TimelineCursor styles in src/visualization/timeline/TimelineCursor.module.css
- [ ] T061 [US3] Integrate TimelineCursor into TimelineView component
- [ ] T062 [US3] Implement cursor position state management in timelineStore (cursor time, x position, snapped event)
- [ ] T063 [US3] Implement snap-to-event algorithm (find nearest event within 10px, update cursor)

### US3: Keyboard Navigation (Test-First)

- [ ] T064 [US3] Add keyboard event listener in TimelineView (ArrowLeft/Right, Home/End, Space)
- [ ] T065 [US3] Implement jumpToPreviousEvent action (find event before cursor time, move cursor)
- [ ] T066 [US3] Implement jumpToNextEvent action (find event after cursor time, move cursor)
- [ ] T067 [US3] Implement jumpToStart action (move cursor to first event timestamp)
- [ ] T068 [US3] Implement jumpToEnd action (move cursor to last event timestamp)
- [ ] T069 [US3] Prevent default browser scrolling when using arrow keys in timeline

### US3: Integration & Verification

- [ ] T070 [US3] Run quality gates: `npm run lint:css && npm run check && npm run typecheck`
- [ ] T071 [US3] Verify US3 acceptance criteria: cursor appears on click/drag, smooth movement, snap-to-event, keyboard navigation works
- [ ] T072 [US3] Test cursor positioning accuracy with events at various timestamps

**US3 Parallel Opportunities**:
- TimelineCursor component can be built in parallel with keyboard navigation logic (T058-T063 parallel with T064-T069)

---

## Phase 6: User Story 4 - Group Related Events into Batches (P2)

**Goal**: Visually group events that occurred synchronously

**Independent Test Criteria**:
- Trigger batched reactive updates (multiple signals updated in same tick)
- Verify events visually grouped with background highlight/bracket
- Hover batch indicator, verify tooltip shows batch ID, event count, duration
- Test nested batch visualization if SolidJS exposes nested batch info

**Why US4 Fourth**: Valuable for understanding synchronous vs asynchronous updates, complements cursor navigation

### US4: Batch Visualization (Test-First)

- [ ] T073 [P] [US4] Write tests for BatchIndicator component in src/visualization/timeline/__tests__/BatchIndicator.spec.tsx
- [ ] T074 [P] [US4] Implement BatchIndicator component in src/visualization/timeline/BatchIndicator.tsx (SVG rect spanning batch duration)
- [ ] T075 [P] [US4] Create BatchIndicator styles in src/visualization/timeline/BatchIndicator.module.css
- [ ] T076 [US4] Detect event batches using eventBatcher utility (assign batchId to events within 50ms window)
- [ ] T077 [US4] Render BatchIndicator for each detected batch in Swimlane component
- [ ] T078 [US4] Add batch hover handler to show tooltip (batch ID, event count, duration)

### US4: Integration & Verification

- [ ] T079 [US4] Run quality gates: `npm run lint:css && npm run check && npm run typecheck`
- [ ] T080 [US4] Create manual test: trigger batch updates with `batch(() => { signal1.set(1); signal2.set(2); })`
- [ ] T081 [US4] Verify US4 acceptance criteria: batches visually grouped, tooltip shows metadata, distinct from async sequences

**US4 Parallel Opportunities**:
- BatchIndicator component, eventBatcher integration, and tooltip logic can be developed in parallel once eventBatcher utility exists (from Phase 2)

---

## Phase 7: User Story 5 - Filter Events by Type and Node (P3)

**Goal**: Filter timeline to show only relevant events

**Independent Test Criteria**:
- Apply event type filter, verify only matching events displayed
- Apply node filter, verify only selected node swimlanes displayed
- Test filter combinations (type + node)
- Clear filters, verify all events/swimlanes restored

**Why US5 Fifth**: Nice-to-have for reducing visual noise in complex apps, not critical for basic debugging

### US5: Filter Controls (Test-First)

- [ ] T082 [P] [US5] Write tests for useEventFilters hook in src/visualization/hooks/__tests__/useEventFilters.spec.ts (use testInRoot helper)
- [ ] T083 [P] [US5] Implement useEventFilters hook in src/visualization/hooks/useEventFilters.ts (createMemo for filtered events, layer toggles)
- [ ] T084 [P] [US5] Write tests for TimelineFilters component in src/visualization/timeline/__tests__/TimelineFilters.spec.tsx
- [ ] T085 [P] [US5] Implement TimelineFilters component in src/visualization/timeline/TimelineFilters.tsx (checkbox group for event types, node multiselect, search input)
- [ ] T086 [P] [US5] Create TimelineFilters styles in src/visualization/timeline/TimelineFilters.module.css

### US5: Filter Application (Test-First)

- [ ] T087 [US5] Integrate TimelineFilters component into TimelineView
- [ ] T088 [US5] Apply event type filters (filter events by enabledEventTypes set)
- [ ] T089 [US5] Apply node filters (hide swimlanes for unselected nodes)
- [ ] T090 [US5] Implement search-based filtering (filter events by text query across nodeId, type, data)
- [ ] T091 [US5] Add filter state persistence to localStorage (save/restore filter preferences)
- [ ] T092 [US5] Display active filter indicators (show count of hidden events/swimlanes)
- [ ] T093 [US5] Implement "Clear all filters" button (reset to show all events)

### US5: Integration & Verification

- [ ] T094 [US5] Run quality gates: `npm run lint:css && npm run check && npm run typecheck`
- [ ] T095 [US5] Verify US5 acceptance criteria: type filtering works, node filtering works, clear filters restores view, indicators show active filters
- [ ] T096 [US5] Test filtering performance with 1000+ events (verify <100ms filter update time)

**US5 Parallel Opportunities**:
- useEventFilters hook and TimelineFilters component can be built in parallel (T082-T086)
- Filter persistence, indicators, and clear button can be developed in parallel once core filtering exists (T091-T093)

---

## Phase 8: User Story 6 - Control Playback Speed and Animation (P3)

**Goal**: Automatically advance cursor through events with speed controls

**Independent Test Criteria**:
- Click play button, verify cursor advances automatically through events
- Adjust speed slider (0.5x, 1x, 2x, 5x), verify cursor speed changes
- Click pause, verify cursor stops
- Test playback completion (cursor reaches end, auto-pause)
- Manually scrub during playback, verify playback pauses

**Why US6 Last**: Nice-to-have for presentations and pattern recognition, not essential for debugging

### US6: Playback Controller (Test-First)

- [ ] T097 [P] [US6] Write tests for usePlaybackController hook in src/visualization/hooks/__tests__/usePlaybackController.spec.ts (use useMockDate + flushMicrotasks helpers)
- [ ] T098 [P] [US6] Implement usePlaybackController hook in src/visualization/hooks/usePlaybackController.ts (requestAnimationFrame loop, rate multiplier, 50ms max delta)
- [ ] T099 [P] [US6] Write tests for PlaybackControls component in src/visualization/timeline/__tests__/PlaybackControls.spec.tsx
- [ ] T100 [P] [US6] Implement PlaybackControls component in src/visualization/timeline/PlaybackControls.tsx (play/pause buttons, speed selector 0.5x/1x/2x/5x)
- [ ] T101 [P] [US6] Create PlaybackControls styles in src/visualization/timeline/PlaybackControls.module.css

### US6: Playback Logic (Test-First)

- [ ] T102 [US6] Integrate PlaybackControls into TimelineView component
- [ ] T103 [US6] Implement play action (start requestAnimationFrame loop, set isPlaying=true)
- [ ] T104 [US6] Implement pause action (cancel animation frame, set isPlaying=false)
- [ ] T105 [US6] Implement setSpeed action (update speed multiplier 0.5x/1x/2x/5x)
- [ ] T106 [US6] Implement playback tick function (advance cursor by speed * delta, cap delta at 50ms)
- [ ] T107 [US6] Implement auto-pause at timeline end (detect cursor >= endTime, pause automatically)
- [ ] T108 [US6] Pause playback when user manually scrubs cursor (detect manual cursor move, pause if playing)

### US6: Integration & Verification

- [ ] T109 [US6] Run quality gates: `npm run lint:css && npm run check && npm run typecheck`
- [ ] T110 [US6] Verify US6 acceptance criteria: play advances cursor, speed adjustment works, pause stops, auto-pause at end, manual scrub pauses playback
- [ ] T111 [US6] Test playback smoothness (verify 60fps, <16ms per frame with 1000+ events)

**US6 Parallel Opportunities**:
- usePlaybackController hook and PlaybackControls component can be built in parallel (T097-T101)
- Play/pause/speed actions can be implemented in parallel once hook exists (T103-T105)

---

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Finalize edge cases, performance, accessibility, documentation

### Performance Optimization

- [ ] T112 [P] Add disposed node visual indicator (50% opacity, grayed out swimlane, show disposal time on hover)
- [ ] T113 [P] Optimize virtual scrolling (benchmark render time, ensure <16ms per frame with 10,000+ events)
- [ ] T114 [P] Add debouncing to zoom handler (prevent excessive recalculation during zoom)

### Edge Cases

- [ ] T115 [P] Handle events with identical timestamps (stack vertically or apply microsecond offset)
- [ ] T116 [P] Handle empty state (no events) - display "No events recorded" message
- [ ] T117 [P] Handle empty filter state (all events filtered out) - display "No events match filters. Clear filters to restore view."
- [ ] T118 [P] Handle real-time events during playback (add to timeline but don't auto-extend playback range, show "N new events" indicator)

### Accessibility & UX

- [ ] T119 [P] Add ARIA labels to all interactive elements (event marks, cursor, playback controls, filters)
- [ ] T120 [P] Ensure keyboard navigation works for all controls (tab order, focus indicators)
- [ ] T121 [P] Add loading state for initial timeline render (spinner while processing events)
- [ ] T122 [P] Add error boundary for timeline rendering errors (catch D3/SVG errors gracefully)

### Documentation & Testing

- [ ] T123 Update AGENTS.md with timeline-specific patterns (D3 time scale usage, brush behavior, playback controller pattern)
- [ ] T124 Update CLAUDE.md with timeline implementation guidelines (refer to useTimelineState, usePlaybackController patterns)
- [ ] T125 Run full test suite and verify 80%+ coverage for timeline feature (`npm run test:coverage`)
- [ ] T126 Create comprehensive manual test scenarios (test all 6 user stories end-to-end with sample app)
- [ ] T127 Performance benchmark: Generate 10,000 events across 100 nodes, verify 60fps scrolling/playback

### Final Quality Gates

- [ ] T128 Run all quality gates: `npm run lint:css && npm run check && npm run typecheck`
- [ ] T129 Verify all 20 functional requirements (FR-001 through FR-020) are met
- [ ] T130 Verify all 6 user stories pass independent test criteria
- [ ] T131 Verify zero failing tests: `npm test`

---

## Parallel Execution Examples

### Within User Story 1 (MVP)

Execute in parallel after foundation (Phase 2) completes:

```bash
# Terminal 1: EventMark component
npm test -- EventMark.spec.tsx --watch

# Terminal 2: Swimlane component  
npm test -- Swimlane.spec.tsx --watch

# Terminal 3: TimelineAxis component
npm test -- TimelineAxis.spec.tsx --watch
```

All three components can be developed simultaneously by different developers/sessions.

### Within User Story 2 (Event Inspection)

Execute in parallel after US1 completes:

```bash
# Terminal 1: EventTooltip component
npm test -- EventTooltip.spec.tsx --watch

# Terminal 2: EventDetailsPanel component
npm test -- EventDetailsPanel.spec.tsx --watch
```

### Within Foundation (Phase 2)

Many tasks can execute in parallel:

```bash
# All utility tests and D3 wrapper tests can run simultaneously
npm test -- eventBatcher.spec.ts eventDensityAnalyzer.spec.ts timelineNavigation.spec.ts timelineScale.spec.ts timelineAxis.spec.ts timelineBrush.spec.ts --watch
```

---

## Task Count Summary

- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundation)**: 18 tasks
- **Phase 3 (US1 - P1)**: 19 tasks
- **Phase 4 (US2 - P1)**: 14 tasks
- **Phase 5 (US3 - P2)**: 15 tasks
- **Phase 6 (US4 - P2)**: 9 tasks
- **Phase 7 (US5 - P3)**: 15 tasks
- **Phase 8 (US6 - P3)**: 15 tasks
- **Phase 9 (Polish)**: 21 tasks

**Total**: 130 tasks

**Parallel Opportunities**: ~40% of tasks marked [P] can execute in parallel

---

## Testing Strategy

**Constitution Principle I**: Test-First Development (NON-NEGOTIABLE)

Every implementation task follows this workflow:

1. **RED**: Write failing test describing desired behavior
2. **GREEN**: Write minimum code to pass test
3. **REFACTOR**: Improve while keeping tests green
4. **QUALITY**: Run `npm run check` and `npm run typecheck`

**Test Helpers** (from specs/TESTING-GUIDE.md):
- `testInRoot()` - Wrap signal/store tests in reactive root
- `useMockDate()` - Mock dates for timeline/playback tests
- `flushMicrotasks()` - Flush microtasks with fake timers

**Coverage Target**: 80%+ for business logic (Constitution Principle III)

---

## Format Validation

✅ All tasks follow required checklist format:
- [x] Checkbox: `- [ ]`
- [x] Task ID: Sequential (T003-T131)
- [x] [P] marker: Applied to parallelizable tasks
- [x] [Story] label: Applied to user story phase tasks (US1-US6)
- [x] Description: Clear action with exact file path

---

## Next Steps

1. **Approve dependencies**: Install d3-axis and d3-brush (Task T003)
2. **Start with MVP**: Execute Phase 1-3 (Setup + Foundation + US1)
3. **Incremental delivery**: Complete US1, demo, then proceed to US2
4. **Quality gates**: Run after each phase completion

**Command to start**: Begin with Task T003 (dependency installation)
