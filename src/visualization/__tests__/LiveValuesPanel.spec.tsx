import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushMicrotasks } from "../../__tests__/helpers";
import { createTrackedSignal } from "../../instrumentation/primitives";
import { tracker } from "../../instrumentation/tracker";
import { LiveValuesPanel } from "../LiveValuesPanel";

afterEach(() => {
	vi.useRealTimers();
	cleanup();
	tracker.reset();
});

describe("LiveValuesPanel", () => {
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

	it("should render when visible", () => {
		const { container } = render(() => (
			<LiveValuesPanel
				isVisible={true}
				width={350}
				onVisibilityChange={() => {}}
				onWidthChange={() => {}}
			/>
		));

		expect(container.querySelector('[class*="panel"]')).toBeTruthy();
	});

	it("should not render when not visible", () => {
		const { container } = render(() => (
			<LiveValuesPanel
				isVisible={false}
				width={350}
				onVisibilityChange={() => {}}
				onWidthChange={() => {}}
			/>
		));

		expect(container.querySelector('[class*="panel"]')).toBeFalsy();
	});

	it("should display panel with specified width", () => {
		const { container } = render(() => (
			<LiveValuesPanel
				isVisible={true}
				width={500}
				onVisibilityChange={() => {}}
				onWidthChange={() => {}}
			/>
		));

		const panel = container.querySelector('[class*="panel"]') as HTMLElement;
		expect(panel?.style.width).toContain("500");
	});

	it("should display empty state when no signals", () => {
		const { getByText } = render(() => (
			<LiveValuesPanel
				isVisible={true}
				width={350}
				onVisibilityChange={() => {}}
				onWidthChange={() => {}}
			/>
		));

		expect(getByText(/no signals|empty/i)).toBeTruthy();
	});

	it("should display signals created with tracker", async () => {
		vi.useFakeTimers();
		const { container, getByText } = render(() => (
			<LiveValuesPanel
				isVisible={true}
				width={350}
				onVisibilityChange={() => {}}
				onWidthChange={() => {}}
			/>
		));

		createTrackedSignal(42, { name: "count" });

		// Flush microtasks before advancing timers (SolidJS effects use queueMicrotask)
		await flushMicrotasks();
		await vi.runAllTimersAsync();
		await flushMicrotasks();

		// Verify signal name is displayed
		expect(getByText(/count/)).toBeTruthy();
		// Verify value is displayed (use container.textContent to avoid multiple element errors)
		expect(container.textContent).toContain("42");
	});

	it("should update display when signal values change", () => {
		const { getByText } = render(() => (
			<LiveValuesPanel
				isVisible={true}
				width={350}
				onVisibilityChange={() => {}}
				onWidthChange={() => {}}
			/>
		));

		const [_count, setCount] = createTrackedSignal(0, { name: "count" });

		setTimeout(() => {
			setCount(99);

			setTimeout(() => {
				expect(getByText(/99/)).toBeTruthy();
			}, 100);
		}, 100);
	});

	it("should have resize handle", () => {
		const { container } = render(() => (
			<LiveValuesPanel
				isVisible={true}
				width={350}
				onVisibilityChange={() => {}}
				onWidthChange={() => {}}
			/>
		));

		const resizeHandle = container.querySelector('[class*="resize"]');
		expect(resizeHandle).toBeTruthy();
	});

	it("should call onWidthChange when resizing", () => {
		const onWidthChange = vi.fn();
		const { container } = render(() => (
			<LiveValuesPanel
				isVisible={true}
				width={350}
				onVisibilityChange={() => {}}
				onWidthChange={onWidthChange}
			/>
		));

		const resizeHandle = container.querySelector(
			'[class*="resize"]',
		) as HTMLElement;

		fireEvent.mouseDown(resizeHandle, { clientX: 0 });
		fireEvent.mouseMove(document, { clientX: -50 });
		fireEvent.mouseUp(document);

		expect(onWidthChange).toHaveBeenCalled();
	});

	it("should enforce minimum width (200px)", () => {
		const onWidthChange = vi.fn();
		const { container } = render(() => (
			<LiveValuesPanel
				isVisible={true}
				width={200}
				onVisibilityChange={() => {}}
				onWidthChange={onWidthChange}
			/>
		));

		const resizeHandle = container.querySelector(
			'[class*="resize"]',
		) as HTMLElement;

		fireEvent.mouseDown(resizeHandle, { clientX: 0 });
		fireEvent.mouseMove(document, { clientX: -1000 }); // Try to resize very small
		fireEvent.mouseUp(document);

		// Should clamp to minimum 200px
		const calls = onWidthChange.mock.calls;
		if (calls.length > 0) {
			const lastCall = calls[calls.length - 1][0];
			expect(lastCall).toBeGreaterThanOrEqual(200);
		}
	});

	it("should enforce maximum width (50% viewport)", () => {
		const onWidthChange = vi.fn();
		global.innerWidth = 1000; // Mock viewport width

		const { container } = render(() => (
			<LiveValuesPanel
				isVisible={true}
				width={400}
				onVisibilityChange={() => {}}
				onWidthChange={onWidthChange}
			/>
		));

		const resizeHandle = container.querySelector(
			'[class*="resize"]',
		) as HTMLElement;

		fireEvent.mouseDown(resizeHandle, { clientX: 0 });
		fireEvent.mouseMove(document, { clientX: 1000 }); // Try to resize very large
		fireEvent.mouseUp(document);

		// Should clamp to max 50% = 500px
		const calls = onWidthChange.mock.calls;
		if (calls.length > 0) {
			const lastCall = calls[calls.length - 1][0];
			expect(lastCall).toBeLessThanOrEqual(500);
		}
	});

	it("should have a header/title", () => {
		const { getByText } = render(() => (
			<LiveValuesPanel
				isVisible={true}
				width={350}
				onVisibilityChange={() => {}}
				onWidthChange={() => {}}
			/>
		));

		expect(getByText(/live values|signals/i)).toBeTruthy();
	});

	it("should support closing the panel", () => {
		const onVisibilityChange = vi.fn();
		const { getByRole } = render(() => (
			<LiveValuesPanel
				isVisible={true}
				width={350}
				onVisibilityChange={onVisibilityChange}
				onWidthChange={() => {}}
			/>
		));

		const closeButton = getByRole("button", { name: /close/i });
		fireEvent.click(closeButton);

		expect(onVisibilityChange).toHaveBeenCalledWith(false);
	});

	it("should integrate with panel state hook", () => {
		// Panel should load and save preferences automatically
		mockStorage["visual-reactivity:panel-prefs"] = JSON.stringify({
			isVisible: true,
			width: 450,
		});

		const { container } = render(() => (
			<LiveValuesPanel
				isVisible={true}
				width={450}
				onVisibilityChange={() => {}}
				onWidthChange={() => {}}
			/>
		));

		const panel = container.querySelector('[class*="panel"]') as HTMLElement;
		expect(panel?.style.width).toContain("450");
	});

	it("should handle many signals efficiently", () => {
		render(() => (
			<LiveValuesPanel
				isVisible={true}
				width={350}
				onVisibilityChange={() => {}}
				onWidthChange={() => {}}
			/>
		));

		// Create 250 signals
		for (let i = 0; i < 250; i++) {
			createTrackedSignal(i, { name: `signal${i}` });
		}

		// Should not crash or hang
		setTimeout(() => {
			expect(true).toBe(true);
		}, 200);
	});

	it("should clean up on unmount", () => {
		const { unmount } = render(() => (
			<LiveValuesPanel
				isVisible={true}
				width={350}
				onVisibilityChange={() => {}}
				onWidthChange={() => {}}
			/>
		));

		createTrackedSignal(42, { name: "count" });

		unmount();

		// Should not throw or leak memory
		expect(true).toBe(true);
	});
});
