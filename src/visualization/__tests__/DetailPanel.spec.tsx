import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { createReactiveNode } from "../../types";
import { DetailPanel } from "../DetailPanel";
import type { DetailPanelData } from "../types";

function createMockPanelData(
	type: "signal" | "memo" | "effect",
	value?: unknown,
): DetailPanelData {
	const node = createReactiveNode(`test-${type}`, type, `My ${type}`, value);
	const sourceNode = createReactiveNode(
		"source-1",
		"signal",
		"Source Signal",
		10,
	);
	const observerNode = createReactiveNode(
		"observer-1",
		"effect",
		"Observer Effect",
		null,
	);

	return {
		node,
		sources: [sourceNode],
		observers: [observerNode],
	};
}

describe("DetailPanel", () => {
	it("renders nothing when data is null", () => {
		const { container } = render(() => (
			<DetailPanel data={null} onClose={() => {}} />
		));

		expect(container.textContent).toBe("");
	});

	it("renders panel when data is provided", () => {
		const data = createMockPanelData("signal", 42);
		const { getByText } = render(() => (
			<DetailPanel data={data} onClose={() => {}} />
		));

		expect(getByText("My signal")).toBeTruthy();
	});

	it("displays node type badge", () => {
		const data = createMockPanelData("signal", 42);
		const { container } = render(() => (
			<DetailPanel data={data} onClose={() => {}} />
		));

		const badge = container.querySelector("span");
		expect(badge?.textContent?.toLowerCase()).toBe("signal");
	});

	it("displays signal value", () => {
		const data = createMockPanelData("signal", 42);
		const { getByText } = render(() => (
			<DetailPanel data={data} onClose={() => {}} />
		));

		expect(getByText("42")).toBeTruthy();
	});

	it("displays memo computed value", () => {
		const data = createMockPanelData("memo", "computed result");
		const { getByText } = render(() => (
			<DetailPanel data={data} onClose={() => {}} />
		));

		expect(getByText(/"computed result"/)).toBeTruthy();
	});

	it("displays sources list", () => {
		const data = createMockPanelData("memo", null);
		const { getByText } = render(() => (
			<DetailPanel data={data} onClose={() => {}} />
		));

		expect(getByText("Source Signal")).toBeTruthy();
	});

	it("displays observers list", () => {
		const data = createMockPanelData("signal", null);
		const { getByText } = render(() => (
			<DetailPanel data={data} onClose={() => {}} />
		));

		expect(getByText("Observer Effect")).toBeTruthy();
	});

	it("calls onClose when close button is clicked", async () => {
		const onClose = vi.fn();
		const data = createMockPanelData("signal", 42);
		const { getByRole } = render(() => (
			<DetailPanel data={data} onClose={onClose} />
		));

		const closeButton = getByRole("button");
		await fireEvent.click(closeButton);

		expect(onClose).toHaveBeenCalled();
	});

	it("truncates long values", () => {
		const longValue = { nested: { deeply: { complex: "x".repeat(200) } } };
		const data = createMockPanelData("signal", longValue);
		const { container } = render(() => (
			<DetailPanel data={data} onClose={() => {}} />
		));

		const valueText = container.textContent;
		expect(valueText?.length).toBeLessThan(300);
	});

	it("displays execution count for effects", () => {
		const data = createMockPanelData("effect", null);
		data.node.executionCount = 5;
		const { getByText } = render(() => (
			<DetailPanel data={data} onClose={() => {}} />
		));

		expect(getByText("Execution Count")).toBeTruthy();
		expect(getByText("5")).toBeTruthy();
	});
});
