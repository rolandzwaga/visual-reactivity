# Developer Quickstart: Demo System

**Feature**: Educational Demo Examples  
**Audience**: Developers adding new demos or modifying demo infrastructure

## Overview

The demo system provides 8 educational examples showcasing SolidJS reactivity patterns. Each demo:
- Creates isolated reactive graph (signals, memos, effects)
- Displays in dedicated panel with controls
- Cleans up completely on switch/close

## Running Demos

```bash
# Start dev server
npm run dev

# Open browser
# Click "Demos" button in top navigation
# Select any of the 8 demos from menu
```

## Project Structure

```
src/
├── demos/                       # Demo implementations
│   ├── __tests__/              # Demo tests
│   ├── SimpleCounter.tsx       # Demo components
│   ├── DemoContext.tsx         # Isolation context
│   ├── demoRegistry.ts         # Central registration
│   └── types.ts                # Shared types
│
└── visualization/              # Demo UI
    ├── DemoMenu.tsx            # Selection modal
    ├── DemoPanel.tsx           # Controls container
    └── WelcomeMessage.tsx      # Initial state
```

## Adding a New Demo

### Step 1: Create Demo Component

```typescript
// src/demos/MyNewDemo.tsx
import { createTrackedSignal, createTrackedEffect } from '../instrumentation';
import type { JSX } from 'solid-js';

export function MyNewDemo(): JSX.Element {
  const [count, setCount] = createTrackedSignal(0, { name: 'count' });
  
  createTrackedEffect(() => {
    console.log('Count:', count());
  }, { name: 'logger' });
  
  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount(count() + 1)}>Increment</button>
    </div>
  );
}
```

### Step 2: Write Tests First

```typescript
// src/demos/__tests__/MyNewDemo.spec.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { testInRoot } from '../../__tests__/helpers';
import { MyNewDemo } from '../MyNewDemo';

describe('MyNewDemo', () => {
  it('creates expected reactive nodes', () => {
    testInRoot(() => {
      render(() => <MyNewDemo />);
      
      const nodes = tracker.getNodes();
      expect(nodes).toHaveLength(2); // signal + effect
      expect(nodes[0].name).toBe('count');
      expect(nodes[1].name).toBe('logger');
    });
  });
});
```

### Step 3: Register Demo

```typescript
// src/demos/demoRegistry.ts
import { MyNewDemo } from './MyNewDemo';

export const DEMO_REGISTRY: DemoRegistry = {
  // ... existing demos
  'my-new-demo': {
    id: 'my-new-demo',
    metadata: {
      name: 'My New Demo',
      concept: 'Signal → Effect',
      description: 'Demonstrates...',
      instructions: 'Click Increment to...'
    },
    render: () => <MyNewDemo />
  }
};
```

### Step 4: Update Count Constant

```typescript
// src/demos/types.ts or demoRegistry.ts
export const EXPECTED_DEMO_COUNT = 9; // Was 8, now 9
```

## Demo Isolation Pattern

Each demo runs in isolated reactive context:

```typescript
// How demos are loaded (handled by App.tsx)
let demoDispose: (() => void) | null = null;

function loadDemo(demo: Demo) {
  if (demoDispose) {
    demoDispose(); // Clean up previous
  }
  
  createRoot(dispose => {
    demoDispose = dispose;
    demo.render(); // Creates signals/effects
  });
}

function cleanupDemo() {
  if (demoDispose) {
    demoDispose(); // Dispose reactive scope
    demoDispose = null;
  }
  tracker.reset(); // Clear visualizer
}
```

## Testing Patterns

### Unit Test: Demo Component

```typescript
import { testInRoot } from '../../__tests__/helpers';

it('demo creates correct nodes', () => {
  testInRoot(() => {
    render(() => <MyDemo />);
    
    const nodes = tracker.getNodes();
    expect(nodes).toHaveLength(expectedCount);
  });
});
```

### Integration Test: Demo Switching

```typescript
it('cleans up when switching demos', () => {
  testInRoot(() => {
    const context1 = loadDemo(DEMO_REGISTRY['simple-counter']);
    expect(tracker.getNodes().length).toBeGreaterThan(0);
    
    cleanupDemo(context1);
    expect(tracker.getNodes().length).toBe(0);
    
    const context2 = loadDemo(DEMO_REGISTRY['derived-state']);
    expect(tracker.getNodes().length).toBeGreaterThan(0);
  });
});
```

