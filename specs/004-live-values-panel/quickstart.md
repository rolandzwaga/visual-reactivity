# Quickstart: Live Values Panel

**Feature**: 004-live-values-panel
**For**: Developers implementing this feature

## Overview

The Live Values Panel is a sidebar that displays all tracked reactive signals with real-time values, inline editing, search/filter, sparkline history, and graph synchronization. This guide helps you get started with implementation.

---

## Prerequisites

Before starting implementation:

1. ✅ Read [spec.md](./spec.md) - Feature requirements and user stories
2. ✅ Read [plan.md](./plan.md) - Technical context and decisions
3. ✅ Read [data-model.md](./data-model.md) - Entity definitions
4. ✅ Review [contracts/types.ts](./contracts/types.ts) - Type contracts
5. ✅ Read [CLAUDE.md](/root/projects/visual-reactivity/CLAUDE.md) - Project guidelines
6. ✅ Read [constitution.md](/.specify/memory/constitution.md) - Development principles

---

## Quick Reference

### Key Concepts

| Concept | Description |
|---------|-------------|
| **SignalEntry** | Represents a single signal in the panel list |
| **ValueHistory** | Last 20 value changes for sparkline visualization |
| **FilterState** | Search/filter criteria (text, type, sort order) |
| **PanelPreferences** | Persisted settings (visibility, width) |
| **Virtual Scrolling** | Only render visible rows for performance (200+ signals) |

### Key Files to Create

```
src/
├── visualization/
│   ├── LiveValuesPanel.tsx          # Main panel component
│   ├── controls/
│   │   ├── PanelToggle.tsx          # Toggle button (Ctrl+Shift+V)
│   │   └── SearchFilter.tsx         # Search and filter controls
│   ├── list/
│   │   ├── SignalList.tsx           # Virtual scrolling list
│   │   ├── SignalRow.tsx            # Single signal row
│   │   ├── ValueEditor.tsx          # Inline JSON editor
│   │   └── Sparkline.tsx            # D3 + SVG sparkline chart
│   └── hooks/
│       ├── usePanelState.ts         # Panel preferences + visibility
│       ├── useSignalList.ts         # Signal data management
│       └── useValueHistory.ts       # Value history tracking
├── stores/
│   └── panelStore.ts                # localStorage persistence
├── lib/
│   ├── valueSerializer.ts           # JSON serialization with depth limiting
│   ├── jsonValidator.ts             # JSON.parse with validation
│   └── virtualScroller.ts           # Virtual scroll calculations
└── types/
    └── panel.ts                     # TypeScript type definitions
```

---

## Implementation Order

### Phase 1: Foundation (P1 - MVP Dependencies)

**Goal**: Build core infrastructure required for all features

1. **Types** (`src/types/panel.ts`)
   - Copy contracts from `specs/004-live-values-panel/contracts/types.ts`
   - No tests needed (pure type definitions)

2. **Utilities** (`src/lib/`)
   - Test: `valueSerializer.spec.ts` → Implement: `valueSerializer.ts`
   - Test: `jsonValidator.spec.ts` → Implement: `jsonValidator.ts`
   - Test: `virtualScroller.spec.ts` → Implement: `virtualScroller.ts`

3. **Store** (`src/stores/panelStore.ts`)
   - Test: `panelStore.spec.ts` → Implement: `panelStore.ts`
   - localStorage load/save, preferences management

### Phase 2: Core Components (P1 - MVP Core)

**Goal**: Build main panel and signal list

4. **Panel State Hook** (`src/visualization/hooks/usePanelState.ts`)
   - Test: `usePanelState.spec.ts` → Implement: `usePanelState.ts`
   - Panel visibility, width, keyboard shortcut integration

5. **Signal List Hook** (`src/visualization/hooks/useSignalList.ts`)
   - Test: `useSignalList.spec.ts` → Implement: `useSignalList.ts`
   - Subscribe to tracker events, manage SignalEntry map

