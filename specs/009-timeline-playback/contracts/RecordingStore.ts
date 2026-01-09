/**
 * API Contract: RecordingStore
 *
 * Manages persistent storage of recordings using IndexedDB.
 * Handles CRUD operations, validation, and quota management.
 *
 * Feature: 009-timeline-playback
 *
 * @see data-model.md for Recording entity definition
 * @see research.md for IndexedDB schema design
 */

import type { ReactivityEvent } from "../../../src/types/events";
import type { Recording, RecordingMetadata } from "../../../src/types/replay";

export interface ValidationError {
	field: "name" | "events" | "version";
	message: string;
	constraint: string;
}

export interface RecordingStore {
	save(name: string, events: ReactivityEvent[]): Promise<number>;
	load(id: number): Promise<Recording>;
	delete(id: number): Promise<void>;
	list(): Promise<RecordingMetadata[]>;
	exists(name: string): Promise<boolean>;
	validateName(name: string): ValidationError | null;
	getQuota(): Promise<{ used: number; available: number }>;
}

export function createRecordingStore(): RecordingStore;