### Component Test: Menu Interaction

```typescript
it('opens menu and selects demo', async () => {
  render(() => <App />);
  
  const demosButton = screen.getByText('Demos');
  demosButton.click();
  
  const demoItem = screen.getByText('Simple Counter');
  demoItem.click();
  
  expect(screen.getByText(/Signal → Effect/)).toBeInTheDocument();
});
```

## Common Patterns

### Creating Reactive Nodes

```typescript
// Signal
const [value, setValue] = createTrackedSignal(initial, { name: 'mySignal' });

// Memo
const doubled = createTrackedMemo(() => value() * 2, { name: 'doubled' });

// Effect
createTrackedEffect(() => {
  console.log(value());
}, { name: 'logger' });
```

### Conditional Effects (Nested)

```typescript
const [toggle, setToggle] = createTrackedSignal(true, { name: 'toggle' });

createTrackedEffect(() => {
  if (toggle()) {
    createTrackedEffect(() => { /* child effect */ }, { name: 'child' });
  }
}, { name: 'parent' });
```

### Batched Updates

```typescript
import { batch } from 'solid-js';

function updateAll() {
  batch(() => {
    setFirst('John');
    setLast('Doe');
    setAge(30);
  });
  // Effect runs once after batch
}
```

## Error Handling

Demos are wrapped in ErrorBoundary automatically:

```typescript
// In DemoPanel.tsx (handled for you)
<ErrorBoundary fallback={(err) => <DemoError error={err} />}>
  {demo && <demo.render />}
</ErrorBoundary>
```

To test error handling:

```typescript
it('catches demo errors', () => {
  const badDemo: Demo = {
    id: 'bad',
    metadata: { /* ... */ },
    render: () => {
      throw new Error('Demo error');
    }
  };
  
  render(() => <DemoPanel demo={badDemo} />);
  expect(screen.getByText(/Demo error/)).toBeInTheDocument();
});
```

## Quality Checks

Before committing:

```bash
# Run tests
npx vitest run --no-watch

# Type check
npm run typecheck

# Lint
npm run check

# CSS lint
npm run lint:css
```

All must pass with 0 errors.

## Debugging Tips

### View Reactive Graph

Open DevTools console while demo is active:

```javascript
// In browser console
tracker.getNodes();  // See all nodes
tracker.getEdges();  // See dependencies
tracker.getEvents(); // See event history
```

### Check Cleanup

Verify disposal in tests:

```typescript
it('disposes all nodes', () => {
  testInRoot(() => {
    const context = loadDemo(demo);
    const nodeCount = tracker.getNodes().length;
    
    cleanupDemo(context);
    expect(tracker.getNodes().length).toBe(0);
  });
});
```

### Measure Load Time

```typescript
it('loads in under 1 second', async () => {
  const start = performance.now();
  
  testInRoot(() => {
    loadDemo(demo);
  });
  
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(1000); // SC-002
});
```

## File Naming Conventions

- Demo components: PascalCase (e.g., `SimpleCounter.tsx`)
- Test files: `ComponentName.spec.tsx` in `__tests__/` directory
- CSS modules: `ComponentName.module.css` (if needed)
- Types: `types.ts` (shared types in module root)

## Resources

- Feature Spec: `specs/010-demo-examples/spec.md`
- Implementation Plan: `specs/010-demo-examples/plan.md`
- API Contracts: `specs/010-demo-examples/contracts/demo-api.ts`
- Testing Guide: `specs/TESTING-GUIDE.md`
- SolidJS Docs: https://www.solidjs.com/docs

## FAQ

**Q: Can demos use external libraries?**  
A: No. Demos use only existing instrumented primitives (createTrackedSignal/Memo/Effect). No new dependencies.

**Q: Can demos persist state?**  
A: No. Demos are stateless. State resets on reload.

**Q: Can demos be async?**  
A: No (per assumption). Keep demos synchronous for clear propagation visualization.

**Q: How many nodes should a demo create?**  
A: <20 nodes (per assumption). Keep demos simple for educational clarity.

**Q: Can I modify existing demos?**  
A: Yes, but run ALL tests after changes to ensure no regressions.

---

**Quickstart Version**: 1.0  
**Last Updated**: 2026-01-09
