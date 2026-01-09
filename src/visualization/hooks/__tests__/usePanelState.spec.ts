import { createRoot } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePanelState } from "../usePanelState";

describe("usePanelState", () => {
	// Mock localStorage
	let mockStorage: Record<string, string> = {};

	beforeEach(() => {
		mockStorage = {};
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

	it("should initialize with default preferences from localStorage", () => {
		createRoot((dispose) => {
			const { preferences } = usePanelState();

			expect(preferences().isVisible).toBe(false);
			expect(preferences().width).toBe(350);

			dispose();
		});
	});

	it("should load saved preferences from localStorage", () => {
		mockStorage["visual-reactivity:panel-prefs"] = JSON.stringify({
			isVisible: true,
			width: 400,
		});

		createRoot((dispose) => {
			const { preferences } = usePanelState();

			expect(preferences().isVisible).toBe(true);
			expect(preferences().width).toBe(400);

			dispose();
		});
	});

	it("should update visibility and persist to localStorage", async () => {
		vi.useFakeTimers();
		await createRoot(async (dispose) => {
			const { preferences, setIsVisible } = usePanelState();

			expect(preferences().isVisible).toBe(false);

			setIsVisible(true);

			expect(preferences().isVisible).toBe(true);

			// createEffect runs asynchronously - advance timers
			await vi.runAllTimersAsync();

			const stored = mockStorage["visual-reactivity:panel-prefs"];
			expect(stored).toBeTruthy();
			expect(stored).toContain('"isVisible":true');
			dispose();
		});
		vi.useRealTimers();
	});

	it("should update width and persist to localStorage", async () => {
		vi.useFakeTimers();
		await createRoot(async (dispose) => {
			const { preferences, setWidth } = usePanelState();

			expect(preferences().width).toBe(350);

			setWidth(500);

			expect(preferences().width).toBe(500);

			// createEffect runs asynchronously - advance timers
			await vi.runAllTimersAsync();

			const stored = mockStorage["visual-reactivity:panel-prefs"];
			expect(stored).toBeTruthy();
			expect(stored).toContain('"width":500');
			dispose();
		});
		vi.useRealTimers();
	});

	it("should clamp width to minimum (200px)", () => {
		createRoot((dispose) => {
			const { preferences, setWidth } = usePanelState();

			setWidth(100);

			expect(preferences().width).toBe(200);

			dispose();
		});
	});

	it("should clamp width to maximum (2000px)", () => {
		createRoot((dispose) => {
			const { preferences, setWidth } = usePanelState();

			setWidth(5000);

			expect(preferences().width).toBe(2000);

			dispose();
		});
	});

	it("should toggle visibility with toggleVisibility", () => {
		createRoot((dispose) => {
			const { preferences, toggleVisibility } = usePanelState();

			expect(preferences().isVisible).toBe(false);

			toggleVisibility();
			expect(preferences().isVisible).toBe(true);

			toggleVisibility();
			expect(preferences().isVisible).toBe(false);

			dispose();
		});
	});

	it("should persist preferences after multiple updates", async () => {
		vi.useFakeTimers();
		await createRoot(async (dispose) => {
			const { setIsVisible, setWidth } = usePanelState();

			setIsVisible(true);
			setWidth(450);

			// createEffect runs asynchronously - advance timers
			await vi.runAllTimersAsync();

			const stored = mockStorage["visual-reactivity:panel-prefs"];
			expect(stored).toBeTruthy();
			const saved = JSON.parse(stored);
			expect(saved.isVisible).toBe(true);
			expect(saved.width).toBe(450);
			dispose();
		});
		vi.useRealTimers();
	});

	it("should handle localStorage errors gracefully", () => {
		global.localStorage.setItem = vi.fn(() => {
			throw new Error("QuotaExceededError");
		});

		createRoot((dispose) => {
			const { setIsVisible } = usePanelState();

			// Should not throw
			expect(() => setIsVisible(true)).not.toThrow();

			dispose();
		});
	});

	it("should provide reactive preferences signal", () => {
		createRoot((dispose) => {
			const { preferences, setWidth } = usePanelState();

			const initialWidth = preferences().width;
			expect(initialWidth).toBe(350);

			setWidth(400);

			const updatedWidth = preferences().width;
			expect(updatedWidth).toBe(400);

			dispose();
		});
	});
});
