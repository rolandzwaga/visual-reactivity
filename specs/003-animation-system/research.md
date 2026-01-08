# Research: Animation System

**Feature**: 003-animation-system  
**Date**: 2026-01-10

## Research Tasks

### 1. D3 Animation Approach for SolidJS

**Decision**: Use D3 transitions with SolidJS signals for state, not D3 selections for DOM

**Rationale**: 
- SolidJS manages DOM directly with fine-grained reactivity
- D3 selections conflict with SolidJS's DOM ownership
- D3 provides excellent easing/interpolation functions that work standalone
- Use `d3-transition`, `d3-ease`, `d3-interpolate` for animation math only
- Drive animations via SolidJS signals + requestAnimationFrame

**Alternatives Considered**:
- Pure D3 transitions on selections: Rejected - conflicts with SolidJS DOM management
- CSS animations only: Rejected - insufficient control for particle animations along paths
- Web Animations API: Considered viable but D3 easing functions are more mature

### 2. Animation Queue Pattern

**Decision**: Priority queue with node-keyed deduplication

**Rationale**:
- Queue allows orderly sequencing of animation events
- Node-keyed map enables O(1) lookup for coalescing rapid updates
- Priority levels: propagation > state change > disposal
- Respects playback pause state by freezing queue processing

**Alternatives Considered**:
- Simple FIFO queue: Rejected - no coalescing support
- No queue (immediate): Rejected - animations would conflict/overlap

### 3. Particle Animation Along Edges

**Decision**: Animate a circle element along SVG path using path.getPointAtLength()

**Rationale**:
- SVG paths have built-in getPointAtLength() for position interpolation
- Create temporary circle element, animate progress 0→1, remove on complete
- D3 interpolate provides smooth easing
- Works with curved or straight edge paths

**Alternatives Considered**:
- CSS offset-path: Limited browser support, harder to control timing
- Canvas rendering: Would require rewriting graph to canvas, too invasive

### 4. Playback State Management

**Decision**: SolidJS signal-based controller with speed multiplier

**Rationale**:
- `createSignal` for isPaused and speedMultiplier
- Animation frame timing respects speed multiplier
- Pause freezes all active animations mid-progress
- Resume continues from frozen state
- Clean integration with SolidJS reactivity

**Alternatives Considered**:
- Context-based global state: Overkill for simple playback state
- External state management: Unnecessary complexity

### 5. Batch Update Visualization

**Decision**: Visual grouping indicator + parallel node pulses

**Rationale**:
- When batch-start event detected, collect all signal changes until batch-end
- Trigger all signal pulse animations simultaneously
- Show subtle visual indicator (e.g., shared glow or bracket) grouping batch
- Particles travel in parallel from all changed signals

**Alternatives Considered**:
- Sequential animations: Misrepresents actual SolidJS behavior
- Single combined animation: Loses individual signal identity

### 6. Performance Strategy for 50+ Animations

**Decision**: RequestAnimationFrame loop with batched updates

**Rationale**:
- Single rAF loop processes all active animations each frame
- Avoid per-animation timers which cause jank
- Skip frames gracefully if behind (don't queue up)
- Use CSS transforms (translate, scale) for GPU acceleration
- Limit particle count: max 1 active particle per edge

**Alternatives Considered**:
- Web Workers for animation math: Overkill, main thread is sufficient
- WebGL rendering: Too invasive for this feature scope

## Dependencies to Add

| Package | Version | Purpose |
|---------|---------|---------|
| d3-transition | ^3.0.0 | Transition utilities (may already be installed via d3) |
| d3-ease | ^3.0.0 | Easing functions |
| d3-interpolate | ^3.0.0 | Value interpolation |

**Note**: Check if these are already included in existing d3 installation from Feature 002.

## Integration Points

1. **Tracker Events** (Feature 001):
   - Subscribe to: signal-write, computation-execute-start/end, subscription-add/remove, computation-dispose, batch-start/end
   - Events trigger corresponding animations

2. **Graph Visualization** (Feature 002):
   - DependencyGraph component provides SVG container
   - Node components (SignalNode, MemoNode, EffectNode) receive animation state props
   - Edge paths provide travel path for particles

3. **Graph State Hook**:
   - useGraphState provides node/edge data
   - Animation system reads positions from graph state
