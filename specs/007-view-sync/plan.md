# Implementation Plan: View Synchronization and Cross-View Selection

**Branch**: `007-view-sync` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/007-view-sync/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements synchronized selection state across all four visualization views (dependency graph, ownership tree, timeline, and values panel). Users can select nodes in any view and see them highlighted in all other views instantly, supporting single-selection, multi-selection (Ctrl/Cmd+click), and keyboard navigation. This enables efficient debugging by eliminating manual node correlation across views.

**Technical Approach**: Centralized selection store using SolidJS `createStore` with subscription pattern. Views subscribe to selection changes and update their highlighting within 16ms (60fps). Selection state persists across view visibility changes.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled  
**Primary Dependencies**: SolidJS 1.9.10 (createStore, createEffect, createMemo), D3.js (existing - for graph/tree manipulation)  
**Storage**: In-memory selection state via SolidJS store, no persistence required  
**Testing**: Vitest 4.x with @solidjs/testing-library 0.8.10  
**Target Platform**: Web browser (Chrome, Firefox, Safari latest)  
**Project Type**: Single web application  
**Performance Goals**: Sub-16ms cross-view synchronization (60fps), smooth scrolling (<300ms), handle 10+ selected nodes without lag  
**Constraints**: <100ms perceived response time for selection changes, 95% synchronization accuracy across views  
**Scale/Scope**: 4 visualization views, up to 100+ reactive nodes visible simultaneously, keyboard navigation across entire graph

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Testing Guide Gate (Principle XXI)

**Required if feature involves unit tests**:
- [x] Read `specs/TESTING-GUIDE.md` before creating test tasks
- [x] Verify test helpers exist in `src/__tests__/helpers`
- [x] Plan to use centralized helpers (`testInRoot()`, `useMockDate()`, etc.)
- [x] Avoid React testing patterns - use SolidJS patterns only

**Enforcement**: Any plan involving tests MUST include explicit task to consult testing guide.

### Test-First Development (Principle I)

- [x] All implementation tasks MUST start with failing tests
- [x] Tests written BEFORE any implementation code
- [x] Every file with executable code MUST have corresponding `.spec.ts` or `.test.ts`

### Zero Failing Tests Policy (Principle XV)

- [x] ALL tests MUST pass before spec can be declared complete
- [x] Failing tests are BLOCKER for completion
- [x] Run `npm test` and verify 100% passing before marking spec finished

### Quality Gates (Principle XIX)

- [x] Run `npm run lint:css` - MUST pass with 0 errors, 0 warnings
- [x] Run `npm run check` (Biome) - MUST pass with 0 errors, 0 warnings
- [x] Run `npm run typecheck` - MUST pass with 0 errors
- [x] ALL three gates MUST pass before spec completion

### Framework Requirements (Principle X)

- [x] SolidJS ONLY - React is forbidden
- [x] Use `createSignal`, `createEffect`, `createMemo`, `createStore`
- [x] No React hooks (`useState`, `useEffect`, etc.)
- [x] Props not destructured (maintain reactivity)

### Static Imports Only (Principle XVII)

- [x] All imports MUST be static `import` statements
- [x] No dynamic `import()` except in `vi.mock()` for tests
- [x] All imports at top of files

### No Complexity Violations

- [x] No new projects added
- [x] No architectural patterns requiring justification
- [x] Reuses existing store pattern (timelineStore.ts, panelStore.ts)

**GATE STATUS**: ✅ PASSED - All constitution requirements met

## Project Structure

### Documentation (this feature)

```text
specs/007-view-sync/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── stores/
│   ├── timelineStore.ts         # Existing - timeline state
│   ├── panelStore.ts            # Existing - panel preferences
│   └── selectionStore.ts        # NEW - centralized selection state
├── types/
│   ├── nodes.ts                 # Existing - ReactiveNode type
│   ├── timeline.ts              # Existing - timeline types
│   └── selection.ts             # NEW - selection state types
├── visualization/
│   ├── DependencyGraph.tsx      # MODIFY - add selection handlers
│   ├── OwnershipTree.tsx        # MODIFY - add selection handlers
│   ├── TimelineView.tsx         # MODIFY - add selection handlers
│   ├── LiveValuesPanel.tsx      # MODIFY - add selection handlers
│   └── hooks/
│       ├── useSelectionSync.ts  # NEW - selection subscription hook
│       └── useKeyboardNav.ts    # NEW - keyboard navigation hook
└── lib/
    └── selectionUtils.ts        # NEW - selection helper functions

tests/ (co-located with source)
├── stores/
│   └── __tests__/
│       └── selectionStore.spec.ts
├── types/
│   └── __tests__/
│       └── selection.spec.ts (if needed for validators)
├── visualization/
│   ├── __tests__/
│   │   ├── DependencyGraph.spec.tsx      # MODIFY - add selection tests
│   │   ├── OwnershipTree.spec.tsx        # MODIFY - add selection tests
│   │   ├── TimelineView.spec.tsx         # MODIFY - add selection tests
│   │   └── LiveValuesPanel.spec.tsx      # MODIFY - add selection tests
│   └── hooks/
│       └── __tests__/
│           ├── useSelectionSync.spec.ts
│           └── useKeyboardNav.spec.ts
└── lib/
    └── __tests__/
        └── selectionUtils.spec.ts
```

