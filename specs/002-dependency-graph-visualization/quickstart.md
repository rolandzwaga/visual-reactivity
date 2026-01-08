# Quickstart: Dependency Graph Visualization

## Installation

Add D3 dependencies:
```bash
npm install d3-force d3-selection d3-zoom d3-drag
npm install -D @types/d3-force @types/d3-selection @types/d3-zoom @types/d3-drag
```

## Basic Usage

```typescript
import { DependencyGraph } from './visualization';
import { tracker, createTrackedSignal, createTrackedMemo, createTrackedEffect } from './instrumentation';

function App() {
  // Create some tracked primitives
  const [count, setCount] = createTrackedSignal(0, { name: 'count' });
  const doubled = createTrackedMemo(() => count() * 2, { name: 'doubled' });
  createTrackedEffect(() => { console.log(doubled()); }, { name: 'logger' });

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <DependencyGraph width={800} height={600} />
    </div>
  );
}
```

## Component API

### DependencyGraph

Main visualization component. Renders the reactive graph with all interactions.

```tsx
<DependencyGraph 
  width={800}      // SVG width (default: 800)
  height={600}     // SVG height (default: 600)
  class="my-graph" // Optional CSS class
/>
```

### Interactions

| Action | Behavior |
|--------|----------|
| Scroll/Pinch | Zoom in/out |
| Drag (empty space) | Pan the view |
| Drag (node) | Reposition the node |
| Hover (node) | Highlight node and connected edges |
| Click (node) | Open detail panel |
| Click (elsewhere) / Escape | Close detail panel |

### Visual Encoding

| Node Type | Shape | Color |
|-----------|-------|-------|
| Signal | Circle | Blue (#3b82f6) |
| Memo | Diamond | Purple (#8b5cf6) |
| Effect | Square | Green (#22c55e) |

## File Structure

```
src/visualization/
├── DependencyGraph.tsx        # Main component
├── DependencyGraph.module.css
├── DetailPanel.tsx            # Node info panel
├── nodes/                     # Node shape components
│   ├── SignalNode.tsx
│   ├── MemoNode.tsx
│   └── EffectNode.tsx
└── hooks/
    ├── useGraphState.ts       # Graph state management
    └── useForceSimulation.ts  # D3 force simulation
```

## Hooks API

### useGraphState

Manages graph nodes, edges, selection, and hover state.

```typescript
const { nodes, edges, selectedNodeId, hoveredNodeId, selectNode, hoverNode } = useGraphState();
```

### useForceSimulation

Creates and manages D3 force simulation.

```typescript
const simulation = useForceSimulation(nodes, edges, { width: 800, height: 600 });
```
