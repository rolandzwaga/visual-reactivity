# Implementation Plan: Dependency Graph Visualization

**Branch**: `002-dependency-graph-visualization` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-dependency-graph-visualization/spec.md`

## Summary

Implement a D3.js force-directed graph visualization that displays SolidJS reactive primitives (signals, memos, effects) as nodes with dependency edges. Includes zoom/pan/drag interactions, real-time updates via tracker event subscription, and a detail panel for node inspection.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode  
**Primary Dependencies**: SolidJS 1.9.10, D3.js (d3-force, d3-selection, d3-zoom)  
**Storage**: N/A (in-memory graph state from tracker)  
**Testing**: Vitest 4.x with @solidjs/testing-library  
**Target Platform**: Web browser (modern browsers with SVG support)  
**Project Type**: Single SolidJS application  
**Performance Goals**: 60fps interactions, <100ms node updates, graphs up to 100 nodes  
**Constraints**: Must integrate with existing tracker from 001-core-instrumentation  
**Scale/Scope**: Educational tool, single-user, up to 100 reactive nodes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ WILL COMPLY | Tests before implementation |
| II. Technology Stack | ✅ COMPLIANT | SolidJS + TypeScript + Vitest |
| III. Code Quality | ✅ WILL COMPLY | Run quality gates after each task |
| IV. Testing Standards | ✅ WILL COMPLY | 80% coverage, co-located tests |
| IX. Dependency Management | ⚠️ NEEDS APPROVAL | D3.js is new dependency |
| X. Framework Restrictions | ✅ COMPLIANT | SolidJS only, no React |
| XIII. Styling Architecture | ✅ WILL COMPLY | CSS modules co-located |
| XVII. Static Imports | ✅ WILL COMPLY | No dynamic imports |
| XIX. Quality Gates | ✅ WILL COMPLY | lint:css, check, typecheck |

**Dependency Approval Required**: D3.js (d3-force, d3-selection, d3-zoom) - justified by ROADMAP.md which explicitly specifies D3.js for visualization.

## Project Structure

### Documentation (this feature)

```text
specs/002-dependency-graph-visualization/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── instrumentation/     # From 001-core-instrumentation (existing)
│   ├── tracker.ts
│   ├── primitives.ts
│   └── index.ts
├── visualization/       # NEW - This feature
│   ├── DependencyGraph.tsx        # Main graph component
│   ├── DependencyGraph.module.css
│   ├── DependencyGraph.spec.tsx
│   ├── DetailPanel.tsx            # Node detail panel
│   ├── DetailPanel.module.css
│   ├── DetailPanel.spec.tsx
│   ├── nodes/                     # Node shape renderers
│   │   ├── SignalNode.tsx
│   │   ├── MemoNode.tsx
│   │   ├── EffectNode.tsx
│   │   └── index.ts
│   ├── hooks/                     # Graph state management
│   │   ├── useGraphState.ts
│   │   ├── useGraphState.spec.ts
│   │   ├── useForceSimulation.ts
│   │   └── useForceSimulation.spec.ts
│   └── index.ts
├── d3/                  # D3 utilities
│   ├── forceSimulation.ts
│   ├── forceSimulation.spec.ts
│   ├── zoom.ts
│   ├── zoom.spec.ts
│   └── index.ts
├── types/               # Existing types
└── App.tsx              # Updated to include visualization

tests/
└── integration/
    └── graph-updates.spec.ts    # Integration tests
```

**Structure Decision**: Single project with new `visualization/` and `d3/` directories. Builds on existing `instrumentation/` module.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| D3.js dependency | Force-directed layout, zoom/pan/drag | Manual implementation would be complex and error-prone; D3 is industry standard for graph visualization |

## Phase Completion Status

| Phase | Status | Output |
|-------|--------|--------|
| Phase 0: Research | ✅ Complete | research.md |
| Phase 1: Design & Contracts | ✅ Complete | data-model.md, contracts/types.ts, quickstart.md |
| Phase 2: Tasks | ✅ Complete | tasks.md |

## Post-Design Constitution Re-check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ READY | Test files mapped in structure |
| II. Technology Stack | ✅ COMPLIANT | SolidJS + D3 (approved via ROADMAP) |
| III. Code Quality | ✅ READY | Quality gates defined |
| IV. Testing Standards | ✅ READY | 80% coverage planned |
| IX. Dependency Management | ✅ APPROVED | D3.js justified by ROADMAP.md |
| X. Framework Restrictions | ✅ COMPLIANT | No React patterns in design |
| XIII. Styling Architecture | ✅ READY | CSS modules co-located |
| XVII. Static Imports | ✅ COMPLIANT | All imports static |
| XIX. Quality Gates | ✅ READY | lint:css, check, typecheck |
