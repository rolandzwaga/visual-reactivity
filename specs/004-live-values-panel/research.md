# Research: Live Values Panel

**Feature**: 004-live-values-panel
**Date**: 2026-01-09
**Status**: Complete

## Overview

This document captures all technical research and decisions made during the planning phase for the Live Values Panel feature.

## Research Questions & Decisions

### 1. Virtual Scrolling Implementation

**Question**: How should virtual scrolling be implemented for signal lists with 200+ items?

**Decision**: Custom virtual scrolling implementation

**Rationale**:
- @solid-primitives/virtual would require new dependency (violates Principle IX without user approval)
- Custom implementation is straightforward: track scrollTop, calculate visible indices, slice data array
- Better control over rendering strategy and performance optimization
- Reusable for future features

**Alternatives Considered**:
- @solid-primitives/virtual: Rejected due to dependency policy
- Render all items: Rejected due to DOM node limit (200+ nodes cause jank)
- Pagination: Rejected (poor UX for quick scanning)

**Performance Target**: 60fps with 200 items

---

### 2. Sparkline Rendering Strategy

**Question**: Should sparklines use D3.js, Canvas, or SVG?

**Decision**: Use D3.js scales + SVG path elements

**Rationale**:
- D3 already available in codebase (no new dependency)
- SVG integrates naturally with SolidJS JSX
- 20-point sparklines are lightweight (no performance concern)
- D3 scales handle numeric/non-numeric value normalization
- CSS styling for consistent visual design

**Alternatives Considered**:
- Pure Canvas: Rejected (complexity overhead, loses CSS styling)
- HTML + CSS: Rejected (difficult to render line charts without SVG)
- Chart library: Rejected (overkill for simple sparklines)

---

### 3. LocalStorage Persistence Strategy

**Question**: How should panel preferences (visibility, width) be persisted?

**Decision**: Use localStorage with synchronous read/write

**Rationale**:
- Preferences are tiny (<100 bytes)
- Synchronous reads during initial render are acceptable (no async waterfall)
- Simple API (no promise handling needed)
- Automatic serialization for primitives

**Alternatives Considered**:
- IndexedDB: Rejected (async overhead unnecessary for tiny data)
- Cookies: Rejected (sent with every request, inappropriate for client-only state)
- URL params: Rejected (pollutes URL, not persistent across sessions)

**Data Structure**:
```typescript
interface PanelPreferences {
  isVisible: boolean;
  width: number;
}
```

**Storage Key**: `visual-reactivity:panel-prefs`

---

### 4. Keyboard Shortcut Implementation

**Question**: How should keyboard shortcuts be registered and handled?

**Decision**: Use document-level keydown listener in App.tsx

**Rationale**:
- Global shortcuts should be registered at root level
- document.addEventListener allows event capture
- Easy cleanup via removeEventListener in onCleanup
- Platform detection via navigator.platform or userAgent

**Alternatives Considered**:
- Per-component listeners: Rejected (duplicate logic, lifecycle complexity)
- Library (e.g., hotkeys-js): Rejected (new dependency for simple feature)

**Shortcut**: Ctrl+Shift+V (Windows/Linux) or Cmd+Shift+V (macOS)

---

### 5. Value Serialization and JSON Validation

**Question**: How should complex values be serialized and validated?

**Decision**: Custom serialization with depth limiting and error handling

**Rationale**:
- JSON.stringify with custom replacer handles depth limiting
- try/catch provides error detection for unserializable values
- JSON.parse try/catch validates user input
- Clear error messages for debugging

**Alternatives Considered**:
- circular-json library: Rejected (new dependency)
- flatted library: Rejected (new dependency)
- No validation: Rejected (app crashes on invalid input)

**Depth Limit**: 3 levels (configurable)

**Special Value Handling**:
- Functions → `[Function]`
- Symbols → `[Symbol]`
- Undefined → `[Undefined]`
- Circular references → null (with error flag)
- Max depth exceeded → `[Max Depth]`

---

## Research Summary

| Topic | Decision | Dependencies | Performance Impact |
|-------|----------|--------------|-------------------|
| Virtual Scrolling | Custom implementation | None (no new deps) | 60fps with 200+ items |
| Sparklines | D3 + SVG | D3 (existing) | <100ms render |
| Persistence | localStorage | None (browser API) | Synchronous, negligible |
| Keyboard Shortcuts | document.addEventListener | None (browser API) | Negligible |
| Serialization | Custom JSON handling | None (built-in) | Try/catch overhead only |

**Total New Dependencies**: 0

**Constitution Compliance**: ✅ All decisions comply with Principle IX (no unauthorized dependencies)

---

## Implementation Patterns

### Virtual Scrolling Pattern

```typescript
const [scrollTop, setScrollTop] = createSignal(0);
const itemHeight = 50;
const viewportHeight = () => containerRef.clientHeight;

const visibleStart = () => Math.floor(scrollTop() / itemHeight);
const visibleEnd = () => Math.ceil((scrollTop() + viewportHeight()) / itemHeight);
const visibleItems = () => items.slice(visibleStart(), visibleEnd() + bufferSize);
```

### Sparkline Pattern

```typescript
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';

const xScale = () => scaleLinear().domain([0, history().length - 1]).range([0, width()]);
const yScale = () => scaleLinear().domain([min(history()), max(history())]).range([height(), 0]);
const linePath = () => line<ValuePoint>()
  .x((d, i) => xScale()(i))
  .y(d => yScale()(d.numericValue))
  (history());
```

### Persistence Pattern

```typescript
const STORAGE_KEY = 'visual-reactivity:panel-prefs';

export const loadPanelPreferences = (): PanelPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
};
```

### Keyboard Shortcut Pattern

```typescript
onMount(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isModifier = e.ctrlKey || e.metaKey;
    if (isModifier && e.shiftKey && e.key === 'V') {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      togglePanelVisibility();
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
});
```

### Serialization Pattern

```typescript
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
  } catch {
    return null;
  }
};
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Virtual scrolling bugs | Low | Medium | Comprehensive tests, buffer zones |
| localStorage quota exceeded | Very Low | Low | Try/catch with fallback to defaults |
| Serialization failures | Medium | Low | Error handling, fallback to "[Unserializable]" |
| Keyboard shortcut conflicts | Low | Low | Check for input focus before triggering |
| Sparkline performance | Very Low | Low | Fixed 20-point limit, throttle updates |

---

## Open Questions

None. All research questions resolved.

---

## References

- SolidJS Docs: https://www.solidjs.com/docs
- D3 Scale Docs: https://d3js.org/d3-scale
- D3 Shape Docs: https://d3js.org/d3-shape
- MDN localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- MDN KeyboardEvent: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
