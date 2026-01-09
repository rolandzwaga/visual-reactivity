import type { Accessor } from "solid-js";
import { createMemo, createSignal } from "solid-js";
import { calculateVisibleRange } from "../../lib/virtualScroller";

/**
 * Parameters for the useVirtualScroll hook.
 */
export interface UseVirtualScrollParams {
	/** Total number of items in the list (reactive accessor) */
	totalItems: Accessor<number>;

	/** Height of each item in pixels (fixed) */
	itemHeight: number;

	/** Number of extra items to render above/below viewport */
	bufferSize: number;
}

/**
 * Visible range result from the hook.
 */
export interface VisibleRange {
	/** Index of first visible item (inclusive) */
	start: number;

	/** Index after last visible item (exclusive) */
	end: number;
}

/**
 * Scroll state managed by the hook.
 */
export interface ScrollState {
	/** Current scroll position in pixels */
	scrollTop: number;

	/** Height of the viewport in pixels */
	viewportHeight: number;
}

/**
 * Return type for useVirtualScroll hook.
 */
export interface UseVirtualScrollReturn {
	/** Current scroll state (reactive) */
	scrollState: Accessor<ScrollState>;

	/** Update scroll position (call from scroll event) */
	onScroll: (scrollTop: number) => void;

	/** Update viewport height (call from resize) */
	setViewportHeight: (height: number) => void;

	/** Get current visible range (reactive) */
	getVisibleRange: () => Accessor<VisibleRange>;
}

/**
 * Default viewport height (used before actual measurement).
 */
const DEFAULT_VIEWPORT_HEIGHT = 600;

/**
 * SolidJS hook for managing virtual scrolling state.
 *
 * Provides reactive scroll state and calculates which items should be
 * rendered based on current scroll position and viewport size.
 *
 * @param params - Hook parameters
 * @returns Virtual scroll state and methods
 */
export function useVirtualScroll(
	params: UseVirtualScrollParams,
): UseVirtualScrollReturn {
	const { totalItems, itemHeight, bufferSize } = params;

	// Reactive scroll state
	const [scrollTop, setScrollTop] = createSignal(0);
	const [viewportHeight, setViewportHeight] = createSignal(
		DEFAULT_VIEWPORT_HEIGHT,
	);

	// Combined scroll state accessor
	const scrollState = createMemo<ScrollState>(() => ({
		scrollTop: scrollTop(),
		viewportHeight: viewportHeight(),
	}));

	// Calculate visible range (memoized for performance)
	const getVisibleRange = () =>
		createMemo<VisibleRange>(() =>
			calculateVisibleRange({
				scrollTop: scrollTop(),
				viewportHeight: viewportHeight(),
				itemHeight,
				totalItems: totalItems(),
				bufferSize,
			}),
		);

	return {
		scrollState,
		onScroll: setScrollTop,
		setViewportHeight,
		getVisibleRange,
	};
}
