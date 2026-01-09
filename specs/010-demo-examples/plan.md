# Implementation Plan: Educational Demo Examples

**Branch**: `010-demo-examples` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/010-demo-examples/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement 8 educational demo examples that showcase SolidJS reactivity patterns using the existing visualizer infrastructure. Each demo creates a specific reactive graph structure (counter, derived state, diamond pattern, batch updates, nested effects, conditional dependencies, deep chain, component tree) with interactive controls and educational descriptions. Demos are accessible via a navigation menu button, display in a dedicated panel, and support immediate switching and cleanup.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled  
**Primary Dependencies**: SolidJS 1.9.10, existing instrumented primitives (createTrackedSignal, createTrackedMemo, createTrackedEffect)  
**Storage**: None (demos are stateless, no persistence required)  
**Testing**: Vitest 4.x with @solidjs/testing-library  
**Target Platform**: Web browser (modern browsers with ES2020+ support)  
**Project Type**: Single SolidJS web application  
**Performance Goals**: Demo load <1s, UI interaction response <100ms (per spec SC-002, SC-005)  
**Constraints**: Each demo <20 nodes (per spec assumptions), synchronous execution only (no async/timers), no new dependencies  
**Scale/Scope**: 8 demos total, each self-contained with 2-10 reactive nodes, simple UI controls (1-3 buttons/inputs per demo)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Test-First Development (Principle I)

**Status**: ✅ COMPLIANT

- Plan includes test-first workflow for all demo components
- Each demo will have corresponding `.spec.tsx` test file
- Demo infrastructure (menu, panel, cleanup) requires unit tests before implementation

### Technology Stack (Principle II)

**Status**: ✅ COMPLIANT

- Using SolidJS 1.9.10 (createSignal, createEffect, createMemo, createStore)
- TypeScript 5.9.3 with strict mode
- Vitest 4.x for testing
- No React patterns
- No new dependencies

### Code Quality & Architecture (Principle III)

**Status**: ✅ COMPLIANT

- Plan includes running `npm run check`, `npm run lint:css`, `npm run typecheck` after each task group
- Each demo is standalone, testable module
- Demo isolation via DemoContext ensures no shared mutable state

### Testing Standards (Principle IV)

**Status**: ✅ COMPLIANT

- Unit tests: Demo initialization, cleanup, state isolation
- Component tests: Demo UI controls, menu interaction
- Integration tests: Loading demo, switching demos, cleanup verification
- Edge cases: Rapid switching, error handling, empty states

### Development Workflow (Principle V)

**Status**: ✅ COMPLIANT

- Red-Green-Refactor cycle for each component
- Quality gates after each task group
- Atomic commits per task (see Principle XXII)

### Framework-Specific Restrictions (Principle X)

**Status**: ✅ COMPLIANT

- **ABSOLUTE**: No React hooks (useState, useEffect, useMemo, etc.)
- Only SolidJS primitives (createSignal, createEffect, createMemo)
- No virtual DOM concepts

### Technical Overview Reference (Principle XVI)

**Status**: ✅ COMPLIANT

- [ ] Read AGENTS.md before starting implementation
- [ ] Check existing components for reuse (App.tsx navigation pattern, panel patterns)
- [ ] Update AGENTS.md after completion with demo system architecture

### Static Imports ONLY (Principle XVII)

**Status**: ✅ COMPLIANT

- All demo imports are static
- No dynamic `import()` calls
- Demos are eagerly loaded (no lazy loading)

### Zero Failing Tests Policy (Principle XV)

**Status**: ✅ COMPLIANT

- ALL tests must pass before declaring feature complete
- Any failing test is blocker for completion

### Quality Gates (Principle XIX)

**Status**: ✅ COMPLIANT

- Run ALL three commands at completion:
  - `npm run lint:css` (zero errors/warnings)
  - `npm run check` (zero errors/warnings)
  - `npm run typecheck` (zero errors)

### Testing Guide Gate (Principle XXI)

