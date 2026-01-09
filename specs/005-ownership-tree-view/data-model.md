# Data Model: Ownership Tree View

**Feature**: 005-ownership-tree-view  
**Date**: 2026-01-09

## Overview

This feature visualizes the ownership hierarchy of reactive nodes. It reuses existing data structures from the core instrumentation (001) and dependency graph (002) features, with additions for tree-specific state.

---

## Core Entities (Reused from 001-core-instrumentation)

### ReactiveNode

**Source**: `src/types/nodes.ts` (existing)

```typescript
interface ReactiveNode {
  id: string;
  type: 'signal' | 'memo' | 'effect' | 'renderEffect' | 'root' | 'component';
  name: string | null;
  
  // Current state
  value: unknown;
  isStale: boolean;
  isExecuting: boolean;
  executionCount: number;
  lastExecutedAt: number;
  
  // Graph relationships
  sources: string[];        // Dependency edges (not used for tree)
  observers: string[];      // Dependency edges (not used for tree)
  
  // Ownership relationships (USED FOR TREE)
  owner: string | null;     // Parent in ownership tree
  owned: string[];          // Children in ownership tree
  
  // Metadata
  createdAt: number;
  disposedAt: number | null;
  stackTrace?: string;
}
```

**Tree-Relevant Fields**:
- `owner`: Parent node ID in ownership hierarchy (null for roots)
- `owned`: Array of child node IDs
- `disposedAt`: Timestamp for disposal (triggers 5-second fade-out per FR-007)
- `createdAt`: Used for sibling sort order (FR-015)

---

## New Tree-Specific Entities

### TreeNode

**Purpose**: Augments ReactiveNode with D3 hierarchy layout information

```typescript
interface TreeNode extends d3.HierarchyPointNode<ReactiveNode> {
  // From d3.HierarchyPointNode:
  data: ReactiveNode;       // Original reactive node
  parent: TreeNode | null;  // D3 hierarchy parent
  children?: TreeNode[];    // D3 hierarchy children
  depth: number;            // Distance from root (0-indexed)
  height: number;           // Distance to deepest leaf
  x: number;                // Computed x position (horizontal in vertical tree)
  y: number;                // Computed y position (vertical depth)
  
  // Tree-specific metadata:
  id: string;               // Convenience: data.id
  isCollapsed: boolean;     // Local UI state (derived from expansion set)
  isVisible: boolean;       // Computed from ancestor expansion state
}
```

**Field Descriptions**:
- `x, y`: Positions computed by D3 tree layout (vertical orientation: x=horizontal, y=depth)
- `depth`: Level in tree (0 for roots, increases downward)
- `isCollapsed`: Whether this node's children are hidden
- `isVisible`: Whether this node should be rendered (all ancestors expanded)

---

### OwnershipEdge

**Purpose**: Represents parent-child ownership link for rendering

```typescript
interface OwnershipEdge {
  id: string;               // `${parent.id}->${child.id}`
  source: TreeNode;         // Parent node
  target: TreeNode;         // Child node
  type: 'ownership';        // Edge type (always ownership for this view)
}
```

**Rendering**: Used to draw connecting lines between parent and child nodes

---

### TreeState

**Purpose**: Manages tree-specific UI state in `useTreeState` hook

```typescript
interface TreeState {
  // Expansion state
  expandedNodes: Set<string>;           // IDs of nodes with visible children
  
  // Computed tree structure
  roots: TreeNode[];                    // Root nodes (owner === null)
  visibleNodes: TreeNode[];             // Nodes that should be rendered
  visibleEdges: OwnershipEdge[];        // Edges between visible nodes
  
  // Layout dimensions
  treeWidth: number;                    // Computed SVG width
  treeHeight: number;                   // Computed SVG height
  
  // Selection state (shared with DependencyGraph)
  selectedNodeId: string | null;        // Currently selected node
  hoveredNodeId: string | null;         // Currently hovered node
  
  // Disposal tracking
  disposingNodes: Map<string, number>;  // nodeId -> removal timestamp
}
```

