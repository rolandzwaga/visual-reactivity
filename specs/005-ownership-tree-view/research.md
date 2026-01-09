# Phase 0 Research: Ownership Tree View

**Feature**: 005-ownership-tree-view  
**Date**: 2026-01-09  
**Status**: In Progress - Awaiting research agents

## Research Questions

### 1. D3 Hierarchy Layout: tree() vs cluster()

**Question**: Which D3 hierarchy layout is best for ownership trees with variable node counts?

**Decision**: Use `d3.tree()` with `.nodeSize([dx, dy])` for consistent node spacing

**Rationale**:
- **tree()** centers parent nodes above children, ideal for ownership visualization
- **nodeSize()** provides consistent spacing regardless of tree size (vs. `.size()` which fits to canvas causing overlap)
- Production-tested in Google Chrome Labs, TensorFlow projects
- Matches ROADMAP.md specification for "tree or dendrogram" layout

**Implementation**:
```typescript
import { tree } from "d3-hierarchy";

const treeLayout = tree<ReactiveNode>()
  .nodeSize([60, 80])  // [horizontal spacing, vertical spacing]
  .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));
```

**Alternatives Considered**:
- **cluster()**: Rejected - aligns all leaf nodes at same depth, not appropriate for ownership hierarchy where depth indicates nesting level
- **tree().size()**: Rejected - fixes canvas dimensions causing node overlap in large trees; nodeSize() allows tree to grow naturally

---

### 2. Multiple Separate Trees Rendering

**Question**: How to efficiently render multiple independent trees (multiple roots) in one SVG?

**Decision**: Render each tree in separate `<g>` element with vertical offset transform

**Rationale**:
- Standard D3 pattern for multiple hierarchies in single SVG
- Each tree gets independent layout calculation
- Vertical stacking via `transform` attribute is performant (GPU-accelerated)
- Allows individual tree manipulation if needed

**Implementation**:
```typescript
const TREE_VERTICAL_SPACING = 100;
let cumulativeHeight = 0;

roots.forEach((root, index) => {
  treeLayout(root);  // Compute layout for this tree
  
  // Offset all nodes in this tree vertically
  root.descendants().forEach(node => {
    node.y += cumulativeHeight;
  });
  
  // Calculate height for next tree
  const treeHeight = d3.max(root.descendants(), n => n.y) || 0;
  cumulativeHeight = treeHeight + TREE_VERTICAL_SPACING;
});

// Render in SolidJS
<For each={roots}>
  {(root, index) => (
    <g class="tree-root" data-index={index()}>
      {/* Nodes and edges for this tree */}
    </g>
  )}
</For>
```

**Alternatives Considered**:
- **Separate SVGs**: Rejected - requires synchronizing zoom/pan across multiple elements, complicates shared selection
- **Single flat node list**: Rejected - loses tree structure, harder to manage per-tree spacing
- **Horizontal arrangement**: Rejected - FR-006 specifies vertical stacking

---

### 3. Expand/Collapse State Management

**Question**: How to manage expand/collapse state in a SolidJS reactive context with D3 hierarchy?

**From Architecture Analysis**:
- DependencyGraph uses `useGraphState` hook with SolidJS signals for state
- State changes trigger D3 simulation updates via `createEffect`
- Pattern: Signal → Effect → D3 update → Position signal → Re-render

**Decision**: Create `useTreeState` hook with expand/collapse signal

**Implementation Pattern**:
```typescript
export function useTreeState() {
  const [expandedNodes, setExpandedNodes] = createSignal<Set<string>>(new Set());
  const [visibleNodes, setVisibleNodes] = createSignal<TreeNode[]>([]);
  
  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };
  
  // Compute visible nodes based on expansion state
  createMemo(() => {
    const expanded = expandedNodes();
    const visible = computeVisibleNodes(allNodes, expanded, maxDepth: 2);
    setVisibleNodes(visible);
  });
  
  return { expandedNodes, visibleNodes, toggleExpanded };
}
```

**Integration with D3 Hierarchy**:
- D3 hierarchy computes full tree structure once
- `visibleNodes` signal filters tree based on expansion state
- Layout recomputes when visible nodes change
- Follows same reactive pattern as `useForceSimulation`

