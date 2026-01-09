# Quickstart Guide: Ownership Tree View

**Feature**: 005-ownership-tree-view  
**Target Audience**: Developers implementing this feature

## Overview

Build a hierarchical tree visualization showing SolidJS ownership relationships using D3 hierarchy layout and SolidJS reactivity patterns established in Feature 002 (DependencyGraph).

---

## Architecture Summary

```
ReactivityTracker (001) 
  → Emits events
  → OwnershipTree component subscribes
  → useTreeState hook (expansion, visibility)
  → useHierarchyLayout hook (D3 tree layout)
  → Render with existing node components (SignalNode, MemoNode, EffectNode)
  → Share DetailPanel with DependencyGraph
```

---

## Key Files to Create

### 1. Main Component
**Path**: `src/visualization/OwnershipTree.tsx`
- Subscribe to tracker events in `onMount`
- Manage tree state with `useTreeState` hook
- Compute layout with `useHierarchyLayout` hook
- Render nodes and edges with SolidJS `<For>`
- Handle expand/collapse interactions

### 2. Tree State Hook
**Path**: `src/visualization/hooks/useTreeState.ts`
- Manage expansion state (`Set<string>` of expanded node IDs)
- Compute visible nodes based on expansion
- Track disposal timers (5-second auto-removal)
- Synchronize selection with DependencyGraph

### 3. Hierarchy Layout Hook
**Path**: `src/visualization/hooks/useHierarchyLayout.ts`
- Wrap D3 `tree()` layout with SolidJS reactivity
- Build hierarchy from tracker nodes using owner/owned relationships
- Handle multiple root trees with vertical stacking
- Compute layout dimensions for SVG sizing

### 4. D3 Utility
**Path**: `src/d3/hierarchyLayout.ts`
- Factory function for D3 tree layout configuration
- Separation function for node spacing
- Helper for multiple tree arrangement

---

## Implementation Checklist

### Phase 1: Tree State & Layout

- [ ] Create `useTreeState` hook with expansion signals
- [ ] Create `useHierarchyLayout` hook wrapping D3 tree()
- [ ] Create `hierarchyLayout.ts` utility
- [ ] Write tests for hooks (test-first)

### Phase 2: Component Structure

- [ ] Create `OwnershipTree.tsx` component skeleton
- [ ] Subscribe to tracker events
- [ ] Integrate tree state and layout hooks
- [ ] Add CSS module for styling

### Phase 3: Rendering

- [ ] Render tree nodes using existing `SignalNode`, `MemoNode`, `EffectNode`
- [ ] Render ownership edges (lines connecting parent/child)
- [ ] Add expand/collapse indicators
- [ ] Implement horizontal scrolling (CSS overflow-x)

### Phase 4: Interactions

- [ ] Click node to toggle expansion
- [ ] Click node to select (opens DetailPanel)
- [ ] Hover for tooltip
- [ ] Synchronize selection with DependencyGraph

### Phase 5: Disposal Handling

- [ ] Style disposed nodes (grayscale filter)
- [ ] Implement 5-second auto-removal timer
- [ ] Clean up timers on unmount

### Phase 6: Integration

- [ ] Import and render OwnershipTree in App.tsx
- [ ] Share DetailPanel component
- [ ] Add view toggle (Graph vs Tree)
- [ ] Test with demo examples

---

## Key Patterns to Follow

### 1. Tracker Subscription (from DependencyGraph)

```typescript
onMount(() => {
  const existingNodes = Array.from(tracker.getNodes().values());
  // Build initial tree from existing nodes
  
  const unsubscribe = tracker.subscribe((event) => {
    switch (event.type) {
      case "signal-create":
      case "computation-create":
        // Add node to tree
        break;
      case "computation-dispose":
        // Mark for disposal, start 5s timer
        break;
    }
  });
  
  onCleanup(() => unsubscribe());
});
```

### 2. D3 Integration (similar to useForceSimulation)

```typescript
const layoutRoot = createMemo(() => {
  const nodes = tracker.getNodes();
  const roots = findRootNodes(nodes);
  
  const trees = roots.map(root => {
    const hierarchyRoot = hierarchy(root, getChildren);
    treeLayout(hierarchyRoot);
    return hierarchyRoot;
  });
  
  return arrangeVertically(trees);
});
```

### 3. Expansion State

```typescript
const [expandedNodes, setExpandedNodes] = createSignal<Set<string>>(
  getDefaultExpanded(roots, maxDepth: 2)
);

const visibleNodes = createMemo(() => {
  return filterByExpansion(layoutRoot().descendants(), expandedNodes());
});
```

### 4. Node Reuse

