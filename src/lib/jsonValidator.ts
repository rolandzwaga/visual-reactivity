import type { ParseResult } from "../types/panel";

/**
 * Parses a JSON string and validates its syntax.
 *
 * @param input - The JSON string to parse
 * @returns ParseResult with parsed value or error message
 */
export function parseJSON(input: string): ParseResult {
	// Trim whitespace first
	const trimmed = input.trim();

	// Empty strings are invalid JSON
	if (trimmed === "") {
		return {
			value: null,
			error: "Cannot parse empty string as JSON",
		};
	}

	try {
		const value = JSON.parse(trimmed);
		return {
			value,
			error: null,
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Invalid JSON";
		return {
			value: null,
			error: errorMessage,
		};
	}
}
