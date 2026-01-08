# Research: Core Instrumentation Layer

**Date**: 2026-01-08  
**Feature**: 001-core-instrumentation

## Research Topics

### 1. Wrapping SolidJS Reactive Primitives

**Decision**: Create wrapper functions that delegate to native SolidJS primitives while emitting tracking events before/after operations.

**Rationale**: 
- SolidJS primitives (`createSignal`, `createMemo`, `createEffect`) return standard getter/setter tuples
- Wrappers can intercept by creating the native primitive, then wrapping the returned functions
- This preserves all reactive behavior while adding instrumentation

**Pattern**:
```typescript
function createTrackedSignal<T>(initialValue: T, options?: { name?: string }) {
  const [get, set] = createSignal(initialValue);
  const nodeId = generateId();
  
  // Register node on creation
  tracker.registerNode({ id: nodeId, type: 'signal', name: options?.name, value: initialValue });
  tracker.emit({ type: 'signal-create', nodeId, data: { value: initialValue } });
  
  // Wrap getter to track reads
  const trackedGet = () => {
    const value = get();
    tracker.emit({ type: 'signal-read', nodeId, data: { value } });
    return value;
  };
  
  // Wrap setter to track writes
  const trackedSet = (newValue: T | ((prev: T) => T)) => {
    const prevValue = get();
    set(newValue);
    const nextValue = get();
    tracker.updateNode(nodeId, { value: nextValue });
    tracker.emit({ type: 'signal-write', nodeId, data: { previousValue: prevValue, newValue: nextValue } });
  };
  
  return [trackedGet, trackedSet];
}
```

**Alternatives Considered**:
- Monkey-patching solid-js exports: Too fragile, breaks with updates
- DevTools integration: Less control, may not expose all needed data

### 2. Tracking Dependencies (Sources/Observers)

**Decision**: Track dependencies by detecting which signals are read during computation execution.

**Rationale**:
- When a memo/effect runs, it reads signals
- We can track which signals were read by maintaining a "current computation" context
- Signal reads during computation execution indicate dependency edges

**Pattern**:
```typescript
let currentComputation: string | null = null;

function createTrackedMemo<T>(fn: () => T, options?: { name?: string }) {
  const nodeId = generateId();
  
  const wrappedFn = () => {
    const prevComputation = currentComputation;
    currentComputation = nodeId;
    tracker.emit({ type: 'computation-execute-start', nodeId });
    
    // Clear old dependencies
    tracker.clearDependencies(nodeId);
    
    try {
      const result = fn();
      return result;
    } finally {
      tracker.emit({ type: 'computation-execute-end', nodeId });
      currentComputation = prevComputation;
    }
  };
  
  const memo = createMemo(wrappedFn);
  // ... wrap memo getter similarly to signal
}

// In trackedGet (signal wrapper):
const trackedGet = () => {
  const value = get();
  if (currentComputation) {
    tracker.addDependency(currentComputation, nodeId); // computation depends on this signal
  }
  tracker.emit({ type: 'signal-read', nodeId, data: { value } });
  return value;
};
```

**Alternatives Considered**:
- Introspecting SolidJS internals: Not stable API, would break on updates

### 3. Ownership Tree Tracking

**Decision**: Use SolidJS's `getOwner()` and `onCleanup()` to track ownership hierarchy.

**Rationale**:
- `getOwner()` returns the current computation owner
- We can capture owner at creation time to build ownership edges
- `onCleanup()` lets us hook into disposal

**Pattern**:
```typescript
import { getOwner, onCleanup } from 'solid-js';

function createTrackedEffect(fn: () => void, options?: { name?: string }) {
  const nodeId = generateId();
  const owner = getOwner();
  
  // Track ownership edge if we have a parent
  if (owner && owner.__trackedId) {
    tracker.addOwnershipEdge(owner.__trackedId, nodeId);
  }
  
  createEffect(() => {
    // ... tracking logic
    
    onCleanup(() => {
      tracker.emit({ type: 'computation-dispose', nodeId });
      tracker.markDisposed(nodeId);
    });
  });
}
```

**Note**: Ownership tracking may be limited since we can't easily associate SolidJS Owner objects with our node IDs without extending them. Alternative: Track ownership implicitly via creation order within `runWithOwner` contexts.

### 4. Event Emitter Pattern

**Decision**: Simple synchronous pub/sub with Set-based subscriber storage.

**Rationale**:
- Events must be synchronous per FR-014
- Multiple subscribers need same event (FR-012, FR-013)
- No need for async/queuing complexity

**Pattern**:
```typescript
type EventCallback = (event: ReactivityEvent) => void;

class ReactivityTracker {
  private subscribers = new Set<EventCallback>();
  
  subscribe(callback: EventCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  
  emit(event: ReactivityEvent) {
    for (const callback of this.subscribers) {
      callback(event);
    }
  }
}
```

### 5. ID Generation

**Decision**: Use incrementing counter with type prefix for human-readable IDs.

**Rationale**:
- Simple, fast, deterministic in tests
- Type prefix aids debugging: `signal-1`, `memo-2`, `effect-3`

**Pattern**:
```typescript
let idCounter = 0;
function generateId(type: NodeType): string {
  return `${type}-${++idCounter}`;
}
```

**Alternatives Considered**:
- UUID: Overkill for in-memory tracking, harder to debug
- Crypto random: Slower, non-deterministic in tests

## Key Findings

1. **SolidJS primitives are wrappable** - They return standard functions that can be intercepted
2. **Dependency tracking requires context** - Must maintain "current computation" during execution
3. **Ownership is partially trackable** - Can use `getOwner()` but mapping to our IDs requires care
4. **`onCleanup` is the disposal hook** - Called when computation re-runs or is disposed
5. **No need for complex event systems** - Synchronous Set-based pub/sub sufficient

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking SolidJS reactivity | Comprehensive tests comparing wrapped vs native behavior |
| Missing dependency edges | Test with diamond patterns and conditional dependencies |
| Memory leaks from undisposed nodes | Test disposal scenarios, verify cleanup |
| Event ordering issues | Synchronous emission preserves order naturally |
