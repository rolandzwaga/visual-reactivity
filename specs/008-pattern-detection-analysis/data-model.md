# Data Model: Pattern Detection & Reactivity Analysis

## Overview

This document defines the core data entities for the pattern detection system. All entities use immutable data structures with TypeScript strict mode enabled.

---

## Entity: Pattern

Represents a detected reactivity anti-pattern instance.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `string` | Required, unique, format: `{type}-{timestamp}-{hash}` | Unique identifier for pattern instance |
| `type` | `PatternType` | Required, enum value | Type of anti-pattern detected |
| `severity` | `'low' \| 'medium' \| 'high'` | Required | Impact level of the pattern |
| `affectedNodeIds` | `string[]` | Required, min length: 1 | Array of ReactiveNode IDs involved in pattern |
| `timestamp` | `number` | Required, positive integer | Unix timestamp (ms) when pattern was detected |
| `description` | `string` | Required, max length: 200 chars | Human-readable description of the issue |
| `remediation` | `string` | Required, max length: 300 chars | Suggested fix or mitigation |
| `metadata` | `Record<string, unknown>` | Optional | Pattern-specific diagnostic data |
| `isExpected` | `boolean` | Required, default: false | Whether user marked pattern as intentional |

### PatternType Enum

```typescript
type PatternType =
  | 'orphaned-effect'
  | 'deep-chain'
  | 'diamond-pattern'
  | 'hot-path'
  | 'high-subscriptions'
  | 'stale-memo';
```

### Severity Rules

| Pattern Type | Default Severity | Escalation Condition |
|--------------|------------------|----------------------|
| `orphaned-effect` | `high` | Always high (memory leak risk) |
| `deep-chain` | `medium` | `high` if depth > 8 levels |
| `diamond-pattern` | `low` | `medium` if convergence node has >3 input paths |
| `hot-path` | `medium` | `high` if update rate > 50/sec |
| `high-subscriptions` | `low` | `medium` if count > 100, `high` if > 200 |
| `stale-memo` | `low` | `medium` if stale for >10 seconds |

### Metadata Structure by Pattern Type

**orphaned-effect**:
```typescript
{ 
  effectId: string;
  createdAt: number;
  lastRunAt: number;
}
```

**deep-chain**:
```typescript
{ 
  depth: number;
  chainPath: string[]; // Node IDs from root to leaf
}
```

**diamond-pattern**:
```typescript
{ 
  convergenceNodeId: string;
  inputPaths: string[][]; // Array of paths leading to convergence
  pathCount: number;
}
```

**hot-path**:
```typescript
{ 
  updateCount: number;
  windowDuration: number; // milliseconds (default 1000)
  updatesPerSecond: number;
}
```

**high-subscriptions**:
```typescript
{ 
  subscriberCount: number;
  subscriberIds: string[];
}
```

**stale-memo**:
```typescript
{ 
  staleSince: number; // timestamp
  lastComputedAt: number;
  observerCount: number;
}
```

### Relationships

- **Pattern → ReactiveNode**: Many-to-many via `affectedNodeIds`
- **Pattern → PatternException**: One-to-one (optional) via pattern `id`

### State Transitions

```
[Detected] → [Active] → [Resolved]
              ↓
         [Expected] (terminal state, isExpected = true)
```

- **Detected**: Pattern first identified, added to store
- **Active**: Pattern persists across analysis cycles
- **Resolved**: Pattern no longer detected, removed from store
- **Expected**: User marked as intentional, remains in store but visually de-emphasized

### Validation Rules

1. `affectedNodeIds` must reference existing ReactiveNode IDs in tracker
2. `timestamp` must not be in the future
3. `description` and `remediation` must not be empty strings
4. `metadata` must match expected structure for `type` (enforced via discriminated union)
5. `id` format: `{type}-{timestamp}-{first8CharsOfHash}` where hash is SHA-256 of `affectedNodeIds.join(',')`

---

## Entity: PatternThreshold

Configures detection sensitivity for each pattern type.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `patternType` | `PatternType` | Required, unique per configuration | Pattern this threshold applies to |
| `thresholdValue` | `number` | Required, positive integer | Numeric threshold for detection trigger |
| `enabled` | `boolean` | Required, default: true | Whether detection is active |

### Default Threshold Values

| Pattern Type | Threshold | Unit | Description |
|--------------|-----------|------|-------------|
| `orphaned-effect` | N/A | N/A | Boolean check (no threshold) |
| `deep-chain` | 5 | levels | Maximum acceptable dependency depth |
| `diamond-pattern` | 2 | paths | Minimum convergent paths to trigger |
| `hot-path` | 10 | updates/sec | Update rate threshold |
| `high-subscriptions` | 50 | count | Observer count threshold |
| `stale-memo` | 0 | observers | Trigger when observer count equals this |

### Relationships

- **PatternThreshold → PatternType**: One-to-one (each type has one threshold config)

### State Transitions

```
[Default] ⇄ [Customized]
   ↓           ↓
[Enabled] ⇄ [Disabled]
```

### Validation Rules

1. `thresholdValue` must be non-negative
2. `thresholdValue` must be integer (no fractional values)
3. Cannot delete threshold (only disable via `enabled = false`)
4. `orphaned-effect` and `stale-memo` ignore `thresholdValue` (boolean checks)

---

## Entity: PatternException

Records user-acknowledged expected patterns (intentional anti-patterns).

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `string` | Required, unique | Auto-generated UUID |
| `patternId` | `string` | Required, foreign key to Pattern | ID of pattern being excepted |
| `reason` | `string` | Optional, max length: 500 chars | User's explanation for exception |
| `createdAt` | `number` | Required, positive integer | Unix timestamp when exception created |
| `expiresAt` | `number \| null` | Optional, must be > createdAt | Expiry timestamp (null = never expires) |

