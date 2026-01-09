# Implementation Plan: Timeline Integration & Event Replay System

**Branch**: `009-timeline-playback` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-timeline-playback/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Integrate the existing Timeline component (from Feature 006) into the main App.tsx navigation and implement comprehensive event replay capabilities. Users will be able to access the timeline view through a navigation button, step through events one at a time, reconstruct historical graph states at any cursor position, save/load named recordings with IndexedDB persistence, and export/import recordings as JSON files for collaboration.

**Key Technical Approach**:
- Add Timeline as third view mode in App.tsx (alongside Graph and Tree)
- Create ReplayStore to manage replay state, cursor position, and recording metadata
- Implement state reconstruction system that queries event history to build historical graph snapshots
- Use IndexedDB for persistent recording storage with structured schema
- Enhance PlaybackControls with single-step, jump, loop, and speed preset features
- Add animation system for graph/tree transitions with 300ms duration and interruption support

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled  
**Primary Dependencies**: SolidJS 1.9.10, D3.js (d3-scale, d3-axis, d3-brush, d3-selection, d3-zoom - all already installed from Feature 006)  
**Storage**: IndexedDB for persistent recording storage (clarified via Q1: preferred over localStorage for capacity)  
**Testing**: Vitest 4.x with @solidjs/testing-library 0.8.10  
**Target Platform**: Browser-based web application (modern browsers with IndexedDB support)  
**Project Type**: Single web application (continuation of existing visual-reactivity project)  
**Performance Goals**:
  - Step-through response: <50ms per event navigation
  - Historical state reconstruction: <100ms latency
  - Animation: 60fps (300ms duration with interruption support)
  - Recording load: <5 seconds for 10,000+ events
  - Export/import: <2s for <10MB files, <10s for <100MB files

**Constraints**:
  - Animation duration: 300ms for graph/tree transitions (clarified via Q3)
  - Animation interruption: Must allow immediate cancellation on user input (clarified via Q5)
  - Recording names: Alphanumeric + dash/underscore/space, 1-100 chars, unique required (clarified via Q4)
  - Replay activation: Automatic on any cursor positioning (clarified via Q2)
  - No new npm dependencies: All required D3 modules already installed

**Scale/Scope**:
  - Support recordings with 100,000+ events (virtualization/sampling)
  - Maintain smooth 60fps playback for 1,000+ event sequences
  - Handle 50+ saved recordings in IndexedDB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Framework Compliance (Principle II, X)

- [x] **SolidJS Only**: No React patterns, use createSignal/createEffect/createMemo/createStore only
- [x] **TypeScript Strict Mode**: All code uses strict TypeScript (already enabled project-wide)
- [x] **Static Imports**: No dynamic import() except in vi.mock() (Principle XVII)
- [x] **Existing Dependencies**: No new npm dependencies required (D3 modules already installed)

### Test-First Development (Principle I)

- [x] **RED-GREEN-REFACTOR**: Write failing tests BEFORE implementation code
- [x] **All executable code requires tests**: Components, stores, utilities, replay logic
- [x] **Types exempt**: Pure type definitions in types/ don't require tests

### Testing Standards (Principles IV, XV, XXI)

- [x] **Testing Guide Consultation Required**: Read `specs/TESTING-GUIDE.md` before test implementation
- [x] **Use Centralized Helpers**: testInRoot(), useMockDate(), flushMicrotasks patterns
- [x] **Zero Failing Tests**: ALL tests MUST pass before completion (BLOCKER)
- [x] **Coverage Target**: 80% minimum for business logic
- [x] **SolidJS Patterns Only**: No React testing patterns (no act(), etc.)

### Quality Gates (Principles III, XIX)

**MANDATORY before completion**:
- [ ] `npm run lint:css` - Zero errors/warnings
- [ ] `npm run check` - Biome lint/format passes
- [ ] `npm run typecheck` - Zero TypeScript errors

### Atomic Task Commits (Principle XXII)

- [x] **Every task ends with commit**: Final todo item MUST be "Commit [description]"
- [x] **No uncommitted work**: Work is incomplete until committed
- [x] **Atomic commits**: One logical unit of work per commit

### Documentation Requirements (Principle XVI)

- [x] **Consult AGENTS.md**: Review existing architecture before planning
- [x] **Update AGENTS.md**: Add Feature 009 tech stack after completion

### Honest Completion (Principle XVIII)

- [x] **No placeholder implementations**: All features fully implemented
- [x] **No weakened tests**: Tests must match spec thresholds
- [x] **All acceptance criteria met**: 100% of user stories implemented

