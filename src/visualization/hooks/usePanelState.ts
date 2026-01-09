import type { Accessor } from "solid-js";
import { createEffect, createSignal } from "solid-js";
import {
	loadPanelPreferences,
	savePanelPreferences,
} from "../../stores/panelStore";
import type { PanelPreferences, UsePanelStateReturn } from "../../types/panel";

/**
 * Hook for managing Live Values Panel state and preferences.
 *
 * Provides reactive panel preferences (visibility, width) with automatic
 * localStorage persistence. Changes are saved immediately.
 *
 * @returns Panel state management methods
 */
export function usePanelState(): UsePanelStateReturn {
	// Load initial preferences from localStorage
	const initialPrefs = loadPanelPreferences();

	// Reactive preferences signal
	const [preferences, setPreferences] =
		createSignal<PanelPreferences>(initialPrefs);

	// Save to localStorage whenever preferences change
	createEffect(() => {
		const prefs = preferences();
		savePanelPreferences(prefs);
	});

	/**
	 * Update visibility state.
	 */
	const setIsVisible = (isVisible: boolean) => {
		setPreferences((prev) => ({ ...prev, isVisible }));
	};

	/**
	 * Update panel width (validates and clamps to bounds).
	 */
	const setWidth = (width: number) => {
		// Clamp to valid range (panelStore will validate again, but we do it here for immediate feedback)
		const MIN_WIDTH = 200;
		const MAX_WIDTH = 2000;

		let clampedWidth = width;
		if (Number.isNaN(width) || !Number.isFinite(width)) {
			clampedWidth = 350; // Default
		} else if (width < MIN_WIDTH) {
			clampedWidth = MIN_WIDTH;
		} else if (width > MAX_WIDTH) {
			clampedWidth = MAX_WIDTH;
		}

		setPreferences((prev) => ({ ...prev, width: clampedWidth }));
	};

	/**
	 * Toggle visibility (for keyboard shortcut).
	 */
	const toggleVisibility = () => {
		setPreferences((prev) => ({ ...prev, isVisible: !prev.isVisible }));
	};

	return {
		preferences: preferences as Accessor<PanelPreferences>,
		setIsVisible,
		setWidth,
		toggleVisibility,
	};
}
