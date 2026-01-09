import { describe, expect, test } from "vitest";
import { validateRecordingName } from "../validation";

describe("validation", () => {
	test("accepts valid alphanumeric name", () => {
		const error = validateRecordingName("valid123");

		expect(error).toBeNull();
	});

	test("accepts name with spaces", () => {
		const error = validateRecordingName("valid name 123");

		expect(error).toBeNull();
	});

	test("accepts name with dashes", () => {
		const error = validateRecordingName("valid-name-123");

		expect(error).toBeNull();
	});

	test("accepts name with underscores", () => {
		const error = validateRecordingName("valid_name_123");

		expect(error).toBeNull();
	});

	test("accepts mixed valid characters", () => {
		const error = validateRecordingName("Valid_Name-123 Test");

		expect(error).toBeNull();
	});

	test("rejects empty name", () => {
		const error = validateRecordingName("");

		expect(error).not.toBeNull();
		expect(error?.field).toBe("name");
		expect(error?.message).toContain("empty");
	});

	test("rejects name with only whitespace", () => {
		const error = validateRecordingName("   ");

		expect(error).not.toBeNull();
		expect(error?.field).toBe("name");
	});

	test("rejects name over 100 characters", () => {
		const longName = "a".repeat(101);
		const error = validateRecordingName(longName);

		expect(error).not.toBeNull();
		expect(error?.field).toBe("name");
		expect(error?.constraint).toContain("100");
	});

	test("accepts name with exactly 100 characters", () => {
		const name = "a".repeat(100);
		const error = validateRecordingName(name);

		expect(error).toBeNull();
	});

	test("accepts name with exactly 1 character", () => {
		const error = validateRecordingName("a");

		expect(error).toBeNull();
	});

	test("rejects name with special characters", () => {
		const invalidNames = [
			"test@name",
			"test#name",
			"test$name",
			"test%name",
			"test&name",
			"test*name",
			"test(name",
			"test)name",
			"test+name",
			"test=name",
			"test[name",
			"test]name",
			"test{name",
			"test}name",
			"test|name",
			"test\\name",
			"test/name",
			"test:name",
			"test;name",
			"test'name",
			'test"name',
			"test<name",
			"test>name",
			"test,name",
			"test.name",
			"test?name",
			"test!name",
			"test~name",
			"test`name",
		];

		for (const name of invalidNames) {
			const error = validateRecordingName(name);
			expect(error).not.toBeNull();
			expect(error?.field).toBe("name");
			expect(error?.message).toContain("letters, numbers");
		}
	});

	test("error message contains helpful guidance", () => {
		const error = validateRecordingName("test@invalid");

		expect(error?.message).toContain("letters");
		expect(error?.message).toContain("numbers");
	});
});
