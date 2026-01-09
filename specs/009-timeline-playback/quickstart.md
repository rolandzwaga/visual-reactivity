# Quickstart: Timeline Integration & Event Replay System

**Feature**: 009-timeline-playback  
**Date**: 2026-01-09

This guide shows how to integrate Timeline into App.tsx and use replay/recording features.

---

## 1. Add Timeline to App Navigation

### Before (App.tsx - Feature 008)

```typescript
type ViewMode = "graph" | "tree";

export function App() {
  const [viewMode, setViewMode] = createSignal<ViewMode>("graph");
  
  return (
    <div>
      <button onClick={() => setViewMode("graph")}>Dependency Graph</button>
      <button onClick={() => setViewMode("tree")}>Ownership Tree</button>
      
      <Show when={viewMode() === "graph"}>
        <DependencyGraph ... />
      </Show>
      <Show when={viewMode() === "tree"}>
        <OwnershipTree ... />
      </Show>
    </div>
  );
}
```

### After (App.tsx - Feature 009)

```typescript
type ViewMode = "graph" | "tree" | "timeline";

export function App() {
  const [viewMode, setViewMode] = createSignal<ViewMode>("graph");
  const replayStore = createReplayStore();
  const recordingStore = createRecordingStore();
  
  return (
    <div>
      <button onClick={() => setViewMode("graph")}>Dependency Graph</button>
      <button onClick={() => setViewMode("tree")}>Ownership Tree</button>
      <button onClick={() => setViewMode("timeline")}>Timeline</button>
      
      <Show when={viewMode() === "graph"}>
        <DependencyGraph replayStore={replayStore} ... />
      </Show>
      <Show when={viewMode() === "tree"}>
        <OwnershipTree replayStore={replayStore} ... />
      </Show>
      <Show when={viewMode() === "timeline"}>
        <TimelineView 
          width={window.innerWidth}
          height={window.innerHeight}
          replayStore={replayStore}
          recordingStore={recordingStore}
          selection={selection}
        />
      </Show>
    </div>
  );
}
```

**Key Changes**:
- Add `"timeline"` to ViewMode type
- Create `replayStore` and `recordingStore` in App root
- Pass stores to Graph/Tree for replay mode subscription
- Pass stores to TimelineView for playback/recording features

---

## 2. Subscribe to Replay State in Graph/Tree

### DependencyGraph.tsx - Add Replay Subscription

```typescript
export function DependencyGraph(props: {
  width: number;
  height: number;
  replayStore: ReplayStore;
  selection: SelectionStore;
}) {
  const replayState = useReplayState(props.replayStore);
  
  const graphData = createMemo(() => {
    if (replayState().active) {
      const historical = reconstructGraphAt(replayState().cursorTimestamp!);
      return toD3GraphData(historical);
    } else {
      const current = tracker.getNodes();
      return toD3GraphData(current);
    }
  });
  
  return (
    <svg>
      <Show when={replayState().active}>
        <ReplayModeIndicator timestamp={replayState().cursorTimestamp!} />
      </Show>
      {/* Render graph using graphData() */}
    </svg>
  );
}
```

**Pattern**:
1. Use `useReplayState(store)` hook to subscribe
2. Check `replayState().active` to determine mode
3. If active, reconstruct historical state at `cursorTimestamp`
4. If inactive, use current live state

**Same pattern applies to OwnershipTree.tsx**

---

## 3. Use RecordingStore for Save/Load

### Save Recording

```typescript
async function handleSaveRecording(name: string) {
  const events = tracker.getEvents();
  
  try {
    const id = await recordingStore.save(name, events);
    console.log('Recording saved with ID:', id);
  } catch (error) {
    if (error.message.includes('unique')) {
      alert(`Recording "${name}" already exists. Try a different name.`);
    } else {
      alert(`Failed to save: ${error.message}`);
    }
  }
}
```

### Load Recording

```typescript
async function handleLoadRecording(id: number) {
  const recording = await recordingStore.load(id);
  replayStore.loadRecording(recording);
  setViewMode('timeline');
}
```

### List Recordings

```typescript
const [recordings, setRecordings] = createSignal<RecordingMetadata[]>([]);

onMount(async () => {
  const list = await recordingStore.list();
  setRecordings(list);
});

return (
  <ul>
    <For each={recordings()}>
      {(recording) => (
        <li onClick={() => handleLoadRecording(recording.id)}>
          {recording.name} ({recording.eventCount} events, {recording.duration}ms)
        </li>
      )}
    </For>
  </ul>
);
```

---

## 4. Export and Import Workflow

### Export Recording

```typescript
import { exportRecording } from './lib/recordingSerializer';

async function handleExport(recording: Recording) {
  const options: ExportOptions = {
    valueInclusion: 'truncated',
    truncationLimit: 10240,
    includeMetadata: true,
  };
  
  const json = exportRecording(recording, options);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${recording.name}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}
```

