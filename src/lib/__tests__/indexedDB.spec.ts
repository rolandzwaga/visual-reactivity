import { beforeEach, describe, expect, test } from "vitest";
import "fake-indexeddb/auto";
import type { Recording } from "../../types/replay";
import {
	deleteRecording,
	listRecordings,
	loadRecording,
	openDB,
	saveRecording,
} from "../indexedDB";

describe("IndexedDB utilities", () => {
	beforeEach(async () => {
		const databases = await indexedDB.databases();
		for (const db of databases) {
			if (db.name) {
				indexedDB.deleteDatabase(db.name);
			}
		}
	});

	test("openDB creates database with schema", async () => {
		const db = await openDB();

		expect(db.name).toBe("visual-reactivity-db");
		expect(db.version).toBe(1);
		expect(db.objectStoreNames.contains("recordings")).toBe(true);
	});

	test("saveRecording adds recording to database", async () => {
		const recording: Recording = {
			id: 0,
			name: "test",
			dateCreated: Date.now(),
			eventCount: 1,
			duration: 100,
			version: "1.0.0",
			events: [
				{
					id: "event-16",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 100,
					data: { newValue: 1, previousValue: 0 },
				},
			],
		};

		const id = await saveRecording(recording);

		expect(id).toBeGreaterThan(0);
	});

	test("loadRecording retrieves recording by id", async () => {
		const recording: Recording = {
			id: 0,
			name: "load-test",
			dateCreated: Date.now(),
			eventCount: 1,
			duration: 100,
			version: "1.0.0",
			events: [
				{
					id: "event-17",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 100,
					data: { newValue: 1, previousValue: 0 },
				},
			],
		};

		const id = await saveRecording(recording);
		const loaded = await loadRecording(id);

		expect(loaded.name).toBe("load-test");
		expect(loaded.id).toBe(id);
	});

	test("deleteRecording removes recording from database", async () => {
		const recording: Recording = {
			id: 0,
			name: "delete-test",
			dateCreated: Date.now(),
			eventCount: 1,
			duration: 100,
			version: "1.0.0",
			events: [
				{
					id: "event-18",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 100,
					data: { newValue: 1, previousValue: 0 },
				},
			],
		};

		const id = await saveRecording(recording);
		await deleteRecording(id);

		await expect(loadRecording(id)).rejects.toThrow();
	});

	test("listRecordings returns all recordings", async () => {
		const recording1: Recording = {
			id: 0,
			name: "list-test-1",
			dateCreated: Date.now(),
			eventCount: 1,
			duration: 100,
			version: "1.0.0",
			events: [
				{
					id: "event-19",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 100,
					data: { newValue: 1, previousValue: 0 },
				},
			],
		};

		const recording2: Recording = {
			...recording1,
			name: "list-test-2",
		};

		await saveRecording(recording1);
		await saveRecording(recording2);

		const list = await listRecordings();

		expect(list.length).toBeGreaterThanOrEqual(2);
	});

	test("saveRecording rejects duplicate names", async () => {
		const recording: Recording = {
			id: 0,
			name: "duplicate",
			dateCreated: Date.now(),
			eventCount: 1,
			duration: 100,
			version: "1.0.0",
			events: [
				{
					id: "event-20",
					type: "signal-write",
					nodeId: "signal-1",
					timestamp: 100,
					data: { newValue: 1, previousValue: 0 },
				},
			],
		};

		await saveRecording(recording);

		await expect(saveRecording(recording)).rejects.toThrow();
	});
});
