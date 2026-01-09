# Technical Research: Pattern Detection & Reactivity Analysis

**Feature**: 008-pattern-detection-analysis  
**Date**: 2026-01-09  
**Purpose**: Document technical decisions, algorithms, and architectural choices

---

## Research Areas

### 1. Pattern Detection Algorithms

#### 1.1 Orphaned Effects Detection

**Decision**: Check `node.owner === null` for effect-type nodes

**Rationale**:
- ReactivityTracker already captures ownership relationships (established in Feature 001)
- Effects without owners are created outside `createRoot()` or component contexts
- Simple null check provides O(1) detection per node

**Algorithm**:
```typescript
function detectOrphanedEffects(nodes: Map<string, ReactiveNode>): Pattern[] {
  return Array.from(nodes.values())
    .filter(node => node.type === 'effect' && node.owner === null)
    .map(node => createPattern('orphaned-effect', 'error', [node.id]));
}
```

**Alternatives Considered**:
- Static analysis of code: Rejected - requires source code access, not available in runtime visualization
- Heuristic-based detection: Rejected - introduces false positives

---

#### 1.2 Deep Dependency Chains Detection

**Decision**: Breadth-first traversal with depth tracking, threshold = 5 levels

**Rationale**:
- BFS provides accurate depth measurement from signal sources to terminal effects
- Threshold of 5 aligns with typical reactive application patterns (signal → memo → memo → memo → effect)
- Beyond 5 levels indicates architectural smell requiring refactoring

**Algorithm**:
```typescript
function detectDeepChains(nodes: Map<string, ReactiveNode>, edges: ReactiveEdge[]): Pattern[] {
  const depthMap = new Map<string, number>();
  
  // BFS from each signal to compute max depth
  for (const node of nodes.values()) {
    if (node.type === 'signal') {
      const depths = bfsDepth(node.id, edges);
      for (const [nodeId, depth] of depths) {
        depthMap.set(nodeId, Math.max(depthMap.get(nodeId) || 0, depth));
      }
    }
  }
  
  // Group nodes exceeding threshold into chains
  return Array.from(depthMap.entries())
    .filter(([_, depth]) => depth > 5)
    .map(([nodeId, depth]) => createPattern('deep-chain', 'warning', [nodeId], { depth }));
}
```

**Alternatives Considered**:
- DFS with backtracking: Rejected - less efficient for graphs with multiple paths
- Fixed depth limit without configuration: Rejected - threshold should be customizable (future enhancement)

---

#### 1.3 Diamond Patterns Detection

**Decision**: Find convergent nodes with 2+ dependency paths from common source

**Rationale**:
- Diamond patterns are architecturally interesting but not problematic (SolidJS handles glitch-free)
- Detection helps developers understand reactive execution order guarantees
- Classified as "info" severity (educational, not error)

**Algorithm**:
```typescript
function detectDiamondPatterns(edges: ReactiveEdge[]): Pattern[] {
  const convergenceMap = new Map<string, Set<string>>(); // target -> sources
  
  for (const edge of edges) {
    if (!convergenceMap.has(edge.target)) {
      convergenceMap.set(edge.target, new Set());
    }
    convergenceMap.get(edge.target)!.add(edge.source);
  }
  
  return Array.from(convergenceMap.entries())
    .filter(([_, sources]) => sources.size >= 2)
    .map(([targetId, sources]) => 
      createPattern('diamond', 'info', [targetId, ...sources])
    );
}
```

**Alternatives Considered**:
- Path enumeration: Rejected - exponential complexity for large graphs
- Only detect strict diamonds (A→B→D, A→C→D): Accepted - simpler and covers 90% of cases

---

#### 1.4 Hot Paths Detection

**Decision**: In-memory counter with sliding 1-second window, threshold = 10 updates/sec

**Rationale**:
- Sliding window provides accurate frequency measurement without unbounded memory growth
- 10 updates/sec threshold indicates likely over-computation (assuming 60fps UI target)
- Requires timestamp tracking on signal writes (already available from ReactivityTracker events)