**Structure Decision**: Single project structure (default). This feature adds a new centralized store (`selectionStore.ts`) and modifies existing visualization components to subscribe to selection changes. Follows existing pattern established by `timelineStore.ts` and `panelStore.ts`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. This feature reuses existing architectural patterns (SolidJS stores with subscription pattern) and adds no new complexity.

## Phase 0: Research & Design Decisions

### Research Tasks

The following areas require investigation before Phase 1:

1. **Selection Store Architecture**
   - **Question**: How should selection state be structured to support both single-selection and multi-selection efficiently?
   - **Question**: What subscription pattern allows views to update reactively without performance penalties?
   - **Research**: Review existing stores (`timelineStore.ts`, `panelStore.ts`) for patterns
   - **Research**: Investigate SolidJS `createStore` batching behavior for rapid selection changes

2. **Cross-View Synchronization**
   - **Question**: How do we ensure selection updates propagate within 16ms (60fps target)?
   - **Question**: Should we use debouncing or throttling for rapid selection changes?
   - **Research**: SolidJS effect batching and microtask scheduling
   - **Research**: Performance implications of updating 4+ views simultaneously

3. **Keyboard Navigation**
   - **Question**: How to determine "next" node in dependency graph (multiple observers/sources)?
   - **Question**: How to handle keyboard navigation in ownership tree vs dependency graph?
   - **Research**: Graph traversal patterns (breadth-first vs depth-first)
   - **Research**: Existing D3 selection APIs for node traversal

4. **Scroll-to-Selected Behavior**
   - **Question**: How do we smoothly scroll off-screen nodes into view without jarring UX?
   - **Question**: What if multiple selected nodes are in different scroll positions?
   - **Research**: Browser `scrollIntoView` API with smooth behavior
   - **Research**: D3 zoom/pan animation APIs for graph/tree views

5. **Visual Highlighting Strategies**
   - **Question**: How to consistently highlight selected nodes across different view types (SVG vs DOM)?
   - **Question**: How to emphasize edges connecting multiple selected nodes?
   - **Research**: CSS class toggling vs inline styles for SVG elements
   - **Research**: D3 selection `.classed()` and `.style()` APIs

**Output Target**: `research.md` with decisions and rationale for all above questions

## Phase 1: Data Model & Contracts

### Key Entities (from spec)

1. **Selection State**
   - Fields: `selectedNodeIds: Set<string>`, `selectionTimestamp: number`, `selectionSource: string | null`
   - Validation: Node IDs must exist in current graph state
   - Persistence: In-memory only, no localStorage

2. **Selection Event**
   - Fields: `addedNodeIds: string[]`, `removedNodeIds: string[]`, `eventTimestamp: number`, `triggeringAction: 'click' | 'keyboard' | 'programmatic'`
   - Purpose: Emitted when selection changes, views subscribe to these events

3. **View Subscription**
   - Fields: `viewId: string`, `callback: (event: SelectionEvent) => void`, `isActive: boolean`
   - Purpose: Tracks which views are listening to selection changes

### API Contracts

**Selection Store API** (programmatic interface):

```typescript
// src/stores/selectionStore.ts

interface SelectionStoreAPI {
  // Getters (reactive)
  getSelectedNodeIds(): Set<string>;
  isNodeSelected(nodeId: string): boolean;
  getSelectionCount(): number;
  
  // Setters (trigger events)
  selectNode(nodeId: string, multiSelect: boolean): void;
  deselectNode(nodeId: string): void;
  clearSelection(): void;
  setSelection(nodeIds: Set<string>): void;
  
  // Keyboard navigation
  navigateToNextObserver(currentNodeId: string): void;
  navigateToNextSource(currentNodeId: string): void;
  navigateToOwner(currentNodeId: string): void;
  navigateToFirstChild(currentNodeId: string): void;
  
  // Subscription
  subscribe(viewId: string, callback: (event: SelectionEvent) => void): () => void;
}
```

**View Integration Hooks**:

```typescript
// src/visualization/hooks/useSelectionSync.ts

interface UseSelectionSyncReturn {
  isNodeSelected(nodeId: string): boolean;
  handleNodeClick(nodeId: string, event: MouseEvent): void;
  highlightedNodeIds: Set<string>;
}

function useSelectionSync(viewId: string): UseSelectionSyncReturn;
```

**Output Target**: `data-model.md`, `contracts/selection-store.ts` (TypeScript interface definitions)