**Required for this feature (involves unit tests)**:
- [x] Read `specs/TESTING-GUIDE.md` before creating test tasks
- [x] Verify test helpers exist in `src/__tests__/helpers`
- [x] Plan to use centralized helpers (`testInRoot()`, `useMockDate()`, etc.)
- [x] Avoid React testing patterns - use SolidJS patterns only

**Enforcement**: Test tasks explicitly reference testing guide patterns.

### Atomic Task Commits Gate (Principle XXII)

**Required for ALL features**:
- [x] EVERY task group MUST end with explicit "Commit [description]" task item
- [x] Plan todo lists with commit as final step for each logical unit of work
- [x] NO task is complete without committing the work

**Enforcement**: Tasks structure includes explicit commit steps after each logical unit.

## Project Structure

### Documentation (this feature)

```text
specs/010-demo-examples/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── checklists/          # Quality validation checklists
│   └── requirements.md
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - demo entities
├── quickstart.md        # Phase 1 output - developer onboarding
└── contracts/           # Phase 1 output - demo interfaces
    └── demo-api.ts      # TypeScript type definitions for demo system
```

### Source Code (repository root)

```text
src/
├── demos/                      # NEW: Demo implementations
│   ├── __tests__/             # Demo unit tests
│   │   ├── SimpleCounter.spec.tsx
│   │   ├── DerivedState.spec.tsx
│   │   ├── DiamondPattern.spec.tsx
│   │   ├── BatchUpdates.spec.tsx
│   │   ├── NestedEffects.spec.tsx
│   │   ├── ConditionalDependencies.spec.tsx
│   │   ├── DeepChain.spec.tsx
│   │   ├── ComponentTree.spec.tsx
│   │   ├── DemoContext.spec.ts
│   │   └── demoRegistry.spec.ts
│   ├── SimpleCounter.tsx      # Demo 1: Signal → Effect
│   ├── DerivedState.tsx       # Demo 2: Signal → Memo → Effect
│   ├── DiamondPattern.tsx     # Demo 3: Diamond dependency
│   ├── BatchUpdates.tsx       # Demo 4: Batched vs individual
│   ├── NestedEffects.tsx      # Demo 5: Ownership hierarchy
│   ├── ConditionalDependencies.tsx  # Demo 6: Dynamic deps
│   ├── DeepChain.tsx          # Demo 7: Long propagation chain
│   ├── ComponentTree.tsx      # Demo 8: Component hierarchy
│   ├── DemoContext.tsx        # Demo isolation context
│   ├── demoRegistry.ts        # Central demo registration
│   └── types.ts               # Demo interfaces (Demo, DemoMetadata)
│
├── visualization/             # MODIFIED: Add demo UI components
│   ├── __tests__/
│   │   ├── DemoMenu.spec.tsx
│   │   ├── DemoPanel.spec.tsx
│   │   └── WelcomeMessage.spec.tsx
│   ├── DemoMenu.tsx           # NEW: Demo selection modal/dropdown
│   ├── DemoMenu.module.css
│   ├── DemoPanel.tsx          # NEW: Demo controls container
│   ├── DemoPanel.module.css
│   ├── WelcomeMessage.tsx     # NEW: Initial state prompt
│   └── WelcomeMessage.module.css
│
├── App.tsx                    # MODIFIED: Add demo menu button, panel integration
├── App.module.css             # MODIFIED: Demo panel layout styles
│
└── [existing directories unchanged]
```

**Structure Decision**: Single project structure. Demos are first-class feature modules in `src/demos/` directory. Demo UI components (menu, panel) live in `src/visualization/` alongside other visualization components for consistency. No new top-level directories required.

## Complexity Tracking

No constitutional violations. All gates pass without exceptions needed.

## Phase 0: Research Outcomes

See [research.md](./research.md) for detailed findings.

