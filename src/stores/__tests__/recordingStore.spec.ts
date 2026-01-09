import { beforeEach, describe, expect, test } from "vitest";
import "fake-indexeddb/auto";
import type { ReactivityEvent } from "../../types/events";
import { createRecordingStore } from "../recordingStore";

describe("RecordingStore", () => {
	beforeEach(async () => {
		const databases = await indexedDB.databases();
		for (const db of databases) {
			if (db.name) {
				indexedDB.deleteDatabase(db.name);
			}
		}
	});

	test("saves recording with valid name", async () => {
		const store = createRecordingStore();
		const events: ReactivityEvent[] = [
			{
				id: "event-11",
				type: "signal-write",
				nodeId: "signal-1",
				timestamp: 100,
				data: { newValue: 1, previousValue: 0 },
			},
		];

		const id = await store.save("test-recording", events);

		expect(id).toBeGreaterThan(0);
	});

	test("validateName rejects empty name", () => {
		const store = createRecordingStore();
		const error = store.validateName("");

		expect(error).not.toBeNull();
		expect(error?.field).toBe("name");
		expect(error?.message).toContain("empty");
	});

	test("validateName rejects name over 100 chars", () => {
		const store = createRecordingStore();
		const longName = "a".repeat(101);
		const error = store.validateName(longName);

		expect(error).not.toBeNull();
		expect(error?.field).toBe("name");
		expect(error?.constraint).toContain("100");
	});

	test("validateName rejects invalid characters", () => {
		const store = createRecordingStore();
		const error = store.validateName("test@invalid");

		expect(error).not.toBeNull();
		expect(error?.field).toBe("name");
		expect(error?.message).toContain("letters, numbers");
	});

	test("validateName accepts valid name", () => {
		const store = createRecordingStore();
		const error = store.validateName("valid-name_123");

		expect(error).toBeNull();
	});

	test("exists returns true for duplicate name", async () => {
		const store = createRecordingStore();
		const events: ReactivityEvent[] = [
			{
				id: "event-12",
				type: "signal-write",
				nodeId: "signal-1",
				timestamp: 100,
				data: { newValue: 1, previousValue: 0 },
			},
		];

		await store.save("duplicate", events);
		const exists = await store.exists("duplicate");

		expect(exists).toBe(true);
	});

	test("exists returns false for unique name", async () => {
		const store = createRecordingStore();
		const exists = await store.exists("unique-name");

		expect(exists).toBe(false);
	});

	test("load retrieves saved recording", async () => {
		const store = createRecordingStore();
		const events: ReactivityEvent[] = [
			{
				id: "event-13",
				type: "signal-write",
				nodeId: "signal-1",
				timestamp: 100,
				data: { newValue: 1, previousValue: 0 },
			},
		];

		const id = await store.save("load-test", events);
		const recording = await store.load(id);

		expect(recording.name).toBe("load-test");
		expect(recording.eventCount).toBe(1);
		expect(recording.events).toHaveLength(1);
	});

	test("delete removes recording", async () => {
		const store = createRecordingStore();
		const events: ReactivityEvent[] = [
			{
				id: "event-14",
				type: "signal-write",
				nodeId: "signal-1",
				timestamp: 100,
				data: { newValue: 1, previousValue: 0 },
			},
		];

		const id = await store.save("delete-test", events);
		await store.delete(id);

		await expect(store.load(id)).rejects.toThrow();
	});

	test("list returns all recordings", async () => {
		const store = createRecordingStore();
		const events: ReactivityEvent[] = [
			{
				id: "event-15",
				type: "signal-write",
				nodeId: "signal-1",
				timestamp: 100,
				data: { newValue: 1, previousValue: 0 },
			},
		];

		await store.save("recording-1", events);
		await store.save("recording-2", events);

		const list = await store.list();

		expect(list.length).toBeGreaterThanOrEqual(2);
		expect(list.some((r) => r.name === "recording-1")).toBe(true);
		expect(list.some((r) => r.name === "recording-2")).toBe(true);
	});

	test("getQuota returns storage usage", async () => {
		const store = createRecordingStore();
		const quota = await store.getQuota();

		expect(quota.used).toBeGreaterThanOrEqual(0);
		expect(quota.available).toBeGreaterThan(0);
	});
});
