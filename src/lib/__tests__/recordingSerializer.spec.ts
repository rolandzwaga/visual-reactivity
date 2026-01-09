import { describe, expect, it } from "vitest";
import type { Recording } from "../../types/replay";
import {
	exportRecording,
	importRecording,
	validateFormat,
} from "../recordingSerializer";

describe("recordingSerializer", () => {
	const mockRecording: Recording = {
		id: 1,
		name: "test-recording",
		dateCreated: 1000000,
		eventCount: 3,
		duration: 1000,
		version: "1.0.0",
		events: [
			{
				id: "evt-1",
				type: "signal-create",
				nodeId: "signal-1",
				timestamp: 1000,
				data: { value: 0 },
			},
			{
				id: "evt-2",
				type: "signal-write",
				nodeId: "signal-1",
				timestamp: 1500,
				data: { previousValue: 0, newValue: 1 },
			},
			{
				id: "evt-3",
				type: "computation-create",
				nodeId: "memo-1",
				timestamp: 2000,
				data: { computationType: "memo" },
			},
		],
	};

	describe("exportRecording", () => {
		it("should export with full values by default", () => {
			const json = exportRecording(mockRecording, {
				valueInclusion: "full",
				truncationLimit: 10240,
				includeMetadata: true,
			});
			const parsed = JSON.parse(json);

			expect(parsed.formatVersion).toBe("1.0.0");
			expect(parsed.name).toBe("test-recording");
			expect(parsed.events).toHaveLength(3);
			expect(parsed.events[0].data.value).toBe(0);
		});

		it("should truncate large values when configured", () => {
			const largeValue = "x".repeat(20000);
			const recordingWithLargeValue: Recording = {
				...mockRecording,
				events: [
					{
						id: "evt-1",
						type: "signal-create",
						nodeId: "signal-1",
						timestamp: 1000,
						data: {
							value: largeValue,
						},
					},
				],
			};

			const json = exportRecording(recordingWithLargeValue, {
				valueInclusion: "truncated",
				truncationLimit: 10240,
				includeMetadata: true,
			});
			const parsed = JSON.parse(json);

			expect(parsed.events[0].data.value).toContain("[Truncated:");
		});

		it("should strip all values in structure-only mode", () => {
			const json = exportRecording(mockRecording, {
				valueInclusion: "structure-only",
				truncationLimit: 10240,
				includeMetadata: true,
			});
			const parsed = JSON.parse(json);

			expect(Object.keys(parsed.events[0].data).length).toBe(0);
			expect(Object.keys(parsed.events[1].data).length).toBe(0);
			expect(Object.keys(parsed.events[2].data).length).toBe(0);
		});
	});

	describe("importRecording", () => {
		it("should import valid recording", () => {
			const json = exportRecording(mockRecording, {
				valueInclusion: "full",
				truncationLimit: 10240,
				includeMetadata: true,
			});

			const imported = importRecording(json);

			expect(imported.name).toBe("test-recording");
			expect(imported.events).toHaveLength(3);
			expect(imported.eventCount).toBe(3);
		});

		it("should throw on invalid JSON", () => {
			expect(() => importRecording("not json")).toThrow();
		});

		it("should throw on missing formatVersion", () => {
			expect(() => importRecording(JSON.stringify({ name: "test" }))).toThrow(
				"Invalid recording format",
			);
		});

		it("should throw on incompatible version", () => {
			expect(() =>
				importRecording(
					JSON.stringify({
						formatVersion: "999.0.0",
						name: "test",
						events: [],
					}),
				),
			).toThrow("Unsupported format version");
		});
	});

	describe("validateFormat", () => {
		it("should validate correct format", () => {
			const json = exportRecording(mockRecording, {
				valueInclusion: "full",
				truncationLimit: 10240,
				includeMetadata: true,
			});

			expect(validateFormat(json)).toBe(true);
		});

		it("should reject invalid format", () => {
			expect(validateFormat("not json")).toBe(false);
			expect(validateFormat(JSON.stringify({ name: "test" }))).toBe(false);
		});
	});
});
