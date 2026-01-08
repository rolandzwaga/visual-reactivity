# Quickstart: Core Instrumentation Layer

## Installation

No additional dependencies required. Uses existing `solid-js` package.

## Basic Usage

```typescript
import { createTrackedSignal, createTrackedMemo, createTrackedEffect } from './instrumentation';
import { tracker } from './instrumentation';

// Create tracked primitives (same API as SolidJS)
const [count, setCount] = createTrackedSignal(0, { name: 'count' });
const doubled = createTrackedMemo(() => count() * 2, { name: 'doubled' });

createTrackedEffect(() => {
  console.log('Count:', count(), 'Doubled:', doubled());
}, { name: 'logger' });

// Subscribe to events
const unsubscribe = tracker.subscribe((event) => {
  console.log(event.type, event.nodeId, event.data);
});

// Use signals normally
setCount(1);  // Emits: signal-write, computation-execute-start/end events

// Query graph state
const nodes = tracker.getNodes();
const edges = tracker.getEdges();

// Cleanup
unsubscribe();
tracker.reset();
```

## Event Types

| Event | When Emitted |
|-------|--------------|
| `signal-create` | New tracked signal created |
| `signal-read` | Signal getter called |
| `signal-write` | Signal setter called |
| `computation-create` | New memo/effect created |
| `computation-execute-start` | Memo/effect begins execution |
| `computation-execute-end` | Memo/effect completes execution |
| `computation-dispose` | Memo/effect disposed |
| `subscription-add` | Dependency edge added |
| `subscription-remove` | Dependency edge removed |

## Querying the Graph

```typescript
// Get all nodes
for (const [id, node] of tracker.getNodes()) {
  console.log(node.type, node.name, node.value);
}

// Get specific node
const node = tracker.getNode('signal-1');

// Get all edges
for (const [id, edge] of tracker.getEdges()) {
  console.log(edge.type, edge.source, '->', edge.target);
}

// Get dependency edges only
const deps = tracker.getEdgesByType('dependency');

// Get edges for a node
const nodeEdges = tracker.getEdgesForNode('memo-1');
```

## File Structure

```
src/
├── instrumentation/
│   ├── tracker.ts       # ReactivityTracker singleton
│   ├── primitives.ts    # createTrackedSignal, createTrackedMemo, createTrackedEffect
│   ├── events.ts        # Event types and helpers
│   └── index.ts         # Public exports
└── types/
    ├── nodes.ts         # ReactiveNode type
    ├── edges.ts         # ReactiveEdge type
    ├── events.ts        # ReactivityEvent type
    └── index.ts         # Type exports
```
