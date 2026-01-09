import type { ValidationError } from "../types/storage";

const RECORDING_NAME_PATTERN = /^[a-zA-Z0-9 _-]{1,100}$/;

export function validateRecordingName(name: string): ValidationError | null {
	const trimmed = name.trim();

	if (trimmed.length === 0) {
		return {
			field: "name",
			message: "Recording name cannot be empty",
			constraint: "min-length:1",
		};
	}

	if (name.length > 100) {
		return {
			field: "name",
			message: `Recording name must be 100 characters or less (currently: ${name.length})`,
			constraint: "max-length:100",
		};
	}

	if (!RECORDING_NAME_PATTERN.test(name)) {
		return {
			field: "name",
			message:
				"Recording name can only contain letters, numbers, spaces, dashes, and underscores",
			constraint: "pattern:[a-zA-Z0-9 _-]",
		};
	}

	return null;
}
