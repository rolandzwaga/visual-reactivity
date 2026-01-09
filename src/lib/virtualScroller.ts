/**
 * Parameters for calculating the visible range in a virtual scroller.
 */
export interface VisibleRangeParams {
	/** Current scroll position in pixels */
	scrollTop: number;

	/** Height of the viewport in pixels */
	viewportHeight: number;

	/** Height of a single item in pixels */
	itemHeight: number;

	/** Total number of items in the list */
	totalItems: number;

	/** Number of extra items to render above and below the viewport */
	bufferSize: number;
}

/**
 * Result of visible range calculation.
 */
export interface VisibleRange {
	/** Index of the first item to render (inclusive) */
	start: number;

	/** Index after the last item to render (exclusive) */
	end: number;
}

/**
 * Calculates which items should be rendered in a virtual scrolling list.
 *
 * This function determines the visible range of items based on the current
 * scroll position, viewport size, and buffer settings. It ensures indices
 * are clamped to valid bounds [0, totalItems].
 *
 * @param params - The parameters for calculating the visible range
 * @returns The start and end indices of items to render
 */
export function calculateVisibleRange(
	params: VisibleRangeParams,
): VisibleRange {
	const { scrollTop, viewportHeight, itemHeight, totalItems, bufferSize } =
		params;

	// Handle empty list
	if (totalItems === 0) {
		return { start: 0, end: 0 };
	}

	// Calculate the index of the first visible item
	const firstVisibleIndex = Math.floor(scrollTop / itemHeight);

	// Calculate the index of the last visible item
	const lastVisibleIndex = Math.ceil((scrollTop + viewportHeight) / itemHeight);

	// Apply buffer and clamp to valid range
	const start = Math.max(0, firstVisibleIndex - bufferSize);
	const end = Math.min(totalItems, lastVisibleIndex + bufferSize);

	return { start, end };
}
