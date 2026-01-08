# Research: Dependency Graph Visualization

**Feature**: 002-dependency-graph-visualization  
**Date**: 2026-01-08

## D3.js + SolidJS Integration Pattern

### Decision
Use D3 for **calculations only** (force simulation, zoom/drag behaviors) while SolidJS handles all **DOM rendering** via JSX. D3 will not directly manipulate the DOM.

### Rationale
- SolidJS's fine-grained reactivity handles DOM updates efficiently
- D3's direct DOM manipulation would conflict with SolidJS's reactive model
- Separating concerns: D3 = physics/math, SolidJS = rendering
- This pattern is well-established in React/Vue D3 integrations and applies equally to SolidJS

### Alternatives Considered
1. **Let D3 manage SVG entirely**: Rejected - conflicts with SolidJS reactivity, loses component benefits
2. **Use a D3 wrapper library**: Rejected - none exist for SolidJS, React wrappers use hooks incompatible with SolidJS
3. **Build custom force simulation**: Rejected - d3-force is battle-tested and handles edge cases

---

## Force Simulation Setup

### Decision
Create simulation outside components, update SolidJS signals on each tick via `simulation.on('tick', callback)`.

### Rationale
- Simulation runs continuously until alpha decays; callbacks update reactive state
- Node positions stored in SolidJS signals, triggering efficient re-renders
- Simulation can be paused/resumed without unmounting components

### Implementation Pattern
```typescript
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { createSignal, onCleanup } from 'solid-js';

function useForceSimulation(nodes, edges) {
  const [positions, setPositions] = createSignal(new Map());
  
  const simulation = forceSimulation(nodes())
    .force('link', forceLink(edges()).id(d => d.id).distance(100))
    .force('charge', forceManyBody().strength(-300))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collide', forceCollide(30));
  
  simulation.on('tick', () => {
    setPositions(new Map(nodes().map(n => [n.id, { x: n.x, y: n.y }])));
  });
  
  onCleanup(() => simulation.stop());
  
  return positions;
}
```

---

## Zoom and Pan Behavior

### Decision
Use `d3-zoom` attached to SVG container, store transform in SolidJS signal, apply via SVG `transform` attribute.

### Rationale
- d3-zoom handles wheel events, touch gestures, and transform math
- SolidJS signal stores current transform; changes trigger re-render of `<g transform={...}>`
- No direct D3 DOM manipulation - D3 calculates, SolidJS renders

### Implementation Pattern
```typescript
import { zoom, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';
import { createSignal, onMount } from 'solid-js';

function useZoom(svgRef) {
  const [transform, setTransform] = createSignal(zoomIdentity);
  
  onMount(() => {
    const zoomBehavior = zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => setTransform(event.transform));
    
    select(svgRef).call(zoomBehavior);
  });
  
  return transform;
}
```

---

## Node Dragging

### Decision
Use `d3-drag` for drag behavior, update node positions in simulation and trigger signal updates.

### Rationale
- d3-drag handles mouse/touch events and coordinates
- On drag, fix node position in simulation (`fx`, `fy` properties)
- Release `fx`/`fy` on drag end to let simulation take over

### Implementation Pattern
```typescript
import { drag } from 'd3-drag';
import { select } from 'd3-selection';

function setupNodeDrag(nodeElement, node, simulation) {
  const dragBehavior = drag()
    .on('start', (event) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      node.fx = node.x;
      node.fy = node.y;
    })
    .on('drag', (event) => {
      node.fx = event.x;
      node.fy = event.y;
    })
    .on('end', (event) => {
      if (!event.active) simulation.alphaTarget(0);
      node.fx = null;
      node.fy = null;
    });
  
  select(nodeElement).call(dragBehavior);
}
```

---

## Required D3 Modules

### Decision
Install only the specific D3 modules needed, not the full `d3` bundle.

### Rationale
- Smaller bundle size
- Clear dependency on what's actually used
- Tree-shaking friendly

### Modules Required
- `d3-force`: Force simulation (forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide)
- `d3-selection`: DOM selection for attaching behaviors (select)
- `d3-zoom`: Zoom and pan (zoom, zoomIdentity)
- `d3-drag`: Node dragging (drag)

---

## Node Shape Rendering

### Decision
Use SolidJS components with SVG elements for node shapes. Each node type has its own component.

### Rationale
- Full SolidJS reactivity for hover/selected states
- Type-safe props
- Easy to style with CSS modules
- Testable with @solidjs/testing-library

### Shape Definitions
| Node Type | Shape | SVG Element | Size |
|-----------|-------|-------------|------|
| Signal | Circle | `<circle>` | r=20 |
| Memo | Diamond | `<polygon>` (rotated square) | 28x28 |
| Effect | Square | `<rect>` | 28x28 |

---

## Edge Arrow Markers

### Decision
Use SVG `<marker>` definition with `<path>` arrow, reference via `marker-end` attribute on lines.

### Rationale
- Standard SVG approach for arrow heads
- Single marker definition, reused by all edges
- Scales properly with zoom

### Implementation
```svg
<defs>
  <marker id="arrow" viewBox="0 -5 10 10" refX="25" refY="0" 
          markerWidth="6" markerHeight="6" orient="auto">
    <path d="M0,-5L10,0L0,5" fill="#999"/>
  </marker>
</defs>
<line x1={...} y1={...} x2={...} y2={...} marker-end="url(#arrow)"/>
```

---

## Performance Considerations

### Decision
Batch simulation updates, use `requestAnimationFrame` throttling if needed, limit node count warning at 100+.

### Rationale
- Force simulation ticks rapidly during settling
- Excessive re-renders can cause jank
- 100 nodes is practical limit for educational tool

### Optimizations
1. Use `createMemo` for derived node/edge arrays to avoid recalculation
2. Debounce tracker event handling if high-frequency updates detected
3. Consider `alphaDecay` tuning for faster settling
