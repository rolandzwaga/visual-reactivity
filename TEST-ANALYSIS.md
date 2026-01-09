# Test Suite Analysis: Alignment with Testing Guide

**Date**: 2026-01-09
**Status**: 📊 Analysis Complete
**Compliance**: ⚠️ Needs Improvement

---

## Executive Summary

Analysis of 35 test files reveals **significant opportunities** to improve test quality by adopting centralized helpers and following Testing Guide patterns.

### Key Findings

| Metric | Count | Status |
|--------|-------|--------|
| Total test files | 35 | ✅ |
| Tests using centralized helpers | 1 (3%) | ❌ |
| Manual `createRoot()` calls | 97 | ❌ Should use `testInRoot()` |
| Fake timer usage | 7 tests | ⚠️ Could use `useMockDate()` |
| Direct `Promise.resolve()` | 0 | ✅ |
| Cleanup order issues | 3+ files | ⚠️ Need fixing |

---

## Issue #1: Manual `createRoot()` Usage (97 instances)

### Current Pattern (❌ Anti-Pattern)
```typescript
// Found in 10+ files
createRoot((dispose) => {
  const state = useTreeState();
  expect(state.expandedNodes()).toEqual(new Set());
  dispose();
});
```

### Should Be (✅ Testing Guide Pattern)
```typescript
import { testInRoot } from '../../__tests__/helpers';

testInRoot(() => {
  const state = useTreeState();
  expect(state.expandedNodes()).toEqual(new Set());
});
```

### Benefits of Using `testInRoot()`
- ✅ Centralized error handling
- ✅ Supports async tests automatically
- ✅ Proper disposal on errors
- ✅ Consistent pattern across codebase
- ✅ Constitution Principle XXI compliance

### Files Requiring Updates
1. `src/animation/__tests__/useAnimationController.spec.ts` (10+ instances)
2. `src/visualization/hooks/__tests__/usePanelState.spec.ts` (6+ instances)
3. `src/visualization/hooks/__tests__/useHierarchyLayout.spec.ts`
4. `src/visualization/hooks/__tests__/useForceSimulation.spec.ts`
5. `src/visualization/hooks/__tests__/useSignalList.spec.ts`
6. `src/visualization/hooks/__tests__/useGraphState.spec.ts`
7. `src/visualization/hooks/__tests__/useTreeState.spec.ts` (10+ instances)
8. `src/visualization/__tests__/DependencyGraph.spec.tsx`
9. `src/instrumentation/__tests__/primitives.spec.ts`
10. `src/instrumentation/__tests__/integration.spec.ts`

**Priority**: 🔴 HIGH - Constitution violation (Principle XXI)

---

## Issue #2: Fake Timer Usage Without Helper (7 instances)

### Current Pattern (⚠️ Suboptimal)
```typescript
// Found in usePanelState.spec.ts, useTreeState.spec.ts, SignalList.spec.tsx
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

### Could Be (✅ Better)
```typescript
import { useMockDate, flushMicrotasks } from '../../__tests__/helpers';

describe('My tests', () => {
  useMockDate('2025-01-15T12:00:00Z'); // Auto-manages timers

  test('debounced action', async () => {
    // ... setup
    await flushMicrotasks();
    await vi.advanceTimersByTimeAsync(300);
    await flushMicrotasks();
    // ... assertions
  });
});
```

### Files With Fake Timers
1. `src/visualization/hooks/__tests__/usePanelState.spec.ts` (3 tests)
2. `src/visualization/hooks/__tests__/useTreeState.spec.ts` (1 describe block)
3. `src/visualization/list/__tests__/SignalList.spec.tsx` (1 test)
4. `src/visualization/__tests__/Notification.spec.tsx` (uses properly now)
5. `src/visualization/__tests__/LiveValuesPanel.spec.tsx` (✅ Fixed)

**Priority**: 🟡 MEDIUM - Not broken, but could be cleaner

---

## Issue #3: Cleanup Order Inconsistencies

### Anti-Pattern Found
```typescript
// From multiple files
afterEach(cleanup);

