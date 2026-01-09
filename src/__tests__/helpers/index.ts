/**
 * Test helper library for Visual-Reactivity
 *
 * Provides utilities for testing SolidJS components and stores.
 * See specs/TESTING-GUIDE.md for usage patterns.
 *
 * @example
 * ```ts
 * import {
 *   testInRoot,
 *   useMockDate,
 *   flushMicrotasks,
 * } from '../helpers';
 * ```
 */

// SolidJS testing utilities
export { testInRoot } from "./solidjs";
// Time mocking utilities
export { flushMicrotasks, useMockDate } from "./time";
