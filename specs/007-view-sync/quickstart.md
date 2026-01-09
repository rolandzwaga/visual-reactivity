# Quickstart Guide: View Synchronization and Cross-View Selection

**Feature**: 007-view-sync  
**For**: Developers implementing or extending selection synchronization

---

## Overview

This guide demonstrates how to use the selection store to enable cross-view selection synchronization. After following this guide, clicking a node in any view will highlight it in all other views.

---

## Basic Usage

### 1. Create Selection Store (App Level)

```typescript
// src/App.tsx
import { createSelectionStore } from './stores/selectionStore';
import type { SelectionStore } from './stores/selectionStore';

function App() {
  const selection = createSelectionStore();
  
  return (
    <>
      <DependencyGraph selection={selection} />
      <OwnershipTree selection={selection} />
      <TimelineView selection={selection} />
      <LiveValuesPanel selection={selection} />
    </>
  );
}
```

### 2. Integrate Into View (Component Level)

```typescript
// src/visualization/DependencyGraph.tsx
import { useSelectionSync } from './hooks/useSelectionSync';
import type { SelectionStore } from '../stores/selectionStore';

interface DependencyGraphProps {
  selection: SelectionStore;
}

export function DependencyGraph(props: DependencyGraphProps) {
  const sync = useSelectionSync('graph', props.selection);
  
  return (
    <g>
      {nodes().map(node => (
        <circle
          r={10}
          onClick={(e) => sync.handleNodeClick(node.id, e)}
          stroke-width={sync.isNodeSelected(node.id) ? 3 : 1}
        />
      ))}
    </g>
  );
}
```

### 3. Add Keyboard Navigation (Optional)

```typescript
import { useKeyboardNav } from './hooks/useKeyboardNav';

export function DependencyGraph(props: DependencyGraphProps) {
  const sync = useSelectionSync('graph', props.selection);
  const keyboard = useKeyboardNav('graph', props.selection);
  
  return (
    <svg 
      onKeyDown={keyboard.handleKeyDown}
      tabindex={0}
    >
      {/* nodes */}
    </svg>
  );
}
```

---

## Common Patterns

### Pattern 1: Single Selection (Replace Existing)

```typescript
// Click handler without modifier key
function handleNodeClick(nodeId: string, event: MouseEvent) {
  const multiSelect = event.ctrlKey || event.metaKey;
  props.selection.selectNode(nodeId, multiSelect, 'graph');
}

// Simplified with useSelectionSync hook
const sync = useSelectionSync('graph', props.selection);
<circle onClick={(e) => sync.handleNodeClick(node.id, e)} />
```

### Pattern 2: Multi-Selection (Add to Existing)

```typescript
// Ctrl+click to add to selection
function handleNodeClick(nodeId: string, event: MouseEvent) {
  if (event.ctrlKey || event.metaKey) {
    props.selection.toggleNodeSelection(nodeId, 'graph');
  } else {
    props.selection.selectNode(nodeId, false, 'graph');
  }
}
```

### Pattern 3: Select All

```typescript
// Select all nodes in current view
function handleSelectAll() {
  const allNodeIds = nodes().map(n => n.id);
  props.selection.setSelection(new Set(allNodeIds), 'graph');
}
```

### Pattern 4: Clear Selection (Escape Key)

```typescript
// Clear all selections
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    props.selection.clearSelection('graph');
  }
}
```

### Pattern 5: Hover Preview

```typescript
// Show hover state without selecting
function handleMouseEnter(nodeId: string) {
  props.selection.setHoveredNode(nodeId, 'graph');
}

function handleMouseLeave() {
  props.selection.setHoveredNode(null, 'graph');
}
```

### Pattern 6: Reactive Highlighting

```typescript
// Update highlighting when selection changes
import { createEffect } from 'solid-js';

createEffect(() => {
  const selectedIds = props.selection.selectedNodeIds();
  
  // Apply highlighting to D3 visualization
  d3.selectAll('.node')
    .classed('selected', (d) => selectedIds.has(d.id))
    .attr('stroke-width', (d) => selectedIds.has(d.id) ? 3 : 1);
});
```

---

## Advanced Usage

### Subscribing to Selection Events

```typescript
import { onMount, onCleanup } from 'solid-js';

onMount(() => {
  const unsubscribe = props.selection.subscribe('graph-view', (event) => {
    console.log('Selection changed:', event.type);
    console.log('Added:', event.addedNodeIds);
    console.log('Removed:', event.removedNodeIds);
    console.log('Total selected:', event.currentSelection.size);
    
    // Perform custom actions based on event
    if (event.type === 'selection-clear') {
      resetZoom();
    }
  });
  
  onCleanup(() => unsubscribe());
});
```

### Keyboard Navigation

```typescript
import { useKeyboardNav } from './hooks/useKeyboardNav';

export function DependencyGraph(props: DependencyGraphProps) {
  const keyboard = useKeyboardNav('graph', props.selection);
  
  // Arrow Right: Navigate to observer (downstream)
  // Arrow Left: Navigate to source (upstream)
  // Escape: Clear selection
  
  return (
    <svg onKeyDown={keyboard.handleKeyDown} tabindex={0}>
      {/* visualization */}
    </svg>
  );
}
```

### Custom Navigation Logic