6. **Signal Row** (`src/visualization/list/SignalRow.tsx`)
   - Test: `SignalRow.spec.tsx` → Implement: `SignalRow.tsx` + `.module.css`
   - Display signal name, value, selection highlight

7. **Signal List** (`src/visualization/list/SignalList.tsx`)
   - Test: `SignalList.spec.tsx` → Implement: `SignalList.tsx` + `.module.css`
   - Virtual scrolling, render visible rows only

8. **Main Panel** (`src/visualization/LiveValuesPanel.tsx`)
   - Test: `LiveValuesPanel.spec.tsx` → Implement: `LiveValuesPanel.tsx` + `.module.css`
   - Container, resize handle, empty state

### Phase 3: Editing (P1 - MVP Editing)

**Goal**: Enable inline value editing

9. **Value Editor** (`src/visualization/list/ValueEditor.tsx`)
   - Test: `ValueEditor.spec.tsx` → Implement: `ValueEditor.tsx` + `.module.css`
   - Inline text input, JSON validation, save/cancel

10. **Integrate Editor into SignalRow**
    - Update `SignalRow.spec.tsx` to test click → edit → save flow
    - Update `SignalRow.tsx` to show ValueEditor on click

### Phase 4: Controls (P2 - Enhanced UX)

**Goal**: Add search, filter, and toggle controls

11. **Panel Toggle** (`src/visualization/controls/PanelToggle.tsx`)
    - Test: `PanelToggle.spec.tsx` → Implement: `PanelToggle.tsx` + `.module.css`
    - Button in toolbar, keyboard shortcut hint

12. **Search Filter** (`src/visualization/controls/SearchFilter.tsx`)
    - Test: `SearchFilter.spec.tsx` → Implement: `SearchFilter.tsx` + `.module.css`
    - Search input, type dropdown, sort dropdown, clear button

13. **Integrate Controls**
    - Update `LiveValuesPanel.spec.tsx` to test filtering
    - Update `LiveValuesPanel.tsx` to include SearchFilter
    - Update `App.tsx` to include PanelToggle and keyboard listener

### Phase 5: Sparklines (P2 - Value History)

**Goal**: Visualize value changes over time

14. **Value History Hook** (`src/visualization/hooks/useValueHistory.ts`)
    - Test: `useValueHistory.spec.ts` → Implement: `useValueHistory.ts`
    - Track last 20 values, clear on disposal

15. **Sparkline Component** (`src/visualization/list/Sparkline.tsx`)
    - Test: `Sparkline.spec.tsx` → Implement: `Sparkline.tsx` + `.module.css`
    - D3 scales + SVG path, tooltip on hover

16. **Integrate Sparkline into SignalRow**
    - Update `SignalRow.spec.tsx` to test sparkline rendering
    - Update `SignalRow.tsx` to display sparkline when history exists

### Phase 6: Selection Sync (P3 - Graph Integration)

**Goal**: Bidirectional selection highlighting

17. **Selection Integration**
    - Update `LiveValuesPanel.spec.tsx` to test selection sync
    - Update `LiveValuesPanel.tsx` to subscribe to graph selection events
    - Update `SignalRow.tsx` to emit selection events when clicked
    - Update `DependencyGraph.tsx` to listen for panel selection events

---

## Development Workflow

### For Each Task

1. **Checkout branch**: Already on `004-live-values-panel`

2. **Write failing test FIRST** (RED):
   ```bash
   # Example: Testing valueSerializer
   # Create src/lib/__tests__/valueSerializer.spec.ts
   npm test -- valueSerializer
   # Test should FAIL (function doesn't exist yet)
   ```

3. **Implement minimum code** (GREEN):
   ```bash
   # Create src/lib/valueSerializer.ts
   npm test -- valueSerializer
   # Test should PASS
   ```

