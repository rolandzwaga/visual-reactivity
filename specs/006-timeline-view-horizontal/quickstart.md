# Quickstart: Timeline View Implementation Guide

**Feature**: `006-timeline-view-horizontal`  
**Date**: 2026-01-09  
**Status**: Phase 1 - Design

## Prerequisites

Before starting implementation, ensure:

1. ✅ Read `specs/TESTING-GUIDE.md` (Constitution Principle XXI)
2. ✅ Read `CLAUDE.md` for existing D3 + SolidJS patterns
3. ✅ Install missing dependencies: `d3-axis`, `d3-brush` (with TypeScript types)
4. ✅ Review existing D3 wrappers in `src/d3/`
5. ✅ Review existing hooks in `src/visualization/hooks/`

## Dependency Installation

**Required**: Add these dependencies before starting implementation:

```bash
npm install d3-axis@^3.0.0 d3-brush@^3.0.0
npm install --save-dev @types/d3-axis@^3.0.0 @types/d3-brush@^3.0.0
```

## Implementation Order

Follow this strict order to maintain testability and avoid integration issues:

### Phase A: Foundation (Core Types & Utilities)

**Goal**: Establish data structures and pure functions

1. **types.ts** - Type definitions
   - Location: `src/types/timeline.ts`
   - Copy from: `specs/006-timeline-view-horizontal/contracts/types.ts`
   - Export from: `src/types/index.ts`
   - Test: Type compilation only (no runtime tests)

2. **eventBatcher.ts** - Batch detection algorithm
   - Location: `src/lib/eventBatcher.ts`
   - Pattern: Pure function taking `TimelineEvent[]`, returning `EventBatch[]`
   - Test file: `src/lib/__tests__/eventBatcher.spec.ts`
   - Algorithm: 50ms windowing (see research.md section 4)

3. **eventDensityAnalyzer.ts** - Clustering logic
   - Location: `src/lib/eventDensityAnalyzer.ts`
   - Pattern: Pure function calculating density and creating clusters
   - Test file: `src/lib/__tests__/eventDensityAnalyzer.spec.ts`
   - Algorithm: >50 events per 100px triggers clustering

4. **timelineNavigation.ts** - Keyboard navigation helper
   - Location: `src/lib/timelineNavigation.ts`
   - Pattern: Pure function mapping keys to actions
   - Test file: `src/lib/__tests__/timelineNavigation.spec.ts`
   - Keys: ArrowLeft/Right, Home/End, Space

**Stop Here**: Verify all tests pass before proceeding.

---

### Phase B: D3 Wrappers

**Goal**: Create reusable D3 configuration functions

Follow existing patterns from `src/d3/forceSimulation.ts`, `zoom.ts`, `drag.ts`.

5. **timelineScale.ts** - Time scale wrapper
   - Location: `src/d3/timelineScale.ts`
   - Pattern: `createTimelineScale(options)` returns configured `ScaleTime`
   - Test file: `src/d3/__tests__/timelineScale.spec.ts`
   - Use `d3.scaleUtc()` for timezone independence

6. **timelineAxis.ts** - Axis renderer wrapper
   - Location: `src/d3/timelineAxis.ts`
   - Pattern: `createTimelineAxis(scale, options)` returns configured axis
   - Test file: `src/d3/__tests__/timelineAxis.spec.ts`
   - Implement smart tick formatting (see research.md section 2)

7. **timelineBrush.ts** - Brush behavior wrapper
   - Location: `src/d3/timelineBrush.ts`
   - Pattern: `createBrushBehavior(options)` returns `d3.brushX()` instance
   - Test file: `src/d3/__tests__/timelineBrush.spec.ts`
   - Include snap-to-event logic

**Stop Here**: Verify all tests pass before proceeding.

---

### Phase C: State Management

**Goal**: Create reactive state stores and hooks

8. **timelineStore.ts** - Timeline global state
   - Location: `src/stores/timelineStore.ts`
   - Pattern: `createStore<TimelineState>(initialState)` (like panelStore.ts)
   - Test file: `src/stores/__tests__/timelineStore.spec.ts`
   - State: cursor, filters, playback, liveMode

