# Visual-Reactivity Development Guidelines

Auto-generated from speckit templates. Last updated: 2026-01-08

---

## CRITICAL: BRANCH WORKFLOW - NEVER COMMIT TO MAIN

```
NEVER COMMIT DIRECTLY TO MAIN BRANCH. ALWAYS USE FEATURE BRANCHES.

BEFORE ANY CODE CHANGE:
1. Check current branch: git branch --show-current
2. If on main, CREATE AND SWITCH to feature branch FIRST
3. VERIFY you are on the feature branch before ANY edit

WORKFLOW:
git checkout -b feature-name    # Create AND switch to branch
git branch --show-current       # VERIFY: must NOT show 'main'
# NOW you can make changes

VIOLATION = POLLUTED MAIN BRANCH. THIS IS IRREVERSIBLE AFTER PUSH.
```

---

## CRITICAL: SOLIDJS ONLY - REACT IS FORBIDDEN

```
THIS IS A SOLIDJS PROJECT. REACT IS ABSOLUTELY FORBIDDEN.

NEVER use: useState, useEffect, useMemo, useCallback, useRef
NEVER import from 'react' or '@types/react'
NEVER use React patterns, lifecycle methods, or virtual DOM concepts

ALWAYS use: createSignal, createEffect, createMemo, createStore
ALWAYS import from 'solid-js' and 'solid-js/store'
ALWAYS use SolidJS fine-grained reactivity patterns

SolidJS components run ONCE. Signals are getter functions: count()
Props are reactive - DO NOT destructure them.
There are NO dependency arrays - tracking is automatic.

VIOLATION = IMMEDIATE CODE REJECTION. NO EXCEPTIONS. ZERO TOLERANCE.
```

---

## CRITICAL: STATIC IMPORTS ONLY - DYNAMIC IMPORTS FORBIDDEN

```
ALWAYS USE STATIC IMPORTS. DYNAMIC IMPORTS ARE ABSOLUTELY FORBIDDEN.

NEVER use: import() for lazy loading
NEVER use: import() for code splitting
NEVER use: import() for conditional imports
NEVER use: await import() anywhere in application code

ALWAYS use: import { x } from 'module' (static imports at top)
ONLY exception: vi.importActual() inside vi.mock() in tests

VIOLATION = IMMEDIATE CODE REJECTION. NO EXCEPTIONS. ZERO TOLERANCE.
```

---

## Active Technologies

**[This section is auto-populated by speckit from feature plans]**

- SolidJS 1.9.10 - Reactive UI framework
- Vite 7.3.1 - Build tool and dev server
- Vitest 4.0.16 - Testing framework
- Biome 2.3.11 - Linting and formatting
- Stylelint 16.26.1 - CSS linting
- TypeScript 5.9.3 - Type system

## Project Structure

```
src/
├── components/       # UI components
├── lib/             # Core utilities and helpers
├── stores/          # SolidJS stores for state management
├── styles/          # Global styles and design tokens
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run check                    # Biome lint and format
npm run lint:css                 # Stylelint CSS
npm run typecheck                # TypeScript type checking
```

## Code Style

### General TypeScript Guidelines

- Use TypeScript with strict mode enabled (`"strict": true`)
- Follow Biome rules for code style
- Prefer functional patterns over imperative
- Use explicit types for function parameters and return values
- Avoid `any` type - use proper type narrowing

### Biome Configuration

- **Indent**: 2 spaces
- **Line width**: 100 characters
- **Quotes**: Single quotes
- **Semicolons**: Always
- **Trailing commas**: ES5 style
- **Arrow parens**: As needed

### Styling Guidelines

- Every component uses CSS Modules (`*.module.css`)
- Import styles: `import styles from './Component.module.css'`
- Reference classes: `class={styles.button}`
- Centralized design tokens in `src/styles/`
- Use CSS custom properties for theming: `var(--color-primary)`
- Never hardcode color values - use design tokens
- All CSS must pass Stylelint checks

### Component Guidelines

