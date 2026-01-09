# Implementation Plan: Live Values Panel

**Branch**: `004-live-values-panel` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-live-values-panel/spec.md`

## Summary

Build a sidebar panel that displays all tracked reactive signals with their current values in real-time, enabling developers to inspect and edit signal values for debugging purposes. The panel includes search/filter capabilities, sparkline visualizations of value history, and bidirectional synchronization with the graph view. Key interactions: toggle visibility (Ctrl+Shift+V), inline value editing with JSON validation, resizable panel width (200px-50% viewport), and virtual scrolling for performance with 100+ signals.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode
**Primary Dependencies**: SolidJS 1.9.10, D3.js (already installed for sparklines)
**Storage**: Browser localStorage for panel visibility and width preferences
**Testing**: Vitest 4.0.16 with @solidjs/testing-library
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web/SolidJS frontend (src/ directory structure)
**Performance Goals**: 50ms update latency, 60fps scrolling, 100ms sparkline render
**Constraints**: JSON serialization only, 20-value history limit, 60fps throttling
**Scale/Scope**: Support 200+ signals with virtual scrolling, 29 functional requirements

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

**GATE STATUS**: ✅ PASSED - Ready for Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/004-live-values-panel/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (already created)
├── research.md          # Phase 0 output (created below)
├── data-model.md        # Phase 1 output (created below)
├── quickstart.md        # Phase 1 output (created below)
├── contracts/           # Phase 1 output (created below)
│   └── types.ts         # TypeScript type contracts
├── checklists/          # Quality checklists
│   └── requirements.md  # Spec quality checklist (already created)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── visualization/       # Existing visualization components
│   ├── DependencyGraph.tsx          # Existing graph view
│   ├── DetailPanel.tsx              # Existing detail panel
│   ├── LiveValuesPanel.tsx          # NEW: Main panel component
│   ├── LiveValuesPanel.module.css   # NEW: Panel styles
│   ├── controls/                    # NEW: Panel controls
│   │   ├── PanelToggle.tsx          # NEW: Toggle button
│   │   ├── PanelToggle.module.css   # NEW: Toggle styles
│   │   ├── SearchFilter.tsx         # NEW: Search and filter controls
│   │   ├── SearchFilter.module.css  # NEW: Search styles
│   │   └── __tests__/               # NEW: Control tests
│   │       ├── PanelToggle.spec.tsx
│   │       └── SearchFilter.spec.tsx
│   ├── list/                        # NEW: List components
│   │   ├── SignalList.tsx           # NEW: Virtual scrolling list
│   │   ├── SignalList.module.css    # NEW: List styles
│   │   ├── SignalRow.tsx            # NEW: Single signal row
│   │   ├── SignalRow.module.css     # NEW: Row styles
│   │   ├── ValueEditor.tsx          # NEW: Inline value editor
│   │   ├── ValueEditor.module.css   # NEW: Editor styles
│   │   ├── Sparkline.tsx            # NEW: Sparkline visualization
│   │   ├── Sparkline.module.css     # NEW: Sparkline styles
│   │   └── __tests__/               # NEW: List component tests
│   │       ├── SignalList.spec.tsx
│   │       ├── SignalRow.spec.tsx
│   │       ├── ValueEditor.spec.tsx
│   │       └── Sparkline.spec.tsx
│   ├── hooks/                       # Existing + new hooks
│   │   ├── useGraphState.ts         # Existing
│   │   ├── useForceSimulation.ts    # Existing
│   │   ├── usePanelState.ts         # NEW: Panel state management
│   │   ├── useSignalList.ts         # NEW: Signal list management
│   │   ├── useValueHistory.ts       # NEW: Value history tracking
│   │   └── __tests__/               # Hook tests
│   │       ├── usePanelState.spec.ts  # NEW
│   │       ├── useSignalList.spec.ts  # NEW
│   │       └── useValueHistory.spec.ts # NEW
│   └── __tests__/                   # Existing tests
│       └── LiveValuesPanel.spec.tsx # NEW: Main panel test
│
├── stores/              # Existing stores
│   ├── panelStore.ts    # NEW: Panel preferences store
│   └── __tests__/       # Store tests
│       └── panelStore.spec.ts # NEW
│
├── lib/                 # Existing utilities
│   ├── valueSerializer.ts      # NEW: Value serialization utilities
│   ├── jsonValidator.ts        # NEW: JSON validation utilities
│   ├── virtualScroller.ts      # NEW: Virtual scrolling logic
│   └── __tests__/              # Utility tests
│       ├── valueSerializer.spec.ts # NEW
│       ├── jsonValidator.spec.ts   # NEW
│       └── virtualScroller.spec.ts # NEW
│
├── types/               # Existing type definitions
│   └── panel.ts         # NEW: Panel-specific types
│
└── App.tsx              # Existing root component (integrate toggle button)
```