**Key Decisions**:
1. **Demo Isolation**: Use SolidJS `createRoot()` with manual disposal for each demo context
2. **Demo Registration**: Central registry pattern with metadata (name, description, instructions, component)
3. **UI Layout**: Top navigation button → modal menu, bottom demo panel (appears/disappears with demo lifecycle)
4. **Cleanup Strategy**: Dispose reactive context + reset tracker state on demo switch/close
5. **Error Boundaries**: Wrap each demo in SolidJS `ErrorBoundary` to prevent visualizer crashes

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Core Entities**:
- **Demo**: Educational example with render function and metadata
- **DemoMetadata**: Name, concept, description, instructions
- **DemoContext**: Isolated reactive root with cleanup function
- **DemoRegistry**: Map of demo ID → Demo instance

### API Contracts

See [contracts/demo-api.ts](./contracts/demo-api.ts) for TypeScript definitions.

**Key Interfaces**:
```typescript
interface Demo {
  id: string;
  metadata: DemoMetadata;
  render: () => JSX.Element;
}

interface DemoContext {
  rootDispose: () => void;
  cleanup: () => void;
}
```

### Developer Quickstart

See [quickstart.md](./quickstart.md) for onboarding guide.

**Essential Commands**:
- Run demos: `npm run dev` → open http://localhost:5173
- Test demos: `npx vitest run src/demos --no-watch`
- Add new demo: Follow 4-step registration pattern in quickstart

## Phase 2: Implementation Tasks

Tasks will be generated via `/speckit.tasks` command (not included in this plan).

**Estimated Task Groups** (7 groups):
1. Demo infrastructure (context, registry, types) + tests
2. Demo UI components (menu, panel, welcome) + tests
3. App integration (navigation, state management) + tests
4. Demos 1-2 (Simple Counter, Derived State) + tests
5. Demos 3-4 (Diamond Pattern, Batch Updates) + tests
6. Demos 5-6 (Nested Effects, Conditional Dependencies) + tests
7. Demos 7-8 (Deep Chain, Component Tree) + tests

Each task group follows pattern:
1. Write failing tests (RED)
2. Implement minimum code (GREEN)
3. Refactor for quality (REFACTOR)
4. Run quality gates (check, lint:css, typecheck)
5. Commit completed work (Principle XXII)

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Demo errors crash visualizer | High | Medium | Wrap each demo in ErrorBoundary, isolate contexts |
| Incomplete cleanup causes state leaks | High | Medium | Test disposal thoroughly, verify node counts after demo unload |
| Demo UI conflicts with visualizer controls | Medium | Low | Use dedicated demo panel separate from visualizer controls |
| Performance degrades with complex demos | Medium | Low | Keep demos <20 nodes (per assumption), measure load times in tests |
| User confusion about initial state | Low | Medium | Prominent welcome message with clear call-to-action |

## Success Metrics

From spec (measurable):
- **SC-002**: Demo load time <1s (measure with performance.now() in tests)
- **SC-005**: UI response time <100ms (measure button click → state update latency)
- **SC-004**: Zero errors when switching between all 8 demos (integration test coverage)
- **SC-006**: 100% of demos demonstrate intended concept (verified by acceptance scenario tests)

## Post-Implementation

**Required Updates**:
1. Update AGENTS.md:
   - Add demo system to project structure
   - Document demo creation pattern (context + registry + component)
   - Note demo isolation strategy (createRoot + manual disposal)

2. Quality Verification:
   - Run `npm run lint:css` (must pass with 0 errors/warnings)
   - Run `npm run check` (must pass with 0 errors/warnings)
   - Run `npm run typecheck` (must pass with 0 errors)
   - Run `npx vitest run --no-watch` (ALL tests must pass)

3. Feature Completion Checklist:
   - [ ] All 52 functional requirements met (FR-001 through FR-052)
   - [ ] All 8 user stories completed with acceptance scenarios verified
   - [ ] All success criteria measurable and passing
   - [ ] Zero failing tests
   - [ ] Zero quality gate errors
   - [ ] AGENTS.md updated

---

**Plan Version**: 1.0  
**Generated**: 2026-01-09  
**Ready for**: `/speckit.tasks` command
