# Visual-Reactivity Testing Guide

**Vitest 4.x + @solidjs/testing-library 0.8.10** | Updated: 2026-01-09

## Core Principles

1. Test user behavior, not implementation
2. Use centralized helpers from `src/__tests__/helpers` (create as needed)
3. Wrap signal/store tests in `testInRoot()`
4. **Always flush microtasks** with fake timers
5. Cleanup order: `vi.useRealTimers()` → `cleanup()`

## Test Helpers

**CRITICAL**: All test helpers are centralized in `src/__tests__/helpers/`. Always import from this location - DO NOT recreate these helpers in individual test files.

```typescript
// Import from centralized helpers (REQUIRED)
import { testInRoot, useMockDate, flushMicrotasks } from '../helpers';
```

**Available Helpers**:
- `testInRoot()` - Wraps signals/stores in reactive root ([src/__tests__/helpers/solidjs.ts](../src/__tests__/helpers/solidjs.ts))
- `useMockDate()` - Sets up fake timers with date ([src/__tests__/helpers/time.ts](../src/__tests__/helpers/time.ts))
- `flushMicrotasks()` - Flushes microtasks for SolidJS effects ([src/__tests__/helpers/time.ts](../src/__tests__/helpers/time.ts))

**Why Centralized Helpers?**
- Consistent behavior across all tests
- Single source of truth for testing patterns
- Easier to maintain and update
- Prevents duplicated helper code
- Enforced by Constitution Principle XXI

### `testInRoot(testFn)`

**Location**: [src/__tests__/helpers/solidjs.ts](../src/__tests__/helpers/solidjs.ts)

Wraps signal/store tests in `createRoot()` with auto-disposal. Required because SolidJS reactivity needs a reactive root.

**Key Features**:
- Automatically creates and disposes reactive root
- Supports both synchronous and asynchronous test functions
- Handles errors properly (disposes before re-throwing)
- For async tests, disposal happens after Promise resolves

```typescript
// BAD: manual createRoot (DON'T DO THIS)
createRoot(dispose => { /* test */ dispose(); });

// GOOD: use centralized helper (supports sync and async)
import { testInRoot } from '../helpers';

test('updates signal', () => {
  testInRoot(() => {
    const [count, setCount] = createSignal(0);
    setCount(1);
    expect(count()).toBe(1);
  });
});

// Async example
test('async effect', async () => {
  await testInRoot(async () => {
    const [data, setData] = createSignal(null);
    // ... async operations
    await waitFor(() => expect(data()).not.toBeNull());
  });
});
```

**When to Use**:
- ANY test that creates signals (`createSignal`)
- ANY test that creates stores (`createStore`)
- ANY test that creates effects (`createEffect`)
- ANY test that uses SolidJS reactive primitives

### `useMockDate(dateString)`

**Location**: [src/__tests__/helpers/time.ts](../src/__tests__/helpers/time.ts)

Sets up Vitest fake timers with a specific date. Automatically sets up in `beforeEach` and cleans up in `afterEach`.

**Key Features**:
- Configures fake timers to NOT fake `queueMicrotask` (preserves SolidJS reactivity)
- Only fakes: `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`, `Date`
- Automatic cleanup - no manual `vi.useRealTimers()` needed
- Must be called at describe block level (not inside individual tests)

```typescript
import { useMockDate } from '../helpers';

describe('Date calculations', () => {
  useMockDate('2025-01-15T12:00:00Z');

  test('calculates days until due', () => {
    const dueDate = new Date('2025-01-18T12:00:00Z');
    expect(daysUntil(dueDate)).toBe(3);
  });

  test('works across multiple tests', () => {
    expect(new Date().toISOString()).toBe('2025-01-15T12:00:00.000Z');
  });
});
```

**When to Use**:
- Tests that depend on current date/time
- Tests that use timers (`setTimeout`, `setInterval`)
- Tests that need consistent date across multiple test cases

**Important**: This helper is specifically configured for SolidJS - it does NOT fake `queueMicrotask` because SolidJS uses it for effects.

## SolidJS Patterns

### Components & Events

```typescript
import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';

test('button click', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(() => <Button onClick={onClick}>Click</Button>);
  await user.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalled();
});
```

### Effects with `testEffect`