**Structure Decision**: Single-project web application structure. Uses existing src/ directory with visualization/, stores/, lib/, and types/ subdirectories. New panel components organized under visualization/ following existing patterns (DependencyGraph, DetailPanel). Hooks and utilities follow established co-location patterns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution requirements are met.

---

# Phase 0: Research & Technical Decisions

**Purpose**: Resolve technical unknowns and document implementation patterns.

## Research Tasks

### 1. Virtual Scrolling Implementation

**Question**: How should virtual scrolling be implemented for signal lists with 200+ items?

**Research**:
- Existing pattern in codebase: None found (first use of virtual scrolling)
- SolidJS virtual scrolling libraries: @solid-primitives/virtual (community maintained)
- DIY approach: Track scroll position, calculate visible range, render only visible items
- Performance target: 60fps with 200 items

**Decision**: Use custom virtual scrolling implementation
- **Rationale**:
  - @solid-primitives/virtual would require new dependency (violates Principle IX without user approval)
  - Custom implementation is straightforward: track scrollTop, calculate visible indices, slice data array
  - Better control over rendering strategy and performance optimization
  - Reusable for future features
- **Alternatives Considered**:
  - @solid-primitives/virtual: Rejected due to dependency policy
  - Render all items: Rejected due to DOM node limit (200+ nodes cause jank)
  - Pagination: Rejected (poor UX for quick scanning)

**Implementation Approach**:
```typescript
// Track scroll position and viewport height
const [scrollTop, setScrollTop] = createSignal(0);
const itemHeight = 50; // Fixed row height
const viewportHeight = () => containerRef.clientHeight;

// Calculate visible range
const visibleStart = () => Math.floor(scrollTop() / itemHeight);
const visibleEnd = () => Math.ceil((scrollTop() + viewportHeight()) / itemHeight);
const visibleItems = () => items.slice(visibleStart(), visibleEnd() + bufferSize);

// Render with offset positioning
<div style={{ height: `${items.length * itemHeight}px` }}>
  <div style={{ transform: `translateY(${visibleStart() * itemHeight}px)` }}>
    <For each={visibleItems()}>{item => <SignalRow {...item} />}</For>
  </div>
</div>
```

### 2. Sparkline Rendering Strategy

**Question**: Should sparklines use D3.js, Canvas, or SVG?

**Research**:
- Existing codebase: D3.js already installed and used for graph visualization (Feature 002)
- Canvas: Best for high-frequency updates, but overkill for 20-point sparklines
- SVG: Declarative, works well with SolidJS reactivity, allows CSS styling
- D3.js + SVG: D3 for scales/lines, SVG for rendering

**Decision**: Use D3.js scales + SVG path elements
- **Rationale**:
  - D3 already available (no new dependency)
  - SVG integrates naturally with SolidJS JSX
  - 20-point sparklines are lightweight (no performance concern)
  - D3 scales handle numeric/non-numeric value normalization
  - CSS styling for consistent visual design
- **Alternatives Considered**:
  - Pure Canvas: Rejected (complexity overhead, loses CSS styling)
  - HTML + CSS: Rejected (difficult to render line charts without SVG)
  - Chart library: Rejected (overkill for simple sparklines)

**Implementation Approach**:
```typescript
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';

// In Sparkline component
const xScale = () => scaleLinear()
  .domain([0, history().length - 1])
  .range([0, width()]);

const yScale = () => scaleLinear()
  .domain([min(history()), max(history())])
  .range([height(), 0]);

const linePath = () => line<ValuePoint>()
  .x((d, i) => xScale()(i))
  .y(d => yScale()(d.numericValue))
  (history());

return <svg><path d={linePath()} /></svg>;
```

### 3. LocalStorage Persistence Strategy

**Question**: How should panel preferences (visibility, width) be persisted?

**Research**:
- Browser storage options: localStorage (synchronous), IndexedDB (async)
- Existing pattern: No localStorage usage found in codebase
- Data to persist: panel visibility (boolean), panel width (number), last updated timestamp
- Size: <100 bytes (well within localStorage limits)

**Decision**: Use localStorage with synchronous read/write
- **Rationale**:
  - Preferences are tiny (<100 bytes)
  - Synchronous reads during initial render are acceptable (no async waterfall)
  - Simple API (no promise handling needed)
  - Automatic serialization for primitives
- **Alternatives Considered**:
  - IndexedDB: Rejected (async overhead unnecessary for tiny data)
  - Cookies: Rejected (sent with every request, inappropriate for client-only state)
  - URL params: Rejected (pollutes URL, not persistent across sessions)

**Implementation Approach**:
```typescript
// In panelStore.ts
const STORAGE_KEY = 'visual-reactivity:panel-prefs';

interface PanelPreferences {
  isVisible: boolean;
  width: number;
}

export const loadPanelPreferences = (): PanelPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { isVisible: true, width: 350 };
  } catch {
    return { isVisible: true, width: 350 }; // Fallback on error
  }
};

export const savePanelPreferences = (prefs: PanelPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Silently fail (e.g., private browsing mode)
  }
};
```