9. **useTimelineState.ts** - Timeline state hook
   - Location: `src/visualization/hooks/useTimelineState.ts`
   - Pattern: Wrap `timelineStore` with actions
   - Test file: `src/visualization/hooks/__tests__/useTimelineState.spec.ts`
   - Use `testInRoot()` helper

10. **useTimelineLayout.ts** - Swimlane layout hook
    - Location: `src/visualization/hooks/useTimelineLayout.ts`
    - Pattern: `createMemo` for swimlane positions using `d3.scaleBand()`
    - Test file: `src/visualization/hooks/__tests__/useTimelineLayout.spec.ts`
    - Use `testInRoot()` helper

11. **usePlaybackController.ts** - Playback logic hook
    - Location: `src/visualization/hooks/usePlaybackController.ts`
    - Pattern: `requestAnimationFrame` loop with rate multiplier
    - Test file: `src/visualization/hooks/__tests__/usePlaybackController.spec.ts`
    - Use `useMockDate()` + `flushMicrotasks()` for playback tests

12. **useEventFilters.ts** - Filter logic hook
    - Location: `src/visualization/hooks/useEventFilters.ts`
    - Pattern: `createMemo` for filtered events
    - Test file: `src/visualization/hooks/__tests__/useEventFilters.spec.ts`
    - Use `testInRoot()` helper

**Stop Here**: Verify all tests pass before proceeding.

---

### Phase D: Timeline Components

**Goal**: Build timeline visualization components

13. **EventMark.tsx** - Single event marker
    - Location: `src/visualization/timeline/EventMark.tsx`
    - Style: `src/visualization/timeline/EventMark.module.css`
    - Test: `src/visualization/timeline/__tests__/EventMark.spec.tsx`
    - Pattern: SVG circle/rect positioned by props

14. **Swimlane.tsx** - Single swimlane row
    - Location: `src/visualization/timeline/Swimlane.tsx`
    - Style: `src/visualization/timeline/Swimlane.module.css`
    - Test: `src/visualization/timeline/__tests__/Swimlane.spec.tsx`
    - Pattern: SVG group with label + events

15. **BatchIndicator.tsx** - Batch grouping visual
    - Location: `src/visualization/timeline/BatchIndicator.tsx`
    - Style: `src/visualization/timeline/BatchIndicator.module.css`
    - Test: `src/visualization/timeline/__tests__/BatchIndicator.spec.tsx`
    - Pattern: SVG rect spanning batch duration

16. **TimelineAxis.tsx** - Time axis
    - Location: `src/visualization/timeline/TimelineAxis.tsx`
    - Style: `src/visualization/timeline/TimelineAxis.module.css`
    - Test: `src/visualization/timeline/__tests__/TimelineAxis.spec.tsx`
    - Pattern: Apply D3 axis in `onMount()` using ref

17. **TimelineCursor.tsx** - Draggable cursor
    - Location: `src/visualization/timeline/TimelineCursor.tsx`
    - Style: `src/visualization/timeline/TimelineCursor.module.css`
    - Test: `src/visualization/timeline/__tests__/TimelineCursor.spec.tsx`
    - Pattern: Apply D3 brush in `onMount()` using ref

**Stop Here**: Verify all tests pass before proceeding.

---

### Phase E: Control Components

**Goal**: Build UI controls for timeline interaction

18. **PlaybackControls.tsx** - Play/pause/speed controls
    - Location: `src/visualization/timeline/PlaybackControls.tsx`
    - Style: `src/visualization/timeline/PlaybackControls.module.css`
    - Test: `src/visualization/timeline/__tests__/PlaybackControls.spec.tsx`
    - Pattern: Button group with speed selector

19. **TimelineFilters.tsx** - Event/node filters
    - Location: `src/visualization/timeline/TimelineFilters.tsx`
    - Style: `src/visualization/timeline/TimelineFilters.module.css`
    - Test: `src/visualization/timeline/__tests__/TimelineFilters.spec.tsx`
    - Pattern: Checkbox group + search input

