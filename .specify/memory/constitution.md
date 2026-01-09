<!--
=============================================================================
SYNC IMPACT REPORT - Constitution Update 1.1.1 → 1.2.0
=============================================================================

Version Change: 1.1.1 → 1.2.0 (MINOR - New principle added)
Date: 2026-01-09

Changes:
--------
- ADDED: Principle XXII. Atomic Task Commits (NON-NEGOTIABLE)
  - Explicit requirement that EVERY task's last todo item MUST be to commit the work
  - Ensures no work is left uncommitted after task completion
  - Prevents forgetting to commit completed work
  - Makes commit boundaries explicit and traceable
- UPDATED: Development Workflow section
  - Step 6 now explicitly references new Principle XXII
  - Reinforced that commits happen after EACH task completion

Modified Principles:
--------------------
- NEW Principle XXII: Atomic Task Commits - ensures every task ends with a commit
- Development Workflow (Step 6): Updated to reference Principle XXII

Templates Requiring Updates:
-----------------------------
✅ tasks-template.md - Added explicit commit requirement to task examples and notes
✅ plan-template.md - Added constitution check reminder for commit discipline
✅ spec-template.md - No changes needed (spec doesn't define task-level workflow)

Follow-up TODOs:
----------------
None

Rationale for MINOR Version Bump:
----------------------------------
This is a NEW principle being added to the constitution that establishes a mandatory
workflow requirement not previously codified. While committing has always been part
of the workflow (Principle V), explicitly requiring the last todo item to be a commit
is new guidance that expands constitutional scope. This is a material addition that
affects agent behavior and task execution patterns.

=============================================================================
-->

# Visual-Reactivity Project Constitution

**Version**: 1.2.0
**Purpose**: Define non-negotiable development principles, standards, and governance for the Visual-Reactivity project

---

## CRITICAL: THIS IS A SOLIDJS PROJECT - NOT REACT

```
THIS IS A SOLIDJS PROJECT. REACT IS ABSOLUTELY FORBIDDEN.

NEVER use: useState, useEffect, useMemo, useCallback, useRef
NEVER import from 'react' or '@types/react'
NEVER use React patterns, lifecycle methods, or virtual DOM concepts

ALWAYS use: createSignal, createEffect, createMemo, createStore
ALWAYS import from 'solid-js' and 'solid-js/store'
ALWAYS use SolidJS fine-grained reactivity model

SolidJS components run ONCE - not on every render like React
Signals are getter functions - call count() not count
No dependency arrays - SolidJS tracks dependencies automatically
Props are reactive - destructuring props breaks reactivity
No virtual DOM - direct DOM manipulation, surgical updates

VIOLATION OF THIS RULE IS GROUNDS FOR IMMEDIATE CODE REJECTION
```

---

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

**STRICTLY ENFORCED**: Every feature MUST begin with tests before any implementation code is written. No implementation code shall be written without a failing test first.

**What Requires Tests** (must write test FIRST):
- All functions, methods, and business logic
- All components (with executable code)
- All utilities and helpers
- All state management (signals, stores, effects)

**What Does NOT Require Tests**:
- Pure type definitions (`type`, `interface` in type files)
- Configuration files
- Barrel exports (index files with only re-exports)

**Test-First Workflow** (NO EXCEPTIONS):
1. **RED**: Write failing test that describes desired behavior
2. **GREEN**: Write MINIMUM code to pass test
3. **REFACTOR**: Improve while keeping tests green
4. **NEVER**: Write implementation before test exists

**Enforcement**:
- ANY file containing executable code MUST have corresponding `.spec.ts` or `.test.ts` file
- Implementation commits without tests will be rejected in code review
- "I'll add tests later" is NOT acceptable

### II. Technology Stack (Non-negotiable)

The following technology choices are mandatory:

**Frontend Framework**: SolidJS 1.9.x
- **Build Tool**: Vite 7.x with vite-plugin-solid
- **Language**: TypeScript with strict mode enabled (`"strict": true`)
- **Testing Framework**: Vitest 4.x with @solidjs/testing-library
- **Code Quality Tools**: Biome (linting + formatting), Stylelint (CSS)

**Architectural Constraints**:
- Use SolidJS reactive primitives: `createSignal`, `createEffect`, `createMemo`, `createStore`
- Components are functions returning JSX (no class components)
- Fine-grained reactivity - avoid unnecessary re-renders
- Prefer signals over stores for simple state
- Use stores for complex nested state

### III. Code Quality & Architecture

All code MUST adhere to consistent quality standards:

**Code Quality Enforcement (MANDATORY)**:
- After completing EACH task, run quality checks:
  1. `npm run check` - Biome lint and format
  2. `npm run lint:css` - Stylelint CSS
  3. `npm run typecheck` - Verify type correctness
- Review all output and manually fix ANY remaining issues
- A task is NOT complete until all checks pass without errors or warnings
- NEVER commit code with unresolved errors
- See also: **Principle XIX. Quality Gates** for spec-level quality verification

**Architectural Standards**:
- Every feature begins as a standalone, testable module
- Use type system to enforce business rules at compile time
- Avoid `any` type assertions; prefer proper type narrowing
- Keep functions pure and manage side-effects explicitly via `createEffect`
- Minimize shared mutable state; prefer immutable data structures
- Each module MUST have a single, well-defined responsibility

### IV. Testing Standards

Testing is comprehensive and mandatory:

- **Unit Tests**: Required for all business logic, utilities, and pure functions
- **Integration Tests**: Required for workflow orchestration and cross-module interactions
- **Component Tests**: Required for all UI components with user interactions
- **Edge Case Testing**: Test error paths, boundary conditions, and edge cases
- **Isolation**: Mock external dependencies; test modules in isolation
- **Coverage Threshold**: Minimum 80% code coverage for business logic
- **Test Naming**: Use descriptive names (Given-When-Then format preferred)
- **Test Location**: Co-located with source files (e.g., `__tests__/Component.tsx` and `__tests__/Component.spec.tsx`)

### V. Development Workflow

All development MUST follow Test-First Development:

1. **Red**: Write failing test (BEFORE ANY IMPLEMENTATION)
2. **Green**: Write minimum code to make test pass
3. **Refactor**: Improve code while keeping tests green
4. **Quality Gate**: Run `npm run check` and `npm run typecheck`
5. **Fix Issues**: Resolve any errors
6. **Commit**: Commit tests and implementation together after all checks pass (see **Principle XXII**)
7. **Review**: Ensure all tests pass before requesting code review

### VI. Performance & User Experience

- **Real-time Updates**: Optimize for 60fps during interactions
- **Initial Load**: Target < 3 seconds for initial page load
- **Interaction**: Target < 100ms response time for user interactions
- **Perceived Performance**: Show loading states and optimistic updates
- **Bundle Size**: Monitor and minimize bundle size; use code splitting

### VII. Accessibility & Usability

Applications must serve diverse users:

- Follow WCAG 2.1 AA standards for ALL UI components
- Ensure keyboard navigation for all interactive elements
- Provide clear, actionable error messages
- Use semantic HTML elements appropriately
- Include ARIA labels where semantic HTML is insufficient
- Ensure color contrast ratios meet WCAG AA requirements (4.5:1)

### VIII. Research & Documentation Standards

When researching implementations, accuracy is critical:

- Use official SolidJS documentation: https://www.solidjs.com/docs
- Use official Vitest documentation: https://vitest.dev/
- Use official Vite documentation: https://vite.dev/
- Verify API signatures and patterns against official documentation
- Query documentation BEFORE writing unfamiliar code

### IX. Dependency Management

**CRITICAL**: Dependency changes affect stability, security, and maintainability.

- **DO NOT** automatically install or modify package.json
- **DO NOT** add dependencies without user consultation
- When new dependency is required, **STOP** and discuss first
- **DO NOT** continue until user approval is obtained
- Justify every new dependency with use case and rationale
- Consider alternatives using existing dependencies

### X. Framework-Specific Restrictions (ABSOLUTE - ZERO TOLERANCE)

**ABSOLUTE PROHIBITION**: This project uses SolidJS EXCLUSIVELY. React, Vue, Angular, or ANY other framework code is COMPLETELY AND UTTERLY FORBIDDEN.

### What is FORBIDDEN (will result in IMMEDIATE rejection):

| React Concept | SolidJS Equivalent | Notes |
|---------------|-------------------|-------|
| `useState` | `createSignal` | NEVER use useState |
| `useEffect` | `createEffect` | NEVER use useEffect |
| `useMemo` | `createMemo` | NEVER use useMemo |
| `useCallback` | Not needed (no re-renders) | NEVER use useCallback |
| `useRef` | `let ref` or variables | NEVER use useRef |
| `useContext` | `useContext` (SolidJS version) | Import from solid-js ONLY |
| `useReducer` | `createStore` | NEVER use useReducer |
| `React.memo` | Not needed | NEVER use React.memo |
| `forwardRef` | `ref` prop directly | NEVER use forwardRef |
| Virtual DOM | Fine-grained reactivity | SolidJS has NO virtual DOM |

### XI. Debugging Attempt Limit (NON-NEGOTIABLE)

**CRITICAL**: Limited to **5 attempts** before requiring user consultation.

**After 5 Failed Attempts**:
- **STOP IMMEDIATELY**
- **DOCUMENT** what was tried and why each failed
- **ANALYZE** common patterns across failures
- **FORMULATE** specific questions
- **PRESENT** findings to user
- **WAIT** for user response

### XII. Concise Communication (NON-NEGOTIABLE)

**CRITICAL**: Respect user's time with brief, technical communication.

**Communication Rules**:
- Keep responses SHORT and TO THE POINT
- Assume senior-level technical knowledge
- NO hand-holding explanations
- NO verbose status updates
- State what you did, not how or why (unless asked)
- Use bullet points for multiple items

### XIII. Styling Architecture

**CSS Modules Approach**:
- Use CSS files co-located with components (`Component.module.css`)
- Import styles: `import styles from './Component.module.css'`
- Reference classes: `class={styles.button}`
- Centralized design tokens in `src/styles/` directory
- Use CSS custom properties for theming

**Stylelint Enforcement**:
- All CSS must pass Stylelint checks
- Use `stylelint-value-no-unknown-custom-properties` for custom property validation
- No magic numbers - use design tokens

### XIV. Token Efficiency (NON-NEGOTIABLE)

**CRITICAL**: Token usage is finite. NEVER generate redundant documentation.

**Prohibited**:
- **NEVER** generate test coverage reports in documentation
- **NEVER** copy/paste command output into markdown
- **NEVER** document metrics that can be obtained by running commands
- **NEVER** duplicate machine-readable information

**Required**:
- **ALWAYS** run commands to view output
- **ONLY** document INSIGHTS requiring human interpretation
- **VERIFY** via command output, not documentation

### XV. Zero Failing Tests Policy (NON-NEGOTIABLE)

**CRITICAL**: EVERY spec delivered with ALL tests passing. ANY failing test is IMMEDIATE problem and ABSOLUTE BLOCKER.

**COMPLETION BLOCKER - Specs Cannot Be Declared "Finished" or "Complete" With Failing Tests**:
- A spec is **NOT FINISHED** if any test fails
- A spec is **NOT COMPLETE** if any test fails
- You **CANNOT** declare a spec done with failing tests
- You **CANNOT** mark implementation complete with failing tests
- Failing tests are a **HARD BLOCKER** for spec completion

**Absolute Requirements**:
- **ALL tests MUST pass** before spec can be declared finished/complete
- **ALL tests MUST pass** before ANY commit
- **ALL tests MUST pass** in CI/CD before merge
- Failing test is YOUR responsibility to fix immediately

**When Tests Fail**:
1. **STOP** all other work
2. **ANALYZE** the failure
3. **FIX** test or code causing failure
4. **VERIFY** all tests pass
5. If unable to fix after 5 attempts, **CONSULT USER**

**Enforcement at Spec Completion**:
- Before declaring spec finished: run `npm test` and verify ALL tests pass
- Document test results showing 100% passing tests
- NO EXCEPTIONS - even a single failing test blocks completion

### XVI. Technical Overview Reference (NON-NEGOTIABLE)

**CRITICAL**: ALWAYS consult technical documentation before creating specs/plans/tasks.

**Mandatory Consultation**:
- **BEFORE spec**: Read CLAUDE.md to understand existing architecture
- **BEFORE plan**: Check docs for existing modules/utilities to reuse
- **BEFORE tasks**: Verify docs for implementation patterns
- **AFTER completion**: UPDATE docs with new utilities/patterns

**Prevention of Duplication**:
- Check if utility already exists before creating new one
- Verify reusable components exist
- Check for existing test helpers

### XVII. Static Imports ONLY (NON-NEGOTIABLE)

**ABSOLUTE PROHIBITION**: All imports MUST be static `import` statements at the top of files. Dynamic `import()` calls are COMPLETELY FORBIDDEN in application code.

### What is FORBIDDEN:

```typescript
// FORBIDDEN
const module = await import('./module');
const { something } = await import('package');
lazy(() => import('./Component'));
import('./chunk').then(m => m.default);
```

### What is REQUIRED:

```typescript
// REQUIRED
import { something } from './module';
import { Component } from './Component';
import defaultExport from 'package';
```

### ONLY Acceptable Exception:

```typescript
// ONLY in test files, inside vi.mock():
vi.mock('./store', async () => {
  const actual = await vi.importActual('./store');
  return { ...actual, mockedFn: vi.fn() };
});
```

### XVIII. Honest Completion (Anti-Cheating) (NON-NEGOTIABLE)

**CRITICAL**: Features are only complete when ALL requirements are genuinely met.

**Definition of "Done"**:
- ALL acceptance criteria met
- Tests at spec thresholds (not weakened to pass)
- No placeholders or TODOs in deliverables
- Performance targets measured and verified

**Forbidden Patterns**:
- Relaxing test thresholds to pass
- Placeholder values marked "needs proper design"
- Removing scope without explicit declaration
- Saying "tests pass" when tests were weakened
- Claiming completion with unimplemented requirements

### XIX. Quality Gates (NON-NEGOTIABLE)

**CRITICAL**: Three mandatory quality gate commands MUST pass before ANY spec can be declared complete.

**Required Commands** (ALL MUST pass with zero errors and zero warnings):

1. **CSS Linting**: `npm run lint:css`
   - Validates all CSS files against Stylelint rules
   - Checks for unknown custom properties

2. **Code Quality**: `npm run check`
   - Runs Biome linting and formatting checks
   - Validates code style consistency

3. **Type Safety**: `npm run typecheck`
   - Runs TypeScript compiler in check mode
   - Verifies all types are correct

**Enforcement**:
- ALL three commands MUST be run at spec completion
- ALL errors MUST be fixed before spec can be marked complete
- ALL warnings MUST be fixed before spec can be marked complete
- NO exceptions - even "pre-existing" issues MUST be resolved

### XX. GUI Domain Requirements (If Applicable)

- **Visual Fidelity**: UI must accurately represent underlying data structures
- **Undo/Redo**: All user actions that modify data MUST be undoable
- **Real-time Feedback**: Visual changes reflect immediately upon user interaction
- **Data Integrity**: Editing operations never corrupt underlying data

### XXI. Testing Guide Reference (NON-NEGOTIABLE)

**CRITICAL**: Before ANY task involving unit tests, MUST ensure `specs/TESTING-GUIDE.md` is in context.

**Mandatory Consultation**:
- **BEFORE spec/plan/tasks with tests**: Read `specs/TESTING-GUIDE.md` to understand testing patterns
- **BEFORE writing ANY test code**: Verify testing patterns and helpers from guide
- **DURING test implementation**: Follow SolidJS-specific patterns from guide
- **AFTER test creation**: Validate tests use centralized helpers (e.g., `testInRoot()`, `useMockDate()`)

**Prevention of Test Anti-Patterns**:
- Check for existing test helpers before creating new ones
- Avoid manual `createRoot()` - use `testInRoot()` helper
- Never use React testing patterns (`act()`, etc.) - use SolidJS patterns
- Always flush microtasks with fake timers (`await Promise.resolve()`)
- Follow mouse event selection pattern (`mouseDown` + `mouseUp`, not `click()`)

**Enforcement**:
- Specs/plans/tasks involving tests MUST include explicit todo item to consult testing guide
- Test code not following guide patterns will be rejected in code review
- "I didn't know about the helper" is NOT acceptable

### XXII. Atomic Task Commits (NON-NEGOTIABLE)

**CRITICAL**: EVERY task MUST end with committing the completed work. The last todo item for EVERY task execution MUST explicitly state that the work will be committed.

**Absolute Requirements**:
- **EVERY task's final todo item** MUST be: "Commit the completed work" (or equivalent explicit commit statement)
- **NO task is complete** until work is committed to version control
- **NEVER skip** the commit step after completing a task
- **ALWAYS make commits atomic** - one logical unit of work per commit

**TodoWrite Tool Requirements**:
- When creating todo lists for tasks, the LAST item MUST ALWAYS be about committing
- Example final todo items:
  - "Commit the implementation"
  - "Commit test and implementation together"
  - "Commit completed feature to version control"
  - "Git commit with descriptive message"

**Enforcement**:
- Agent MUST include explicit commit todo item for EVERY task
- Skipping commit step violates this principle
- Work left uncommitted after task completion is INCOMPLETE work
- Code review will verify commit discipline

**Rationale**:
- Prevents work from being lost or forgotten
- Ensures clear audit trail of changes
- Makes commit boundaries explicit and traceable
- Supports atomic, reviewable units of work
- Prevents accumulation of uncommitted changes

---

## Technology Stack Requirements

### Mandatory Dependencies

**Production**:
- `solid-js`: ^1.9.10 - Core reactive framework

**Development**:
- `typescript`: ^5.9.3 - Type system
- `vite`: ^7.3.1 - Build tool and dev server
- `vite-plugin-solid`: ^2.11.10 - SolidJS Vite plugin
- `vitest`: ^4.0.16 - Testing framework
- `@biomejs/biome`: ^2.3.11 - Linting and formatting
- `stylelint`: ^16.26.1 - CSS linting
- `stylelint-value-no-unknown-custom-properties`: ^6.1.0 - Custom property validation

### Configuration

**TypeScript** (`tsconfig.json`):
- `"strict": true` - Strict mode required
- `"jsx": "preserve"` - Let Vite handle JSX
- `"jsxImportSource": "solid-js"` - SolidJS JSX

**Biome** (`biome.json`):
- Format and lint on save
- Consistent code style across project

**Stylelint** (`.stylelintrc.json`):
- Validate custom properties
- Enforce CSS best practices

---

## Development Workflow

### Feature Development Process

1. **Technical Documentation Consultation**: Read CLAUDE.md
2. **Specification**: Create feature spec using `/speckit.specify`
3. **Planning**: Generate implementation plan using `/speckit.plan`
4. **Clarification**: Use `/speckit.clarify` to resolve underspecified areas
5. **Task Generation**: Generate tasks using `/speckit.tasks`
6. **Test-First Implementation**: For each task:
   - Write failing test(s) first
   - Implement minimum code to pass
   - Refactor while keeping tests green
   - Run quality checks
   - Fix all issues
   - Commit atomically (see **Principle XXII** - MUST be last todo item)
7. **Coverage Verification**: Verify 80% threshold after spec completion
8. **All Tests Passing (BLOCKER)**: Ensure ALL tests pass before completion - failing tests BLOCK declaring spec finished
9. **Quality Gates (BLOCKER)**: Run ALL quality gate commands (lint:css, check, typecheck) - failures BLOCK completion
10. **Update Technical Docs**: Document new utilities/patterns in CLAUDE.md
11. **Review**: Submit PR with all checks passing

### Git Workflow

- **Branch Naming**: `feature/description` or `fix/description`
- **Commit Messages**: Conventional commits format
- **Atomic Commits**: Each commit is complete working unit
- **No Broken Commits**: Never commit failing tests or quality violations

### Code Review Standards

All code reviews MUST verify:
- [ ] Tests written BEFORE implementation
- [ ] Every file has corresponding `.spec.ts` or `.test.ts`
- [ ] All tests passing (EVERY SINGLE TEST)
- [ ] Coverage >= 80% for business logic
- [ ] Quality gates pass (`npm run lint:css`, `npm run check`, `npm run typecheck`)
- [ ] No React patterns used (SolidJS only)
- [ ] CLAUDE.md consulted and updated
- [ ] No duplicate code
- [ ] No unauthorized dependency changes
- [ ] Every task ended with a commit (Principle XXII compliance)

---

## Governance

### Constitutional Authority

This constitution supersedes all other practices. When conflicts arise, this constitution takes precedence.

### Amendment Process

1. **Proposal**: Document change, rationale, impact, migration plan
2. **Review**: Technical lead reviews
3. **Approval**: Requires unanimous approval
4. **Documentation**: Document with version bump
5. **Migration**: Include migration guide for breaking changes

### Versioning Policy

Semantic versioning:
- **MAJOR**: Backward-incompatible changes, principle removals
- **MINOR**: New principles added or expanded
- **PATCH**: Clarifications, wording improvements

### Exceptions

Exceptions are **extremely rare** and require:
1. Written justification
2. Risk assessment and mitigation plan
3. Approval from technical lead
4. Time-bound exception with remediation plan
5. Documentation in exceptions log

**Note**: Security/compliance principles, Zero Failing Tests Policy, Quality Gates, and Atomic Task Commits have **NO exceptions**.

---

**Version**: 1.2.0
**Ratified**: 2026-01-08
**Last Amended**: 2026-01-09