**GATE STATUS**: ✅ PASSED - No violations, all principles applicable and planned for

## Project Structure

### Documentation (this feature)

```text
specs/009-timeline-playback/
├── spec.md              # Feature specification (already created)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   ├── ReplayStore.ts   # ReplayStore API contract
│   ├── RecordingStore.ts # RecordingStore API contract
│   └── HistoricalState.ts # HistoricalGraphState contract
├── checklists/
│   └── requirements.md  # Spec quality checklist (already created)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

This is a **single web application project** (continuation of existing visual-reactivity structure).

```text
src/
├── stores/
│   ├── replayStore.ts           # NEW: Replay state management (cursor, mode, recordings)
│   ├── recordingStore.ts        # NEW: Recording persistence (IndexedDB wrapper)
│   ├── selectionStore.ts        # EXISTING: Selection sync (from Feature 007)
│   └── patternStore.ts          # EXISTING: Pattern detection (from Feature 008)
│
├── lib/
│   ├── indexedDB.ts             # NEW: IndexedDB utilities (open, read, write, delete)
│   ├── recordingSerializer.ts   # NEW: Recording JSON serialization/deserialization
│   ├── historicalState.ts       # NEW: Event history query and state reconstruction
│   └── validation.ts            # NEW: Recording name validation
│
├── visualization/
│   ├── App.tsx                  # MODIFY: Add Timeline view mode
│   ├── TimelineView.tsx         # EXISTING: From Feature 006 (integrate into App)
│   ├── DependencyGraph.tsx      # MODIFY: Subscribe to replay state
│   ├── OwnershipTree.tsx        # MODIFY: Subscribe to replay state
│   ├── DetailPanel.tsx          # MODIFY: Show historical values in replay mode
│   │
│   ├── timeline/
│   │   ├── PlaybackControls.tsx          # MODIFY: Add step, jump, loop, speed presets
│   │   ├── RecordingManager.tsx          # NEW: Save/load/delete UI
│   │   ├── ExportImportControls.tsx      # NEW: Export/import buttons
│   │   └── ReplayModeIndicator.tsx       # NEW: Visual replay mode badge/overlay
│   │
│   └── hooks/
│       ├── useReplayState.ts             # NEW: Subscribe to replay store
│       ├── useHistoricalGraph.ts         # NEW: Reconstruct graph at cursor time
│       └── useKeyboardNavigation.ts      # NEW: Arrow key handlers for stepping
│
├── types/
│   ├── replay.ts                # NEW: ReplayState, Recording, RecordingMetadata
│   ├── timeline.ts              # EXISTING: TimelineEvent, PlaybackState (from Feature 006)
│   └── index.ts                 # MODIFY: Export replay types
│
└── instrumentation/
    └── tracker.ts               # EXISTING: ReactivityTracker (no changes needed)

