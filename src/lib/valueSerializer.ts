import type { SerializationResult } from "../types/panel";

/**
 * Maximum depth for nested object serialization.
 * Objects deeper than this will be replaced with '[Object]'.
 */
const MAX_DEPTH = 3;

/**
 * Serializes a value to JSON with depth limiting and circular reference detection.
 *
 * @param value - The value to serialize
 * @returns SerializationResult with serialized string or error
 */
export function serializeValue(value: unknown): SerializationResult {
	try {
		const seen = new WeakSet<object>();

		const replacer = (_key: string, val: unknown, depth = 0): unknown => {
			// Handle special types first
			if (typeof val === "function") {
				return val.name ? `[Function: ${val.name}]` : "[Function]";
			}

			if (typeof val === "symbol") {
				const description = val.description;
				return description ? `[Symbol: ${description}]` : "[Symbol]";
			}

			if (typeof val === "undefined") {
				return null;
			}

			// Handle NaN and Infinity
			if (typeof val === "number" && !Number.isFinite(val)) {
				return null;
			}

			// Handle non-plain objects
			if (val instanceof Date) {
				return val.toISOString();
			}

			if (val instanceof Map) {
				return "[Map]";
			}

			if (val instanceof Set) {
				return "[Set]";
			}

			// Handle objects and arrays
			if (val !== null && typeof val === "object") {
				// Circular reference detection
				if (seen.has(val)) {
					throw new Error("Converting circular structure to JSON");
				}

				seen.add(val);

				// Depth limiting
				if (depth >= MAX_DEPTH) {
					return "[Object]";
				}

				// Recursively process objects and arrays
				if (Array.isArray(val)) {
					return val.map((item) => replacer("", item, depth + 1));
				}

				const result: Record<string, unknown> = {};
				for (const [key, value] of Object.entries(val)) {
					result[key] = replacer(key, value, depth + 1);
				}
				return result;
			}

			return val;
		};

		const processed = replacer("", value);
		const serialized = JSON.stringify(processed);

		return {
			serialized,
			success: true,
			error: null,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			serialized: null,
			success: false,
			error: errorMessage,
		};
	}
}