// OR
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
```

### Correct Pattern (Testing Guide)
```typescript
afterEach(() => {
  vi.useRealTimers();  // First - restore timers
  cleanup();           // Then - cleanup components
  tracker.reset();     // Then - reset state
});
```

### Files With Cleanup Issues
1. `src/visualization/hooks/__tests__/useVirtualScroll.spec.tsx` - `afterEach(cleanup)` only
2. `src/visualization/list/__tests__/SignalList.spec.tsx` - `afterEach(cleanup)` only
3. `src/visualization/list/__tests__/SignalRow.spec.tsx` - `afterEach(cleanup)` only

**Priority**: 🟢 LOW - Works but not future-proof

---

## Issue #4: Missing Microtask Flushing with Fake Timers

### Tests Using Fake Timers Need Review

When using fake timers with SolidJS effects, must flush microtasks:

```typescript
// From usePanelState.spec.ts - MISSING flushMicrotasks()
vi.useFakeTimers();
await createRoot(async (dispose) => {
  const { preferences, setIsVisible } = usePanelState();
  setIsVisible(true);

  // ❌ Missing: await flushMicrotasks();
  await vi.advanceTimersByTimeAsync(600);
  // ❌ Missing: await flushMicrotasks();

  expect(mockStorage["visual-reactivity:panel-prefs"]).toBeDefined();
  dispose();
});
vi.useRealTimers();
```

**Priority**: 🔴 HIGH - Potential for flaky tests

---

## Issue #5: No Helper Imports (34/35 files)

Only 1 file (`LiveValuesPanel.spec.tsx`) currently imports from centralized helpers.

### Missing Imports Pattern
```typescript
// Should be at top of EVERY test file using signals/stores/timers
import { testInRoot, useMockDate, flushMicrotasks } from '../../__tests__/helpers';
```

**Priority**: 🔴 HIGH - Constitution violation

---

## Compliance Scorecard

### Constitution Principle XXI: Testing Guide Reference

| Requirement | Status | Notes |
|-------------|--------|-------|
| Use centralized helpers | ❌ 3% | Only 1/35 files |
| Use `testInRoot()` for signals/stores | ❌ 0% | 97 manual `createRoot()` |
| Use `flushMicrotasks()` with fake timers | ⚠️ 50% | Some missing |
| Follow SolidJS patterns (not React) | ✅ 100% | No React patterns found |
| Proper cleanup order | ⚠️ ~90% | 3 files need fixing |

**Overall Compliance**: 40% 📉

---

## Recommended Action Plan

### Phase 1: Critical Fixes (High Priority)
1. ✅ **DONE**: Fix `LiveValuesPanel.spec.tsx` flaky test
2. ⬜ Add `testInRoot()` helper to all 10 files with manual `createRoot()`
3. ⬜ Add `flushMicrotasks()` to tests with fake timers + SolidJS effects
4. ⬜ Fix cleanup order in 3 files

### Phase 2: Optimization (Medium Priority)
5. ⬜ Replace manual timer setup with `useMockDate()` helper (7 tests)
6. ⬜ Add helper imports to all test files

### Phase 3: Documentation (Low Priority)
7. ⬜ Add examples of helper usage to commonly-copied test patterns
8. ⬜ Update test file templates in `.specify/templates/`

---

## Impact Assessment

### Benefits of Full Compliance
- **Consistency**: All tests follow same patterns
- **Maintainability**: Single source of truth for test helpers
- **Reliability**: Fewer flaky tests from proper SolidJS handling
- **Constitution**: 100% compliance with Principle XXI
- **Onboarding**: New developers see correct patterns

### Effort Estimation
- **Phase 1**: ~2-3 hours (97 replacements, but mostly mechanical)
- **Phase 2**: ~1 hour (7 files)
- **Phase 3**: ~30 minutes (documentation)
- **Total**: ~4 hours

### Risk Assessment
- **Low Risk**: Changes are mechanical and pattern-based
- **High Value**: Prevents future flaky tests
- **Easy Rollback**: Changes are per-file, not structural

---

## Sample Refactoring

### Before (useTreeState.spec.ts)
```typescript
import { createRoot } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTreeState } from "../useTreeState";

