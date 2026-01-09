# Phase 1: Data Model

**Feature**: Educational Demo Examples  
**Date**: 2026-01-09

## Entity Definitions

### Demo

**Purpose**: Represents a complete educational example with its UI component and metadata

**TypeScript Definition**:
```typescript
interface Demo {
  id: string;                    // Unique identifier (e.g., 'simple-counter')
  metadata: DemoMetadata;        // Descriptive information
  render: () => JSX.Element;     // SolidJS component function
}
```

**Attributes**:
- `id` (string, required): Unique kebab-case identifier for registry lookup and URL routing potential
- `metadata` (DemoMetadata, required): Educational context (name, concept, description, instructions)
- `render` (() => JSX.Element, required): SolidJS component that creates reactive graph and UI controls

**Validation Rules**:
- `id` must be unique across all demos
- `id` must match pattern `/^[a-z]+(-[a-z]+)*$/` (lowercase kebab-case)
- `render` must return valid SolidJS JSX
- `render` must not throw during initialization (errors caught by ErrorBoundary)

**Relationships**:
- One Demo has one DemoMetadata (composition)
- One Demo creates many ReactiveNodes when rendered (via tracker)

---

### DemoMetadata

**Purpose**: Descriptive information displayed in menu and demo panel

**TypeScript Definition**:
```typescript
interface DemoMetadata {
  name: string;                  // Display name (e.g., "Simple Counter")
  concept: string;               // Reactivity pattern taught (e.g., "Signal → Effect")
  description: string;           // What this demo demonstrates (1-2 sentences)
  instructions: string;          // How to interact with demo (e.g., "Click Increment...")
}
```

**Attributes**:
- `name` (string, required): Human-readable title for menu display
- `concept` (string, required): Brief pattern description for educational context
- `description` (string, required): Explains what reactivity concept is demonstrated
- `instructions` (string, required): User guidance on interacting with demo controls

**Validation Rules**:
- `name` must be 3-50 characters
- `concept` must be 5-100 characters
- `description` must be 20-500 characters
- `instructions` must be 10-300 characters

**Usage**:
- Displayed in demo selection menu for browsing
- Shown in demo panel header when demo is active
- Provides educational context per FR-045, FR-046, FR-048

---

### DemoContext

**Purpose**: Encapsulates isolated reactive scope and cleanup function for a running demo

**TypeScript Definition**:
```typescript
interface DemoContext {
  rootDispose: () => void;       // SolidJS root disposal function
  cleanup: () => void;           // Full cleanup: dispose + reset tracker
}
```

**Attributes**:
- `rootDispose` (() => void, required): Function returned by `createRoot()` to dispose reactive scope
- `cleanup` (() => void, required): Composite function that calls `rootDispose()` + `tracker.reset()`

**Lifecycle**:
1. **Creation**: When demo is loaded via menu selection
   ```typescript
   createRoot(dispose => {
     context = { rootDispose: dispose, cleanup: () => { dispose(); tracker.reset(); } };
     renderDemo();
   });
   ```

2. **Active**: Demo is running, reactive nodes are live in tracker

3. **Disposal**: When demo is switched or closed
   ```typescript
   context.cleanup(); // Disposes all signals/effects + clears visualizer state
   context = null;
   ```

**Validation Rules**:
- Must call `cleanup()` before loading new demo (per FR-003)
- Must verify `tracker.getNodes().length === 0` after cleanup (test requirement)

**Relationships**:
- One DemoContext exists per active Demo (1:0..1)
- One DemoContext manages many ReactiveNodes created by Demo

---

### DemoRegistry

**Purpose**: Central map of all available demos for menu rendering and lookup

**TypeScript Definition**:
```typescript
type DemoRegistry = Record<string, Demo>;

// Derived helper
const DEMO_LIST: Demo[];  // Array version for iteration
```

**Structure**:
```typescript
const DEMO_REGISTRY: DemoRegistry = {
  'simple-counter': { id: 'simple-counter', metadata: {...}, render: () => <SimpleCounter /> },
  'derived-state': { id: 'derived-state', metadata: {...}, render: () => <DerivedState /> },
  // ... 6 more demos
};

const DEMO_LIST = Object.values(DEMO_REGISTRY);
```

**Operations**:
- **Lookup by ID**: `DEMO_REGISTRY[demoId]` (O(1) for menu selection handling)
- **List all demos**: `DEMO_LIST` (for menu rendering)
- **Check existence**: `demoId in DEMO_REGISTRY` (for validation)

**Validation Rules**:
- Must contain exactly 8 demos (per spec)
- All IDs must be unique (enforced by Record type)
- All demos must have valid metadata and render function

---

## State Transitions

### Application State