### 4. Keyboard Shortcut Implementation

**Question**: How should keyboard shortcuts be registered and handled?

**Research**:
- Existing pattern: No keyboard shortcuts found in current codebase
- Browser API: addEventListener('keydown') on window or document
- Modifier keys: Ctrl (Windows/Linux) vs Cmd (macOS) detection via event.metaKey
- Conflict prevention: Check for focus in input elements before triggering

**Decision**: Use document-level keydown listener in App.tsx
- **Rationale**:
  - Global shortcuts should be registered at root level
  - document.addEventListener allows event capture
  - Easy cleanup via removeEventListener in onCleanup
  - Platform detection via navigator.platform or userAgent
- **Alternatives Considered**:
  - Per-component listeners: Rejected (duplicate logic, lifecycle complexity)
  - Library (e.g., hotkeys-js): Rejected (new dependency for simple feature)

**Implementation Approach**:
```typescript
// In App.tsx
import { onMount, onCleanup } from 'solid-js';

onMount(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+Shift+V (Windows/Linux) or Cmd+Shift+V (macOS)
    const isModifier = e.ctrlKey || e.metaKey;
    if (isModifier && e.shiftKey && e.key === 'V') {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      e.preventDefault();
      togglePanelVisibility();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
});
```

### 5. Value Serialization and JSON Validation

**Question**: How should complex values be serialized and validated?

**Research**:
- JSON.stringify limitations: Fails on circular references, functions, symbols, undefined
- try/catch required for serialization errors
- JSON.parse validation: Use try/catch for syntax errors
- Depth limiting: Custom replacer function for JSON.stringify

**Decision**: Custom serialization with depth limiting and error handling
- **Rationale**:
  - JSON.stringify with custom replacer handles depth limiting
  - try/catch provides error detection for unserializable values
  - JSON.parse try/catch validates user input
  - Clear error messages for debugging
- **Alternatives Considered**:
  - circular-json library: Rejected (new dependency)
  - flatted library: Rejected (new dependency)
  - No validation: Rejected (app crashes on invalid input)

**Implementation Approach**:
```typescript
// In lib/valueSerializer.ts
export const serializeValue = (value: unknown, maxDepth = 3): string | null => {
  try {
    let depth = 0;
    return JSON.stringify(value, (key, val) => {
      if (depth++ > maxDepth) return '[Max Depth]';
      if (typeof val === 'function') return '[Function]';
      if (typeof val === 'symbol') return '[Symbol]';
      if (val === undefined) return '[Undefined]';
      return val;
    }, 2);
  } catch (err) {
    return null; // Unserializable (e.g., circular reference)
  }
};

// In lib/jsonValidator.ts
export const parseJSON = (text: string): { value: unknown; error: string | null } => {
  try {
    const value = JSON.parse(text);
    return { value, error: null };
  } catch (err) {
    return { value: null, error: err instanceof Error ? err.message : 'Invalid JSON' };
  }
};
```

## Research Summary

All technical unknowns resolved:
1. ✅ Virtual scrolling: Custom implementation (no new dependencies)
2. ✅ Sparklines: D3 + SVG (existing D3 dependency)
3. ✅ Persistence: localStorage synchronous API
4. ✅ Keyboard shortcuts: document.addEventListener in App.tsx
5. ✅ Serialization: Custom with depth limiting and error handling

**Ready to proceed to Phase 1: Design & Contracts**

---

# Phase 1: Design & Data Model

**Purpose**: Define data structures, component architecture, and type contracts.

See [data-model.md](./data-model.md) for complete entity definitions and relationships.
See [contracts/types.ts](./contracts/types.ts) for TypeScript type contracts.
See [quickstart.md](./quickstart.md) for developer onboarding guide.

---

## Constitution Check (Post-Design)

### Re-Evaluation After Phase 1 Design

- ✅ **No New Dependencies**: All research decisions use existing dependencies
- ✅ **SolidJS Patterns**: All components use signals, effects, memos appropriately
- ✅ **Test-First Ready**: Component hierarchy supports isolated unit testing
- ✅ **CSS Modules**: All components have corresponding .module.css files
- ✅ **Type Safety**: Full TypeScript coverage with strict mode
- ✅ **No Dynamic Imports**: All imports remain static

**GATE STATUS**: ✅ PASSED - Ready for Phase 2 (task generation via /speckit.tasks)

---

## Next Steps

1. Review generated artifacts:
   - [research.md](./research.md) - Technical decisions and rationale
   - [data-model.md](./data-model.md) - Entity definitions and relationships
   - [contracts/types.ts](./contracts/types.ts) - TypeScript type contracts
   - [quickstart.md](./quickstart.md) - Developer quickstart guide

2. Run `/speckit.tasks` to generate implementation tasks from this plan

3. Begin test-first implementation following constitution principles
