# Implementation Plan: Core Instrumentation Layer

**Branch**: `001-core-instrumentation` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-instrumentation/spec.md`

## Summary

Build the foundational instrumentation layer for tracking SolidJS reactive primitives. This includes a singleton ReactivityTracker class that maintains a graph of reactive nodes (signals, memos, effects) and their dependency/ownership relationships, instrumented wrapper functions (createTrackedSignal, createTrackedMemo, createTrackedEffect) that emit events on reactive operations, and a pub/sub event system for real-time visualization updates.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode  
**Primary Dependencies**: SolidJS 1.9.10 (wrapping its primitives)  
**Storage**: In-memory only (Map-based registries)  
**Testing**: Vitest 4.x with @solidjs/testing-library  
**Target Platform**: Browser (ES2020+)  
**Project Type**: Single project (library module within larger app)  
**Performance Goals**: No specific target (dev tooling, observability > speed)  
**Constraints**: Must not alter SolidJS reactive behavior; wrapper must be transparent  
**Scale/Scope**: Handles graphs up to ~1000 nodes (typical app size)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ WILL COMPLY | All instrumentation code test-first |
| II. Technology Stack | ✅ COMPLIANT | SolidJS 1.9.x, Vite 7.x, Vitest 4.x, TypeScript strict |
| III. Code Quality | ✅ WILL COMPLY | Biome, Stylelint, typecheck gates |
| IV. Testing Standards | ✅ WILL COMPLY | Unit tests, 80% coverage target |
| IX. Dependency Management | ✅ NO NEW DEPS | Only uses existing solid-js |
| X. Framework Restrictions | ✅ COMPLIANT | SolidJS only, no React |
| XVII. Static Imports | ✅ WILL COMPLY | No dynamic imports |
| XIX. Quality Gates | ✅ WILL COMPLY | lint:css, check, typecheck |

**Gate Status: PASSED** - No violations, no justifications needed.

**Post-Design Re-check**: All gates still pass. Design uses:
- SolidJS primitives only (wrapped, not replaced)
- TypeScript strict mode types
- In-memory Map storage (no external deps)
- Static imports only

## Project Structure

### Documentation (this feature)

```text
specs/001-core-instrumentation/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (TypeScript interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── instrumentation/
│   ├── tracker.ts           # ReactivityTracker singleton
│   ├── primitives.ts        # createTrackedSignal, createTrackedMemo, createTrackedEffect
│   ├── events.ts            # Event types and emitter
│   └── index.ts             # Public exports
├── types/
│   ├── nodes.ts             # ReactiveNode types
│   ├── edges.ts             # ReactiveEdge types
│   ├── events.ts            # ReactivityEvent types
│   └── index.ts             # Type exports
└── index.tsx                # App entry (existing)

```

**Structure Decision**: Single project structure. Instrumentation is a library module within the visualizer app. Tests co-located with source files per constitution (e.g., `tracker.spec.ts` next to `tracker.ts` in the same directory).
