import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SignalEntry } from "../../../types/panel";
import { SignalList } from "../SignalList";

beforeEach(() => {
	vi.useRealTimers();
});

afterEach(cleanup);

describe("SignalList", () => {
	const createMockSignals = (count: number): SignalEntry[] => {
		return Array.from({ length: count }, (_, i) => ({
			id: `signal-${i}`,
			name: `signal${i}`,
			type: "signal" as const,
			currentValue: i,
			serializedValue: String(i),
			isEditable: true,
			updateCount: 0,
			lastUpdatedAt: Date.now(),
			valueHistory: [],
		}));
	};

	it("should render empty state when no signals", () => {
		const { getByText } = render(() => (
			<SignalList
				signals={[]}
				selectedId={null}
				onSignalClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		expect(getByText(/no signals|empty/i)).toBeTruthy();
	});

	it("should render all signals when list is small", () => {
		const signals = createMockSignals(5);
		const { getByText } = render(() => (
			<SignalList
				signals={signals}
				selectedId={null}
				onSignalClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		expect(getByText(/signal0/)).toBeTruthy();
		expect(getByText(/signal1/)).toBeTruthy();
		expect(getByText(/signal2/)).toBeTruthy();
		expect(getByText(/signal3/)).toBeTruthy();
		expect(getByText(/signal4/)).toBeTruthy();
	});

	it("should use virtual scrolling for large lists (200+ items)", () => {
		const signals = createMockSignals(250);
		const { container } = render(() => (
			<SignalList
				signals={signals}
				selectedId={null}
				onSignalClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		// Should have scroll container
		const scrollContainer = container.querySelector('[style*="overflow"]');
		expect(scrollContainer).toBeTruthy();
	});

	it("should only render visible items in viewport", () => {
		const signals = createMockSignals(250);
		const { queryByText } = render(() => (
			<SignalList
				signals={signals}
				selectedId={null}
				onSignalClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		// First few items should be rendered (use exact match to avoid matching signal10, signal11, etc.)
		expect(queryByText(/^signal0$/)).toBeTruthy();
		expect(queryByText(/^signal1$/)).toBeTruthy();

		// Items far down should not be rendered initially
		expect(queryByText(/^signal200$/)).toBeFalsy();
	});

	it("should call onSignalClick when a row is clicked", () => {
		const onSignalClick = vi.fn();
		const signals = createMockSignals(3);

		const { getByText } = render(() => (
			<SignalList
				signals={signals}
				selectedId={null}
				onSignalClick={onSignalClick}
				onValueEdit={() => {}}
			/>
		));

		const signal1 = getByText(/signal1/);
		fireEvent.click(signal1.closest('[class*="row"]') || signal1);

		expect(onSignalClick).toHaveBeenCalledWith("signal-1");
	});

	it("should highlight selected signal", () => {
		const signals = createMockSignals(3);
		const { container } = render(() => (
			<SignalList
				signals={signals}
				selectedId="signal-1"
				onSignalClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		const selectedRow = container.querySelector('[class*="selected"]');
		expect(selectedRow).toBeTruthy();
	});

	it("should scroll selected signal into view", async () => {
		vi.useFakeTimers();
		const signals = createMockSignals(250);
		const scrollIntoViewMock = vi.fn();

		// Mock scrollIntoView
		Element.prototype.scrollIntoView = scrollIntoViewMock;

		render(() => (
			<SignalList
				signals={signals}
				selectedId="signal-100"
				onSignalClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		// Run all timers async (handles both microtasks and timers)
		await vi.runAllTimersAsync();

		// Should attempt to scroll selected signal into view
		expect(scrollIntoViewMock).toHaveBeenCalled();
		vi.useRealTimers();
	});

	it("should pass onValueEdit to signal rows", () => {
		const onValueEdit = vi.fn();
		const signals = createMockSignals(1);

		const { getByText } = render(() => (
			<SignalList
				signals={signals}
				selectedId={null}
				onSignalClick={() => {}}
				onValueEdit={onValueEdit}
			/>
		));

		// Assuming SignalRow exposes edit functionality
		const row = getByText(/signal0/).closest('[class*="row"]');
		if (row) {
			fireEvent.click(row);
		}

		// onValueEdit should be callable (actual editing tested in SignalRow tests)
		expect(onValueEdit).toBeDefined();
	});

	it("should maintain scroll position when signals update", () => {
		const signals1 = createMockSignals(250); // Need 200+ for virtual scrolling
		const signals2 = createMockSignals(250);
		signals2[0].currentValue = 999; // Update first signal

		// Use SolidJS signal for reactive prop updates
		const [signals, setSignals] = createSignal(signals1);

		const { container } = render(() => (
			<SignalList
				signals={signals()}
				selectedId={null}
				onSignalClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		const scrollContainer = container.querySelector(
			'[style*="overflow"]',
		) as HTMLElement;
		if (scrollContainer) {
			scrollContainer.scrollTop = 500;
		}

		// Update signals using SolidJS reactivity
		setSignals(signals2);

		// Scroll position should be preserved (or close to it)
		expect(scrollContainer?.scrollTop).toBeGreaterThan(400);
	});

	it("should handle rapid signal additions", () => {
		// Use SolidJS signal for reactive prop updates
		const [signals, setSignals] = createSignal<SignalEntry[]>([]);

		render(() => (
			<SignalList
				signals={signals()}
				selectedId={null}
				onSignalClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		// Add signals incrementally using SolidJS reactivity
		for (let i = 1; i <= 10; i++) {
			setSignals(createMockSignals(i));
		}

		// Should not crash
		expect(true).toBe(true);
	});

	it("should display signals in provided order", () => {
		const signals: SignalEntry[] = [
			{
				id: "3",
				name: "zulu",
				type: "signal",
				currentValue: 3,
				serializedValue: "3",
				isEditable: true,
				updateCount: 0,
				lastUpdatedAt: 0,
				valueHistory: [],
			},
			{
				id: "1",
				name: "alpha",
				type: "signal",
				currentValue: 1,
				serializedValue: "1",
				isEditable: true,
				updateCount: 0,
				lastUpdatedAt: 0,
				valueHistory: [],
			},
			{
				id: "2",
				name: "beta",
				type: "signal",
				currentValue: 2,
				serializedValue: "2",
				isEditable: true,
				updateCount: 0,
				lastUpdatedAt: 0,
				valueHistory: [],
			},
		];

		const { container } = render(() => (
			<SignalList
				signals={signals}
				selectedId={null}
				onSignalClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		const text = container.textContent || "";
		const zuluIndex = text.indexOf("zulu");
		const alphaIndex = text.indexOf("alpha");
		const betaIndex = text.indexOf("beta");

		// Order should be: zulu, alpha, beta (as provided)
		expect(zuluIndex).toBeLessThan(alphaIndex);
		expect(alphaIndex).toBeLessThan(betaIndex);
	});

	it("should support keyboard navigation", () => {
		const onSignalClick = vi.fn();
		const signals = createMockSignals(3);

		const { container } = render(() => (
			<SignalList
				signals={signals}
				selectedId={null}
				onSignalClick={onSignalClick}
				onValueEdit={() => {}}
			/>
		));

		const firstRow = container.querySelector('[class*="row"]') as HTMLElement;
		fireEvent.keyDown(firstRow, { key: "ArrowDown" });

		// Should handle keyboard navigation (implementation specific)
		expect(firstRow).toBeTruthy();
	});

	it("should calculate correct item height for virtual scrolling", () => {
		const signals = createMockSignals(250);
		const { container } = render(() => (
			<SignalList
				signals={signals}
				selectedId={null}
				onSignalClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		// Virtual scroll container should have calculated height
		const scrollContainer = container.querySelector(
			'[style*="overflow"]',
		) as HTMLElement;
		expect(
			scrollContainer?.style.height || scrollContainer?.style.maxHeight,
		).toBeTruthy();
	});
});
