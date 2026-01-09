import type { Recording } from "../types/replay";
import { DB_SCHEMA } from "../types/storage";

let dbInstance: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
	if (dbInstance) {
		return dbInstance;
	}

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_SCHEMA.name, DB_SCHEMA.version);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			dbInstance = request.result;
			resolve(dbInstance);
		};

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			if (!db.objectStoreNames.contains("recordings")) {
				const store = db.createObjectStore("recordings", {
					keyPath: DB_SCHEMA.stores.recordings.keyPath,
					autoIncrement: DB_SCHEMA.stores.recordings.autoIncrement,
				});

				for (const index of DB_SCHEMA.stores.recordings.indexes) {
					store.createIndex(index.name, index.keyPath, index.options);
				}
			}
		};
	});
}

export async function saveRecording(recording: Recording): Promise<number> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction("recordings", "readwrite");
		const store = tx.objectStore("recordings");

		const recordingCopy = { ...recording };
		if (recordingCopy.id === 0) {
			delete (recordingCopy as Partial<Recording>).id;
		}

		const request = store.add(recordingCopy);

		request.onsuccess = () => resolve(request.result as number);
		request.onerror = () => {
			if (request.error?.name === "ConstraintError") {
				reject(new Error(`Recording name "${recording.name}" already exists`));
			} else {
				reject(request.error);
			}
		};
	});
}

export async function loadRecording(id: number): Promise<Recording> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction("recordings", "readonly");
		const store = tx.objectStore("recordings");
		const request = store.get(id);

		request.onsuccess = () => {
			if (request.result) {
				resolve(request.result as Recording);
			} else {
				reject(new Error(`Recording with id ${id} not found`));
			}
		};
		request.onerror = () => reject(request.error);
	});
}

export async function deleteRecording(id: number): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction("recordings", "readwrite");
		const store = tx.objectStore("recordings");
		const request = store.delete(id);

		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

export async function listRecordings(): Promise<Recording[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction("recordings", "readonly");
		const store = tx.objectStore("recordings");
		const index = store.index("dateCreated");
		const request = index.getAll();

		request.onsuccess = () => resolve(request.result as Recording[]);
		request.onerror = () => reject(request.error);
	});
}

export async function recordingExists(name: string): Promise<boolean> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction("recordings", "readonly");
		const store = tx.objectStore("recordings");
		const index = store.index("name");
		const request = index.getKey(name);

		request.onsuccess = () => resolve(request.result !== undefined);
		request.onerror = () => reject(request.error);
	});
}

export async function getStorageQuota(): Promise<{
	used: number;
	available: number;
}> {
	if (navigator.storage && navigator.storage.estimate) {
		const estimate = await navigator.storage.estimate();
		return {
			used: estimate.usage || 0,
			available: estimate.quota || 0,
		};
	}

	return {
		used: 0,
		available: Number.POSITIVE_INFINITY,
	};
}
