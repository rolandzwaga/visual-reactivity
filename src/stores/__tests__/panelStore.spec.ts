import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelPreferences } from "../../types/panel";
import { loadPanelPreferences, savePanelPreferences } from "../panelStore";

describe("panelStore", () => {
	const STORAGE_KEY = "visual-reactivity:panel-prefs";

	// Mock localStorage
	let mockStorage: Record<string, string> = {};

	beforeEach(() => {
		mockStorage = {};

		// Mock localStorage methods
		global.localStorage = {
			getItem: vi.fn((key: string) => mockStorage[key] || null),
			setItem: vi.fn((key: string, value: string) => {
				mockStorage[key] = value;
			}),
			removeItem: vi.fn((key: string) => {
				delete mockStorage[key];
			}),
			clear: vi.fn(() => {
				mockStorage = {};
			}),
			key: vi.fn(() => null),
			length: 0,
		};
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("loadPanelPreferences", () => {
		it("should return default preferences when localStorage is empty", () => {
			const prefs = loadPanelPreferences();

			expect(prefs.isVisible).toBe(false);
			expect(prefs.width).toBe(350);
		});

		it("should load saved preferences from localStorage", () => {
			const saved: PanelPreferences = {
				isVisible: true,
				width: 400,
			};

			mockStorage[STORAGE_KEY] = JSON.stringify(saved);

			const loaded = loadPanelPreferences();

			expect(loaded.isVisible).toBe(true);
			expect(loaded.width).toBe(400);
		});

		it("should return defaults if localStorage contains invalid JSON", () => {
			mockStorage[STORAGE_KEY] = "invalid json{";

			const prefs = loadPanelPreferences();

			expect(prefs.isVisible).toBe(false);
			expect(prefs.width).toBe(350);
		});

		it("should return defaults if localStorage getItem throws", () => {
			global.localStorage.getItem = vi.fn(() => {
				throw new Error("Storage unavailable");
			});

			const prefs = loadPanelPreferences();

			expect(prefs.isVisible).toBe(false);
			expect(prefs.width).toBe(350);
		});

		it("should validate loaded width is within bounds", () => {
			const saved: PanelPreferences = {
				isVisible: true,
				width: 100, // Below minimum 200px
			};

			mockStorage[STORAGE_KEY] = JSON.stringify(saved);

			const loaded = loadPanelPreferences();

			// Should clamp to minimum
			expect(loaded.width).toBe(200);
		});

		it("should handle width above maximum", () => {
			const saved: PanelPreferences = {
				isVisible: true,
				width: 5000, // Far above reasonable maximum
			};

			mockStorage[STORAGE_KEY] = JSON.stringify(saved);

			const loaded = loadPanelPreferences();

			// Should use a reasonable maximum (implementation-defined)
			expect(loaded.width).toBeGreaterThanOrEqual(200);
			expect(loaded.width).toBeLessThanOrEqual(2000);
		});

		it("should handle missing fields in stored preferences", () => {
			mockStorage[STORAGE_KEY] = '{"isVisible": true}';

			const loaded = loadPanelPreferences();

			expect(loaded.isVisible).toBe(true);
			expect(loaded.width).toBe(350); // Default width
		});

		it("should handle null values in stored preferences", () => {
			mockStorage[STORAGE_KEY] = '{"isVisible": null, "width": null}';

			const loaded = loadPanelPreferences();

			expect(loaded.isVisible).toBe(false);
			expect(loaded.width).toBe(350);
		});
	});

	describe("savePanelPreferences", () => {
		it("should save preferences to localStorage", () => {
			const prefs: PanelPreferences = {
				isVisible: true,
				width: 400,
			};

			savePanelPreferences(prefs);

			expect(global.localStorage.setItem).toHaveBeenCalledWith(
				STORAGE_KEY,
				JSON.stringify(prefs),
			);
			expect(mockStorage[STORAGE_KEY]).toBe(JSON.stringify(prefs));
		});

		it("should save default preferences", () => {
			const prefs: PanelPreferences = {
				isVisible: false,
				width: 350,
			};

			savePanelPreferences(prefs);

			const saved = JSON.parse(mockStorage[STORAGE_KEY]);
			expect(saved.isVisible).toBe(false);
			expect(saved.width).toBe(350);
		});

		it("should handle localStorage quota exceeded", () => {
			global.localStorage.setItem = vi.fn(() => {
				throw new Error("QuotaExceededError");
			});

			// Should not throw - silently fail
			expect(() =>
				savePanelPreferences({ isVisible: true, width: 400 }),
			).not.toThrow();
		});

		it("should handle localStorage access denied", () => {
			global.localStorage.setItem = vi.fn(() => {
				throw new Error("SecurityError");
			});

			// Should not throw - silently fail
			expect(() =>
				savePanelPreferences({ isVisible: true, width: 400 }),
			).not.toThrow();
		});

		it("should handle saving multiple times", () => {
			savePanelPreferences({ isVisible: true, width: 300 });
			savePanelPreferences({ isVisible: false, width: 500 });

			const loaded = loadPanelPreferences();
			expect(loaded.isVisible).toBe(false);
			expect(loaded.width).toBe(500);
		});

		it("should validate width before saving", () => {
			const prefs: PanelPreferences = {
				isVisible: true,
				width: 150, // Below minimum
			};

			savePanelPreferences(prefs);

			const loaded = loadPanelPreferences();
			expect(loaded.width).toBe(200); // Clamped to minimum
		});

		it("should handle NaN width", () => {
			const prefs: PanelPreferences = {
				isVisible: true,
				width: Number.NaN,
			};

			savePanelPreferences(prefs);

			const loaded = loadPanelPreferences();
			expect(loaded.width).toBe(350); // Default
		});

		it("should handle negative width", () => {
			const prefs: PanelPreferences = {
				isVisible: true,
				width: -100,
			};

			savePanelPreferences(prefs);

			const loaded = loadPanelPreferences();
			expect(loaded.width).toBe(200); // Minimum
		});
	});

	describe("integration", () => {
		it("should persist preferences across save/load cycle", () => {
			const original: PanelPreferences = {
				isVisible: true,
				width: 450,
			};

			savePanelPreferences(original);
			const loaded = loadPanelPreferences();

			expect(loaded).toEqual(original);
		});

		it("should handle rapid save/load operations", () => {
			for (let i = 0; i < 10; i++) {
				savePanelPreferences({ isVisible: i % 2 === 0, width: 300 + i * 10 });
			}

			const loaded = loadPanelPreferences();
			expect(loaded.isVisible).toBe(false); // i=9 is odd (9 % 2 = 1), so false
			expect(loaded.width).toBe(390);
		});
	});
});