describe("useTreeState", () => {
  it("should initialize with empty expanded nodes", () =>
    createRoot((dispose) => {
      const state = useTreeState();
      expect(state.expandedNodes()).toEqual(new Set());
      dispose();
    }));

  it("should toggle node expansion", () =>
    createRoot((dispose) => {
      const state = useTreeState();
      state.toggleExpanded("node-1");
      expect(state.expandedNodes().has("node-1")).toBe(true);
      dispose();
    }));
});
```

### After (Following Testing Guide)
```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { testInRoot } from "../../../__tests__/helpers";
import { useTreeState } from "../useTreeState";

describe("useTreeState", () => {
  it("should initialize with empty expanded nodes", () =>
    testInRoot(() => {
      const state = useTreeState();
      expect(state.expandedNodes()).toEqual(new Set());
    }));

  it("should toggle node expansion", () =>
    testInRoot(() => {
      const state = useTreeState();
      state.toggleExpanded("node-1");
      expect(state.expandedNodes().has("node-1")).toBe(true);
    }));
});
```

**Lines changed**: 3 (import + 2 replacements)
**Lines removed**: 2 (`createRoot` import + manual `dispose()`)
**Complexity**: Reduced

---

## Testing Guide Reference

For detailed patterns and rationale, see:
- **Testing Guide**: [specs/TESTING-GUIDE.md](specs/TESTING-GUIDE.md)
- **Constitution**: [.specify/memory/constitution.md](.specify/memory/constitution.md) (Principle XXI)
- **Centralized Helpers**: [src/__tests__/helpers/](src/__tests__/helpers/)

---

## Appendix: Files Analyzed

### ✅ Files Following Testing Guide (1)
1. `src/visualization/__tests__/LiveValuesPanel.spec.tsx`

### ⚠️ Files Needing Improvement (34)
<details>
<summary>View full list</summary>

1. `src/animation/__tests__/EdgeAnimator.spec.ts`
2. `src/animation/__tests__/easing.spec.ts`
3. `src/animation/__tests__/NodeAnimator.spec.ts`
4. `src/animation/__tests__/useAnimationController.spec.ts`
5. `src/d3/__tests__/drag.spec.ts`
6. `src/d3/__tests__/forceSimulation.spec.ts`
7. `src/d3/__tests__/hierarchyLayout.spec.ts`
8. `src/d3/__tests__/zoom.spec.ts`
9. `src/instrumentation/__tests__/events.spec.ts`
10. `src/instrumentation/__tests__/integration.spec.ts`
11. `src/instrumentation/__tests__/primitives.spec.ts`
12. `src/instrumentation/__tests__/tracker.spec.ts`
13. `src/lib/__tests__/virtualScroller.spec.ts`
14. `src/visualization/__tests__/ConfirmDialog.spec.tsx`
15. `src/visualization/__tests__/DependencyGraph.spec.tsx`
16. `src/visualization/__tests__/DetailPanel.spec.tsx`
17. `src/visualization/__tests__/Notification.spec.tsx`
18. `src/visualization/__tests__/OwnershipTree.spec.tsx`
19. `src/visualization/hooks/__tests__/useForceSimulation.spec.ts`
20. `src/visualization/hooks/__tests__/useGraphState.spec.ts`
21. `src/visualization/hooks/__tests__/useHierarchyLayout.spec.ts`
22. `src/visualization/hooks/__tests__/usePanelState.spec.ts`
23. `src/visualization/hooks/__tests__/useSignalList.spec.ts`
24. `src/visualization/hooks/__tests__/useTreeState.spec.ts`
25. `src/visualization/hooks/__tests__/useVirtualScroll.spec.tsx`
26. `src/visualization/list/__tests__/SignalList.spec.tsx`
27. `src/visualization/list/__tests__/SignalRow.spec.tsx`
28. `tests/integration/cross-view-selection.spec.tsx`
29. `tests/integration/live-values-updates.spec.ts`
30. `tests/integration/ownership-tree-updates.spec.ts`
31. `tests/integration/signal-tracking.spec.ts`
32. Plus 3 additional files

</details>

---

**Generated by**: Test Analysis Tool
**Next Review**: After Phase 1 completion
