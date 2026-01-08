# Data Model: Core Instrumentation Layer

**Date**: 2026-01-08  
**Feature**: 001-core-instrumentation

## Entities

### ReactiveNode

Represents a signal, memo, or effect in the reactive graph.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | string | Unique identifier | Required, format: `{type}-{counter}` |
| type | NodeType | Kind of reactive primitive | Required, enum |
| name | string \| null | Optional human-readable name | Provided by user |
| value | unknown | Current value (signals/memos only) | undefined for effects |
| isStale | boolean | Marked dirty but not re-evaluated | Default: false |
| isExecuting | boolean | Currently running | Default: false |
| executionCount | number | Times this node has executed | Default: 0 (signals: 0) |
| createdAt | number | Creation timestamp (ms) | Required |
| lastExecutedAt | number \| null | Last execution timestamp | null if never executed |
| disposedAt | number \| null | Disposal timestamp | null if active |
| sources | string[] | IDs of upstream dependencies | Empty array initially |
| observers | string[] | IDs of downstream dependents | Empty array initially |
| owner | string \| null | Parent in ownership tree | null if root-level |
| owned | string[] | Children in ownership tree | Empty array initially |

### NodeType (Enum)

```
'signal' | 'memo' | 'effect' | 'root'
```

- **signal**: Created via `createTrackedSignal`
- **memo**: Created via `createTrackedMemo`
- **effect**: Created via `createTrackedEffect`
- **root**: Synthetic root for ownership tree (optional, for visualization)

### ReactiveEdge

Represents a relationship between two nodes.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | string | Unique identifier | Required, format: `{type}-{source}-{target}` |
| type | EdgeType | Kind of relationship | Required, enum |
| source | string | Source node ID | Required, must exist in registry |
| target | string | Target node ID | Required, must exist in registry |
| lastTriggeredAt | number \| null | Last propagation timestamp | Dependency edges only |
| triggerCount | number | Times this edge propagated | Default: 0 |

### EdgeType (Enum)

```
'dependency' | 'ownership'
```

- **dependency**: Data flow edge (target depends on source, source is upstream)
- **ownership**: Disposal hierarchy (source owns target, target disposed with source)

### ReactivityEvent

Represents a single occurrence in the reactive system.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | string | Unique event identifier | Required, auto-generated |
| type | EventType | Kind of event | Required, enum |
| timestamp | number | When event occurred (ms) | Required |
| nodeId | string | Associated node ID | Required |
| data | EventData | Event-specific payload | Varies by type |

### EventType (Enum)

```
'signal-create' | 'signal-read' | 'signal-write' |
'computation-create' | 'computation-execute-start' | 'computation-execute-end' | 'computation-dispose' |
'subscription-add' | 'subscription-remove'
```

### EventData (Union by EventType)

| EventType | Data Fields |
|-----------|-------------|
| signal-create | `{ value: unknown }` |
| signal-read | `{ value: unknown }` |
| signal-write | `{ previousValue: unknown, newValue: unknown }` |
| computation-create | `{ computationType: 'memo' \| 'effect' }` |
| computation-execute-start | `{}` |
| computation-execute-end | `{ durationMs: number }` |
| computation-dispose | `{}` |
| subscription-add | `{ sourceId: string }` |
| subscription-remove | `{ sourceId: string }` |

## Relationships

```
┌─────────────┐     dependency      ┌─────────────┐
│   Signal    │◄────────────────────│    Memo     │
│  (source)   │                     │  (target)   │
└─────────────┘                     └─────────────┘
       ▲                                   │
       │         dependency                │
       └───────────────────────────────────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │   Effect    │
                                    │  (target)   │
                                    └─────────────┘

Ownership (disposal hierarchy):
┌─────────────┐
│    Root     │──owns──►┌─────────────┐
│   Effect    │         │ Child Memo  │
└─────────────┘         └─────────────┘
```

## State Transitions

### Node Lifecycle

```
Created → Active ─┬─► Executing → Active
                  │
                  └─► Stale → Executing → Active
                  │
                  └─► Disposed (terminal)
```

### Edge Lifecycle

```
Created → Active ─┬─► Triggered → Active
                  │
                  └─► Removed (when dependency changes)
```

## Invariants

1. **No orphan edges**: Edge source and target must exist in node registry
2. **No duplicate edges**: At most one edge per (type, source, target) tuple
3. **Consistent bidirectional references**: If A has B in observers, B must have A in sources
4. **Disposal cascades**: When node disposed, all owned children must be disposed
5. **ID uniqueness**: All node IDs unique, all edge IDs unique, all event IDs unique