```typescript
import { testEffect } from '@solidjs/testing-library';

test('effect runs on change', () => testEffect(done => {
  const [value, setValue] = createSignal(0);
  createEffect((run: number = 0) => {
    if (run === 0) { setValue(1); }
    else { expect(value()).toBe(1); done(); }
    return run + 1;
  });
}));
```

### Context Providers

```typescript
const { getByText } = render(() => <Consumer />, {
  wrapper: (props) => <MyContext.Provider value="test">{props.children}</MyContext.Provider>
});
```

### Directives

```typescript
import { renderDirective } from '@solidjs/testing-library';

const { setArg } = renderDirective(myDirective, { initialValue: false, targetElement });
setArg(true);
```

### Form Submission

**Important:** Use both `fireEvent.input()` AND `fireEvent.change()` for SolidJS reactivity.

```typescript
fireEvent.input(input, { target: { value: 'test' } });
fireEvent.change(input, { target: { value: 'test' } });
```

## Router Testing (if using @solidjs/router)

MemoryRouter provides isolated router context per test (`useNavigate`, `useLocation`, etc.).

```typescript
import { MemoryRouter, Route } from '@solidjs/router';
import { createMemoryHistory } from '@solidjs/router';

// Render with router
const history = createMemoryHistory();
history.set({ value: '/some-route' });
render(() => (
  <MemoryRouter history={history}>
    <Route path="*" component={MyComponent} />
  </MemoryRouter>
));
```

### Mocking `useNavigate`

Must mock at **module level** (hook called during component init, not render):

```typescript
const mockNavigate = vi.fn();

vi.mock('@solidjs/router', async () => ({
  ...(await vi.importActual<typeof import('@solidjs/router')>('@solidjs/router')),
  useNavigate: vi.fn(() => mockNavigate),
}));

beforeEach(() => mockNavigate.mockClear());
```

### `flushMicrotasks()`

**Location**: [src/__tests__/helpers/time.ts](../src/__tests__/helpers/time.ts)

Flushes the microtask queue. Essential when using fake timers with SolidJS because effects run via `queueMicrotask`.

**Key Features**:
- Simple async helper: `await Promise.resolve()`
- Must be called before AND after advancing timers
- Required for SolidJS effects to run when using fake timers

```typescript
import { flushMicrotasks } from '../helpers';

test('debounced input', async () => {
  vi.useFakeTimers();

  // Your test setup...
  await user.type(input, 'test');

  // Flush BEFORE advancing timers
  await flushMicrotasks();
  await vi.advanceTimersByTimeAsync(300);
  // Flush AFTER advancing timers
  await flushMicrotasks();

  expect(onChange).toHaveBeenCalled();

  vi.useRealTimers();
});
```

**When to Use**:
- ANY test using fake timers with SolidJS effects
- Before and after `vi.advanceTimersByTimeAsync()`
- When effects don't seem to run during timer tests

## Fake Timers & Microtasks

**Critical:** SolidJS uses `queueMicrotask` for effects. Fake timers only control macrotasks (setTimeout). Must flush microtasks explicitly using the `flushMicrotasks()` helper.

```typescript
import { flushMicrotasks } from '../helpers';

describe('Debounced input', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.useRealTimers(); cleanup(); }); // Order matters!

  test('debounce', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(() => <SearchInput onChange={onChange} />);

    await user.type(screen.getByRole('textbox'), 'test');

    await flushMicrotasks();              // Flush microtasks BEFORE
    await vi.advanceTimersByTimeAsync(300);
    await flushMicrotasks();              // Flush microtasks AFTER

    expect(onChange).toHaveBeenCalled();
  });
});
```

**Config tip:** `vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'] })` — avoid faking `queueMicrotask`.

### Event Listener Cleanup

```typescript
createEffect(() => {
  const handler = (e: KeyboardEvent) => { /* ... */ };
  document.addEventListener('keydown', handler);
  onCleanup(() => document.removeEventListener('keydown', handler));
});

// Test cleanup
const spy = vi.spyOn(document, 'removeEventListener');
const { unmount } = render(() => <Component />);
unmount();
expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));
```

## Mouse Event Selection Pattern

**Important:** Selection happens on mouseup. Tests using `fireEvent.click()` may NOT work for selection interactions.

