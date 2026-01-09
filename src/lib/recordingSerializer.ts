import type { ExportOptions, Recording } from "../types/replay";

const CURRENT_VERSION = "1.0.0";

export function exportRecording(
	recording: Recording,
	options: ExportOptions = {
		valueInclusion: "truncated",
		truncationLimit: 10240,
		includeMetadata: true,
	},
): string {
	const processedEvents = recording.events.map((event) => {
		const processedEvent = { ...event };

		if (options.valueInclusion === "structure-only") {
			if (processedEvent.data && typeof processedEvent.data === "object") {
				(processedEvent.data as any).value =
					"[Value removed for structure-only export]";
			}
		} else if (options.valueInclusion === "truncated") {
			const eventString = JSON.stringify(event.data);
			if (eventString.length > options.truncationLimit) {
				(processedEvent.data as any).__truncated = true;
				(processedEvent.data as any).__originalSize = eventString.length;
			}
		}

		return processedEvent;
	});

	const exportData = {
		formatVersion: CURRENT_VERSION,
		metadata: {
			name: recording.name,
			dateCreated: recording.dateCreated,
			eventCount: recording.eventCount,
			duration: recording.duration,
			appVersion: recording.version,
			nodeTypes: Array.from(
				new Set(recording.events.map((e) => e.type.split("-")[0])),
			),
		},
		events: processedEvents,
		exportOptions: options,
	};

	return JSON.stringify(exportData, null, 2);
}

export function importRecording(jsonString: string): Recording {
	const data = JSON.parse(jsonString);

	if (!data.formatVersion) {
		throw new Error("Missing formatVersion field in recording file");
	}

	const [importedMajor] = data.formatVersion.split(".").map(Number);
	const [currentMajor] = CURRENT_VERSION.split(".").map(Number);

	if (importedMajor !== currentMajor) {
		console.warn(
			`Version mismatch: imported ${data.formatVersion}, current ${CURRENT_VERSION}`,
		);
	}

	if (!data.metadata || !Array.isArray(data.events)) {
		throw new Error("Invalid recording format: missing metadata or events");
	}

	return {
		id: 0,
		name: data.metadata.name,
		dateCreated: data.metadata.dateCreated,
		eventCount: data.events.length,
		duration: data.metadata.duration,
		version: data.formatVersion,
		events: data.events,
	};
}

export function validateFormat(jsonString: string): {
	valid: boolean;
	error?: string;
} {
	try {
		const data = JSON.parse(jsonString);

		if (!data.formatVersion) {
			return { valid: false, error: "Missing formatVersion" };
		}

		if (!data.metadata) {
			return { valid: false, error: "Missing metadata" };
		}

		if (!Array.isArray(data.events)) {
			return { valid: false, error: "Missing or invalid events array" };
		}

		return { valid: true };
	} catch (err: any) {
		return { valid: false, error: err.message };
	}
}
