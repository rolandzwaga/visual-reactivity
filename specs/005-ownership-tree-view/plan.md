# Implementation Plan: Ownership Tree View

**Branch**: `005-ownership-tree-view` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-ownership-tree-view/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a hierarchical tree visualization component that displays SolidJS ownership relationships between reactive primitives (signals, memos, effects). The tree shows parent-child ownership hierarchy using D3's hierarchy layout with vertical orientation, enabling developers to understand disposal cascading and debug memory leaks. Includes expand/collapse interactions, disposed node visualization with 5-second auto-removal, synchronization with the Dependency Graph View, and manual disposal testing for educational purposes.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled  
**Primary Dependencies**: SolidJS 1.9.10, D3.js (d3-hierarchy, d3-selection, d3-zoom for reuse)  
**Storage**: In-memory state from ReactivityTracker (no persistence)  
**Testing**: Vitest 4.x with @solidjs/testing-library  
**Target Platform**: Web browsers (modern evergreen browsers)  
**Project Type**: Single web application (SolidJS SPA)  
**Performance Goals**: 60 FPS interaction, <50ms tree updates on tracker events  
**Constraints**: Support trees up to 20 levels deep and 100+ nodes without performance degradation  
**Scale/Scope**: Single feature component integrating with existing visualizer (002-dependency-graph-visualization)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gates

- ✅ **SolidJS Exclusive**: No React patterns planned; using SolidJS reactive primitives only
- ✅ **Test-First Development**: Plan includes test files for all components and utilities
- ✅ **Static Imports Only**: No dynamic imports planned; all imports static
- ✅ **No Unauthorized Dependencies**: Reusing existing D3 modules from 002-dependency-graph-visualization; no new dependencies required
- ✅ **Technical Documentation**: Will consult AGENTS.md and existing specs (001-004) for patterns
- ✅ **Zero Failing Tests**: All tests will pass before completion
- ✅ **Quality Gates**: Will run `npm run lint:css`, `npm run check`, `npm run typecheck`

### Post-Phase 1 Gates (Re-evaluated after design)

- ⏳ **Test-First Workflow**: Verify all implementation files have corresponding test files
- ⏳ **No React Patterns**: Review code for accidental React usage
- ⏳ **80% Coverage**: Verify coverage threshold for business logic
- ⏳ **Quality Gates Pass**: Confirm all three quality commands pass with zero errors/warnings

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
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
├── instrumentation/           # Feature 001 - Core tracking (existing)
├── visualization/             # Feature 002 - Graph visualization (existing)
│   ├── DependencyGraph.tsx    # Existing dependency graph view
│   ├── DetailPanel.tsx        # Shared detail panel (existing)
│   └── OwnershipTree.tsx      # NEW - This feature's main component
├── animation/                 # Feature 003 - Animation system (existing)
├── panels/                    # Feature 004 - Live values panel (existing)
└── d3/                        # D3 utilities (existing)
    ├── forceSimulation.ts     # Existing force layout
    ├── hierarchyLayout.ts     # NEW - D3 hierarchy tree layout
    ├── scales.ts              # Existing color/size scales (reuse)
    └── shapes.ts              # Existing node shapes (reuse)

tests/
└── (mirrors src/ structure with .spec.ts files)
```

**Structure Decision**: Single web application structure. This feature adds a new `OwnershipTree.tsx` component to the existing `src/visualization/` directory alongside the `DependencyGraph.tsx`. It will reuse the existing `DetailPanel.tsx` (FR-011 specifies shared panel), node shape rendering from `src/d3/shapes.ts`, and color scales from `src/d3/scales.ts`. A new `hierarchyLayout.ts` utility will be created in `src/d3/` to encapsulate D3 hierarchy layout logic (tree/dendrogram).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations detected. All gates pass.
