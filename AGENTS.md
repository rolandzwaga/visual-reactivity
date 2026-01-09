# visual-reactivity Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-08

## Active Technologies
- TypeScript 5.9.3 with strict mode + SolidJS 1.9.10, D3.js (d3-force, d3-selection, d3-zoom) (002-dependency-graph-visualization)
- N/A (in-memory graph state from tracker) (002-dependency-graph-visualization)
- TypeScript 5.9.3 with strict mode + SolidJS 1.9.10, D3.js (d3-transition, d3-ease, d3-interpolate) (003-animation-system)
- N/A (in-memory animation state) (003-animation-system)
- TypeScript 5.9.3 with strict mode + SolidJS 1.9.10, D3.js (already installed for sparklines) (004-live-values-panel)
- Browser localStorage for panel visibility and width preferences (004-live-values-panel)
- TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10, D3.js (d3-hierarchy, d3-selection, d3-zoom for reuse) (005-ownership-tree-view)
- In-memory state from ReactivityTracker (no persistence) (005-ownership-tree-view)
- TypeScript 5.9.3 with strict mode + SolidJS 1.9.10, D3.js (d3-scale for time scales, d3-axis for axis rendering, d3-brush for cursor, d3-selection for DOM, d3-zoom for navigation - **d3-axis and d3-brush need adding**) (006-timeline-view-horizontal)
- In-memory event history from ReactivityTracker, browser localStorage for panel preferences (visibility, height, filters) (006-timeline-view-horizontal)
- TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10 (createStore, createEffect, createMemo), D3.js (existing - for graph/tree manipulation) (007-view-sync)
- In-memory selection state via SolidJS store, no persistence required (007-view-sync)
- TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10, D3.js (d3-selection, d3-zoom), existing ReactivityTracker (008-pattern-detection-analysis)
- Browser localStorage for pattern detection settings and exceptions (008-pattern-detection-analysis)
- TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10, D3.js (d3-scale, d3-axis, d3-brush, d3-selection, d3-zoom - all already installed from Feature 006) (009-timeline-playback)
- IndexedDB for persistent recording storage (clarified via Q1: preferred over localStorage for capacity) (009-timeline-playback)

- TypeScript 5.9.3 with strict mode + SolidJS 1.9.10 (wrapping its primitives) (001-core-instrumentation)

## Project Structure

```text
src/
├── instrumentation/
│   ├── tracker.ts       # ReactivityTracker singleton
│   ├── primitives.ts    # createTrackedSignal, createTrackedMemo, createTrackedEffect
│   └── index.ts         # Public exports
├── types/
│   ├── nodes.ts         # ReactiveNode type
│   ├── edges.ts         # ReactiveEdge type
│   ├── events.ts        # ReactivityEvent type
│   └── index.ts         # Type exports
tests/
```

## Commands

- `npx vitest run --no-watch` - Run all tests
- `npx vitest run --coverage --no-watch` - Run tests with coverage
- `npm run check` - Biome lint/format
- `npm run typecheck` - TypeScript check

## Code Style

TypeScript 5.9.3 with strict mode: Follow standard conventions

## Recent Changes
- 009-timeline-playback: Added TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10, D3.js (d3-scale, d3-axis, d3-brush, d3-selection, d3-zoom - all already installed from Feature 006)
- 008-pattern-detection-analysis: Added TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10, D3.js (d3-selection, d3-zoom), existing ReactivityTracker
- 007-view-sync: Added TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10 (createStore, createEffect, createMemo), D3.js (existing - for graph/tree manipulation)


<!-- MANUAL ADDITIONS START -->
## Instrumentation API

```typescript
import { 
  tracker, 
  createTrackedSignal, 
  createTrackedMemo, 
  createTrackedEffect 
} from './instrumentation';

// Same API as SolidJS, but emits events
const [count, setCount] = createTrackedSignal(0, { name: 'count' });
const doubled = createTrackedMemo(() => count() * 2, { name: 'doubled' });
createTrackedEffect(() => { doubled(); }, { name: 'logger' });

// Subscribe to reactivity events
tracker.subscribe((event) => console.log(event.type, event.nodeId));

// Query graph state
tracker.getNodes();           // All nodes
tracker.getNode('signal-1');  // Single node
tracker.getEdges();           // All edges
tracker.getEdgesByType('dependency'); // Filter by type
tracker.getEdgesForNode('memo-1');    // Edges for node
tracker.reset();              // Clear all state
```
<!-- MANUAL ADDITIONS END -->
