import { createRoot, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { tracker } from "../../src/instrumentation";
import { createSelectionStore } from "../../src/stores/selectionStore";

describe("Selection Persistence (T111a)", () => {
	it("should persist selection when view is hidden and shown", () =>
		createRoot((dispose) => {
			tracker.reset();

			tracker.getNode = (id: string) => ({ id, type: "signal" }) as never;

			const selection = createSelectionStore();
			const [_viewVisible, setViewVisible] = createSignal(true);

			selection.selectNode("signal-1", false, "timeline");
			expect(selection.selectedNodeIds().has("signal-1")).toBe(true);
			expect(selection.selectionSource()).toBe("timeline");

			setViewVisible(false);

			expect(selection.selectedNodeIds().has("signal-1")).toBe(true);
			expect(selection.selectionSource()).toBe("timeline");

			setViewVisible(true);

			expect(selection.selectedNodeIds().has("signal-1")).toBe(true);
			expect(selection.selectionSource()).toBe("timeline");

			dispose();
		}));

	it("should restore selection across multiple views after hide/show", () =>
		createRoot((dispose) => {
			tracker.reset();

			tracker.getNode = (id: string) => ({ id, type: "signal" }) as never;

			const selection = createSelectionStore();
			const [_timelineVisible, setTimelineVisible] = createSignal(true);
			const [_graphVisible, setGraphVisible] = createSignal(true);

			selection.selectNode("signal-1", false, "timeline");
			selection.selectNode("signal-2", true, "graph");

			expect(selection.selectedNodeIds().size).toBe(2);
			expect(selection.selectedNodeIds().has("signal-1")).toBe(true);
			expect(selection.selectedNodeIds().has("signal-2")).toBe(true);

			setTimelineVisible(false);
			setGraphVisible(false);

			expect(selection.selectedNodeIds().size).toBe(2);

			setTimelineVisible(true);
			setGraphVisible(true);

			expect(selection.selectedNodeIds().size).toBe(2);
			expect(selection.selectedNodeIds().has("signal-1")).toBe(true);
			expect(selection.selectedNodeIds().has("signal-2")).toBe(true);

			dispose();
		}));

	it("should preserve multi-selection when toggling view visibility", () =>
		createRoot((dispose) => {
			tracker.reset();

			tracker.getNode = (id: string) => ({ id, type: "signal" }) as never;

			const selection = createSelectionStore();
			const [_listVisible, setListVisible] = createSignal(true);

			selection.selectNode("signal-1", false, "list");
			selection.selectNode("signal-2", true, "list");
			selection.selectNode("signal-3", true, "list");

			expect(selection.selectionCount()).toBe(3);

			setListVisible(false);
			expect(selection.selectionCount()).toBe(3);

			setListVisible(true);
			expect(selection.selectionCount()).toBe(3);
			expect(selection.selectedNodeIds().has("signal-1")).toBe(true);
			expect(selection.selectedNodeIds().has("signal-2")).toBe(true);
			expect(selection.selectedNodeIds().has("signal-3")).toBe(true);

			dispose();
		}));
});
