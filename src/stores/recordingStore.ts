import {
	deleteRecording as dbDelete,
	loadRecording as dbLoad,
	saveRecording as dbSave,
	getStorageQuota,
	listRecordings,
	recordingExists,
} from "../lib/indexedDB";
import { validateRecordingName } from "../lib/validation";
import type { ReactivityEvent } from "../types/events";
import type {
	Recording,
	RecordingMetadata,
	ReplayState,
} from "../types/replay";
import type { ValidationError } from "../types/storage";

export interface RecordingStore {
	save(name: string, events: ReactivityEvent[]): Promise<number>;
	load(id: number): Promise<Recording>;
	delete(id: number): Promise<void>;
	list(): Promise<RecordingMetadata[]>;
	exists(name: string): Promise<boolean>;
	validateName(name: string): ValidationError | null;
	getQuota(): Promise<{ used: number; available: number }>;
}

export function createRecordingStore(): RecordingStore {
	return {
		async save(name: string, events: ReactivityEvent[]): Promise<number> {
			const validationError = validateRecordingName(name);
			if (validationError) {
				throw new Error(validationError.message);
			}

			const exists = await recordingExists(name);
			if (exists) {
				throw new Error(
					`Recording with name "${name}" already exists. Try "${name} 2" or "${name} ${Date.now()}"`,
				);
			}

			const sortedEvents = [...events].sort(
				(a, b) => a.timestamp - b.timestamp,
			);
			const duration =
				sortedEvents.length > 0
					? sortedEvents[sortedEvents.length - 1].timestamp -
						sortedEvents[0].timestamp
					: 0;

			const recording: Recording = {
				id: 0,
				name,
				dateCreated: Date.now(),
				eventCount: sortedEvents.length,
				duration,
				version: "1.0.0",
				events: sortedEvents,
			};

			return await dbSave(recording);
		},

		async load(id: number): Promise<Recording> {
			return await dbLoad(id);
		},

		async delete(id: number): Promise<void> {
			return await dbDelete(id);
		},

		async list(): Promise<RecordingMetadata[]> {
			const recordings = await listRecordings();
			return recordings
				.map((recording) => {
					const nodeTypes = Array.from(
						new Set(
							recording.events.map((e) => {
								if (e.type.includes("signal")) return "signal";
								if (e.type.includes("memo")) return "memo";
								if (e.type.includes("effect")) return "effect";
								return "other";
							}),
						),
					);

					return {
						id: recording.id,
						name: recording.name,
						dateCreated: recording.dateCreated,
						eventCount: recording.eventCount,
						duration: recording.duration,
						nodeTypes,
						appVersion: recording.version,
					};
				})
				.sort((a, b) => b.dateCreated - a.dateCreated);
		},

		async exists(name: string): Promise<boolean> {
			return await recordingExists(name);
		},

		validateName(name: string): ValidationError | null {
			return validateRecordingName(name);
		},

		async getQuota(): Promise<{ used: number; available: number }> {
			return await getStorageQuota();
		},
	};
}
