# Visual-Reactivity Testing Guide

**Vitest 4.x + @solidjs/testing-library 0.8.10** | Updated: 2026-01-09

## Core Principles

1. Test user behavior, not implementation
2. Use centralized helpers from `src/__tests__/helpers` (create as needed)
3. Wrap signal/store tests in `testInRoot()`
4. **Always flush microtasks** with fake timers
5. Cleanup order: `vi.useRealTimers()` → `cleanup()`

## Test Helpers

```typescript
import { testInRoot, useMockDate, flushMicrotasks } from '../helpers';
```

**Import Note:** If your helpers use `@solidjs/router` (which has `.jsx` files), import directly to avoid load errors when Router isn't needed:

```typescript
import { testInRoot } from '../helpers/solidjs';
import { useMockDate, flushMicrotasks } from '../helpers/time';
```

### `testInRoot(testFn)`

Wraps signal/store tests in `createRoot()` with auto-disposal. Required because SolidJS reactivity needs a reactive root.

```typescript
// BAD: manual createRoot
createRoot(dispose => { /* test */ dispose(); });

// GOOD: use helper (supports sync and async)
testInRoot(() => {
  const [count, setCount] = createSignal(0);
  setCount(1);
  expect(count()).toBe(1);
});
```

### `useMockDate(dateString)`

Sets up fake timers with date, auto-cleans in afterEach.

```typescript
describe('Date tests', () => {
  useMockDate('2025-01-15T12:00:00Z');
  test('uses mocked date', () => { /* ... */ });
});
```

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

## Fake Timers & Microtasks

**Critical:** SolidJS uses `queueMicrotask` for effects. Fake timers only control macrotasks (setTimeout). Must flush microtasks explicitly.

```typescript
describe('Debounced input', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.useRealTimers(); cleanup(); }); // Order matters!

  test('debounce', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(() => <SearchInput onChange={onChange} />);

    await user.type(screen.getByRole('textbox'), 'test');

    await Promise.resolve();              // Flush microtasks BEFORE
    await vi.advanceTimersByTimeAsync(300);
    await Promise.resolve();              // Flush microtasks AFTER

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

| Bad | Good |
|-----|------|
| Manual `createRoot(dispose => ...)` | `testInRoot(() => ...)` |
| `vi.advanceTimersByTimeAsync()` alone | Wrap with `await Promise.resolve()` before/after |
| `vi.useRealTimers()` per-test | `useMockDate()` or centralize in `afterEach` |
| `afterEach { cleanup(); useRealTimers(); }` | `afterEach { useRealTimers(); cleanup(); }` |
| `vi.advanceTimersByTime()` with async | `vi.advanceTimersByTimeAsync()` |
| Testing implementation details | Test user-visible behavior |

## Quick Reference

| Task | Solution |
|------|----------|
| Render component | `render(() => <Component />)` |
| Test signals/stores | `testInRoot(() => { ... })` |
| Mock dates | `useMockDate('2025-01-15T12:00:00Z')` |
| Test effects | `testEffect(done => { createEffect(...); done(); })` |
| Test directives | `renderDirective(directive, { initialValue, targetElement })` |
| Mock useNavigate | Module-level `vi.mock('@solidjs/router', ...)` |
| Flush microtasks | `await Promise.resolve()` |
| Form input (SolidJS) | `fireEvent.input()` + `fireEvent.change()` |
| Selection events | `fireEvent.mouseDown()` + `fireEvent.mouseUp()` |

## Test Helper Implementation Examples

Create these helpers in `src/__tests__/helpers/` as needed:

### `helpers/solidjs.ts`

```typescript
import { createRoot } from 'solid-js';

export function testInRoot<T>(fn: () => T): T {
  let result: T;
  createRoot(dispose => {
    result = fn();
    dispose();
  });
  return result!;
}
```

### `helpers/time.ts`

```typescript
import { afterEach, beforeEach, vi } from 'vitest';

export function useMockDate(dateString: string) {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(dateString));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
}

export async function flushMicrotasks() {
  await Promise.resolve();
}
```

## References

- [SolidJS Testing](https://docs.solidjs.com/guides/testing) | [@solidjs/testing-library](https://github.com/solidjs/solid-testing-library)
- [Vitest](https://vitest.dev/) | [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [MemoryRouter](https://docs.solidjs.com/solid-router/reference/components/memory-router)
