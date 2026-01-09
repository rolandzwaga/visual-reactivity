import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushMicrotasks, testInRoot } from "../../../__tests__/helpers";
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
		testInRoot(() => {
			const { preferences } = usePanelState();

			expect(preferences().isVisible).toBe(false);
			expect(preferences().width).toBe(350);
		});
	});

	it("should load saved preferences from localStorage", () => {
		mockStorage["visual-reactivity:panel-prefs"] = JSON.stringify({
			isVisible: true,
			width: 400,
		});

		testInRoot(() => {
			const { preferences } = usePanelState();

			expect(preferences().isVisible).toBe(true);
			expect(preferences().width).toBe(400);
		});
	});

	it("should update visibility and persist to localStorage", async () => {
		vi.useFakeTimers();
		await testInRoot(async () => {
			const { preferences, setIsVisible } = usePanelState();

			expect(preferences().isVisible).toBe(false);

			setIsVisible(true);

			expect(preferences().isVisible).toBe(true);

			// createEffect runs asynchronously - flush microtasks and advance timers
			await flushMicrotasks();
			await vi.runAllTimersAsync();
			await flushMicrotasks();

			const stored = mockStorage["visual-reactivity:panel-prefs"];
			expect(stored).toBeTruthy();
			expect(stored).toContain('"isVisible":true');
		});
		vi.useRealTimers();
	});

	it("should update width and persist to localStorage", async () => {
		vi.useFakeTimers();
		await testInRoot(async () => {
			const { preferences, setWidth } = usePanelState();

			expect(preferences().width).toBe(350);

			setWidth(500);

			expect(preferences().width).toBe(500);

			// createEffect runs asynchronously - flush microtasks and advance timers
			await flushMicrotasks();
			await vi.runAllTimersAsync();
			await flushMicrotasks();

			const stored = mockStorage["visual-reactivity:panel-prefs"];
			expect(stored).toBeTruthy();
			expect(stored).toContain('"width":500');
		});
		vi.useRealTimers();
	});

	it("should clamp width to minimum (200px)", () => {
		testInRoot(() => {
			const { preferences, setWidth } = usePanelState();

			setWidth(100);

			expect(preferences().width).toBe(200);
		});
	});

	it("should clamp width to maximum (2000px)", () => {
		testInRoot(() => {
			const { preferences, setWidth } = usePanelState();

			setWidth(5000);

			expect(preferences().width).toBe(2000);
		});
	});

	it("should toggle visibility with toggleVisibility", () => {
		testInRoot(() => {
			const { preferences, toggleVisibility } = usePanelState();

			expect(preferences().isVisible).toBe(false);

			toggleVisibility();
			expect(preferences().isVisible).toBe(true);

			toggleVisibility();
			expect(preferences().isVisible).toBe(false);
		});
	});

	it("should persist preferences after multiple updates", async () => {
		vi.useFakeTimers();
		await testInRoot(async () => {
			const { setIsVisible, setWidth } = usePanelState();

			setIsVisible(true);
			setWidth(450);

			// createEffect runs asynchronously - flush microtasks and advance timers
			await flushMicrotasks();
			await vi.runAllTimersAsync();
			await flushMicrotasks();

			const stored = mockStorage["visual-reactivity:panel-prefs"];
			expect(stored).toBeTruthy();
			const saved = JSON.parse(stored);
			expect(saved.isVisible).toBe(true);
			expect(saved.width).toBe(450);
		});
		vi.useRealTimers();
	});

	it("should handle localStorage errors gracefully", () => {
		global.localStorage.setItem = vi.fn(() => {
			throw new Error("QuotaExceededError");
		});

		testInRoot(() => {
			const { setIsVisible } = usePanelState();

			// Should not throw
			expect(() => setIsVisible(true)).not.toThrow();
		});
	});

	it("should provide reactive preferences signal", () => {
		testInRoot(() => {
			const { preferences, setWidth } = usePanelState();

			const initialWidth = preferences().width;
			expect(initialWidth).toBe(350);

			setWidth(400);

			const updatedWidth = preferences().width;
			expect(updatedWidth).toBe(400);
		});
	});
});