## Phase 2: Implementation Tasks

> **Note**: Detailed task breakdown will be generated by `/speckit.tasks` command after Phase 1 completion.

### High-Level Task Categories

1. **Core Selection Store** (Priority: P1)
   - Implement `selectionStore.ts` with reactive state
   - Add selection event emission
   - Add subscription mechanism
   - Write comprehensive unit tests

2. **View Integration Hooks** (Priority: P1)
   - Implement `useSelectionSync.ts` hook
   - Implement `useKeyboardNav.ts` hook
   - Add keyboard event listeners
   - Write hook tests

3. **Dependency Graph Integration** (Priority: P1)
   - Add click handlers to node components
   - Add visual highlighting for selected nodes
   - Add edge emphasis for multi-selection
   - Modify existing tests to cover selection

4. **Ownership Tree Integration** (Priority: P1)
   - Add click handlers to tree nodes
   - Add visual highlighting
   - Add expand-to-show-selected logic
   - Modify existing tests

5. **Timeline Integration** (Priority: P1)
   - Add click handlers to swimlanes/events
   - Add swimlane highlighting
   - Add scroll-to-selected logic
   - Modify existing tests

6. **Values Panel Integration** (Priority: P1)
   - Add click handlers to list rows
   - Add row highlighting
   - Add scroll-to-selected logic
   - Modify existing tests

7. **Multi-Selection Support** (Priority: P2)
   - Implement Ctrl/Cmd+click detection
   - Update views to show multiple selections
   - Add edge emphasis in graph for multi-select
   - Add multi-select tests

8. **Keyboard Navigation** (Priority: P3)
   - Implement arrow key handlers
   - Add graph traversal logic
   - Add tree traversal logic
   - Add Escape key to clear selection
   - Add keyboard navigation tests

9. **Quality Assurance** (Priority: P1)
   - Run all quality gates (`lint:css`, `check`, `typecheck`)
   - Verify 100% test pass rate
   - Verify 95% synchronization accuracy (from SC-004)
   - Performance testing (sub-100ms response, 10+ nodes)

## Success Criteria Mapping

| Success Criterion | Verification Method |
|-------------------|---------------------|
| SC-001: <100ms cross-view sync | Performance test measuring time between click and all views updated |
| SC-002: 10+ nodes without lag | Performance test with 10 selected nodes, measure frame rate (should stay 60fps) |
| SC-003: 40% faster keyboard nav | Manual test comparing mouse-only vs keyboard nav for common tasks |
| SC-004: 95% sync accuracy | Integration test: 100 selection actions, count successful syncs across all views |
| SC-005: 300ms scroll animation | Unit test for scroll animation duration |
| SC-006: 90% visual distinction | Manual user testing (not automated) |
| SC-007: 100+ rapid changes | Performance test: hold arrow key, measure UI responsiveness |

## Dependencies

### External Dependencies
- **SolidJS 1.9.10**: Already installed, no changes needed
- **D3.js**: Already installed (features 002, 005, 006), no new modules needed
- **@solidjs/testing-library 0.8.10**: Already installed

### Internal Dependencies
This feature depends on all four visualization views being implemented:
- ✅ Feature 002: Dependency Graph (completed)
- ✅ Feature 004: Live Values Panel (completed)
- ✅ Feature 005: Ownership Tree (completed)
- ✅ Feature 006: Timeline View (completed)

### Integration Points
- **ReactiveNode type** (`src/types/nodes.ts`): Used for node ID validation
- **DependencyGraph component**: Requires modification for selection handlers
- **OwnershipTree component**: Requires modification for selection handlers
- **TimelineView component**: Requires modification for selection handlers
- **LiveValuesPanel component**: Requires modification for selection handlers

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Rapid selection changes cause UI lag | High | Debounce/throttle selection updates, use SolidJS batching |
| Complex keyboard nav logic in dense graphs | Medium | Start with simple traversal (first observer/source), enhance later |
| Inconsistent highlighting across SVG/DOM | Medium | Centralize highlighting logic, use consistent CSS classes |
| Off-screen scroll behavior conflicts with user scrolling | Low | Check if user is actively scrolling before auto-scrolling |
| Multi-selection edge emphasis clutters graph | Low | Limit edge emphasis to selected nodes only, use subtle styling |

## Next Steps

1. ✅ **Phase 0 Complete**: Plan generated
2. **Phase 0 Next**: Generate `research.md` (run research agents for unknowns)
3. **Phase 1 Next**: Generate `data-model.md` and `contracts/`
4. **Phase 1 Next**: Run `.specify/scripts/bash/update-agent-context.sh opencode`
5. **Phase 2 Next**: Generate `tasks.md` using `/speckit.tasks` command

---

**Plan Status**: ✅ READY FOR PHASE 0 RESEARCH  
**Constitution Check**: ✅ PASSED  
**Blocking Issues**: None