```typescript
// Preferred pattern for selection events
fireEvent.mouseDown(element, { button: 0 });
fireEvent.mouseUp(document);
```

## Anti-Patterns

| Bad | Good | Why |
|-----|------|-----|
| Manual `createRoot(dispose => ...)` | `testInRoot(() => ...)` from helpers | Centralized, handles errors, supports async |
| `await Promise.resolve()` directly | `await flushMicrotasks()` from helpers | Explicit intent, centralized |
| `vi.advanceTimersByTimeAsync()` alone | Wrap with `flushMicrotasks()` before/after | SolidJS effects use microtasks |
| `vi.useRealTimers()` per-test | `useMockDate()` helper at describe level | Auto-cleanup, SolidJS-safe config |
| `afterEach { cleanup(); useRealTimers(); }` | `afterEach { useRealTimers(); cleanup(); }` | Order matters for cleanup |
| `vi.advanceTimersByTime()` with async | `vi.advanceTimersByTimeAsync()` | Async version required for async code |
| Testing implementation details | Test user-visible behavior | Tests should be implementation-agnostic |
| Creating helper in test file | Import from `src/__tests__/helpers` | Single source of truth |

## Quick Reference

| Task | Solution | Import From |
|------|----------|-------------|
| Render component | `render(() => <Component />)` | `@solidjs/testing-library` |
| Test signals/stores | `testInRoot(() => { ... })` | `../helpers` ✅ |
| Mock dates | `useMockDate('2025-01-15T12:00:00Z')` | `../helpers` ✅ |
| Flush microtasks | `await flushMicrotasks()` | `../helpers` ✅ |
| Test effects | `testEffect(done => { createEffect(...); done(); })` | `@solidjs/testing-library` |
| Test directives | `renderDirective(directive, { initialValue, targetElement })` | `@solidjs/testing-library` |
| Mock useNavigate | Module-level `vi.mock('@solidjs/router', ...)` | `vitest` |
| Form input (SolidJS) | `fireEvent.input()` + `fireEvent.change()` | `@solidjs/testing-library` |
| Selection events | `fireEvent.mouseDown()` + `fireEvent.mouseUp()` | `@solidjs/testing-library` |

✅ = Use centralized helper from `src/__tests__/helpers` (REQUIRED)

## Centralized Test Helpers (ALREADY IMPLEMENTED)

**Location**: [src/__tests__/helpers/](../src/__tests__/helpers/)

All test helpers are already implemented and ready to use. **DO NOT recreate these helpers** in individual test files.

### Available Files

1. **[solidjs.ts](../src/__tests__/helpers/solidjs.ts)** - SolidJS reactive primitives testing
   - `testInRoot()` - Wraps tests in reactive root with auto-disposal

2. **[time.ts](../src/__tests__/helpers/time.ts)** - Time and date mocking
   - `useMockDate()` - Sets up fake timers with specific date
   - `flushMicrotasks()` - Flushes microtask queue for SolidJS effects

3. **[index.ts](../src/__tests__/helpers/index.ts)** - Barrel export for all helpers
   - Re-exports all helpers for convenient importing

### Usage

```typescript
// Import from centralized location (REQUIRED)
import { testInRoot, useMockDate, flushMicrotasks } from '../helpers';

// Now use in your tests
describe('My Feature', () => {
  useMockDate('2025-01-15T12:00:00Z');

  test('signal updates', () => {
    testInRoot(() => {
      const [count, setCount] = createSignal(0);
      setCount(1);
      expect(count()).toBe(1);
    });
  });

  test('debounced effect', async () => {
    vi.useFakeTimers();

    // ... test setup

    await flushMicrotasks();
    await vi.advanceTimersByTimeAsync(300);
    await flushMicrotasks();

    // ... assertions

    vi.useRealTimers();
  });
});
```

**Constitution Enforcement**: Using these centralized helpers is required by Principle XXI. Test code NOT using these helpers will be rejected in code review.

## References

- [SolidJS Testing](https://docs.solidjs.com/guides/testing) | [@solidjs/testing-library](https://github.com/solidjs/solid-testing-library)
- [Vitest](https://vitest.dev/) | [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [MemoryRouter](https://docs.solidjs.com/solid-router/reference/components/memory-router)
