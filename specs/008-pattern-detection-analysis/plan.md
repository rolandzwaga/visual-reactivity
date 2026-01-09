# Implementation Plan: Pattern Detection & Reactivity Analysis

**Branch**: `008-pattern-detection-analysis` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/008-pattern-detection-analysis/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement automated pattern detection system to identify reactive anti-patterns (orphaned effects, deep chains, diamond patterns, hot paths, high subscriptions, stale memos) with real-time visual indicators in the dependency graph and a collapsible sidebar analysis panel for detailed remediation guidance.

**Primary Technical Approach**: Extend existing ReactivityTracker with pattern analysis algorithms, integrate visual badge overlays into DependencyGraph node rendering, and create new AnalysisPanel component following the established sidebar panel architecture (LiveValuesPanel pattern).

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled  
**Primary Dependencies**: SolidJS 1.9.10, D3.js (d3-selection, d3-zoom), existing ReactivityTracker  
**Storage**: Browser localStorage for pattern detection settings and exceptions  
**Testing**: Vitest 4.x with @solidjs/testing-library 0.8.10, centralized test helpers  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge latest 2 versions)  
**Project Type**: Single web application (SolidJS visualization tool)  
**Performance Goals**: <200ms pattern analysis time for graphs with 100 nodes, <16ms UI updates (60fps), 300ms debounce for rapid graph changes  
**Constraints**: Real-time passive detection with silent degradation on failures, no blocking modals, must integrate with existing view synchronization system  
**Scale/Scope**: Support graphs with 200+ nodes, 6 pattern types, collapsible sidebar panel with filtering and sorting

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Test-First Development (Principle I) ✅

- **Status**: COMPLIANT
- **Rationale**: Feature requires comprehensive test coverage for pattern detection algorithms, UI components, and integration workflows
- **Action**: All pattern detection logic, analysis panel, and visual indicators will follow TDD (RED-GREEN-REFACTOR)

### Technology Stack (Principle II) ✅

- **Status**: COMPLIANT
- **Stack**: TypeScript 5.9.3 strict + SolidJS 1.9.10 + Vitest 4.x + Biome + Stylelint
- **Validation**: All dependencies already present in package.json, no new dependencies required

### Code Quality (Principle III) ✅

- **Status**: COMPLIANT
- **Gates**: `npm run check` (Biome), `npm run lint:css` (Stylelint), `npm run typecheck` (TSC)
- **Enforcement**: Quality checks will run after each task completion

### Testing Standards (Principle IV) ✅

- **Status**: COMPLIANT
- **Coverage**: Unit tests for pattern detection algorithms, component tests for AnalysisPanel, integration tests for workflow
- **Target**: 80% coverage for business logic

### Zero Failing Tests (Principle XV) ✅

- **Status**: COMPLIANT
- **Commitment**: ALL tests MUST pass before declaring spec complete. Failing tests are BLOCKERS.

### Testing Guide Reference (Principle XXI) ✅

**Required**: Feature involves unit tests

- [X] Read `specs/TESTING-GUIDE.md` before creating test tasks
- [X] Verify test helpers exist in `src/__tests__/helpers` (confirmed: testInRoot, useMockDate, flushMicrotasks)
- [X] Plan to use centralized helpers (`testInRoot()` for pattern detection logic, `useMockDate()` for hot path timestamp tests)
- [X] Avoid React testing patterns - use SolidJS patterns only (no `act()`, use proper event simulation)

**Enforcement**: Tasks will include explicit step to consult testing guide before implementing tests.

### Static Imports Only (Principle XVII) ✅

- **Status**: COMPLIANT
- **Validation**: All imports will be static `import` statements, no dynamic `import()` or `lazy()`

### Quality Gates (Principle XIX) ✅

- **Status**: COMPLIANT
- **Commands**: All three quality gate commands will be verified at spec completion:
  1. `npm run lint:css` - CSS validation
  2. `npm run check` - Biome linting and formatting
  3. `npm run typecheck` - TypeScript type checking

### Violations Requiring Justification