4. **Refactor** (keep tests green):
   ```bash
   # Improve code quality while keeping tests passing
   npm test -- valueSerializer
   ```

5. **Quality gates** (MANDATORY before commit):
   ```bash
   npm run check           # Biome lint + format
   npm run lint:css        # Stylelint CSS
   npm run typecheck       # TypeScript check
   ```

6. **Fix ALL errors/warnings** before committing

7. **Commit** (atomic, tests + implementation together):
   ```bash
   git add src/lib/valueSerializer.ts src/lib/__tests__/valueSerializer.spec.ts
   git commit -m "feat: value serialization with depth limiting"
   ```

---

## Key Patterns

### SolidJS Reactivity

**DO:**
```typescript
// Props are reactive - don't destructure
const MyComponent = (props) => {
  return <div>{props.value}</div>;
};

// Signals are getters - call them
const [count, setCount] = createSignal(0);
console.log(count()); // Read value
setCount(count() + 1); // Update value
```

**DON'T:**
```typescript
// ❌ Destructuring breaks reactivity
const MyComponent = ({ value }) => <div>{value}</div>;

// ❌ React patterns are FORBIDDEN
const [count, setCount] = useState(0);      // NO!
useEffect(() => {...}, [dep]);              // NO!
const value = useMemo(() => {...}, [dep]);  // NO!
```

### Virtual Scrolling

```typescript
// Track scroll position
const [scrollTop, setScrollTop] = createSignal(0);

// Calculate visible range
const itemHeight = 50;
const visibleStart = () => Math.floor(scrollTop() / itemHeight);
const visibleEnd = () => Math.ceil((scrollTop() + viewportHeight()) / itemHeight);

// Slice and render only visible items
const visibleItems = () => allItems().slice(visibleStart(), visibleEnd() + 5);
```

### Sparkline with D3

```typescript
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';

const xScale = () => scaleLinear().domain([0, history().length - 1]).range([0, width()]);
const yScale = () => scaleLinear().domain([min, max]).range([height(), 0]);

const linePath = () => line<ValuePoint>()
  .x((d, i) => xScale()(i))
  .y(d => yScale()(d.numericValue))
  (history());

return <svg><path d={linePath()} /></svg>;
```

### LocalStorage Persistence

```typescript
const STORAGE_KEY = 'visual-reactivity:panel-prefs';

export const loadPanelPreferences = (): PanelPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultPreferences;
  } catch {
    return defaultPreferences; // Graceful fallback
  }
};

export const savePanelPreferences = (prefs: PanelPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Silently fail (e.g., quota exceeded, private browsing)
  }
};
```

---

## Testing Checklist

### Unit Tests (MANDATORY)

- [ ] All utilities (valueSerializer, jsonValidator, virtualScroller)
- [ ] All hooks (usePanelState, useSignalList, useValueHistory)
- [ ] All components (every .tsx file has .spec.tsx)
- [ ] Store (panelStore localStorage operations)

### Integration Tests (MANDATORY)

- [ ] Tracker events → SignalEntry updates
- [ ] Value edit → JSON validation → setter call
- [ ] Search filter → filtered list rendering
- [ ] Panel resize → localStorage persist
- [ ] Keyboard shortcut → panel toggle

### Edge Cases (MANDATORY)

- [ ] Empty signal list (no tracked signals)
- [ ] Unserializable values (circular references)
- [ ] Invalid JSON input (editing)
- [ ] localStorage quota exceeded
- [ ] 200+ signals (virtual scrolling)
- [ ] Rapid updates (60fps throttling)

---

## Common Pitfalls

### ❌ Destructuring Props

```typescript
// WRONG - breaks SolidJS reactivity
const SignalRow = ({ signal, isSelected }) => {
  return <div class={isSelected ? 'selected' : ''}>{signal.name}</div>;
};
```

```typescript
// CORRECT - props are reactive
const SignalRow = (props) => {
  return <div class={props.isSelected ? 'selected' : ''}>{props.signal.name}</div>;
};
```