### Import Recording

```typescript
import { importRecording } from './lib/recordingSerializer';

async function handleImport(file: File) {
  const json = await file.text();
  
  try {
    const recording = importRecording(json);
    const id = await recordingStore.save(recording.name, recording.events);
    alert(`Imported "${recording.name}" successfully!`);
  } catch (error) {
    alert(`Import failed: ${error.message}`);
  }
}
```

---

## 5. Keyboard Navigation for Stepping

### useKeyboardNavigation Hook

```typescript
import { onMount, onCleanup } from 'solid-js';

export function useKeyboardNavigation(
  replayStore: ReplayStore,
  events: () => ReactivityEvent[]
) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      replayStore.stepForward(events());
    } else if (e.key === 'ArrowLeft') {
      replayStore.stepBackward(events());
    }
  };
  
  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
  });
  
  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
}
```

### Usage in TimelineView

```typescript
export function TimelineView(props: { replayStore: ReplayStore, ... }) {
  const events = () => tracker.getEvents();
  
  useKeyboardNavigation(props.replayStore, events);
  
  return <svg>...</svg>;
}
```

---

## 6. Animation with Interruption Support

### Pattern: Cancel Ongoing Transitions

```typescript
function animateGraphTransition(
  selection: D3Selection,
  newState: GraphData,
  duration: number
) {
  selection
    .selectAll('.node')
    .interrupt('graph-transition');
  
  selection
    .selectAll('.node')
    .data(newState.nodes)
    .transition('graph-transition')
    .duration(duration)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);
}
```

### Usage with Replay State

```typescript
createEffect(() => {
  const state = replayState();
  if (state.active) {
    const historical = reconstructGraphAt(state.cursorTimestamp!);
    animateGraphTransition(graphSelection, historical, 300);
  }
});
```

**Note**: Rapidly pressing arrow keys will automatically cancel ongoing animations and start new ones.

---

## 7. Name Validation Before Save

### Pattern: Validate Early

```typescript
function RecordingNameInput(props: { onSubmit: (name: string) => void }) {
  const [name, setName] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);
  const recordingStore = createRecordingStore();
  
  const handleSubmit = async () => {
    const validationError = recordingStore.validateName(name());
    if (validationError) {
      setError(validationError.message);
      return;
    }
    
    const exists = await recordingStore.exists(name());
    if (exists) {
      setError(`Recording "${name()}" already exists`);
      return;
    }
    
    props.onSubmit(name());
  };
  
  return (
    <div>
      <input value={name()} onInput={(e) => setName(e.target.value)} />
      <Show when={error()}>
        <span class="error">{error()}</span>
      </Show>
      <button onClick={handleSubmit}>Save</button>
    </div>
  );
}
```

---

## Common Patterns

### Pattern 1: Check Replay Mode Before Showing UI

```typescript
<Show when={!replayState().active}>
  <button onClick={handleSaveRecording}>Save Current Events</button>
</Show>

<Show when={replayState().active}>
  <button onClick={() => replayStore.clearCursor()}>Exit Replay</button>
</Show>
```

### Pattern 2: Sync Cursor with Mouse Click

```typescript
function handleTimelineClick(e: MouseEvent) {
  const x = e.clientX - svgRect.left;
  const timestamp = timeScale.invert(x).getTime();
  replayStore.setCursor(timestamp);
}
```

### Pattern 3: Display Historical Value in Detail Panel

```typescript
function DetailPanel(props: { nodeId: string, replayStore: ReplayStore }) {
  const value = createMemo(() => {
    const state = props.replayStore.state();
    if (state.active) {
      const historical = reconstructGraphAt(state.cursorTimestamp!);
      return historical.activeNodes.get(props.nodeId)?.value;
    } else {
      return tracker.getNode(props.nodeId)?.value;
    }
  });
  
  return <div>Value: {JSON.stringify(value())}</div>;
}
```

---

## File Structure Reference

```
src/
├── stores/
│   ├── replayStore.ts           # Create in App root
│   └── recordingStore.ts        # Create in App root
├── lib/
│   ├── historicalState.ts       # Used by Graph/Tree for reconstruction
│   └── recordingSerializer.ts   # Used for export/import
├── visualization/
│   ├── App.tsx                  # Add Timeline mode + create stores
│   ├── TimelineView.tsx         # Pass replayStore + recordingStore
│   ├── DependencyGraph.tsx      # Subscribe to replayStore
│   └── OwnershipTree.tsx        # Subscribe to replayStore
└── types/
    └── replay.ts                # ReplayState, Recording, etc.
```

---

## Next Steps

1. Read `specs/TESTING-GUIDE.md` for testing patterns
2. Run `/speckit.tasks` to generate detailed implementation tasks
3. Follow test-first development (RED-GREEN-REFACTOR)
4. Run quality gates after each task: `npm run lint:css && npm run check && npm run typecheck`

---

**Quickstart Complete**: 2026-01-09