**State Transitions**:
1. **Node Created**: Add to tree structure, auto-expand if depth ≤ 2 (FR-014)
2. **Node Disposed**: Add to `disposingNodes`, schedule removal after 5s (FR-007)
3. **Toggle Expand**: Add/remove from `expandedNodes`, recompute visible nodes
4. **Selection**: Update `selectedNodeId`, sync with DependencyGraph (FR-009)

---

## Data Flow

### 1. Tracker → Tree State

```
tracker.getNodes() → ReactiveNode[]
  ↓ Filter by ownership
  ↓ Build hierarchy (owner/owned relationships)
D3 hierarchy() → HierarchyNode<ReactiveNode>
  ↓ Apply tree layout
D3 tree() → TreeNode[] (with x,y positions)
  ↓ Filter by expansion state
visibleNodes → TreeNode[] (displayed on screen)
```

### 2. Tracker Events → Tree Updates

```
tracker.subscribe(event)
  ↓
Event Type:
  - "signal-create", "computation-create"
    → addNode() → rebuild tree → recompute layout
  
  - "computation-dispose"
    → markDisposing() → start 5s timer → removeNode()
  
  - (ownership changes - not emitted by current tracker)
    → rebuildTree() → recompute layout
```

### 3. User Interaction → State Updates

```
Click expand/collapse icon
  ↓
toggleExpanded(nodeId)
  ↓
expandedNodes.add() or .delete()
  ↓
recomputeVisibleNodes() (filter tree by expansion)
  ↓
Re-render with new visibleNodes
```

---

## D3 Hierarchy Structure

### Hierarchy Creation

```typescript
// 1. Get all nodes from tracker
const allNodes = Array.from(tracker.getNodes().values());

// 2. Filter to root nodes (owner === null)
const rootNodes = allNodes.filter(node => node.owner === null);

// 3. Build hierarchy for each root
const trees = rootNodes.map(root => {
  return d3.hierarchy(root, (node: ReactiveNode) => {
    // Children are nodes in 'owned' array
    return node.owned
      .map(childId => tracker.getNode(childId))
      .filter(Boolean)
      .sort((a, b) => a.createdAt - b.createdAt);  // FR-015: Sort by timestamp
  });
});

// 4. Apply tree layout to each tree
const treeLayout = d3.tree<ReactiveNode>()
  .nodeSize([60, 80])  // [dx, dy] spacing
  .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));

const layoutTrees = trees.map(tree => {
  treeLayout(tree);
  return tree;
});
```

### Multiple Trees Arrangement (FR-006)

```typescript
// Stack trees vertically with spacing
let cumulativeHeight = 0;
const TREE_VERTICAL_SPACING = 100;

layoutTrees.forEach((tree, index) => {
  // Offset each tree's y-coordinates
  tree.descendants().forEach(node => {
    node.y += cumulativeHeight;
  });
  
  const treeHeight = d3.max(tree.descendants(), n => n.y) || 0;
  cumulativeHeight = treeHeight + TREE_VERTICAL_SPACING;
});
```

---

## Expansion State Management

### Default Expansion (FR-014)

```typescript
function getDefaultExpandedNodes(roots: TreeNode[]): Set<string> {
  const expanded = new Set<string>();
  
  roots.forEach(root => {
    root.descendants().forEach(node => {
      // Expand nodes at depth 0 and 1 (shows 2 levels)
      if (node.depth < 2) {
        expanded.add(node.data.id);
      }
    });
  });
  
  return expanded;
}
```

### Visible Nodes Computation