### Relationships

- **PatternException → Pattern**: One-to-one (each exception targets one pattern)

### State Transitions

```
[Active] → [Expired] (auto-transition when expiresAt < Date.now())
   ↓
[Deleted] (user removes exception)
```

### Validation Rules

1. `patternId` must reference existing Pattern
2. `expiresAt` must be greater than `createdAt` if set
3. Cannot create multiple exceptions for same `patternId` (upsert operation)
4. When exception expires, pattern reverts to `isExpected = false`

---

## Entity: MetricsSummary

Aggregated statistics for pattern detection dashboard.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `totalPatterns` | `number` | Required, non-negative | Total active patterns detected |
| `byType` | `Record<PatternType, number>` | Required | Count of patterns per type |
| `bySeverity` | `Record<'low' \| 'medium' \| 'high', number>` | Required | Count by severity level |
| `mostProblematicNodes` | `Array<{ nodeId: string; patternCount: number }>` | Required, max length: 5 | Top 5 nodes by pattern involvement |
| `lastAnalysisAt` | `number` | Required | Timestamp of last analysis run |
| `analysisStatus` | `'idle' \| 'analyzing' \| 'success' \| 'error'` | Required | Current analysis state |
| `errorMessage` | `string \| null` | Optional | Error details if status = 'error' |

### Relationships

- **MetricsSummary → Pattern**: One-to-many (aggregates from all patterns)
- **MetricsSummary → ReactiveNode**: Many-to-many (via `mostProblematicNodes`)

### State Transitions

```
[idle] → [analyzing] → [success]
                    ↘ [error] → [idle] (after 5 seconds)
```

### Validation Rules

1. `totalPatterns` must equal sum of `byType` values
2. `totalPatterns` must equal sum of `bySeverity` values
3. `mostProblematicNodes` must be sorted descending by `patternCount`
4. `mostProblematicNodes[].nodeId` must reference existing ReactiveNode IDs
5. `errorMessage` must be null when `analysisStatus !== 'error'`
6. `lastAnalysisAt` must not be in the future

---

## Computed Properties

### Pattern

```typescript
// Computed severity badge color
getSeverityColor(severity: Pattern['severity']): string {
  return {
    low: '#fbbf24',    // amber-400
    medium: '#fb923c', // orange-400
    high: '#ef4444'    // red-500
  }[severity];
}

// Check if pattern should be visible
isVisible(pattern: Pattern, showExpected: boolean): boolean {
  return showExpected || !pattern.isExpected;
}

// Get human-readable age
getAge(pattern: Pattern): string {
  const ageMs = Date.now() - pattern.timestamp;
  // Returns: "just now" | "5s ago" | "2m ago" | "1h ago"
}
```

### MetricsSummary

```typescript
// Get severity distribution percentage
getSeverityPercentage(severity: 'low' | 'medium' | 'high'): number {
  return (bySeverity[severity] / totalPatterns) * 100;
}

// Check if analysis is stale (>5 seconds old)
isStale(summary: MetricsSummary): boolean {
  return Date.now() - summary.lastAnalysisAt > 5000;
}
```

---

## Storage Schema (localStorage)

### Key: `visual-reactivity:pattern-exceptions`

```typescript
interface StoredExceptions {
  version: 1;
  exceptions: PatternException[];
  lastUpdated: number;
}
```

### Key: `visual-reactivity:pattern-thresholds`

```typescript
interface StoredThresholds {
  version: 1;
  thresholds: PatternThreshold[];
  lastUpdated: number;
}
```

### Versioning Strategy

- Increment `version` on schema changes
- On load, check version and migrate/discard incompatible data
- Default to built-in values if storage corrupted

---

## Indexing Strategy (In-Memory)

For performance, maintain these indices in PatternStore:

```typescript
{
  byId: Map<string, Pattern>;              // O(1) lookup by pattern ID
  byType: Map<PatternType, Set<string>>;   // O(1) patterns of given type
  byNode: Map<string, Set<string>>;        // O(1) patterns affecting node
  bySeverity: Map<Severity, Set<string>>;  // O(1) patterns by severity
}
```

Update indices atomically on pattern add/remove/update.

---

## Migration Path

### From v0 (no data) → v1 (initial)

- Initialize with default `PatternThreshold` values
- Empty `PatternException[]`
- MetricsSummary with all zeros

### Future v1 → v2 (example)

If adding new pattern type:
1. Add to `PatternType` enum
2. Add default `PatternThreshold` entry
3. Initialize `byType[newType] = 0` in MetricsSummary

---

## Invariants (CRITICAL)

These MUST hold at all times:

1. **Referential Integrity**: All `affectedNodeIds` exist in ReactivityTracker
2. **Temporal Consistency**: `timestamp` ≤ `Date.now()` for all entities
3. **Summation Consistency**: `totalPatterns` = Σ(byType) = Σ(bySeverity)`
4. **Uniqueness**: No duplicate Pattern IDs in store
5. **Exception Binding**: Every `PatternException.patternId` references existing Pattern
6. **Threshold Coverage**: Every `PatternType` has exactly one `PatternThreshold`

---

## Performance Considerations

- **Pattern ID Generation**: Use deterministic hash to deduplicate identical patterns across analysis runs
- **Index Updates**: Batch index updates during bulk pattern adds (e.g., initial analysis)
- **MetricsSummary Calculation**: Debounce recalculation to once per analysis cycle (not per pattern)
- **localStorage Writes**: Debounce writes to 1-second intervals to avoid thrashing

---

## Type Definitions Location

All types will be implemented in: `/root/projects/visual-reactivity/src/types/pattern.ts`

Export via: `/root/projects/visual-reactivity/src/types/index.ts`