20. **EventTooltip.tsx** - Event hover tooltip
    - Location: `src/visualization/timeline/EventTooltip.tsx`
    - Style: `src/visualization/timeline/EventTooltip.module.css`
    - Test: `src/visualization/timeline/__tests__/EventTooltip.spec.tsx`
    - Pattern: Positioned overlay with event details

21. **EventDetailsPanel.tsx** - Event inspection panel
    - Location: `src/visualization/timeline/EventDetailsPanel.tsx`
    - Style: `src/visualization/timeline/EventDetailsPanel.module.css`
    - Test: `src/visualization/timeline/__tests__/EventDetailsPanel.spec.tsx`
    - Pattern: Sidebar panel with event metadata

**Stop Here**: Verify all tests pass before proceeding.

---

### Phase F: Main Timeline Component

**Goal**: Integrate all components into main timeline view

22. **TimelineView.tsx** - Main timeline component
    - Location: `src/visualization/TimelineView.tsx`
    - Style: `src/visualization/TimelineView.module.css`
    - Test: `src/visualization/__tests__/TimelineView.spec.tsx`
    - Pattern: SVG container with zoom, swimlanes, cursor, axis
    - Integration: Use all hooks and components from previous phases

**Stop Here**: Verify all tests pass before proceeding.

---

## Testing Patterns

### Unit Tests (Pure Functions)

```typescript
import { describe, test, expect } from 'vitest';
import { detectBatches } from '../eventBatcher';

describe('eventBatcher', () => {
  test('groups events within 50ms threshold', () => {
    const events = [
      { id: '1', timestamp: 1000, ... },
      { id: '2', timestamp: 1020, ... },
      { id: '3', timestamp: 1080, ... },
    ];
    
    const batches = detectBatches(events);
    
    expect(batches).toHaveLength(2);
    expect(batches[0].eventIds).toEqual(['1', '2']);
    expect(batches[1].eventIds).toEqual(['3']);
  });
});
```

### Hook Tests (SolidJS Reactive)

```typescript
import { describe, test, expect } from 'vitest';
import { testInRoot } from '../../__tests__/helpers';
import { useTimelineState } from '../useTimelineState';

describe('useTimelineState', () => {
  test('adds events to timeline', () => {
    testInRoot(() => {
      const { state, addEvent } = useTimelineState();
      
      addEvent({ type: 'signal-write', timestamp: 1000, ... });
      
      expect(state().events).toHaveLength(1);
      expect(state().events[0].type).toBe('signal-write');
    });
  });
});
```

### Component Tests (SolidJS + D3)

```typescript
import { describe, test, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { EventMark } from '../EventMark';

describe('EventMark', () => {
  test('renders at specified position', () => {
    const event = { id: '1', type: 'signal-write', ... };
    
    render(() => (
      <svg>
        <EventMark event={event} x={100} y={50} />
      </svg>
    ));
    
    const mark = screen.getByTestId('event-mark-1');
    expect(mark).toHaveAttribute('cx', '100');
    expect(mark).toHaveAttribute('cy', '50');
  });
});
```

### Playback Tests (Fake Timers)

```typescript
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { testInRoot, flushMicrotasks } from '../../__tests__/helpers';
import { usePlaybackController } from '../usePlaybackController';

describe('usePlaybackController', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.useRealTimers(); });

  test('advances cursor during playback', async () => {
    await testInRoot(async () => {
      const { state, play, seek } = usePlaybackController();
      
      seek(1000);
      play();
      
      await flushMicrotasks();
      await vi.advanceTimersByTimeAsync(100);
      await flushMicrotasks();
      
      expect(state().playback.isPlaying).toBe(true);
      expect(state().cursor.time).toBeGreaterThan(1000);
    });
  });
});
```

## Common Pitfalls

### ❌ Don't: Mix D3 state with SolidJS state

```typescript
// BAD: D3 manages position internally
const zoomBehavior = d3.zoom().on('zoom', event => {
  // D3 owns transform state
});
```

### ✅ Do: Extract D3 data to SolidJS signals

