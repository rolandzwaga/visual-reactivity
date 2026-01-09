import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, it } from "vitest";
import { createRecordingStore } from "../../../stores/recordingStore";
import type { Recording } from "../../../types/replay";
import { ExportImportControls } from "../ExportImportControls";

describe("ExportImportControls", () => {
	const mockRecording: Recording = {
		id: 1,
		name: "test-recording",
		dateCreated: 1000000,
		eventCount: 3,
		duration: 1000,
		version: "1.0.0",
		events: [],
	};

	afterEach(() => {
		cleanup();
	});

	it("should render export and import controls", () => {
		const store = createRecordingStore();
		const { container } = render(() => (
			<ExportImportControls
				recordingStore={store}
				currentRecording={mockRecording}
			/>
		));

		expect(container.textContent).toContain("Export Mode:");
		expect(container.textContent).toContain("📤 Export");
		expect(container.textContent).toContain("📥 Import");
	});

	it("should disable export button when no recording loaded", () => {
		const store = createRecordingStore();
		const { container } = render(() => (
			<ExportImportControls recordingStore={store} currentRecording={null} />
		));

		const buttons = container.querySelectorAll("button");
		const exportButton = Array.from(buttons).find((btn) =>
			btn.textContent?.includes("📤 Export"),
		) as HTMLButtonElement;
		expect(exportButton?.disabled).toBe(true);
	});

	it("should enable export button when recording loaded", () => {
		const store = createRecordingStore();
		const { container } = render(() => (
			<ExportImportControls
				recordingStore={store}
				currentRecording={mockRecording}
			/>
		));

		const buttons = container.querySelectorAll("button");
		const exportButton = Array.from(buttons).find((btn) =>
			btn.textContent?.includes("📤 Export"),
		) as HTMLButtonElement;
		expect(exportButton?.disabled).toBe(false);
	});

	it("should have export mode selector with three options", () => {
		const store = createRecordingStore();
		const { container } = render(() => (
			<ExportImportControls
				recordingStore={store}
				currentRecording={mockRecording}
			/>
		));

		const select = container.querySelector("select");
		expect(select).toBeTruthy();

		const options = select?.querySelectorAll("option");
		expect(options?.length).toBe(3);

		expect(container.textContent).toContain("Full (with all values)");
		expect(container.textContent).toContain("Truncated (10KB limit)");
		expect(container.textContent).toContain("Structure Only");
	});
});
