# Quickstart: Pattern Detection Integration

This guide shows how to integrate pattern detection into your application in 5 minutes.

---

## 1. Basic Setup

### Initialize Pattern Detector

```typescript
import { createPatternDetector } from './analysis/patternDetector';
import { tracker } from './instrumentation/tracker';

const detector = createPatternDetector(
  () => tracker.getNodes(),
  () => tracker.getEdges()
);

tracker.subscribe((event) => detector.handleEvent(event));
```

**What this does**: Creates detector bound to your reactivity tracker. All graph updates automatically trigger analysis after 300ms debounce.

---

## 2. Integrate AnalysisPanel into App

### Add to App.tsx

```typescript
import { createSignal } from 'solid-js';
import { AnalysisPanel } from './visualization/AnalysisPanel';
import { createPatternStore } from './stores/patternStore';
import { usePatternDetection } from './visualization/hooks/usePatternDetection';

function App() {
  const patternStore = createPatternStore();
  const [isPanelExpanded, setIsPanelExpanded] = createSignal(false);
  
  usePatternDetection(detector, patternStore);

  const handlePatternClick = (pattern: Pattern) => {
    const nodeIds = pattern.affectedNodeIds;
    selectionStore.setSelected(nodeIds);
  };

  return (
    <div class="app">
      <AnalysisPanel
        patterns={patternStore.patterns()}
        metrics={patternStore.metrics()}
        isExpanded={isPanelExpanded()}
        onToggle={() => setIsPanelExpanded(!isPanelExpanded())}
        onPatternClick={handlePatternClick}
        onMarkExpected={(id, reason) => patternStore.markAsExpected(id, reason)}
        onRemoveException={(id) => patternStore.removeException(id)}
        showExpectedPatterns={false}
        onToggleShowExpected={(show) => {}}
      />
      {/* Your existing views */}
    </div>
  );
}
```

**What this does**: 
- Creates pattern store for reactive state management
- Connects detector to store via `usePatternDetection` hook
- Adds collapsible sidebar panel
- Integrates with existing selection system

---

## 3. Add Pattern Badges to Graph View

### Modify DependencyGraph.tsx

```typescript
import { PatternBadge } from './PatternBadge';
import { For } from 'solid-js';

export function DependencyGraph(props: DependencyGraphProps) {
  const getBadgePosition = (nodeId: string) => {
    const node = d3.select(`[data-node-id="${nodeId}"]`).node() as SVGCircleElement;
    if (!node) return null;
    const { x, y } = node.getBBox();
    return { x: x + 20, y: y - 20 };
  };

  const patternsForGraph = () => 
    props.patterns.filter(p => 
      p.affectedNodeIds.some(id => props.nodes.some(n => n.id === id))
    );

  return (
    <svg class="dependency-graph">
      {/* Existing graph rendering */}
      
      <g class="pattern-badges">
        <For each={patternsForGraph()}>
          {(pattern) => {
            const pos = getBadgePosition(pattern.affectedNodeIds[0]);
            return pos ? (
              <PatternBadge 
                pattern={pattern}
                onClick={props.onPatternClick}
                x={pos.x}
                y={pos.y}
              />
            ) : null;
          }}
        </For>
      </g>
    </svg>
  );
}
```

**What this does**: Overlays visual badges on graph nodes with detected patterns. Clicking badge selects affected nodes.

---

## 4. Custom Pattern Thresholds

### Configure Detection Sensitivity

```typescript
import { createPatternDetector } from './analysis/patternDetector';

const detector = createPatternDetector(
  () => tracker.getNodes(),
  () => tracker.getEdges(),
  {
    thresholds: [
      { patternType: 'deep-chain', thresholdValue: 8, enabled: true },
      { patternType: 'hot-path', thresholdValue: 50, enabled: true },
      { patternType: 'high-subscriptions', thresholdValue: 100, enabled: true },
      { patternType: 'orphaned-effect', thresholdValue: 0, enabled: true },
      { patternType: 'diamond-pattern', thresholdValue: 3, enabled: false },
      { patternType: 'stale-memo', thresholdValue: 0, enabled: true },
    ],
    debounceMs: 500,
    debug: false,
  }
);
```

**What this does**: 
- Raises deep-chain threshold to 8 levels (less sensitive)
- Increases hot-path threshold to 50 updates/sec
- Disables diamond pattern detection
- Increases debounce to 500ms for slower analysis