```typescript
function computeVisibleNodes(
  roots: TreeNode[],
  expandedNodes: Set<string>
): TreeNode[] {
  const visible: TreeNode[] = [];
  
  function traverse(node: TreeNode, ancestorsExpanded: boolean) {
    // Node is visible if all ancestors are expanded
    const isVisible = ancestorsExpanded;
    
    if (isVisible) {
      visible.push(node);
    }
    
    // Traverse children if this node is expanded
    const isExpanded = expandedNodes.has(node.data.id);
    if (node.children && isExpanded) {
      node.children.forEach(child => traverse(child, isVisible));
    }
  }
  
  roots.forEach(root => traverse(root, true));
  return visible;
}
```

---

## Disposal Lifecycle (FR-007)

### State Transitions

```
Node Active (disposedAt === null)
  ↓ tracker emits "computation-dispose"
Node Disposed (disposedAt = timestamp)
  ↓ Styled with gray filter + "Disposed" label
  ↓ Start 5-second timer
  ↓ (5 seconds elapse)
Node Removed from tree
```

### Implementation

```typescript
createEffect(() => {
  const node = props.node;
  
  if (node.data.disposedAt !== null) {
    const timer = setTimeout(() => {
      // Remove node from tree state
      removeNodeFromTree(node.data.id);
    }, 5000);
    
    onCleanup(() => clearTimeout(timer));
  }
});
```

---

## Layout Dimensions

### Size Calculation

```typescript
interface LayoutDimensions {
  nodeWidth: number;    // 60px (includes padding)
  nodeHeight: number;   // 80px (vertical spacing between levels)
  minTreeWidth: number; // Minimum viewport width
  treeHeight: number;   // Total height (all trees stacked)
}

function computeLayoutDimensions(
  roots: TreeNode[]
): LayoutDimensions {
  // Width: max x-coordinate across all trees + padding
  const maxX = d3.max(
    roots.flatMap(tree => tree.descendants()),
    node => node.x
  ) || 0;
  
  const treeWidth = Math.max(maxX + 100, MIN_VIEWPORT_WIDTH);
  
  // Height: max y-coordinate + padding
  const maxY = d3.max(
    roots.flatMap(tree => tree.descendants()),
    node => node.y
  ) || 0;
  
  const treeHeight = maxY + 100;
  
  return {
    nodeWidth: 60,
    nodeHeight: 80,
    minTreeWidth: MIN_VIEWPORT_WIDTH,
    treeWidth,
    treeHeight,
  };
}
```

---

## Integration with Existing Systems

### Shared with DependencyGraph (002)

- **ReactiveNode**: Same data structure from instrumentation layer
- **NODE_STYLES**: Reuse color/shape constants from `visualization/types.ts`
- **DetailPanel**: Shared component (FR-011)
- **Selection State**: Synchronized via shared signal or context

### Shared with Animation System (003)

- **Visual States**: Node components accept animation props (pulse, executing, stale)
- **Disposal Animation**: Reuse disposal visual effects (grayscale, fade, shrink)

---

## Performance Considerations

### Scaling (SC-002, SC-004)

**Target**: 20 levels deep, 100+ nodes, 60 FPS

**Optimizations**:
1. **Virtualization**: Only render visible nodes (filtered by expansion)
2. **Memoization**: Cache tree layout until structure changes
3. **Batch Updates**: Debounce rapid tracker events
4. **Efficient Lookups**: Use `Map<string, TreeNode>` for O(1) node access

### Memory Management

- Remove disposed nodes after 5s to prevent memory leaks
- Unsubscribe from tracker on component cleanup
- Clear timers on unmount

---

## Summary

### New Data Structures
- `TreeNode`: Augments ReactiveNode with D3 hierarchy + layout
- `OwnershipEdge`: Parent-child links for rendering
- `TreeState`: Expansion, visibility, disposal tracking

### Reused Data Structures
- `ReactiveNode`: Core entity from instrumentation layer
- `NODE_STYLES`: Visual encoding constants
- `DetailPanelData`: Structure for detail panel

### Key Algorithms
- D3 hierarchy construction from owner/owned relationships
- Tree layout with vertical stacking for multiple roots
- Visibility computation from expansion state
- 5-second disposal timer with automatic cleanup
