# Phase 0: Research Outcomes

**Feature**: Educational Demo Examples  
**Date**: 2026-01-09

## Research Questions

### Q1: How to isolate demo reactive contexts to prevent interference?

**Decision**: Use SolidJS `createRoot()` with manual disposal tracking

**Rationale**:
- SolidJS provides `createRoot(dispose => { ... })` for creating isolated reactive scopes
- Each demo gets its own root that can be disposed independently
- Prevents reactive leaks between demos
- Matches SolidJS patterns documented in official docs

**Implementation Pattern**:
```typescript
// Demo context creation
let demoDispose: (() => void) | null = null;

function loadDemo(demo: Demo) {
  if (demoDispose) {
    demoDispose(); // Clean up previous demo
  }
  
  createRoot(dispose => {
    demoDispose = dispose;
    demo.render(); // Creates signals/effects within this root
  });
}

function cleanupDemo() {
  if (demoDispose) {
    demoDispose();
    demoDispose = null;
  }
  tracker.reset(); // Clear visualizer state
}
```

**Alternatives Considered**:
- Global reactive context with manual tracking: Rejected (error-prone, hard to verify complete cleanup)
- Separate iframe per demo: Rejected (unnecessary complexity, poor UX, breaks visualizer integration)

**References**:
- SolidJS Docs: https://www.solidjs.com/docs/latest/api#createroot
- Existing pattern in test helpers: `src/__tests__/helpers/testInRoot.ts`

---

### Q2: How to register and organize 8 demos for menu display?

**Decision**: Central registry pattern with typed metadata

**Rationale**:
- Single source of truth for all demo definitions
- Type-safe access to demo metadata
- Easy to iterate for menu rendering
- Supports future demo additions without menu refactoring

**Implementation Pattern**:
```typescript
// demoRegistry.ts
export const DEMO_REGISTRY: Record<string, Demo> = {
  'simple-counter': {
    id: 'simple-counter',
    metadata: {
      name: 'Simple Counter',
      concept: 'Signal → Effect',
      description: '...',
      instructions: '...'
    },
    render: () => <SimpleCounter />
  },
  // ... other demos
};

export const DEMO_LIST = Object.values(DEMO_REGISTRY); // For menu iteration
```

**Alternatives Considered**:
- Dynamic discovery via file system: Rejected (requires build-time config, not suitable for browser)
- Separate arrays for metadata and components: Rejected (data duplication, out-of-sync risk)

---

### Q3: Where to position demo panel in layout?

**Decision**: Bottom of visualization area, fixed height, appears/disappears with demo lifecycle

**Rationale** (from clarification Q2):
- User selected "dedicated demo panel (top or bottom)"
- Bottom position keeps top navigation clean
- Fixed height (~200-300px) maintains consistency
- Doesn't interfere with graph zoom/pan interactions
- Matches existing timeline panel pattern

**CSS Layout Strategy**:
```css
/* App.module.css */
.appLayout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.visualizationArea {
  flex: 1; /* Takes remaining space */
  overflow: hidden;
}

.demoPanel {
  height: 250px;
  border-top: 1px solid var(--border-color);
  /* Appears via conditional rendering */
}
```

**Alternatives Considered**:
- Top position: Rejected (clutters navigation area, clarification favored bottom)
- Overlay panel: Rejected (blocks visualization, poor for interactive demos)
- Sidebar: Rejected (user didn't select in clarification Q2)

---

### Q4: How to handle demo errors without crashing visualizer?

**Decision**: SolidJS `ErrorBoundary` wrapper per demo with error UI

**Rationale**:
- SolidJS provides built-in error boundary component
- Catches errors in demo render and effects
- Allows graceful degradation with error message
- User can close errored demo and return to menu (per FR-052)

**Implementation Pattern**:
```typescript
<ErrorBoundary fallback={(err) => (
  <div class={styles.demoError}>
    <h3>Demo Error</h3>
    <p>{err.message}</p>
    <button onClick={closeDemo}>Close Demo</button>
  </div>
)}>
  {currentDemo && <currentDemo.render />}
</ErrorBoundary>
```

**Alternatives Considered**:
- Try-catch in each demo: Rejected (doesn't catch async errors, boilerplate in every demo)
- Global error handler: Rejected (can't provide demo-specific recovery UI)

**References**:
- SolidJS ErrorBoundary: https://www.solidjs.com/docs/latest/api#errorboundary

---

### Q5: How to track and display which demo is currently active?

**Decision**: Signal-based state in App.tsx with menu highlighting

**Rationale**:
- Simple reactive state: `const [currentDemoId, setCurrentDemoId] = createSignal<string | null>(null)`
- Menu can check `currentDemoId() === demo.id` for active state styling
- Demo panel conditionally renders based on `currentDemoId() !== null`
- Welcome message shows when `currentDemoId() === null` (clarification Q4)

**Implementation Pattern**:
```typescript
// App.tsx
const [currentDemoId, setCurrentDemoId] = createSignal<string | null>(null);

function selectDemo(demoId: string) {
  cleanupCurrentDemo(); // Dispose previous
  loadDemo(DEMO_REGISTRY[demoId]); // Load new
  setCurrentDemoId(demoId); // Update state
}

function closeDemo() {
  cleanupCurrentDemo();
  setCurrentDemoId(null); // Return to welcome state
}
```

**Alternatives Considered**:
- Store full Demo object in signal: Rejected (unnecessary data, ID is sufficient for lookup)
- Separate signals for panel visibility: Rejected (redundant with currentDemoId check)

---

## Technology Stack Confirmation

**Existing Dependencies** (no new additions required):
- SolidJS 1.9.10: `createSignal`, `createEffect`, `createMemo`, `createStore`, `createRoot`, `ErrorBoundary`
- TypeScript 5.9.3: Strict mode type safety
- Vitest 4.x: Demo component testing
- @solidjs/testing-library: Component test utilities
- CSS Modules: Demo component styling

**No New Dependencies**: Feature uses existing instrumentation and visualization infrastructure.

---

## Best Practices Applied

### SolidJS Reactive Patterns
- Use `createSignal` for UI state (current demo ID, menu open/close)
- Use `createRoot` for demo isolation (manual lifecycle control)
- Use `ErrorBoundary` for error handling (SolidJS best practice)
- Avoid destructuring props (preserves reactivity)
- No dependency arrays (automatic tracking)

### Testing Patterns (from TESTING-GUIDE.md)
- Use `testInRoot()` helper for signal tests in demo context
- Use `useMockDate()` for timestamp-sensitive tests
- Flush microtasks with `await Promise.resolve()` when using fake timers
- Verify disposal by checking `tracker.getNodes().length` after cleanup

### Code Organization
- Co-locate demo components in `src/demos/` directory
- Each demo has corresponding `.spec.tsx` test file
- Central registry in `demoRegistry.ts` for single source of truth
- Shared types in `demos/types.ts` for consistency

---

## Open Items

None. All research questions resolved and decisions documented.

---

**Research Complete**: Ready for Phase 1 (Design & Contracts)