**UI-based threshold adjustment**:

```typescript
patternStore.updateThreshold('deep-chain', 10);
patternStore.toggleThreshold('diamond-pattern', false);
```

---

## 5. Pattern Exception Handling

### Mark Patterns as Expected

**Use case**: Your app intentionally uses deep chains for specific features.

```typescript
const markDeepChainAsExpected = (patternId: string) => {
  patternStore.markAsExpected(
    patternId,
    'Deep chain intentional for reactive form validation',
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );
};
```

**What this does**: Marks pattern as expected with reason and 7-day expiry. Pattern stays in list but visually de-emphasized.

**Remove exception**:

```typescript
patternStore.removeException(patternId);
```

---

## 6. Testing Pattern Detection

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { testInRoot } from '../__tests__/helpers/testInRoot';
import { createPatternDetector } from './analysis/patternDetector';

describe('PatternDetector', () => {
  it('detects orphaned effects', () => {
    testInRoot(() => {
      const getNodes = vi.fn(() => [
        { id: 'effect-1', type: 'effect', owner: null },
        { id: 'signal-1', type: 'signal', owner: 'root' },
      ]);
      const getEdges = vi.fn(() => []);
      
      const detector = createPatternDetector(getNodes, getEdges);
      const patterns = detector.detectOrphanedEffects();
      
      expect(patterns).toHaveLength(1);
      expect(patterns[0].type).toBe('orphaned-effect');
      expect(patterns[0].affectedNodeIds).toEqual(['effect-1']);
    });
  });

  it('debounces analysis on rapid updates', async () => {
    testInRoot(async () => {
      const detector = createPatternDetector(() => [], () => []);
      const analyzeSpy = vi.spyOn(detector, 'runAnalysis');
      
      detector.handleEvent({ type: 'update', nodeId: 'signal-1', timestamp: Date.now() });
      detector.handleEvent({ type: 'update', nodeId: 'signal-1', timestamp: Date.now() });
      detector.handleEvent({ type: 'update', nodeId: 'signal-1', timestamp: Date.now() });
      
      await new Promise(resolve => setTimeout(resolve, 350));
      
      expect(analyzeSpy).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

## Performance Validation

### Expected Metrics

Run analysis on 100-node graph:

```typescript
const result = detector.runAnalysis();
console.log(`Analysis completed in ${result.duration}ms`);
console.log(`Found ${result.patterns.length} patterns`);
```

**Target performance**:
- <200ms analysis time for 100 nodes
- <16ms UI updates (60fps)
- 300ms debounce prevents thrashing

**Monitor performance**:

```typescript
import { createEffect } from 'solid-js';

createEffect(() => {
  const metrics = patternStore.metrics();
  if (metrics.lastAnalysisAt > 0) {
    const duration = Date.now() - metrics.lastAnalysisAt;
    if (duration > 200) {
      console.warn(`Slow analysis: ${duration}ms`);
    }
  }
});
```

---

## Troubleshooting

### No patterns detected

**Check**:
1. `detector.handleEvent()` connected to `tracker.subscribe()`?
2. Thresholds too high? Lower sensitivity.
3. Analysis disabled? Check `patternStore.status()`.

### Analysis too slow

**Solutions**:
1. Increase debounce: `debounceMs: 500`
2. Disable expensive detectors: `toggleThreshold('diamond-pattern', false)`
3. Reduce graph size or increase thresholds

### Patterns not clearing

**Issue**: Patterns persist after fix.

**Solution**: Detector only runs on graph changes. Manually trigger:

```typescript
const result = detector.runAnalysis();
patternStore.clearPatterns();
patternStore.addPatterns(result.patterns);
```

---

## Next Steps

1. **Customize remediation text** in `src/analysis/detectors/*.ts`
2. **Add pattern filters** to AnalysisPanel (by type, severity)
3. **Export analysis reports** via JSON download button
4. **Integrate with CI** by exporting patterns and failing on high-severity count > threshold

---

## API Reference

See contracts for full API:
- `contracts/pattern-detector.ts` - Detection engine API
- `contracts/pattern-store.ts` - Store API
- `contracts/analysis-panel.tsx` - Component props
- `data-model.md` - Entity definitions
