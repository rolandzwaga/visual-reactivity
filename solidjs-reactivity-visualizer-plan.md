# SolidJS Reactivity Visualizer — Design Plan

A D3-based application for visualizing SolidJS's fine-grained reactivity system in real-time.

---

## 1. Goals & Scope

### Primary Goals

- Visualize the reactive dependency graph in real-time
- Show data flow propagation when signals change
- Display the ownership/disposal hierarchy
- Animate the execution phases (signal write → memo evaluation → effect execution)

### Secondary Goals

- Allow inspection of current values
- Show subscription counts and memory pressure
- Highlight "hot paths" (frequently updating nodes)
- Detect potential issues (orphaned effects, deep chains, diamond patterns)

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Visualization App                         │
├─────────────────┬───────────────────┬───────────────────────┤
│   Instrumented  │   Graph State     │   D3 Rendering        │
│   Solid Runtime │   Manager         │   Layer               │
├─────────────────┼───────────────────┼───────────────────────┤
│ • Proxy/Wrapper │ • Node registry   │ • Force-directed      │
│   for signals   │ • Edge tracking   │   graph view          │
│ • Hook into     │ • Event log       │ • Tree view           │
│   computations  │ • Snapshots       │ • Timeline view       │
│ • Emit events   │                   │ • Animation system    │
└─────────────────┴───────────────────┴───────────────────────┘
```

---

## 3. Data Model

### 3.1 Node Types

```typescript
type NodeType = 'signal' | 'memo' | 'effect' | 'renderEffect' | 'root' | 'component'

interface ReactiveNode {
  id: string
  type: NodeType
  name: string | null
  
  // Current state
  value: unknown           // For signals/memos
  isStale: boolean         // Marked dirty but not yet re-evaluated
  isExecuting: boolean     // Currently running
  executionCount: number   // How many times it has run
  lastExecutedAt: number   // Timestamp
  
  // Graph relationships
  sources: string[]        // IDs of nodes this depends on (upstream)
  observers: string[]      // IDs of nodes that depend on this (downstream)
  
  // Ownership relationships
  owner: string | null     // Parent in ownership tree
  owned: string[]          // Children in ownership tree
  
  // Metadata
  createdAt: number
  disposedAt: number | null
  stackTrace?: string      // Where it was created
}
```

### 3.2 Edge Types

```typescript
type EdgeType = 'dependency' | 'ownership'

interface ReactiveEdge {
  id: string
  type: EdgeType
  source: string  // Node ID
  target: string  // Node ID
  
  // For animation
  lastTriggeredAt: number | null
  triggerCount: number
}
```

### 3.3 Event Log (for timeline/playback)

```typescript
type EventType = 
  | 'signal-create'
  | 'signal-read'
  | 'signal-write'
  | 'computation-create'
  | 'computation-execute-start'
  | 'computation-execute-end'
  | 'computation-dispose'
  | 'subscription-add'
  | 'subscription-remove'
  | 'batch-start'
  | 'batch-end'

interface ReactivityEvent {
  id: string
  type: EventType
  timestamp: number
  nodeId: string
  data: {
    previousValue?: unknown
    newValue?: unknown
    sourceId?: string      // For subscription events
    batchId?: string       // For batch grouping
  }
}
```

---

## 4. Instrumentation Strategy

### Option A: Wrapper Primitives (Recommended for Demo)

Create instrumented versions of Solid's primitives that emit events:

```typescript
// Conceptual API
import { createInstrumentedSignal, createInstrumentedEffect } from './instrumented'

