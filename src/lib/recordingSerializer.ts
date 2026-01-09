import type { ExportOptions, Recording } from "../types/replay";

const CURRENT_VERSION = "1.0.0";

function truncateValue(value: unknown, limit: number): unknown {
	const str = JSON.stringify(value);
	if (str.length <= limit) return value;
	return `[Truncated: ${str.length} bytes, showing first ${limit} chars]${str.slice(0, limit)}`;
}

function processDataForExport(
	data: any,
	options: ExportOptions,
): Record<string, unknown> {
	const processed: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(data)) {
		if (options.valueInclusion === "structure-only") {
			continue;
		} else if (options.valueInclusion === "truncated") {
			processed[key] = truncateValue(value, options.truncationLimit);
		} else {
			processed[key] = value;
		}
	}

	return processed;
}

export function exportRecording(
	recording: Recording,
	options: ExportOptions = {
		valueInclusion: "truncated",
		truncationLimit: 10240,
		includeMetadata: true,
	},
): string {
	const processedEvents = recording.events.map((event) => ({
		...event,
		data: processDataForExport(event.data, options),
	}));

	const exportData = {
		formatVersion: CURRENT_VERSION,
		name: recording.name,
		dateCreated: recording.dateCreated,
		eventCount: recording.eventCount,
		duration: recording.duration,
		appVersion: recording.version,
		events: processedEvents,
	};

	return JSON.stringify(exportData, null, 2);
}

export function importRecording(jsonString: string): Recording {
	const data = JSON.parse(jsonString);

	if (!data.formatVersion) {
		throw new Error("Invalid recording format");
	}

	const [importedMajor] = data.formatVersion.split(".").map(Number);
	const [currentMajor] = CURRENT_VERSION.split(".").map(Number);

	if (importedMajor !== currentMajor) {
		throw new Error("Unsupported format version");
	}

	if (!data.name || !Array.isArray(data.events)) {
		throw new Error("Invalid recording format");
	}

	return {
		id: 0,
		name: data.name,
		dateCreated: data.dateCreated || Date.now(),
		eventCount: data.events.length,
		duration: data.duration || 0,
		version: data.formatVersion,
		events: data.events,
	};
}

export function validateFormat(jsonString: string): boolean {
	try {
		const data = JSON.parse(jsonString);

		if (!data.formatVersion) {
			return false;
		}

		if (!data.name) {
			return false;
		}

		if (!Array.isArray(data.events)) {
			return false;
		}

		return true;
	} catch {
		return false;
	}
}