tests/ (co-located with source in __tests__ directories)
```

**Structure Decision**: This feature extends the existing single-project structure. Timeline component already exists from Feature 006 but was never integrated into App.tsx. We're adding replay/recording infrastructure alongside existing stores (selectionStore, patternStore) and enhancing the Timeline view with new playback features.

## Complexity Tracking

No Constitution violations requiring justification. This feature:
- Uses existing tech stack (SolidJS, D3, Vitest)
- No new dependencies
- Follows established patterns (stores for state, hooks for subscriptions, lib for utilities)
- Standard IndexedDB usage (no complex database patterns)

---

## Phase 0: Research & Investigation (NEXT PHASE)

**Objective**: Resolve technical unknowns and establish implementation patterns

### Research Tasks

1. **IndexedDB Schema Design**
   - Research: Best practices for IndexedDB object store schema for recordings
   - Decide: Schema structure (stores, indexes, keys)
   - Document: In research.md with rationale

2. **Historical State Reconstruction Algorithm**
   - Research: Efficient algorithms for event sourcing and snapshot reconstruction
   - Decide: Full replay vs incremental state updates vs snapshot caching
   - Document: Performance characteristics and implementation approach

3. **Animation Interruption Pattern**
   - Research: SolidJS patterns for cancelable D3 transitions
   - Decide: How to cancel ongoing animation and start new one immediately
   - Document: Code pattern with D3 transition.interrupt() or similar

4. **Recording Serialization Format**
   - Research: JSON schema versioning best practices
   - Decide: Format structure, version field location, compatibility strategy
   - Document: Example JSON structure with versioning

5. **Large Recording Optimization**
   - Research: Virtualization patterns for 100,000+ event timelines
   - Decide: Lazy loading strategy, sampling approach, chunking size
   - Document: Performance targets and implementation approach

**Output**: `research.md` with all decisions documented

---

## Phase 1: Design & Contracts (AFTER PHASE 0)

**Objective**: Define data models and component contracts

### Artifacts to Generate

1. **data-model.md**: Entity definitions
   - ReplayState (active, cursorTimestamp, recordingId)
   - Recording (id, name, events[], metadata)
   - RecordingMetadata (name, dateCreated, eventCount, duration, version)
   - HistoricalGraphState (timestamp, activeNodeIds, nodeValues, edges)
   - PlaybackControlState extensions (loop, step mode)
   - ExportOptions (valueInclusion, truncationLimit)

2. **contracts/**: API definitions
   - ReplayStore.ts: createReplayStore() API with methods
   - RecordingStore.ts: createRecordingStore() API with IndexedDB operations
   - HistoricalState.ts: reconstructGraphAtTime(timestamp) function signature

3. **quickstart.md**: Integration guide
   - How to add Timeline to App.tsx
   - How to subscribe to replay state in Graph/Tree
   - How to use RecordingStore for save/load
   - Example: Export and import workflow

4. **Update AGENTS.md**: Add Feature 009 to tech stack
   - Run `.specify/scripts/bash/update-agent-context.sh opencode`
   - Add: "TypeScript 5.9.3 with strict mode + SolidJS 1.9.10, D3.js (existing), IndexedDB (009-timeline-playback)"
   - Add: "IndexedDB for recordings persistence (009-timeline-playback)"

**Output**: data-model.md, contracts/, quickstart.md, updated AGENTS.md

---

## Phase 2: Task Generation (SEPARATE COMMAND)

**NOT GENERATED BY THIS COMMAND**

Use `/speckit.tasks` after Phase 1 to generate detailed implementation tasks.

Expected task breakdown:
- Timeline Integration (5-8 tasks): Add to App, view switching, state preservation
- Replay State Management (8-12 tasks): ReplayStore, cursor navigation, activation logic
- Historical State Reconstruction (8-12 tasks): Event queries, graph snapshots, animations
- Recording Management (10-15 tasks): IndexedDB setup, save/load/delete, validation
- Export/Import (8-12 tasks): JSON serialization, file operations, validation
- Enhanced Playback Controls (6-10 tasks): Step buttons, jump, loop, speed presets
- Visual Indicators (4-6 tasks): Replay mode badges, timestamp display
- Testing (20-30 tasks): Unit, integration, edge cases for all components
- Quality verification (3 tasks): Run quality gates, fix issues, final validation

**Total estimated**: 72-108 tasks (similar complexity to Feature 008's 88 tasks)

---

## Implementation Notes

### Key Integration Points

1. **App.tsx**: Add "timeline" to ViewMode type, render TimelineView conditionally
2. **ReplayStore**: Single source of truth for replay state, broadcasts changes to subscribers
3. **Graph/Tree**: Subscribe to replayState, query historicalState.reconstructGraphAtTime()
4. **IndexedDB**: Single database "visual-reactivity" with "recordings" object store
5. **PlaybackControls**: Enhanced with step/jump/loop controls, communicates with ReplayStore

### Dependencies Between Components

- RecordingStore depends on IndexedDB utilities
- ReplayStore depends on RecordingStore for loading recordings
- HistoricalState depends on ReactivityTracker event history
- Graph/Tree replay rendering depends on HistoricalState
- TimelineView integrates with ReplayStore for cursor position

### Risk Mitigation

**Risk**: IndexedDB quota exceeded with large recordings
**Mitigation**: Add quota check before save, show warning when approaching limit, implement export-to-free-space workflow

**Risk**: Performance degradation with 100,000+ events
**Mitigation**: Implement virtualization early (part of Phase 1), test with large datasets, add sampling fallback

**Risk**: Animation stuttering during rapid stepping
**Mitigation**: Test interruption pattern early, ensure immediate cancellation works, consider skipping animation if steps < 100ms apart

---

## Post-Implementation Checklist

After `/speckit.implement` completes:

- [ ] All tests passing (`npx vitest run --no-watch`)
- [ ] Coverage >= 80% on new code (`npx vitest run --coverage --no-watch`)
- [ ] Quality gates pass:
  - [ ] `npm run lint:css`
  - [ ] `npm run check`
  - [ ] `npm run typecheck`
- [ ] All acceptance criteria met (verify against spec.md)
- [ ] AGENTS.md updated with Feature 009 tech stack
- [ ] No uncommitted changes
- [ ] Ready for PR

---

**Status**: Phase 0 (Research) - NEXT
**Created**: 2026-01-09
**Last Updated**: 2026-01-09
