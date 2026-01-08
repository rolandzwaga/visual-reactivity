# Quickstart: Animation System

**Feature**: 003-animation-system

## Prerequisites

- Feature 001 (Core Instrumentation) implemented
- Feature 002 (Dependency Graph Visualization) implemented
- Node.js 18+
- npm packages installed

## Usage

### Basic Integration

```typescript
import { createAnimationController } from './animation';
import { tracker } from './instrumentation';
import { DependencyGraph } from './visualization';

// Create controller
const animation = createAnimationController();

// Subscribe to tracker events
tracker.subscribe((event) => {
  switch (event.type) {
    case 'signal-write':
      animation.animateSignalWrite(event.nodeId);
      break;
    case 'computation-execute-start':
      animation.animateExecutionStart(event.nodeId);
      break;
    case 'computation-execute-end':
      animation.animateExecutionEnd(event.nodeId);
      break;
    case 'subscription-add':
      animation.animateEdgeAdd(event.data.edgeId);
      break;
    case 'subscription-remove':
      animation.animateEdgeRemove(event.data.edgeId);
      break;
    case 'computation-dispose':
      animation.animateDisposal(event.nodeId);
      break;
  }
});

// Pass animation state to graph
<DependencyGraph animationController={animation} />
```

### Playback Controls

```typescript
// Pause/resume
animation.playback.togglePause();
animation.playback.setPaused(true);

// Adjust speed (0.25x to 2x)
animation.playback.setSpeed(0.5);  // Half speed
animation.playback.setSpeed(2.0);  // Double speed

// Read state
const { isPaused, speedMultiplier, pendingCount } = animation.playback.state();
```

### Node Visual State

```typescript
// Get reactive visual state for a node
const visualState = animation.getNodeVisualState('signal-1');

// Use in component
<circle
  r={20 * visualState().pulseScale}
  opacity={1 - visualState().disposeProgress}
  class={visualState().isExecuting ? 'executing' : ''}
/>
```

### Edge Visual State

```typescript
// Get reactive visual state for an edge
const edgeState = animation.getEdgeVisualState('edge-1');

// Render particle if active
{edgeState().particleProgress !== null && (
  <circle
    cx={getPointOnPath(path, edgeState().particleProgress).x}
    cy={getPointOnPath(path, edgeState().particleProgress).y}
    r={4}
  />
)}
```

## Configuration

```typescript
const animation = createAnimationController({
  baseDuration: 300,        // Default animation duration (ms)
  showBatchIndicator: true  // Show batch grouping visual
});
```

## Cleanup

```typescript
// When unmounting
animation.dispose();
```
