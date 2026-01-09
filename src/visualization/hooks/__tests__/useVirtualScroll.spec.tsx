import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { useVirtualScroll } from "../useVirtualScroll";

afterEach(cleanup);

describe("useVirtualScroll", () => {
	function TestComponent(props: {
		totalItems: number;
		itemHeight: number;
		bufferSize?: number;
	}) {
		const { scrollState, onScroll, setViewportHeight, getVisibleRange } =
			useVirtualScroll({
				totalItems: () => props.totalItems,
				itemHeight: props.itemHeight,
				bufferSize: props.bufferSize ?? 5,
			});

		const range = getVisibleRange();

		return (
			<div>
				<div>Scroll: {scrollState().scrollTop}</div>
				<div>Viewport: {scrollState().viewportHeight}</div>
				<div>Start: {range().start}</div>
				<div>End: {range().end}</div>
				<button onClick={() => setViewportHeight(500)} type="button">
					Set Viewport
				</button>
				<button onClick={() => onScroll(1000)} type="button">
					Scroll
				</button>
			</div>
		);
	}

	it("should initialize with default scroll state", () => {
		const { getByText } = render(() => (
			<TestComponent totalItems={100} itemHeight={50} />
		));

		expect(getByText(/Scroll: 0/)).toBeTruthy();
		expect(getByText(/Viewport: 600/)).toBeTruthy();
	});

	it("should calculate initial visible range", () => {
		const { getByText } = render(() => (
			<TestComponent totalItems={100} itemHeight={50} />
		));

		expect(getByText(/Start: 0/)).toBeTruthy();
		// viewport 600 / itemHeight 50 = 12 items, +5 buffer = 17
		expect(getByText(/End: 17/)).toBeTruthy();
	});

	it("should update scroll position when onScroll is called", () => {
		const { getByText } = render(() => (
			<TestComponent totalItems={100} itemHeight={50} />
		));

		const scrollButton = getByText("Scroll");
		fireEvent.click(scrollButton);

		expect(getByText(/Scroll: 1000/)).toBeTruthy();
	});

	it("should recalculate visible range after scroll", () => {
		const { getByText } = render(() => (
			<TestComponent totalItems={100} itemHeight={50} />
		));

		const scrollButton = getByText("Scroll");
		fireEvent.click(scrollButton);

		// scrollTop 1000 / itemHeight 50 = item 20
		// start: 20 - 5 = 15
		// end: ceil((1000 + 600) / 50) + 5 = 32 + 5 = 37
		expect(getByText(/Start: 15/)).toBeTruthy();
		expect(getByText(/End: 37/)).toBeTruthy();
	});

	it("should update viewport height when setViewportHeight is called", () => {
		const { getByText } = render(() => (
			<TestComponent totalItems={100} itemHeight={50} />
		));

		const setViewportButton = getByText("Set Viewport");
		fireEvent.click(setViewportButton);

		expect(getByText(/Viewport: 500/)).toBeTruthy();
	});

	it("should recalculate visible range after viewport resize", () => {
		const { getByText } = render(() => (
			<TestComponent totalItems={100} itemHeight={50} />
		));

		const setViewportButton = getByText("Set Viewport");
		fireEvent.click(setViewportButton);

		// viewport 500 / itemHeight 50 = 10 items, +5 buffer = 15
		expect(getByText(/End: 15/)).toBeTruthy();
	});

	it("should handle custom buffer size", () => {
		const { getByText } = render(() => (
			<TestComponent totalItems={100} itemHeight={50} bufferSize={10} />
		));

		// viewport 600 / itemHeight 50 = 12 items, +10 buffer = 22
		expect(getByText(/End: 22/)).toBeTruthy();
	});

	it("should handle zero buffer size", () => {
		const { getByText } = render(() => (
			<TestComponent totalItems={100} itemHeight={50} bufferSize={0} />
		));

		// viewport 600 / itemHeight 50 = 12 items, +0 buffer = 12
		expect(getByText(/End: 12/)).toBeTruthy();
	});

	it("should handle reactive totalItems changes", () => {
		const [totalItems, setTotalItems] = createSignal(100);

		function ReactiveTestComponent() {
			const { getVisibleRange } = useVirtualScroll({
				totalItems,
				itemHeight: 50,
				bufferSize: 5,
			});

			const range = getVisibleRange();

			return (
				<div>
					<div>End: {range().end}</div>
					<button onClick={() => setTotalItems(10)} type="button">
						Reduce Items
					</button>
				</div>
			);
		}

		const { getByText } = render(() => <ReactiveTestComponent />);

		expect(getByText(/End: 17/)).toBeTruthy(); // Initial

		const reduceButton = getByText("Reduce Items");
		fireEvent.click(reduceButton);

		// Total items reduced to 10, should clamp end to 10
		expect(getByText(/End: 10/)).toBeTruthy();
	});

	it("should clamp visible range to total items", () => {
		const { getByText } = render(() => (
			<TestComponent totalItems={5} itemHeight={50} />
		));

		expect(getByText(/Start: 0/)).toBeTruthy();
		expect(getByText(/End: 5/)).toBeTruthy();
	});

	it("should handle empty list", () => {
		const { getByText } = render(() => (
			<TestComponent totalItems={0} itemHeight={50} />
		));

		expect(getByText(/Start: 0/)).toBeTruthy();
		expect(getByText(/End: 0/)).toBeTruthy();
	});
});