### ❌ React Patterns

```typescript
// WRONG - using React hooks
import { useState, useEffect } from 'react';
const [value, setValue] = useState(0);
useEffect(() => {...}, [dep]);
```

```typescript
// CORRECT - using SolidJS primitives
import { createSignal, createEffect } from 'solid-js';
const [value, setValue] = createSignal(0);
createEffect(() => {...}); // No dep array - auto-tracked
```

### ❌ Forgetting CSS Modules

```typescript
// WRONG - using plain classname strings
<div class="panel-container">...</div>
```

```typescript
// CORRECT - using CSS Modules
import styles from './LiveValuesPanel.module.css';
<div class={styles.panelContainer}>...</div>
```

### ❌ Skipping Tests

```typescript
// WRONG - writing implementation first
// 1. Create SignalRow.tsx
// 2. Write tests later (maybe)
```

```typescript
// CORRECT - test-first development
// 1. Create SignalRow.spec.tsx with failing test
// 2. Run test (RED)
// 3. Create SignalRow.tsx to make test pass (GREEN)
// 4. Refactor (keep tests green)
```

---

## Performance Tips

1. **Virtual Scrolling**: Only render ~20 visible rows, not all 200
2. **createMemo**: Use for filtered/sorted lists (avoid recomputation)
3. **Throttling**: Limit updates to 60fps using requestAnimationFrame
4. **Debouncing**: Debounce search input (150ms), localStorage writes (500ms)
5. **Lazy Serialization**: Only serialize values when displayed or edited

---

## Resources

### Documentation

- [SolidJS Docs](https://www.solidjs.com/docs)
- [D3 Scale](https://d3js.org/d3-scale)
- [D3 Shape](https://d3js.org/d3-shape)
- [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

### Existing Code to Reference

- `src/visualization/DependencyGraph.tsx` - Graph visualization patterns
- `src/visualization/DetailPanel.tsx` - Panel layout patterns
- `src/instrumentation/tracker.ts` - Event subscription patterns
- `src/visualization/hooks/useGraphState.ts` - Hook patterns

### Project Files

- [CLAUDE.md](/root/projects/visual-reactivity/CLAUDE.md) - Project guidelines
- [Constitution](/.specify/memory/constitution.md) - Development principles
- [spec.md](./spec.md) - Feature requirements
- [plan.md](./plan.md) - Implementation plan
- [data-model.md](./data-model.md) - Data structures

---

## Getting Help

1. **Constitution Questions**: Read [constitution.md](/.specify/memory/constitution.md)
2. **SolidJS Questions**: Check [SolidJS docs](https://www.solidjs.com/docs)
3. **Testing Questions**: See existing test files in `src/**/__tests__/`
4. **Pattern Questions**: Review existing code in `src/`
5. **Stuck After 5 Attempts**: Stop and document what you tried, then consult user

---

## Success Criteria

Before marking this feature complete, verify:

- ✅ ALL tests passing (`npm test`)
- ✅ 80%+ code coverage (`npm test -- --coverage`)
- ✅ Quality gates pass:
  - `npm run lint:css` (zero errors/warnings)
  - `npm run check` (zero errors/warnings)
  - `npm run typecheck` (zero errors)
- ✅ All 29 functional requirements implemented
- ✅ All 5 user stories delivered
- ✅ Performance targets met (50ms updates, 60fps scrolling)
- ✅ No React patterns (SolidJS only)
- ✅ No dynamic imports (static only)
- ✅ CSS Modules for all styles
- ✅ Test-first development followed (tests written before implementation)

---

## Next Steps

1. Review all documentation above
2. Run `/speckit.tasks` to generate detailed implementation tasks
3. Start with Phase 1 (Foundation) - utilities and types
4. Follow test-first workflow for every component
5. Run quality gates after each task
6. Commit atomically with passing tests

Good luck! 🚀
