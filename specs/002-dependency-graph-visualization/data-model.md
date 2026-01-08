# Data Model: Dependency Graph Visualization

**Feature**: 002-dependency-graph-visualization  
**Date**: 2026-01-08

## Entities

### GraphNode

Visual representation of a ReactiveNode for the force simulation.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (from ReactiveNode) |
| type | 'signal' \| 'memo' \| 'effect' | Node type |
| name | string \| null | Display name |
| x | number | Current x position (managed by simulation) |
| y | number | Current y position (managed by simulation) |
| vx | number | Velocity x (managed by simulation) |
| vy | number | Velocity y (managed by simulation) |
| fx | number \| null | Fixed x position (for dragging) |
| fy | number \| null | Fixed y position (for dragging) |
| data | ReactiveNode | Reference to underlying tracker node |

### GraphEdge

Visual representation of a ReactiveEdge for the force simulation.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (from ReactiveEdge) |
| source | GraphNode \| string | Source node (D3 resolves to object) |
| target | GraphNode \| string | Target node (D3 resolves to object) |
| type | 'dependency' \| 'ownership' | Edge type |

### GraphState

Container for all graph visualization state.

| Field | Type | Description |
|-------|------|-------------|
| nodes | GraphNode[] | All nodes in the graph |
| edges | GraphEdge[] | All edges in the graph |
| selectedNodeId | string \| null | Currently selected node |
| hoveredNodeId | string \| null | Currently hovered node |
| transform | ZoomTransform | Current zoom/pan transform |

### DetailPanelData

Data displayed in the node detail panel.

| Field | Type | Description |
|-------|------|-------------|
| node | ReactiveNode | The selected node's data |
| sources | ReactiveNode[] | Upstream dependencies |
| observers | ReactiveNode[] | Downstream dependents |
| isVisible | boolean | Panel visibility |

## State Transitions

### Node Lifecycle

```
[created] → GraphNode added to nodes array
                ↓
[simulation] → x, y updated on each tick
                ↓
[dragged] → fx, fy set to fixed position
                ↓
[released] → fx, fy cleared, simulation resumes
                ↓
[disposed] → GraphNode removed from nodes array
```

### Selection State

```
[none] → selectedNodeId = null
   ↓ click node
[selected] → selectedNodeId = node.id, detail panel visible
   ↓ click elsewhere / press Escape
[none] → selectedNodeId = null, detail panel hidden
```

### Hover State

```
[none] → hoveredNodeId = null
   ↓ mouse enter node
[hovered] → hoveredNodeId = node.id, node + edges highlighted
   ↓ mouse leave node
[none] → hoveredNodeId = null, highlight removed
```

## Relationships

```
┌─────────────┐        ┌─────────────┐
│ ReactiveNode│◄───────│  GraphNode  │
│  (tracker)  │  data  │ (d3-force)  │
└─────────────┘        └──────┬──────┘
                              │
                              │ source/target
                              ▼
┌─────────────┐        ┌─────────────┐
│ ReactiveEdge│◄───────│  GraphEdge  │
│  (tracker)  │  ref   │ (d3-force)  │
└─────────────┘        └─────────────┘
```

## Validation Rules

1. **Node ID uniqueness**: Each GraphNode.id must be unique within nodes array
2. **Edge references**: GraphEdge.source and GraphEdge.target must reference existing GraphNode.id values
3. **Position bounds**: x, y should remain within viewable SVG bounds (soft constraint, zoom handles overflow)
4. **Single selection**: Only one node can be selected at a time
5. **Single hover**: Only one node can be hovered at a time

## Synchronization with Tracker

The graph state synchronizes with tracker via event subscription:

| Tracker Event | Graph Action |
|---------------|--------------|
| signal-create | Add new GraphNode (type: signal) |
| computation-create | Add new GraphNode (type: memo/effect) |
| computation-dispose | Remove GraphNode and connected GraphEdges |
| subscription-add | Add new GraphEdge |
| subscription-remove | Remove GraphEdge |

### Initial Load

On component mount:
1. Query `tracker.getNodes()` → create GraphNode for each
2. Query `tracker.getEdges()` → create GraphEdge for each
3. Initialize force simulation with nodes and edges
4. Subscribe to tracker events for updates