```typescript
// Manually navigate to next observer
function navigateToNextObserver() {
  const currentIds = Array.from(props.selection.selectedNodeIds());
  if (currentIds.length === 0) return;
  
  const currentId = currentIds[0];
  const nextId = props.selection.navigateToNextObserver(currentId);
  
  if (nextId) {
    props.selection.selectNode(nextId, false, 'graph');
  }
}
```

### Scroll-to-Selected (DOM)

```typescript
// For DOM elements (e.g., values panel list)
import { createEffect } from 'solid-js';

createEffect(() => {
  const selectedIds = props.selection.selectedNodeIds();
  if (selectedIds.size === 0) return;
  
  const firstSelectedId = Array.from(selectedIds)[0];
  const element = document.getElementById(firstSelectedId);
  
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
});
```

### Scroll-to-Selected (SVG with D3 Zoom)

```typescript
// For SVG views with D3 zoom behavior
import { createEffect } from 'solid-js';
import * as d3 from 'd3';

createEffect(() => {
  const selectedIds = props.selection.selectedNodeIds();
  if (selectedIds.size === 0) return;
  
  const firstSelectedId = Array.from(selectedIds)[0];
  const nodeElement = d3.select(`[data-node-id="${firstSelectedId}"]`).node();
  
  if (nodeElement) {
    const bbox = nodeElement.getBBox();
    const svg = d3.select('svg');
    const svgRect = svg.node().getBoundingClientRect();
    
    // Calculate center of node
    const nodeCenterX = bbox.x + bbox.width / 2;
    const nodeCenterY = bbox.y + bbox.height / 2;
    
    // Create transform to center node
    const targetScale = 1.5;
    const targetX = (svgRect.width / 2 - nodeCenterX * targetScale);
    const targetY = (svgRect.height / 2 - nodeCenterY * targetScale);
    
    const newTransform = d3.zoomIdentity
      .translate(targetX, targetY)
      .scale(targetScale);
    
    // Apply with 300ms smooth transition
    svg.transition()
      .duration(300)
      .ease(d3.easeCubicOut)
      .call(zoomBehavior.transform, newTransform);
  }
});
```

---

## Testing

### Unit Test: Selection Store

```typescript
import { describe, test, expect } from 'vitest';
import { testInRoot } from '../helpers';
import { createSelectionStore } from './selectionStore';

describe('SelectionStore', () => {
  test('single selection replaces existing', () => {
    testInRoot(() => {
      const store = createSelectionStore();
      
      store.selectNode('node-1', false);
      expect(store.selectedNodeIds().has('node-1')).toBe(true);
      
      store.selectNode('node-2', false);
      expect(store.selectedNodeIds().has('node-1')).toBe(false);
      expect(store.selectedNodeIds().has('node-2')).toBe(true);
    });
  });
  
  test('multi-selection adds to existing', () => {
    testInRoot(() => {
      const store = createSelectionStore();
      
      store.selectNode('node-1', false);
      store.selectNode('node-2', true);  // multiSelect = true
      
      expect(store.selectedNodeIds().size).toBe(2);
      expect(store.selectedNodeIds().has('node-1')).toBe(true);
      expect(store.selectedNodeIds().has('node-2')).toBe(true);
    });
  });
});
```

### Component Test: Click Handling

```typescript
import { render, fireEvent } from '@solidjs/testing-library';
import { createSelectionStore } from '../stores/selectionStore';

test('clicking node selects it', () => {
  const selection = createSelectionStore();
  const { getByTestId } = render(() => (
    <DependencyGraph selection={selection} />
  ));
  
  const node = getByTestId('node-signal-1');
  fireEvent.click(node);
  
  expect(selection.isNodeSelected('signal-1')).toBe(true);
});
```

---

## Troubleshooting

### Selection Not Updating Across Views

**Problem**: Clicking node in graph doesn't highlight in tree.

**Solution**: Ensure all views receive the same selection store instance from App.

```typescript
// WRONG: Creating separate stores
function DependencyGraph() {
  const selection = createSelectionStore();  // Isolated store
}

// CORRECT: Receiving shared store via props
function DependencyGraph(props: { selection: SelectionStore }) {
  const sync = useSelectionSync('graph', props.selection);
}
```

### Highlighting Not Reactive

**Problem**: Selection changes but highlighting doesn't update.

**Solution**: Use reactive effects and signals, not one-time reads.

```typescript
// WRONG: One-time read
const selectedIds = props.selection.selectedNodeIds();  // Not reactive

// CORRECT: Reactive access inside effect
createEffect(() => {
  const selectedIds = props.selection.selectedNodeIds();  // Reactive
  updateHighlighting(selectedIds);
});
```

### Performance Issues with Many Selected Nodes

**Problem**: Selecting 100+ nodes causes UI lag.

**Solution**: Use batching and createMemo for derived state.

```typescript
// Batch selection updates
const nodeIds = getAllNodeIds();
props.selection.setSelection(new Set(nodeIds));  // Single update

// Use createMemo for expensive filtering
const selectedNodes = createMemo(() => {
  const ids = props.selection.selectedNodeIds();
  return nodes().filter(n => ids.has(n.id));  // Cached until selection changes
});
```

---

## Next Steps

- Read [data-model.md](./data-model.md) for complete entity definitions
- Read [contracts/selection-store.ts](./contracts/selection-store.ts) for full API reference
- Run `/speckit.tasks` to generate implementation tasks
- Follow test-first development (RED → GREEN → REFACTOR)

---

**Document Status**: ✅ COMPLETE  
**Last Updated**: 2026-01-09