**None** - This feature complies with all constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/008-pattern-detection-analysis/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (technical decisions, algorithms)
├── data-model.md        # Phase 1 output (Pattern, PatternThreshold entities)
├── quickstart.md        # Phase 1 output (integration guide for pattern detection)
├── contracts/           # Phase 1 output (PatternDetector API, AnalysisPanel props)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Structure Decision**: Single project structure. Pattern detection integrates with existing visualization architecture established in features 001-007.

```text
src/
├── analysis/                         # NEW - Pattern detection core
│   ├── patternDetector.ts           # Main pattern detection engine
│   ├── detectors/                   # Individual pattern detectors
│   │   ├── orphanedEffects.ts      # Orphaned effects detector
│   │   ├── deepChains.ts            # Deep dependency chains detector
│   │   ├── diamondPatterns.ts      # Diamond convergence detector
│   │   ├── hotPaths.ts              # Hot path frequency monitor
│   │   ├── highSubscriptions.ts    # High observer count detector
│   │   └── staleMemos.ts            # Stale memo detector
│   ├── __tests__/
│   │   ├── patternDetector.spec.ts
│   │   └── detectors/               # Tests for each detector
│   └── index.ts                     # Barrel export
│
├── stores/
│   ├── patternStore.ts              # NEW - Pattern detection state management
│   └── __tests__/
│       └── patternStore.spec.ts     # NEW
│
├── types/
│   ├── pattern.ts                   # NEW - Pattern, PatternThreshold, PatternException types
│   └── index.ts                     # Update with pattern exports
│
├── visualization/
│   ├── AnalysisPanel.tsx            # NEW - Collapsible sidebar panel
│   ├── AnalysisPanel.module.css    # NEW - Panel styles
│   ├── PatternBadge.tsx             # NEW - Badge overlay for nodes
│   ├── PatternBadge.module.css     # NEW - Badge styles
│   ├── DependencyGraph.tsx          # MODIFIED - Integrate badge overlays
│   ├── __tests__/
│   │   ├── AnalysisPanel.spec.tsx  # NEW
│   │   └── PatternBadge.spec.tsx   # NEW
│   └── hooks/
│       ├── usePatternDetection.ts   # NEW - Hook for pattern detection integration
│       └── __tests__/
│           └── usePatternDetection.spec.ts  # NEW
│
├── lib/
│   └── patternUtils.ts              # NEW - Shared pattern detection utilities
│
└── App.tsx                          # MODIFIED - Integrate AnalysisPanel

tests/integration/
└── pattern-detection.spec.tsx       # NEW - End-to-end pattern detection workflow
```

**Integration Points**:
- `analysis/` - New module for pattern detection core logic
- `stores/patternStore.ts` - Manages pattern state, integrates with existing stores
- `visualization/AnalysisPanel.tsx` - New sidebar panel following LiveValuesPanel architecture
- `visualization/PatternBadge.tsx` - Visual indicators for nodes with patterns
- `visualization/DependencyGraph.tsx` - Renders badge overlays on nodes
- `types/pattern.ts` - New types for pattern detection entities

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - This feature complies with all constitution principles and requires no justifications.

---

## Phase 0: Research & Technical Decisions

*Status: COMPLETE - See [research.md](./research.md)*

---

## Phase 1: Data Model & Contracts

*Status: COMPLETE - See [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)*

---

## Phase 2: Task Generation

*Status: PENDING - Use `/speckit.tasks` command after Phase 1 completion*

Task generation will break down implementation into atomic units following test-first development approach:
1. Setup (types, project structure)
2. Tests for pattern detectors (RED phase)
3. Pattern detector implementations (GREEN phase)
4. Tests for UI components (RED phase)
5. UI component implementations (GREEN phase)
6. Integration tests (RED phase)
7. Integration implementation (GREEN phase)
8. Polish and validation

---

## Notes

- Feature builds on existing architecture from features 001 (Core Instrumentation), 002 (Dependency Graph), and 007 (View Synchronization)
- Pattern detection runs in real-time with 300ms debouncing to avoid performance impact
- Analysis panel follows established sidebar pattern (LiveValuesPanel) for UI consistency
- Badge overlays use highest severity color + count for multi-pattern nodes
- Silent degradation on failures with "Analysis Unavailable" status indicator
- All pattern detection settings and exceptions persist in localStorage