**Algorithm**:
```typescript
class HotPathDetector {
  private updateTimestamps = new Map<string, number[]>(); // nodeId -> timestamps
  
  recordUpdate(nodeId: string, timestamp: number) {
    if (!this.updateTimestamps.has(nodeId)) {
      this.updateTimestamps.set(nodeId, []);
    }
    
    const timestamps = this.updateTimestamps.get(nodeId)!;
    timestamps.push(timestamp);
    
    // Sliding window: remove timestamps older than 1 second
    const cutoff = timestamp - 1000;
    const recentTimestamps = timestamps.filter(t => t >= cutoff);
    this.updateTimestamps.set(nodeId, recentTimestamps);
  }
  
  detectHotPaths(threshold: number = 10): Pattern[] {
    return Array.from(this.updateTimestamps.entries())
      .filter(([_, timestamps]) => timestamps.length > threshold)
      .map(([nodeId, timestamps]) => 
        createPattern('hot-path', 'warning', [nodeId], { frequency: timestamps.length })
      );
  }
}
```

**Alternatives Considered**:
- Fixed-size circular buffer: Rejected - less accurate for variable update rates
- Event-based sampling: Rejected - introduces measurement error

---

#### 1.5 High Subscriptions Detection

**Decision**: Count `node.observers.length`, threshold = 50

**Rationale**:
- Observer count directly available from ReactivityTracker node data
- 50 observers threshold indicates potential memory pressure or architectural issue
- Threshold based on empirical data from typical SolidJS applications

**Algorithm**:
```typescript
function detectHighSubscriptions(nodes: Map<string, ReactiveNode>): Pattern[] {
  return Array.from(nodes.values())
    .filter(node => node.observers.length > 50)
    .map(node => 
      createPattern('high-subscriptions', 'warning', [node.id], 
        { count: node.observers.length })
    );
}
```

**Alternatives Considered**:
- Weighted threshold by node type: Rejected - adds complexity without clear benefit
- Memory usage estimation: Deferred - requires profiling infrastructure (out of scope)

---

#### 1.6 Stale Memos Detection

**Decision**: Check `node.type === 'memo' && node.observers.length === 0`

**Rationale**:
- Memos with zero observers waste computation cycles on every source update
- Simple check, no complex algorithm needed
- Classified as "info" severity (cleanup suggestion, not critical)

**Algorithm**:
```typescript
function detectStaleMemos(nodes: Map<string, ReactiveNode>): Pattern[] {
  return Array.from(nodes.values())
    .filter(node => node.type === 'memo' && node.observers.length === 0)
    .map(node => createPattern('stale-memo', 'info', [node.id]));
}
```

**Alternatives Considered**:
- Track read frequency: Rejected - adds overhead, zero observers is sufficient indicator

---

### 2. Real-Time Analysis Architecture

#### 2.1 Debouncing Strategy

**Decision**: 300ms debounce with trailing edge execution

**Rationale**:
- Batches rapid graph changes (e.g., multiple signal updates in quick succession)
- 300ms provides good balance between responsiveness and performance
- Trailing edge ensures analysis runs after changes settle

**Implementation**:
```typescript
let debounceTimer: NodeJS.Timeout | null = null;

function scheduleAnalysis() {
  if (debounceTimer) clearTimeout(debounceTimer);
  
  debounceTimer = setTimeout(() => {
    runPatternDetection();
    debounceTimer = null;
  }, 300);
}
```

**Alternatives Considered**:
- Leading edge debounce: Rejected - misses final state after rapid updates
- Throttling: Rejected - may miss important intermediate states

---

#### 2.2 Performance Optimization

**Decision**: Incremental analysis with dirty node tracking

**Rationale**:
- Only re-analyze nodes affected by recent changes
- Reduces analysis time from O(n) to O(k) where k = changed nodes
- Maintains <200ms target for graphs with 100+ nodes

**Implementation**:
```typescript
class PatternDetector {
  private dirtyNodes = new Set<string>();
  
  markDirty(nodeId: string) {
    this.dirtyNodes.add(nodeId);
    scheduleAnalysis();
  }
  
  analyze() {
    if (this.dirtyNodes.size === 0) return;
    
    // Only re-run detectors for dirty nodes
    const affectedPatterns = this.reanalyze(this.dirtyNodes);
    this.dirtyNodes.clear();
    
    this.updatePatternStore(affectedPatterns);
  }
}
```