- Component file naming: PascalCase (e.g., `Button.tsx`)
- Utility file naming: camelCase (e.g., `formatDate.ts`)
- Co-locate tests with components (e.g., `Button.spec.tsx`)
- Props interface named `[ComponentName]Props`
- Export components as named exports
- Use SolidJS primitives only (createSignal, createEffect, createMemo)

### Testing Guidelines

- Test files use `.spec.ts` or `.spec.tsx` extension
- Test location: Co-located with source files
- Use descriptive test names (Given-When-Then format)
- Mock external dependencies
- Aim for 80%+ code coverage
- Test edge cases and error paths

### Import Organization

```typescript
// 1. External dependencies
import { createSignal, createEffect } from 'solid-js';

// 2. Internal absolute imports (if configured)
import { someUtil } from '~/lib/utils';

// 3. Relative imports
import { Button } from '../Button';
import styles from './Component.module.css';
```

## Utility Modules

**[Document utilities as they are created]**

## State Management

### SolidJS Signals and Stores

Use signals for simple reactive state:

```typescript
const [count, setCount] = createSignal(0);
const [isActive, setIsActive] = createSignal(false);
```

Use stores for complex nested state:

```typescript
import { createStore } from 'solid-js/store';

const [state, setState] = createStore({
  items: [],
  selectedId: null,
});
```

### Global State Pattern

```typescript
// src/stores/exampleStore.ts
const [state, setState] = createStore<ExampleState>(initialState);

export const exampleStore = {
  state,
  doSomething: (value: string) => {
    setState('property', value);
  },
};
```

## Testing Helpers

**[Document helpers as they are created]**

### Rendering Utilities

```typescript
import { render } from '@solidjs/testing-library';

export function renderComponent(component: Component) {
  return render(() => component);
}
```

## Error Handling

### Component Error Boundaries

```typescript
import { ErrorBoundary } from 'solid-js';

<ErrorBoundary fallback={(err) => <ErrorDisplay error={err} />}>
  <RiskyComponent />
</ErrorBoundary>
```

## Performance Guidelines

- Use `createMemo` for computed values that are expensive
- Avoid unnecessary signal reads in JSX (signals are already fine-grained)
- Use `<For>` component for list rendering (optimized keyed updates)
- Implement virtual scrolling for lists with 100+ items

## Accessibility Guidelines

- Follow WCAG 2.1 AA standards
- Ensure keyboard navigation works for all controls
- Use semantic HTML elements
- Include ARIA labels for icon-only buttons
- Maintain 4.5:1 color contrast for text

## Security Guidelines

- Validate all user inputs before processing
- No eval() or dynamic code execution
- Handle malformed data gracefully

## Common Pitfalls

### Type Imports

Always import types from the correct location:

```typescript
// Verify type file location before importing
import type { SomeType } from '../../types/example';
```

### SolidJS Reactivity

```typescript
// Props are reactive - DO NOT destructure
// WRONG
const MyComponent = ({ value }) => <div>{value}</div>;

// CORRECT
const MyComponent = (props) => <div>{props.value}</div>;
```

### Selection Tests Must Use mouseDown + mouseUp

Selection happens on mouseup. Tests using `fireEvent.click()` may NOT work.

```typescript
// Preferred pattern for click events
fireEvent.mouseDown(element, { button: 0 });
fireEvent.mouseUp(document);
```

---

## Common Patterns

### Pattern: Reactive Property Editing

```typescript
const [value, setValue] = createSignal(initialValue);

createEffect(() => {
  // Sync to external store when local value changes
  store.updateProperty(id, 'value', value());
});

return (
  <input
    value={value()}
    onInput={(e) => setValue(e.currentTarget.value)}
  />
);
```

## Recent Changes

**[Track feature additions here]**

---

## Notes for Maintainers

This file is a **living document** that should be updated as:
- New utilities are created
- New patterns are established
- Technology stack changes
- Best practices evolve

**Update frequency**: After each feature is completed

**Sections to maintain**:
- Active Technologies (auto-updated by speckit)
- Utility Modules (add new utilities)
- Common Patterns (document recurring patterns)
- Recent Changes (track feature additions)

<!-- MANUAL ADDITIONS START -->
<!-- Add any project-specific guidelines that don't fit above categories here -->
<!-- MANUAL ADDITIONS END -->
