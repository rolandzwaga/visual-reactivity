# visual-reactivity Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-08

## Active Technologies
- TypeScript 5.9.3 with strict mode + SolidJS 1.9.10, D3.js (d3-force, d3-selection, d3-zoom) (002-dependency-graph-visualization)
- N/A (in-memory graph state from tracker) (002-dependency-graph-visualization)
- TypeScript 5.9.3 with strict mode + SolidJS 1.9.10, D3.js (d3-transition, d3-ease, d3-interpolate) (003-animation-system)
- N/A (in-memory animation state) (003-animation-system)

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
- 003-animation-system: Added TypeScript 5.9.3 with strict mode + SolidJS 1.9.10, D3.js (d3-transition, d3-ease, d3-interpolate)
- 002-dependency-graph-visualization: Added TypeScript 5.9.3 with strict mode + SolidJS 1.9.10, D3.js (d3-force, d3-selection, d3-zoom)

- 001-core-instrumentation: Added TypeScript 5.9.3 with strict mode + SolidJS 1.9.10 (wrapping its primitives)

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