```
┌─────────────────┐
│  Initial Load   │ (currentDemoId = null)
│ (Welcome State) │
└────────┬────────┘
         │
         │ User clicks "Demos" button
         ▼
┌─────────────────┐
│   Menu Open     │ (menuOpen = true)
└────────┬────────┘
         │
         │ User selects demo
         ▼
┌─────────────────┐     User clicks close button
│   Demo Active   │ ◄──────────────────────────┐
│(currentDemoId   │                             │
│  = 'demo-id')   │                             │
└────────┬────────┘                             │
         │                                      │
         │ User selects different demo          │
         ▼                                      │
┌─────────────────┐                             │
│Demo Switching   │ (cleanup old → load new)    │
└────────┬────────┘                             │
         │                                      │
         └──────────────────────────────────────┘
                        │
                        │ Close demo
                        ▼
                ┌─────────────────┐
                │  Welcome State  │ (back to initial)
                └─────────────────┘
```

### Demo Lifecycle

```
NOT_LOADED
    │
    │ selectDemo(id)
    ▼
LOADING ──error──► ERROR_STATE ──closeDemo()──► NOT_LOADED
    │                     ▲
    │ render complete     │
    ▼                     │
ACTIVE ──error────────────┘
    │
    │ closeDemo() or selectDemo(differentId)
    ▼
CLEANING_UP (dispose + reset)
    │
    ▼
NOT_LOADED
```

**State Invariants**:
- Only one demo can be ACTIVE at a time
- CLEANING_UP must complete before new demo enters LOADING
- ERROR_STATE allows closeDemo() operation (per FR-052)
- NOT_LOADED state shows welcome message (per clarification Q4)

---

## Relationships Diagram

```
┌───────────────────┐
│   DemoRegistry    │ (central registry)
│  Record<string,   │
│      Demo>        │
└─────────┬─────────┘
          │ contains 8
          │
          ▼
    ┌─────────┐
    │  Demo   │ (educational example)
    ├─────────┤
    │ id      │
    │metadata │────► DemoMetadata (name, concept, description, instructions)
    │ render  │
    └────┬────┘
         │ when active, creates
         │
         ▼
    ┌──────────────┐           ┌─────────────────┐
    │ DemoContext  │───owns───►│ ReactiveNodes   │ (signals, memos, effects)
    ├──────────────┤           │ (in tracker)    │
    │ rootDispose  │           └─────────────────┘
    │ cleanup      │
    └──────────────┘
```

---

## Data Flow

### Demo Selection Flow

```
User Action (click demo in menu)
    │
    ▼
setCurrentDemoId(newId) ──► Signal update
    │
    ▼
createEffect(() => {  ──────► Reactive handler
  if (currentDemoId()) {
    cleanupPreviousDemo();  ──► Dispose old context + reset tracker
    loadNewDemo();          ──► Create new context + render
  }
})
    │
    ▼
Demo renders ──────────────► Creates ReactiveNodes via createTrackedSignal/Memo/Effect
    │
    ▼
Tracker emits events ──────► Visualizer updates graph/tree/timeline
    │
    ▼
Demo panel displays ────────► UI controls + metadata visible
```

### Demo Cleanup Flow

```
User Action (close button or select different demo)
    │
    ▼
currentContext.cleanup()
    │
    ├──► currentContext.rootDispose() ──► Disposes all signals/effects/memos
    │
    └──► tracker.reset() ───────────────► Clears nodes, edges, events
              │
              ▼
    Visualizer updates ─────────────────► Graph/tree/timeline clear
              │
              ▼
    setCurrentDemoId(null) ─────────────► Welcome message appears
```

---

## Validation Rules Summary

| Entity | Rule | Enforcement |
|--------|------|-------------|
| Demo | Unique ID | TypeScript Record key uniqueness |
| Demo | Valid render function | ErrorBoundary catches exceptions |
| DemoMetadata | String length constraints | Runtime validation in registry |
| DemoContext | Single active instance | State machine in App.tsx |
| DemoContext | Complete cleanup | Test verification: `tracker.getNodes().length === 0` |
| DemoRegistry | Exactly 8 demos | Compile-time type + runtime test |

---

## Performance Considerations

**Memory**:
- Each demo context limited to <20 nodes (per assumption)
- Full cleanup on switch prevents memory leaks
- No persistent demo state (stateless demos)

**Rendering**:
- Demo load target <1s (per SC-002)
- UI interaction <100ms (per SC-005)
- Lazy evaluation: demos not rendered until selected

**Scale**:
- 8 demos total (fixed, not dynamic)
- Each demo ~2-10 nodes (simple graphs for education)
- Total memory footprint: <1MB per active demo

---

**Data Model Complete**: Ready for contract generation (contracts/demo-api.ts)