**Alternatives Considered**:
- Full graph scan every time: Rejected - O(n) complexity doesn't scale
- Event sourcing with incremental updates: Deferred - adds complexity (future optimization)

---

#### 2.3 Error Handling

**Decision**: Silent degradation with status indicator

**Rationale**:
- Pattern detection failures should not block visualization (core functionality more important)
- Log errors to console for debugging
- Show "Analysis Unavailable" in UI without modal interruption

**Implementation**:
```typescript
async function runPatternDetection() {
  try {
    const patterns = await detectAllPatterns();
    patternStore.setPatterns(patterns);
    patternStore.setStatus('success', patterns.length);
  } catch (error) {
    console.error('[PatternDetection] Analysis failed:', error);
    patternStore.setStatus('error', 0);
    // Visualization continues functioning normally
  }
}
```

**Alternatives Considered**:
- Retry with exponential backoff: Rejected - adds complexity, errors likely persistent
- Disable pattern detection on error: Rejected - user may want to manually retry

---

### 3. Visual Indicator Architecture

#### 3.1 Badge Overlay Rendering

**Decision**: SVG `<g>` overlay with circle + text positioned at top-right of node

**Rationale**:
- SVG maintains resolution at any zoom level (D3 zoom already in use)
- Top-right position doesn't obscure node content
- Circle background provides clear contrast against node

**Implementation**:
```typescript
<g transform={`translate(${node.x}, ${node.y})`}>
  {/* Original node rendering */}
  <SignalNode {...nodeProps} />
  
  {/* Badge overlay */}
  {patternCount > 0 && (
    <g transform="translate(15, -15)">
      <circle r="10" fill={severityColor} stroke="white" stroke-width="2" />
      <text text-anchor="middle" dy="0.3em" fill="white" font-size="10">
        {patternCount}
      </text>
    </g>
  )}
</g>
```

**Alternatives Considered**:
- Colored border stacking: Rejected - doesn't scale beyond 3 patterns
- Corner flags: Rejected - harder to read at small sizes
- External markers: Rejected - loses visual connection to node

---

#### 3.2 Color Palette

**Decision**: Severity-based color scheme with color-blind friendly alternatives

**Rationale**:
- Red (error): Orphaned effects - critical memory leak
- Orange (warning): Deep chains, hot paths, high subscriptions - performance issues
- Blue (info): Diamond patterns, stale memos - educational/cleanup

**Colors** (WCAG AA compliant, Deuteranopia-safe):
- Error: `#DC2626` (red-600)
- Warning: `#EA580C` (orange-600)
- Info: `#2563EB` (blue-600)

**Alternatives Considered**:
- Unique color per pattern type: Rejected - 6 colors hard to distinguish, especially for color-blind users
- Grayscale with shapes: Rejected - less visually salient

---

### 4. Analysis Panel Architecture

#### 4.1 Component Structure

**Decision**: Follow LiveValuesPanel architecture (collapsible sidebar with resize handle)

**Rationale**:
- Consistency with existing UI patterns
- Users already familiar with panel collapse/expand behavior
- Reuses existing panel state management (panelStore pattern)

**Component Hierarchy**:
```
AnalysisPanel.tsx
├── PanelHeader (toggle button, status indicator)
├── PatternFilters (filter by type, severity)
├── PatternList (virtualized list of detected patterns)
│   └── PatternItem (pattern description, affected nodes, remediation)
└── PanelResizeHandle (drag to resize)
```

**Alternatives Considered**:
- Modal dialog: Rejected - blocks interaction with graph
- Floating window: Rejected - adds complexity, inconsistent with existing UI

---

#### 4.2 Pattern Sorting & Filtering

**Decision**: Default sort by severity (error > warning > info), then by affected node count

**Rationale**:
- Critical patterns surfaced first
- Within same severity, more widespread patterns prioritized
- Aligns with user workflow (fix critical issues first)

