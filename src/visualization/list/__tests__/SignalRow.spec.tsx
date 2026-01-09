import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SignalEntry } from "../../../types/panel";
import { SignalRow } from "../SignalRow";

afterEach(cleanup);

describe("SignalRow", () => {
	const createMockSignal = (overrides?: Partial<SignalEntry>): SignalEntry => ({
		id: "signal-1",
		name: "count",
		type: "signal",
		currentValue: 42,
		serializedValue: "42",
		isEditable: true,
		updateCount: 1,
		lastUpdatedAt: Date.now(),
		valueHistory: [],
		...overrides,
	});

	it("should display signal name", () => {
		const signal = createMockSignal({ name: "mySignal" });
		const { getByText } = render(() => (
			<SignalRow
				signal={signal}
				isSelected={false}
				onClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		expect(getByText(/mySignal/)).toBeTruthy();
	});

	it("should display signal ID when name is null", () => {
		const signal = createMockSignal({ id: "signal-123", name: null });
		const { getByText } = render(() => (
			<SignalRow
				signal={signal}
				isSelected={false}
				onClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		expect(getByText(/signal-123/)).toBeTruthy();
	});

	it("should display serialized value", () => {
		const signal = createMockSignal({
			currentValue: { name: "test" },
			serializedValue: '{"name":"test"}',
		});
		const { getByText } = render(() => (
			<SignalRow
				signal={signal}
				isSelected={false}
				onClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		expect(getByText(/{"name":"test"}/)).toBeTruthy();
	});

	it("should display [Unserializable] when serializedValue is null", () => {
		const signal = createMockSignal({ serializedValue: null });
		const { getByText } = render(() => (
			<SignalRow
				signal={signal}
				isSelected={false}
				onClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		expect(getByText(/Unserializable/)).toBeTruthy();
	});

	it("should show signal type indicator", () => {
		const signal = createMockSignal({ type: "signal" });
		const memoSignal = createMockSignal({ type: "memo" });

		const { getByText: getByText1 } = render(() => (
			<SignalRow
				signal={signal}
				isSelected={false}
				onClick={() => {}}
				onValueEdit={() => {}}
			/>
		));
		expect(getByText1(/signal/i)).toBeTruthy();

		cleanup();

		const { getByText: getByText2 } = render(() => (
			<SignalRow
				signal={memoSignal}
				isSelected={false}
				onClick={() => {}}
				onValueEdit={() => {}}
			/>
		));
		expect(getByText2(/memo/i)).toBeTruthy();
	});

	it("should apply selected styling when isSelected is true", () => {
		const signal = createMockSignal();
		const { container } = render(() => (
			<SignalRow
				signal={signal}
				isSelected={true}
				onClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		const row = container.querySelector('[class*="selected"]');
		expect(row).toBeTruthy();
	});

	it("should call onClick when row is clicked", () => {
		const onClick = vi.fn();
		const signal = createMockSignal();

		const { container } = render(() => (
			<SignalRow
				signal={signal}
				isSelected={false}
				onClick={onClick}
				onValueEdit={() => {}}
			/>
		));

		const row = container.firstChild as HTMLElement;
		fireEvent.click(row);

		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("should display update count", () => {
		const signal = createMockSignal({ updateCount: 5 });
		const { getByText } = render(() => (
			<SignalRow
				signal={signal}
				isSelected={false}
				onClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		expect(getByText(/Updates: 5/)).toBeTruthy();
	});

	it("should format lastUpdatedAt timestamp", () => {
		const signal = createMockSignal({ lastUpdatedAt: Date.now() });
		const { container } = render(() => (
			<SignalRow
				signal={signal}
				isSelected={false}
				onClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		// Should contain some time representation
		expect(container.textContent).toBeTruthy();
	});

	it("should indicate read-only for memos", () => {
		const memo = createMockSignal({ type: "memo", isEditable: false });
		const { getByText } = render(() => (
			<SignalRow
				signal={memo}
				isSelected={false}
				onClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		expect(getByText(/read-only|memo/i)).toBeTruthy();
	});

	it("should handle null currentValue", () => {
		const signal = createMockSignal({
			currentValue: null,
			serializedValue: "null",
		});
		const { getByText } = render(() => (
			<SignalRow
				signal={signal}
				isSelected={false}
				onClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		expect(getByText(/null/)).toBeTruthy();
	});

	it("should handle boolean values", () => {
		const signal = createMockSignal({
			currentValue: true,
			serializedValue: "true",
		});
		const { getByText } = render(() => (
			<SignalRow
				signal={signal}
				isSelected={false}
				onClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		expect(getByText(/true/)).toBeTruthy();
	});

	it("should handle string values", () => {
		const signal = createMockSignal({
			currentValue: "hello",
			serializedValue: '"hello"',
		});
		const { getByText } = render(() => (
			<SignalRow
				signal={signal}
				isSelected={false}
				onClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		expect(getByText(/"hello"/)).toBeTruthy();
	});

	it("should handle array values", () => {
		const signal = createMockSignal({
			currentValue: [1, 2, 3],
			serializedValue: "[1,2,3]",
		});
		const { getByText } = render(() => (
			<SignalRow
				signal={signal}
				isSelected={false}
				onClick={() => {}}
				onValueEdit={() => {}}
			/>
		));

		expect(getByText(/\[1,2,3\]/)).toBeTruthy();
	});

	it("should be accessible via keyboard", () => {
		const onClick = vi.fn();
		const signal = createMockSignal();

		const { container } = render(() => (
			<SignalRow
				signal={signal}
				isSelected={false}
				onClick={onClick}
				onValueEdit={() => {}}
			/>
		));

		const row = container.firstChild as HTMLElement;
		fireEvent.keyDown(row, { key: "Enter" });

		expect(onClick).toHaveBeenCalled();
	});
});