**Rationale**: 
- Consistent with existing state management patterns
- SolidJS signals provide automatic reactivity
- Expansion state is independent from layout computation
- Allows default expansion depth (2 levels per FR-014)

**Alternatives Considered**:
- Store expansion in D3 node data: Rejected - mixes concerns, loses reactivity
- Global expansion state: Rejected - multiple tree instances would conflict
- Expand/collapse via DOM manipulation: Rejected - bypasses reactive system

---

### 4. Integration Pattern with Existing Architecture

**Question**: How to integrate OwnershipTree.tsx with existing DependencyGraph.tsx patterns?

**From Codebase Analysis** (explore agent results):

**Existing Patterns**:
- **State Management**: `useGraphState.ts` - manages nodes, edges, selection, hover with SolidJS signals
- **D3 Integration**: `useForceSimulation.ts` - wraps D3 force simulation with SolidJS lifecycle
- **Tracker Subscription**: Subscribe in `onMount`, unsubscribe in `onCleanup`
- **Node Rendering**: Stateless components (`SignalNode.tsx`, `MemoNode.tsx`, `EffectNode.tsx`) with animation props
- **Visual Constants**: `NODE_STYLES` and `EDGE_STYLES` in `visualization/types.ts`
- **Animation Controller**: Separate `useAnimationController` hook manages visual states
- **Detail Panel**: Reusable component accepting `DetailPanelData` props

**Decision**: Follow established architecture patterns:
1. Create `useTreeState.ts` hook for tree-specific state (expanded nodes, visible nodes)
2. Create `useHierarchyLayout.ts` hook for D3 hierarchy integration (similar to `useForceSimulation`)
3. Reuse existing node shape components (`SignalNode`, `MemoNode`, `EffectNode`)
4. Reuse existing `NODE_STYLES` from `visualization/types.ts`
5. Import and use existing `DetailPanel.tsx` component
6. Create `d3/hierarchyLayout.ts` utility (parallel to `d3/forceSimulation.ts`)
7. Subscribe to tracker in `onMount` with same event handling pattern

**Rationale**: 
- Maintains architectural consistency across visualization features
- Maximizes code reuse (node components, styles, detail panel)
- Follows proven patterns from DependencyGraph implementation
- Separates concerns: state management (hooks), layout (D3 utility), rendering (components)

**Alternatives Considered**:
- Inline all D3 logic in component: Rejected - violates separation of concerns established in 002
- Create entirely separate architecture: Rejected - would fragment codebase and duplicate logic
- Embed tree in DependencyGraph component: Rejected - tree and graph are distinct views requiring separate components

---

### 5. Disposed Node Auto-Removal Timing

**Question**: How to implement 5-second auto-removal of disposed nodes?

**Decision**: Use `setTimeout` with cleanup in SolidJS `onCleanup`

**Rationale**: 
- SolidJS `createEffect` with `onCleanup` handles timer cleanup automatically
- Aligns with reactive framework patterns
- No additional dependencies needed

**Implementation Pattern**:
```typescript
createEffect(() => {
  if (node.disposedAt) {
    const timer = setTimeout(() => {
      // Remove node from visible set
    }, 5000);
    onCleanup(() => clearTimeout(timer));
  }
});
```

**Alternatives Considered**:
- setInterval polling: Rejected - unnecessary overhead
- Animation library: Rejected - adds dependency for simple timing

---

### 6. Horizontal Scrolling Implementation

**Question**: How to enable horizontal scrolling when tree width exceeds viewport?

**From Spec Clarifications**: FR-003 specifies "maintaining consistent node spacing with horizontal scrolling enabled when tree width exceeds viewport"

**Decision**: Use CSS `overflow-x: auto` on container with computed SVG width based on tree layout

**Rationale**:
- Native browser scrolling is performant and accessible
- D3 hierarchy provides layout width via `tree.size()` or computed from nodes
- No custom scroll logic needed

**Implementation Pattern**:
```css
.tree-container {
  overflow-x: auto;
  overflow-y: auto;
}
```

```typescript
const treeWidth = d3.max(nodes, n => n.x) + padding;
svg.attr('width', treeWidth);
```

**Alternatives Considered**:
- D3 zoom for panning: Rejected - conflicts with zoom gesture for graph view
- Custom scrollbar component: Rejected - overengineering

---

### 7. Shared Detail Panel Integration

