import type { PanelPreferences } from "../types/panel";

/**
 * localStorage key for panel preferences.
 */
const STORAGE_KEY = "visual-reactivity:panel-prefs";

/**
 * Default panel preferences.
 */
const DEFAULT_PREFERENCES: PanelPreferences = {
	isVisible: false,
	width: 350,
};

/**
 * Constraints for panel width.
 */
const MIN_WIDTH = 200;
const MAX_WIDTH = 2000;

/**
 * Clamps a width value to valid bounds.
 *
 * @param width - The width to clamp
 * @returns The clamped width
 */
function clampWidth(width: number): number {
	// Invalid values return default
	if (Number.isNaN(width) || !Number.isFinite(width)) {
		return DEFAULT_PREFERENCES.width;
	}

	// Clamp to valid range
	if (width < MIN_WIDTH) {
		return MIN_WIDTH;
	}
	if (width > MAX_WIDTH) {
		return MAX_WIDTH;
	}

	return width;
}

/**
 * Validates and normalizes panel preferences.
 *
 * @param prefs - The preferences to validate
 * @returns Validated preferences
 */
function validatePreferences(
	prefs: Partial<PanelPreferences>,
): PanelPreferences {
	return {
		isVisible: Boolean(prefs.isVisible),
		width: clampWidth(prefs.width ?? DEFAULT_PREFERENCES.width),
	};
}

/**
 * Loads panel preferences from localStorage.
 *
 * If localStorage is unavailable, contains invalid data, or fails to read,
 * returns default preferences.
 *
 * @returns Panel preferences
 */
export function loadPanelPreferences(): PanelPreferences {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);

		if (!stored) {
			return { ...DEFAULT_PREFERENCES };
		}

		const parsed = JSON.parse(stored) as Partial<PanelPreferences>;
		return validatePreferences(parsed);
	} catch {
		// localStorage unavailable, quota exceeded, parse error, etc.
		return { ...DEFAULT_PREFERENCES };
	}
}

/**
 * Saves panel preferences to localStorage.
 *
 * Validates preferences before saving. If localStorage is unavailable
 * or fails to write (quota exceeded, private browsing), silently fails.
 *
 * @param prefs - The preferences to save
 */
export function savePanelPreferences(prefs: PanelPreferences): void {
	try {
		const validated = validatePreferences(prefs);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
	} catch {
		// localStorage unavailable, quota exceeded, etc. - silently fail
	}
}
