import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RecordingStore } from "../../../stores/recordingStore";
import { RecordingManager } from "../RecordingManager";

describe("RecordingManager", () => {
	const createMockStore = (): RecordingStore => ({
		save: vi.fn(),
		load: vi.fn(),
		list: vi.fn().mockResolvedValue([]),
		delete: vi.fn(),
		exists: vi.fn().mockResolvedValue(false),
		validateName: vi.fn(),
		getQuota: vi.fn().mockResolvedValue({ used: 0, total: 1000000 }),
	});

	afterEach(() => {
		cleanup();
	});

	it("should render trigger button", () => {
		const store = createMockStore();
		render(() => (
			<RecordingManager
				recordingStore={store}
				onLoad={vi.fn()}
				onSave={vi.fn()}
			/>
		));

		expect(screen.getByText(/📼 Recordings/i)).toBeTruthy();
	});

	it("should open modal on button click", () => {
		const store = createMockStore();
		render(() => (
			<RecordingManager
				recordingStore={store}
				onLoad={vi.fn()}
				onSave={vi.fn()}
			/>
		));

		const button = screen.getByText(/📼 Recordings/i);
		fireEvent.click(button);

		expect(screen.getByText(/Recording Manager/i)).toBeTruthy();
		expect(screen.getByPlaceholderText(/Recording name.../i)).toBeTruthy();
	});

	it("should call onSave with name when saving", async () => {
		const store = createMockStore();
		const onSave = vi.fn();

		render(() => (
			<RecordingManager
				recordingStore={store}
				onLoad={vi.fn()}
				onSave={onSave}
			/>
		));

		const openButton = screen.getByText(/📼 Recordings/i);
		fireEvent.click(openButton);

		const input = screen.getByPlaceholderText(
			/Recording name.../i,
		) as HTMLInputElement;
		fireEvent.input(input, {
			target: { value: "test-recording" },
		} as unknown as InputEvent);

		const saveButton = screen.getByText(/Save Current/i);
		fireEvent.click(saveButton);

		await vi.waitFor(() => {
			expect(onSave).toHaveBeenCalledWith("test-recording");
		});
	});

	it("should show error for empty name", async () => {
		const store = createMockStore();
		store.validateName = vi
			.fn()
			.mockReturnValue({ message: "Name cannot be empty" });

		render(() => (
			<RecordingManager
				recordingStore={store}
				onLoad={vi.fn()}
				onSave={vi.fn()}
			/>
		));

		const openButton = screen.getByText(/📼 Recordings/i);
		fireEvent.click(openButton);

		const saveButton = screen.getByText(/Save Current/i);
		fireEvent.click(saveButton);

		expect(await screen.findByText(/Name cannot be empty/i)).toBeTruthy();
	});

	it("should show error for invalid characters", async () => {
		const store = createMockStore();
		store.validateName = vi
			.fn()
			.mockReturnValue({ message: "Invalid characters" });

		render(() => (
			<RecordingManager
				recordingStore={store}
				onLoad={vi.fn()}
				onSave={vi.fn()}
			/>
		));

		const openButton = screen.getByText(/📼 Recordings/i);
		fireEvent.click(openButton);

		const input = screen.getByPlaceholderText(
			/Recording name.../i,
		) as HTMLInputElement;
		fireEvent.input(input, {
			target: { value: "invalid@name!" },
		} as unknown as InputEvent);

		const saveButton = screen.getByText(/Save Current/i);
		fireEvent.click(saveButton);

		expect(await screen.findByText(/Invalid characters/i)).toBeTruthy();
	});
});
