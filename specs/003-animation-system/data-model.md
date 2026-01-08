# Data Model: Animation System

**Feature**: 003-animation-system  
**Date**: 2026-01-10

## Entities

### Animation

Represents a single animated visual change.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique animation identifier |
| type | AnimationType | Category of animation |
| targetId | string | Node or edge ID being animated |
| startTime | number | Timestamp when animation started (ms) |
| duration | number | Base duration in milliseconds |
| progress | number | Current progress 0-1 |
| easing | EasingFunction | Easing curve to apply |
| state | 'pending' \| 'running' \| 'paused' \| 'complete' | Current state |
| data | AnimationData | Type-specific animation data |

### AnimationType (enum)

| Value | Description |
|-------|-------------|
| 'node-pulse' | Node scale up/down on value change |
| 'node-stale' | Node dimmed indicator |
| 'node-executing' | Node highlight during execution |
| 'node-fade-out' | Node highlight fade after execution |
| 'node-dispose' | Node fade to gray and shrink |
| 'edge-particle' | Particle traveling along edge |
| 'edge-add' | New edge draw-in animation |
| 'edge-remove' | Edge fade-out/retract animation |
| 'batch-indicator' | Visual grouping for batch updates |

### AnimationData (union by type)

| Type | Data Fields |
|------|-------------|
| node-pulse | { scale: number } |
| node-stale | { opacity: number } |
| node-executing | { glowIntensity: number } |
| node-fade-out | { opacity: number } |
| node-dispose | { scale: number, opacity: number } |
| edge-particle | { pathProgress: number, particleId: string } |
| edge-add | { strokeDashoffset: number } |
| edge-remove | { opacity: number } |
| batch-indicator | { nodeIds: string[] } |

### AnimationQueue

Manages pending and active animations.

| Field | Type | Description |
|-------|------|-------------|
| pending | Animation[] | Queued animations not yet started |
| active | Map<string, Animation> | Currently running, keyed by targetId |
| completed | Animation[] | Recently completed (for debugging) |

### PlaybackState

Global animation playback controls.

| Field | Type | Description |
|-------|------|-------------|
| isPaused | boolean | Whether animations are frozen |
| speedMultiplier | number | Speed factor (0.25 to 2.0) |
| pendingCount | number | Number of queued animations |

### NodeVisualState

Per-node visual state for rendering.

| Field | Type | Description |
|-------|------|-------------|
| nodeId | string | Reference to graph node |
| isStale | boolean | Marked dirty but not re-evaluated |
| isExecuting | boolean | Currently running |
| pulseScale | number | Current pulse scale (1.0 = normal) |
| highlightOpacity | number | Execution highlight intensity (0-1) |
| disposeProgress | number | Disposal animation progress (0-1) |

### EdgeVisualState

Per-edge visual state for rendering.

| Field | Type | Description |
|-------|------|-------------|
| edgeId | string | Reference to graph edge |
| particleProgress | number \| null | Particle position 0-1, null if no particle |
| addProgress | number | Draw-in progress 0-1 (1 = fully visible) |
| removeProgress | number | Fade-out progress 0-1 (1 = fully faded) |

## Relationships

```
AnimationQueue 1──* Animation
Animation *──1 (Node | Edge)
PlaybackState 1──1 AnimationQueue
NodeVisualState *──1 Node (from visualization)
EdgeVisualState *──1 Edge (from visualization)
```

## State Transitions

### Animation Lifecycle

```
pending → running → complete
              ↓
           paused → running (on resume)
              ↓
           complete (if disposed while paused)
```

### Node Visual State

```
normal → stale (on dependency change)
stale → executing (on re-evaluation start)
executing → highlighted (on execution end)
highlighted → normal (after fade-out)

any → disposing → removed (on disposal)
```

## Validation Rules

1. Animation duration must be > 0
2. Progress must be in range [0, 1]
3. Speed multiplier must be in range [0.25, 2.0]
4. Only one animation per targetId can be active (coalescing)
5. Batch indicator requires at least 2 nodeIds