```typescript
<For each={visibleNodes()}>
  {(node) => {
    const NodeComponent = getNodeComponent(node.data.type);
    return (
      <g transform={`translate(${node.x}, ${node.y})`}>
        <NodeComponent
          node={node}
          isSelected={selectedNodeId() === node.data.id}
          onClick={() => toggleExpanded(node.data.id)}
        />
      </g>
    );
  }}
</For>
```

---

## D3 Tree Layout Configuration

```typescript
import { tree, hierarchy } from 'd3-hierarchy';

const treeLayout = tree()
  .nodeSize([60, 80])  // [horizontal, vertical] spacing
  .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));

const root = hierarchy(data, (d) => {
  return d.owned
    .map(id => tracker.getNode(id))
    .filter(Boolean)
    .sort((a, b) => a.createdAt - b.createdAt);  // FR-015
});

treeLayout(root);
```

---

## Multiple Trees Arrangement

```typescript
let cumulativeHeight = 0;
const TREE_SPACING = 100;

roots.forEach(root => {
  treeLayout(root);
  
  root.descendants().forEach(node => {
    node.y += cumulativeHeight;
  });
  
  const maxY = d3.max(root.descendants(), n => n.y) || 0;
  cumulativeHeight = maxY + TREE_SPACING;
});
```

---

## Testing Strategy

### Unit Tests
- `useTreeState.spec.ts`: Expansion, visibility, disposal tracking
- `useHierarchyLayout.spec.ts`: Layout computation, multiple trees
- `hierarchyLayout.spec.ts`: D3 utility functions

### Integration Tests
- Tracker subscription and tree updates
- Expand/collapse interactions
- Disposal lifecycle (5-second removal)
- Selection synchronization

### Component Tests
- Node rendering with correct shapes/colors
- Edge rendering between parent/child
- Expand/collapse UI feedback
- DetailPanel integration

---

## Performance Targets (from Success Criteria)

- **SC-002**: 20 levels deep without degradation (60 FPS)
- **SC-003**: Updates within 50ms of tracker events
- **SC-004**: 100+ nodes navigable without freezing

**Optimization if needed**:
- Virtual rendering (only render visible nodes)
- Disable transitions for large updates (>200 nodes)
- Batch tracker events with `queueMicrotask`

---

## Reusable Components

### From Feature 002 (Dependency Graph)
- `DetailPanel.tsx` - Share for node inspection
- `SignalNode.tsx`, `MemoNode.tsx`, `EffectNode.tsx` - Reuse for rendering
- `visualization/types.ts` - Import `NODE_STYLES` constants

### From Feature 003 (Animation)
- `useAnimationController` - Reuse for disposal animations
- Animation visual states (pulse, executing, stale, disposal)

---

## Common Pitfalls to Avoid

1. **Don't mutate D3 nodes directly** - Use SolidJS signals for state
2. **Don't inline D3 logic in component** - Extract to hooks (architectural pattern)
3. **Don't create new node components** - Reuse existing (FR-002)
4. **Don't forget timer cleanup** - Use `onCleanup` for disposal timers
5. **Don't mix D3 DOM and SolidJS rendering** - D3 for math only, SolidJS for rendering

---

## Integration with App.tsx

```typescript
import { DependencyGraph } from './visualization/DependencyGraph';
import { OwnershipTree } from './visualization/OwnershipTree';
import { DetailPanel } from './visualization/DetailPanel';

const [view, setView] = createSignal<'graph' | 'tree'>('graph');
const [selectedNodeId, setSelectedNodeId] = createSignal<string | null>(null);

<div>
  <button onClick={() => setView(v => v === 'graph' ? 'tree' : 'graph')}>
    Toggle View
  </button>
  
  <Show when={view() === 'graph'}>
    <DependencyGraph 
      selectedNodeId={selectedNodeId()}
      onSelectNode={setSelectedNodeId}
    />
  </Show>
  
  <Show when={view() === 'tree'}>
    <OwnershipTree
      selectedNodeId={selectedNodeId()}
      onSelectNode={setSelectedNodeId}
    />
  </Show>
  
  <Show when={selectedNodeId()}>
    <DetailPanel
      nodeId={selectedNodeId()}
      onClose={() => setSelectedNodeId(null)}
    />
  </Show>
</div>
```

---

## Next Steps

1. Review existing `DependencyGraph.tsx` and hooks
2. Start with `useTreeState` hook (test-first)
3. Implement `useHierarchyLayout` hook (test-first)
4. Build component incrementally
5. Test with simple examples first
6. Add complexity (disposal, multiple roots)
7. Run quality gates: `npm run check`, `npm run typecheck`
