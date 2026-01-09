# Implementation Plan: Timeline View - Horizontal Timeline Visualization

**Branch**: `006-timeline-view-horizontal` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-timeline-view-horizontal/spec.md`

## Summary

Build a horizontal timeline visualization with swimlanes showing temporal sequence of reactive events. Each reactive node gets its own swimlane, with events positioned proportionally by timestamp. Features include event inspection (hover/click for details), temporal navigation with cursor scrubbing, batch grouping for synchronous updates, event filtering by type/node, and playback controls with adjustable speed (0.5x-5x). Key interactions: drag to scrub timeline, arrow keys to jump between events, toggle panel visibility, zoom for high-density regions. Technical approach: D3 time scales for timestamp-to-pixel mapping, SVG swimlanes with event marks, cursor state management, and virtual rendering for 1000+ events.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode
**Primary Dependencies**: SolidJS 1.9.10, D3.js (d3-scale for time scales, d3-axis for axis rendering, d3-brush for cursor, d3-selection for DOM, d3-zoom for navigation - **d3-axis and d3-brush need adding**)
**Storage**: In-memory event history from ReactivityTracker, browser localStorage for panel preferences (visibility, height, filters)
**Testing**: Vitest 4.0.16 with @solidjs/testing-library, useMockDate for timeline tests
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web/SolidJS frontend (src/ directory structure)
**Performance Goals**: 60fps scrolling/scrubbing/playback, <16ms per frame, virtual scrolling for 1000+ events, <100ms filter updates
**Constraints**: 50ms batch detection threshold, >50 events/100px aggregation trigger, 50ms max delta for playback smoothness
**Scale/Scope**: 1000+ events across 50+ nodes, 20 functional requirements, 7 user stories (4 P1, 2 P2, 1 P3)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Critical Checks (MUST PASS)

- ✅ **SolidJS Only**: Feature uses SolidJS primitives (createSignal, createEffect, createMemo, createStore)
- ✅ **Test-First Development**: All implementation preceded by failing tests
- ✅ **No React Patterns**: No useState, useEffect, useMemo, useCallback, useRef
- ✅ **Static Imports Only**: No dynamic import() calls except in vi.mock() for tests
- ✅ **Zero Failing Tests**: All tests must pass before completion
- ✅ **Quality Gates**: npm run lint:css, npm run check, npm run typecheck must pass
- ✅ **80% Coverage**: Business logic must meet coverage threshold
- ✅ **No Dynamic Imports**: All imports are static at top of files

### Framework Compliance

- ✅ **SolidJS Reactivity**: Using signals, effects, memos, stores appropriately
- ✅ **Props Handling**: Props not destructured (maintain reactivity)
- ✅ **Component Pattern**: Functions returning JSX, run once
- ✅ **Fine-Grained Updates**: Surgical DOM updates, no virtual DOM

### Technology Stack Compliance

- ✅ **Build Tool**: Vite 7.x with vite-plugin-solid
- ✅ **Testing**: Vitest 4.x with @solidjs/testing-library
- ✅ **Code Quality**: Biome 2.3.11 for linting and formatting
- ✅ **CSS Linting**: Stylelint 16.26.1
- ✅ **Type Safety**: TypeScript strict mode enabled

### Design Standards

- ✅ **CSS Modules**: All styles use CSS Modules (*.module.css)
- ✅ **Design Tokens**: Use centralized tokens from src/styles/
- ✅ **Co-located Tests**: Tests in __tests__/ alongside source files
- ✅ **Component Naming**: PascalCase for components, camelCase for utilities

### Terminology Standards

**Feature Name**: "Timeline View" or "Horizontal Timeline Visualization"
- Use in: User-facing documentation, spec.md, plan.md, tasks.md, commit messages

**Component Name**: `TimelineView`
- Use in: Source code, type names, test files
- Pattern: PascalCase for all component names (EventMark, Swimlane, TimelineAxis)

**Noun vs. Compound Noun**:
- Correct: "timeline view", "event mark", "swimlane", "playback controller"
- Incorrect: "timelineview", "eventmark" (as separate words in prose)

**Consistency Rule**: When referring to the overall feature in narrative text, use "timeline view" (lowercase). When referring to the React/SolidJS component, use `TimelineView` (PascalCase, code-formatted).

### Testing Guide Gate (Principle XXI)

**Required for this feature (involves extensive unit tests)**:
- ✅ Read `specs/TESTING-GUIDE.md` before creating test tasks
- ✅ Verify test helpers exist in `src/__tests__/helpers` (testInRoot, useMockDate, flushMicrotasks)
- ✅ Plan to use centralized helpers in all timeline tests
- ✅ Avoid React testing patterns - use SolidJS patterns only
- ✅ Use mouseDown + mouseUp for selection events (not click())
- ✅ Flush microtasks when using fake timers for playback tests

**GATE STATUS**: ✅ PASSED - Phase 0 research complete, Phase 1 design complete

### Post-Design Re-Evaluation

After completing Phase 0 (research) and Phase 1 (design):

- ✅ **All unknowns resolved**: d3-axis and d3-brush identified as missing, documented in research.md
- ✅ **No new dependencies beyond d3-axis/d3-brush**: All other D3 modules already installed
- ✅ **Design follows existing patterns**: Uses same D3 wrapper + SolidJS hook pattern from codebase
- ✅ **Test strategy defined**: Comprehensive test plan in quickstart.md using existing test helpers
- ✅ **No constitution violations introduced**: All design decisions comply with project standards

**Final Gate Status**: ✅ READY FOR IMPLEMENTATION (Phase 2: tasks.md generation via `/speckit.tasks`)

## Project Structure

### Documentation (this feature)

```text
specs/006-timeline-view-horizontal/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (already created)
├── research.md          # Phase 0 output (created below)
├── data-model.md        # Phase 1 output (created below)
├── quickstart.md        # Phase 1 output (created below)
├── contracts/           # Phase 1 output (created below)
│   └── types.ts         # TypeScript type contracts for timeline entities
├── checklists/          # Quality checklists
│   └── requirements.md  # Spec quality checklist (already created)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── d3/                          # Existing D3 wrappers
│   ├── forceSimulation.ts       # Existing: Force layout
│   ├── zoom.ts                  # Existing: Zoom behavior
│   ├── drag.ts                  # Existing: Drag behavior
│   ├── hierarchyLayout.ts       # Existing: Tree layout
│   ├── timelineScale.ts         # NEW: Time scale for timeline
│   ├── timelineAxis.ts          # NEW: Axis rendering for timeline
│   ├── timelineBrush.ts         # NEW: Brush behavior for cursor
│   └── __tests__/
│       ├── timelineScale.spec.ts    # NEW: Scale tests
│       ├── timelineAxis.spec.ts     # NEW: Axis tests
│       └── timelineBrush.spec.ts    # NEW: Brush tests
│
├── visualization/               # Existing visualization components
│   ├── DependencyGraph.tsx      # Existing: Force-directed graph
│   ├── OwnershipTree.tsx        # Existing: Hierarchy tree
│   ├── TimelineView.tsx         # NEW: Main timeline component
│   ├── TimelineView.module.css  # NEW: Timeline styles
│   ├── timeline/                # NEW: Timeline subcomponents
│   │   ├── Swimlane.tsx         # NEW: Single swimlane row
│   │   ├── Swimlane.module.css  # NEW: Swimlane styles
│   │   ├── EventMark.tsx        # NEW: Event marker on timeline
│   │   ├── EventMark.module.css # NEW: Event mark styles
│   │   ├── TimelineCursor.tsx   # NEW: Draggable cursor
│   │   ├── TimelineCursor.module.css # NEW: Cursor styles
│   │   ├── TimelineAxis.tsx     # NEW: Time axis rendering
│   │   ├── TimelineAxis.module.css # NEW: Axis styles
│   │   ├── BatchIndicator.tsx   # NEW: Batch grouping visual
│   │   ├── BatchIndicator.module.css # NEW: Batch styles
│   │   ├── PlaybackControls.tsx # NEW: Play/pause/speed controls
│   │   ├── PlaybackControls.module.css # NEW: Controls styles
│   │   ├── EventTooltip.tsx     # NEW: Event hover tooltip
│   │   ├── EventTooltip.module.css # NEW: Tooltip styles
│   │   ├── EventDetailsPanel.tsx # NEW: Event inspection panel
│   │   ├── EventDetailsPanel.module.css # NEW: Details styles
│   │   ├── TimelineFilters.tsx  # NEW: Event/node filters
│   │   ├── TimelineFilters.module.css # NEW: Filter styles
│   │   └── __tests__/           # NEW: Timeline component tests
│   │       ├── Swimlane.spec.tsx
│   │       ├── EventMark.spec.tsx
│   │       ├── TimelineCursor.spec.tsx
│   │       ├── TimelineAxis.spec.tsx
│   │       ├── BatchIndicator.spec.tsx
│   │       ├── PlaybackControls.spec.tsx
│   │       ├── EventTooltip.spec.tsx
│   │       ├── EventDetailsPanel.spec.tsx
│   │       └── TimelineFilters.spec.tsx
│   │
│   └── hooks/                   # Existing hooks directory
│       ├── useForceSimulation.ts # Existing: Force sim hook
│       ├── useHierarchyLayout.ts # Existing: Hierarchy hook
│       ├── useTimelineState.ts  # NEW: Timeline state management
│       ├── useTimelineLayout.ts # NEW: Swimlane layout calculation
│       ├── usePlaybackController.ts # NEW: Playback state/controls
│       ├── useEventFilters.ts   # NEW: Event filtering logic
│       └── __tests__/
│           ├── useTimelineState.spec.ts
│           ├── useTimelineLayout.spec.ts
│           ├── usePlaybackController.spec.ts
│           └── useEventFilters.spec.ts
│
├── stores/                      # Existing stores
│   ├── panelStore.ts            # Existing: Panel preferences
│   ├── timelineStore.ts         # NEW: Timeline state (cursor, filters, playback)
│   └── __tests__/
│       └── timelineStore.spec.ts # NEW: Store tests
│
├── lib/                         # Existing utilities
│   ├── valueSerializer.ts       # Existing: Value serialization
│   ├── virtualScroller.ts       # Existing: Virtual scroll helper
│   ├── eventBatcher.ts          # NEW: Batch detection algorithm
│   ├── eventDensityAnalyzer.ts  # NEW: High-density event aggregation
│   ├── timelineNavigation.ts    # NEW: Keyboard navigation helper
│   └── __tests__/
│       ├── eventBatcher.spec.ts
│       ├── eventDensityAnalyzer.spec.ts
│       └── timelineNavigation.spec.ts
│
├── types/                       # Existing types
│   ├── nodes.ts                 # Existing: ReactiveNode
│   ├── edges.ts                 # Existing: ReactiveEdge
│   ├── events.ts                # Existing: ReactivityEvent
│   ├── timeline.ts              # NEW: Timeline-specific types
│   └── index.ts                 # Updated: Export timeline types
│
└── instrumentation/             # Existing instrumentation
    ├── tracker.ts               # Existing: ReactivityTracker (read events)
    └── primitives.ts            # Existing: Tracked primitives (emit events)
```

**Structure Decision**: Web/SolidJS frontend with single `src/` directory structure. Timeline feature follows existing patterns: D3 wrappers in `src/d3/`, SolidJS components in `src/visualization/`, hooks in `src/visualization/hooks/`, shared utilities in `src/lib/`, types in `src/types/`, and state management in `src/stores/`. All tests co-located in `__tests__/` directories alongside source files.

## Complexity Tracking

No constitution violations. All gates passed.