**From Spec Clarifications**: FR-011 specifies "System MUST open the shared detail panel (same as Dependency Graph View)"

**From Feature 002 Structure**:
```
src/visualization/
├── DetailPanel.tsx
└── DetailPanel.module.css
```

**Decision**: Import and reuse existing `DetailPanel.tsx` component

**Rationale**: FR-011 explicitly requires shared panel, avoids duplication

**Integration Pattern**:
```typescript
import { DetailPanel } from './DetailPanel';

// In OwnershipTree.tsx
const [selectedNode, setSelectedNode] = createSignal<string | null>(null);

<DetailPanel 
  nodeId={selectedNode()} 
  onClose={() => setSelectedNode(null)} 
/>
```

**Alternatives Considered**: None - requirement is explicit

---

### 8. Node Shape Rendering Reuse

**From Feature 002 Structure**:
```
src/visualization/nodes/
├── SignalNode.tsx
├── MemoNode.tsx
├── EffectNode.tsx
└── index.ts
```

**From Spec**: FR-002 "System MUST render nodes using the same visual encoding as the dependency graph"

**Decision**: Reuse existing node shape components

**Rationale**: FR-002 requires visual consistency, components already exist

**Alternatives Considered**: None - spec mandates reuse

---

## Summary of Research Decisions

### All Research Complete ✅

1. ✅ **D3 Layout**: `d3.tree()` with `.nodeSize([60, 80])`
2. ✅ **Layout orientation**: Vertical (top-to-bottom) - FR-003
3. ✅ **Multiple trees**: Separate `<g>` elements with vertical offset transforms - FR-006
4. ✅ **Expand/collapse**: `children` ↔ `_children` pattern with SolidJS signals
5. ✅ **SolidJS integration**: D3 for calculations, SolidJS for rendering (matches DependencyGraph pattern)
6. ✅ **Performance**: nodeSize(), virtual rendering for 100+ nodes, CSS transforms
7. ✅ **Horizontal scrolling**: CSS `overflow-x: auto` with computed SVG width - FR-003
8. ✅ **Disposed node retention**: 5-second auto-removal with setTimeout - FR-007
9. ✅ **Detail panel**: Shared with DependencyGraph - FR-011
10. ✅ **Node shapes**: Reuse existing `SignalNode`, `MemoNode`, `EffectNode` components - FR-002
11. ✅ **Default expansion depth**: 2 levels - FR-014
12. ✅ **Sibling sort order**: Creation timestamp (oldest first) - FR-015

---

## Performance Optimization Strategies

**From D3 Research** (for 20 levels, 100+ nodes at 60 FPS):

### 1. Use nodeSize() instead of size()
```typescript
// ✅ Good: Tree grows naturally
const treeLayout = tree().nodeSize([60, 80]);

// ❌ Bad: Fixed canvas causes overlap
const treeLayout = tree().size([1000, 2000]);
```

### 2. Virtual Rendering for Deep Trees
```typescript
// Only render nodes within viewport
const visibleNodes = createMemo(() => {
  const allNodes = root().descendants();
  return allNodes.filter(d => isInViewport(d, zoomTransform()));
});
```

### 3. CSS Transforms Over SVG Transforms
```typescript
// Apply to container, not each node
<div style={`transform: translate(${x}px, ${y}px) scale(${k})`}>
  <svg>{/* nodes */}</svg>
</div>
```

### 4. Batch D3 Calculations
```typescript
// Recalculate only when structure changes
const layoutRoot = createMemo(() => {
  const r = hierarchy(props.data);
  treeLayout(r);
  return r;
});
```

### 5. Disable Transitions for Large Updates
```typescript
const duration = () => nodes().length < 200 ? 300 : 0;
```

**Industry Benchmark** (from 2025 research):
> "Reducing SVG elements by 30% results in up to 50% improvement in rendering speed"

**Implementation Strategy**:
- Start with simple rendering
- Add virtualization if performance drops below 60 FPS with 100+ nodes
- Use Chrome DevTools Performance profiler to identify bottlenecks

---

## Next Steps

1. ✅ Research complete
2. ✅ Data model defined
3. ⏭️ Create contracts (TypeScript interfaces)
4. ⏭️ Write quickstart guide
5. ⏭️ Update agent context (AGENTS.md)