```typescript
// GOOD: SolidJS owns state, D3 provides calculations
const [transform, setTransform] = createSignal({ k: 1, x: 0, y: 0 });

const zoomBehavior = d3.zoom().on('zoom', event => {
  setTransform({
    k: event.transform.k,
    x: event.transform.x,
    y: event.transform.y,
  });
});
```

### ❌ Don't: Use React patterns

```typescript
// BAD: This is React, not SolidJS
const [count, setCount] = useState(0);
useEffect(() => { ... }, [count]);
```

### ✅ Do: Use SolidJS patterns

```typescript
// GOOD: SolidJS reactive primitives
const [count, setCount] = createSignal(0);
createEffect(() => { /* runs when count() changes */ });
```

### ❌ Don't: Destructure props

```typescript
// BAD: Breaks reactivity
const MyComponent = ({ value }) => <div>{value}</div>;
```

### ✅ Do: Access props directly

```typescript
// GOOD: Maintains reactivity
const MyComponent = (props) => <div>{props.value}</div>;
```

### ❌ Don't: Use `click()` for selection events

```typescript
// BAD: Selection happens on mouseup, not click
fireEvent.click(element);
```

### ✅ Do: Use `mouseDown` + `mouseUp`

```typescript
// GOOD: Proper selection event simulation
fireEvent.mouseDown(element, { button: 0 });
fireEvent.mouseUp(document);
```

## D3 + SolidJS Integration Checklist

When creating new D3 visualizations:

- [ ] Create D3 wrapper function in `src/d3/`
- [ ] D3 function is pure (no side effects)
- [ ] Callbacks extract data from D3 events
- [ ] SolidJS hook wraps D3 wrapper
- [ ] Hook uses `createSignal` or `createMemo` for reactive output
- [ ] Hook uses `createEffect` to respond to reactive inputs
- [ ] Component applies D3 behavior in `onMount()` with SVG ref
- [ ] Component uses `select(ref).call(behavior)` pattern
- [ ] Cleanup disposes D3 resources in `onCleanup()`
- [ ] Tests use `testInRoot()` for reactive code

## Performance Checklist

Before marking feature complete:

- [ ] Virtual scrolling enabled for >1000 events
- [ ] Event aggregation triggers at >50 events per 100px
- [ ] Filters use `createMemo` for efficient recalculation
- [ ] `requestAnimationFrame` used for playback loop
- [ ] Delta capped at 50ms to prevent jumps
- [ ] Debounce applied to high-frequency updates
- [ ] `selection.join()` used for efficient DOM updates
- [ ] Off-screen events culled from rendering

## Quality Gates (Before Completion)

Run all quality checks:

```bash
npm run lint:css        # Stylelint CSS
npm run check           # Biome lint and format
npm run typecheck       # TypeScript type safety
npm test                # All tests pass
npm run test:coverage   # Verify 80%+ coverage
```

All commands must pass with zero errors and zero warnings.

## Integration Points

Timeline view integrates with existing features:

1. **ReactivityTracker** (`src/instrumentation/tracker.ts`)
   - Subscribe to events in `onMount()`
   - Unsubscribe in `onCleanup()`

2. **Existing Visualization** (`src/visualization/`)
   - Follow same component structure
   - Use same hooks pattern
   - Match existing CSS module conventions

3. **Panel Store** (`src/stores/panelStore.ts`)
   - Store timeline panel preferences
   - Follow same localStorage pattern

## Next Steps

After completing implementation:

1. Update `AGENTS.md` with new timeline patterns
2. Update `CLAUDE.md` with timeline-specific guidelines
3. Run full test suite and verify 80%+ coverage
4. Run all quality gates (lint:css, check, typecheck)
5. Manual testing: Create sample app with tracked signals
6. Performance testing: Generate 1000+ events, verify 60fps

## Support

If stuck, refer to:

- `specs/TESTING-GUIDE.md` - Testing patterns
- `CLAUDE.md` - Existing D3 + SolidJS patterns
- `src/d3/` - Reference D3 wrapper implementations
- `src/visualization/DependencyGraph.tsx` - Reference component integration
- `research.md` - Technical research and decisions

---

**Remember**: Test-first development is mandatory (Constitution Principle I). Write failing test before any implementation code.