const [count, setCount] = createInstrumentedSignal(0, { name: 'count' })
```

**Pros:** Non-invasive, works with any Solid app, clear boundaries  
**Cons:** Requires modifying application code

### Option B: Runtime Monkey-Patching

Patch `solid-js` exports at runtime to intercept all reactive operations.

**Pros:** Zero app code changes, sees everything  
**Cons:** Fragile, may break with Solid updates, complex

### Option C: Solid DevTools Integration

Hook into Solid's existing dev mode instrumentation (`_SOLID_DEV_`).

**Pros:** Official hooks, maintained compatibility  
**Cons:** Less control, may not expose all needed data

### Recommendation

Start with **Option A** for a standalone educational tool, with a clear API. Can expand to B/C later.

---

## 5. Visualization Views

### 5.1 Dependency Graph View (Primary)

**Layout:** Force-directed graph using `d3-force`

#### Visual Encoding

| Element | Signal | Memo | Effect | RenderEffect |
|---------|--------|------|--------|--------------|
| Shape | Circle | Diamond | Square | Square (dashed) |
| Color | Blue | Purple | Green | Orange |
| Size | Based on observer count | Based on observer count | Fixed | Fixed |

#### Edge Encoding

- **Dependency edges:** Solid arrows, gray by default
- **Active propagation:** Animated pulse along edge (colored by source)
- **Ownership edges:** Dashed lines, lighter color

#### Interactions

- Hover node → highlight connected subgraph
- Click node → show detail panel with value, stack trace, stats
- Drag nodes → reposition
- Scroll → zoom
- Double-click effect → trigger manual re-run (if safe)

#### Animation on Update

1. Signal node pulses (scale up briefly)
2. Edges to dependents animate with traveling particle
3. Dependent nodes pulse when they execute
4. Color intensity fades over time (heat map of recent activity)

### 5.2 Ownership Tree View

**Layout:** Hierarchical tree using `d3-hierarchy` (tidy tree or dendrogram)

**Purpose:** Show the disposal hierarchy — what gets cleaned up when a computation re-runs

#### Visual Encoding

- Same shapes/colors as dependency graph
- Tree structure shows parent-child ownership
- Collapsed subtrees for large graphs

#### Interactions

- Click to expand/collapse subtrees
- Highlight path to root
- "Dispose" button to manually dispose a root (for testing)

### 5.3 Timeline View

**Layout:** Horizontal timeline with swimlanes per node

**Purpose:** Show temporal sequence of events, useful for debugging execution order

#### Visual Encoding

- X-axis: Time
- Y-axis: One row per active node (or grouped by type)
- Events as marks on the timeline
- Batches shown as grouped regions

#### Interactions

- Scrub through time
- Click event to see details
- Filter by event type
- Play/pause real-time updates

### 5.4 Live Values Panel

**Layout:** Sidebar list/table

#### Content

- All signals with current values
- Search/filter
- Edit values directly (calls setter)
- Sparkline of value history

---

## 6. Key Animation Sequences

### 6.1 Signal Write Propagation

```
Frame 0:    Signal node scales up, turns bright
Frame 1-5:  Particle travels along each outgoing edge
Frame 6:    Dependent memos highlight (stale)
Frame 7-10: Memos evaluate (if read), particles continue
Frame 11:   Effects queue indicator shows pending count
Frame 12+:  Effects execute one by one, pulse on completion
```

### 6.2 Subscription Change

When dependencies change during re-execution:

- Old edges fade out and disconnect
- New edges draw in with a "connection" animation
- Brief highlight on newly connected nodes

### 6.3 Disposal

When a computation is disposed:

- Node and all owned children fade to gray
- Edges disconnect with retraction animation
- Nodes shrink and disappear
- Optional: ghost outline remains briefly

---

## 7. Technical Implementation Plan

### Phase 1: Core Infrastructure

1. Create `ReactivityTracker` class to maintain graph state
2. Implement instrumented primitives (`createTrackedSignal`, `createTrackedEffect`, `createTrackedMemo`)
3. Build event emitter system for real-time updates
4. Create serialization for snapshots

### Phase 2: Basic Graph Visualization

1. Set up D3 force simulation with nodes and links
2. Implement node rendering with proper shapes/colors
3. Add basic interactions (hover, click, drag, zoom)
4. Create detail panel component

### Phase 3: Animation System

1. Build edge animation system (traveling particles)
2. Implement node state transitions (pulse, highlight, fade)
3. Create animation queue for sequencing
4. Add timing controls (speed adjustment, pause)

### Phase 4: Additional Views

1. Ownership tree view
2. Timeline view
3. Live values panel
4. View synchronization (selecting in one highlights in others)

### Phase 5: Polish & Advanced Features

1. Performance optimization for large graphs (virtualization, WebGL)
2. Export/import graph snapshots
3. "Time travel" debugging with event replay
4. Pattern detection (diamonds, long chains, orphans)
5. Integration with Solid DevTools (if feasible)

---

## 8. File Structure

```
solid-reactivity-visualizer/
├── src/
│   ├── instrumentation/
│   │   ├── tracker.ts           # Core graph state manager
│   │   ├── primitives.ts        # Wrapped createSignal, etc.
│   │   ├── events.ts            # Event types and emitter
│   │   └── serialization.ts     # Snapshot import/export
│   │
│   ├── visualization/
│   │   ├── DependencyGraph.tsx  # Main force-directed view
│   │   ├── OwnershipTree.tsx    # Hierarchical tree view
│   │   ├── Timeline.tsx         # Event timeline
│   │   ├── ValuesPanel.tsx      # Live values sidebar
│   │   ├── DetailPanel.tsx      # Node inspection
│   │   └── controls/
│   │       ├── PlaybackControls.tsx
│   │       ├── FilterControls.tsx
│   │       └── LayoutControls.tsx
│   │
│   ├── animation/
│   │   ├── EdgeAnimator.ts      # Particle/pulse on edges
│   │   ├── NodeAnimator.ts      # Node state transitions  
│   │   └── AnimationQueue.ts    # Sequencing system
│   │
│   ├── d3/
│   │   ├── forceSimulation.ts   # D3 force setup
│   │   ├── treeLayout.ts        # D3 hierarchy setup
│   │   ├── scales.ts            # Color/size scales
│   │   └── shapes.ts            # Node shape generators
│   │
│   ├── demo/
│   │   ├── examples/            # Pre-built example apps
│   │   │   ├── counter.tsx
│   │   │   ├── todoList.tsx
│   │   │   ├── diamondProblem.tsx
│   │   │   └── nestedEffects.tsx
│   │   └── DemoApp.tsx          # Example runner
│   │
│   ├── App.tsx                  # Main app shell
│   └── index.tsx                # Entry point
│
├── public/
└── package.json
```

---

## 9. Example Scenarios to Demonstrate

1. **Simple Counter** — Signal → Effect, basic flow
2. **Derived State** — Signal → Memo → Effect, shows memo caching
3. **Diamond Pattern** — A → B,C → D, demonstrates glitch-free execution
4. **Conditional Dependencies** — Dependencies that change based on branching
5. **Nested Effects** — Shows ownership tree and disposal
6. **Batch Updates** — Multiple writes, single effect execution
7. **Deep Chain** — A → B → C → D → E, shows propagation depth
8. **Component Tree** — Multiple components with shared state

---

## 10. Potential Challenges & Mitigations

| Challenge | Mitigation |
|-----------|------------|
| Large graphs (100+ nodes) | Virtualize rendering, collapse clusters, WebGL fallback |
| High-frequency updates | Throttle visualization updates, batch animation frames |
| Async effects timing | Show async boundaries clearly, separate "pending" state |
| Circular dependencies | Detect and highlight as error (Solid prevents these anyway) |
| Value serialization | Handle functions/symbols gracefully, show type placeholders |
| Performance of D3 in SolidJS | Use D3 for math/layout only, render with Solid's DOM |

---

## 11. Nice-to-Have Extensions

- **Code view**: Show source code with reactive primitives highlighted
- **Diff view**: Compare graph snapshots side-by-side
- **Performance metrics**: Execution time per computation, memory usage
- **Export as video**: Record animation sequence
- **Embed mode**: Drop visualizer into any Solid app as a dev panel
- **Graph query language**: Filter/search with expressions like `type:effect AND observers.length > 2`

---

## 12. Getting Started

### Recommended First Steps

1. **Start with the instrumentation layer** — Build the `ReactivityTracker` and wrapped primitives first. This is the foundation everything else depends on.

2. **Create a minimal D3 force graph** — Get something visual working quickly with basic nodes and edges, then iterate.

3. **Build one demo scenario** — Implement the "Simple Counter" example to test the full pipeline end-to-end.

4. **Add animations incrementally** — Start with node pulses, then edge particles, then more complex sequences.

### Technology Stack

- **Framework:** SolidJS (eating our own dog food)
- **Visualization:** D3.js (for force simulation, layouts, scales)
- **Styling:** CSS/Tailwind (keep it simple)
- **Build:** Vite
- **Testing:** Vitest for unit tests on the tracker logic

---

## 13. References

- [SolidJS Documentation](https://docs.solidjs.com/)
- [SolidJS Source Code - signal.ts](https://github.com/solidjs/solid/blob/main/packages/solid/src/reactive/signal.ts)
- [D3 Force Simulation](https://d3js.org/d3-force)
- [D3 Hierarchy](https://d3js.org/d3-hierarchy)
- [Ryan Carniato - Fine-Grained Reactivity](https://dev.to/ryansolid/a-hands-on-introduction-to-fine-grained-reactivity-3ndf)
- [Reactivity Overview - Solid Work Group](https://github.com/solidjs/solid-workgroup/discussions/2)