**Filter Options**:
- By pattern type: orphaned-effect, deep-chain, diamond, hot-path, high-subscriptions, stale-memo
- By severity: error, warning, info
- By affected nodes: filter to patterns containing specific node ID

**Alternatives Considered**:
- Alphabetical sorting: Rejected - not useful for debugging workflow
- Time-based sorting (recently detected): Deferred - adds state management complexity

---

### 5. localStorage Persistence

#### 5.1 Schema

**Decision**: Store pattern detection settings and exceptions as JSON

**Schema**:
```typescript
interface PatternStorageSchema {
  version: 1;
  settings: {
    enabledPatterns: Record<PatternType, boolean>;
    thresholds: {
      deepChainDepth: number;
      hotPathFrequency: number;
      highSubscriptionCount: number;
    };
  };
  exceptions: Array<{
    patternId: string;
    reason: string;
    timestamp: number;
  }>;
  panelState: {
    isExpanded: boolean;
    width: number;
  };
}
```

**Storage Key**: `visual-reactivity:pattern-detection`

**Rationale**:
- Versioned schema allows future migrations
- Single key reduces localStorage fragmentation
- Exceptions persist across sessions

**Alternatives Considered**:
- Multiple keys per setting: Rejected - harder to maintain consistency
- IndexedDB: Rejected - overkill for small data size

---

## Summary of Technical Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Orphaned Effects** | Null owner check | Simple, O(1), no false positives |
| **Deep Chains** | BFS with depth=5 threshold | Accurate depth measurement, standard threshold |
| **Diamonds** | Convergent node detection | Educational value, info severity |
| **Hot Paths** | Sliding 1-second window, 10/sec | Accurate frequency without memory bloat |
| **High Subscriptions** | Observer count > 50 | Direct metric, memory pressure indicator |
| **Stale Memos** | Zero observers check | Simple, identifies unused computation |
| **Debouncing** | 300ms trailing edge | Batches rapid updates, responsive |
| **Performance** | Incremental dirty tracking | O(k) vs O(n), scales to 200+ nodes |
| **Error Handling** | Silent degradation | Non-blocking, visualization continues |
| **Badge Overlays** | SVG top-right positioning | Scalable, clear, doesn't obscure node |
| **Color Palette** | Severity-based, color-blind safe | WCAG AA, Deuteranopia-safe |
| **Panel Architecture** | Collapsible sidebar (LiveValuesPanel pattern) | UI consistency, familiar UX |
| **Persistence** | localStorage with versioned schema | Simple, session-persistent, migratable |

---

## Performance Validation Strategy

### Target Metrics (from spec Success Criteria)

- **SC-002**: Pattern detection analyzes graphs with up to 100 nodes in under 200ms
- **SC-005**: Hot path detection identifies nodes within 2 seconds of crossing threshold
- **SC-009**: Handles 200+ nodes without degradation (maintains <200ms)

### Measurement Approach

1. **Benchmark Suite**: Create performance tests with varying graph sizes (10, 50, 100, 200 nodes)
2. **Profiling**: Use browser Performance API to measure analysis time
3. **Regression Testing**: Monitor performance metrics in CI/CD

**Implementation**:
```typescript
// tests/performance/pattern-detection.spec.ts
test('analyzes 100-node graph in <200ms', () => {
  const nodes = generateMockNodes(100);
  const edges = generateMockEdges(nodes);
  
  const start = performance.now();
  const patterns = detectAllPatterns(nodes, edges);
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(200);
});
```

---

## Dependencies on Existing Features

- **Feature 001 (Core Instrumentation)**: ReactivityTracker provides node/edge data, update events
- **Feature 002 (Dependency Graph)**: DependencyGraph rendering infrastructure for badge overlays
- **Feature 007 (View Synchronization)**: Selection store for node highlighting on badge click

**Integration Requirements**:
- ReactivityTracker must emit `signal-write` events with timestamps (already implemented)
- DependencyGraph must support overlaying custom SVG elements on nodes (pattern established in Feature 003 animations)
- Selection store must be accessible from AnalysisPanel for cross-highlighting (established in Feature 007)

---

**Research Status**: COMPLETE  
**Next Phase**: Data Model & Contracts (Phase 1)
