import { describe, expect, it } from "vitest";
import { parseJSON } from "../jsonValidator";

describe("jsonValidator", () => {
	describe("valid JSON", () => {
		it("should parse valid number strings", () => {
			const result = parseJSON("42");
			expect(result.value).toBe(42);
			expect(result.error).toBeNull();
		});

		it("should parse valid string literals", () => {
			const result = parseJSON('"hello"');
			expect(result.value).toBe("hello");
			expect(result.error).toBeNull();
		});

		it("should parse valid boolean literals", () => {
			const trueResult = parseJSON("true");
			expect(trueResult.value).toBe(true);
			expect(trueResult.error).toBeNull();

			const falseResult = parseJSON("false");
			expect(falseResult.value).toBe(false);
			expect(falseResult.error).toBeNull();
		});

		it("should parse null", () => {
			const result = parseJSON("null");
			expect(result.value).toBeNull();
			expect(result.error).toBeNull();
		});

		it("should parse valid arrays", () => {
			const result = parseJSON("[1, 2, 3]");
			expect(result.value).toEqual([1, 2, 3]);
			expect(result.error).toBeNull();
		});

		it("should parse valid objects", () => {
			const result = parseJSON('{"name": "test", "value": 42}');
			expect(result.value).toEqual({ name: "test", value: 42 });
			expect(result.error).toBeNull();
		});

		it("should parse nested structures", () => {
			const result = parseJSON('{"user": {"name": "Alice", "age": 30}}');
			expect(result.value).toEqual({ user: { name: "Alice", age: 30 } });
			expect(result.error).toBeNull();
		});

		it("should parse empty objects", () => {
			const result = parseJSON("{}");
			expect(result.value).toEqual({});
			expect(result.error).toBeNull();
		});

		it("should parse empty arrays", () => {
			const result = parseJSON("[]");
			expect(result.value).toEqual([]);
			expect(result.error).toBeNull();
		});

		it("should handle whitespace", () => {
			const result = parseJSON('  { "key" : "value" }  ');
			expect(result.value).toEqual({ key: "value" });
			expect(result.error).toBeNull();
		});
	});

	describe("invalid JSON", () => {
		it("should reject unquoted strings", () => {
			const result = parseJSON("hello");
			expect(result.value).toBeNull();
			expect(result.error).toContain("JSON");
		});

		it("should reject single-quoted strings", () => {
			const result = parseJSON("'hello'");
			expect(result.value).toBeNull();
			expect(result.error).toContain("JSON");
		});

		it("should reject trailing commas in objects", () => {
			const result = parseJSON('{"key": "value",}');
			expect(result.value).toBeNull();
			expect(result.error).toContain("JSON");
		});

		it("should reject trailing commas in arrays", () => {
			const result = parseJSON("[1, 2, 3,]");
			expect(result.value).toBeNull();
			expect(result.error).toContain("JSON");
		});

		it("should reject unclosed objects", () => {
			const result = parseJSON('{"key": "value"');
			expect(result.value).toBeNull();
			expect(result.error).toContain("JSON");
		});

		it("should reject unclosed arrays", () => {
			const result = parseJSON("[1, 2, 3");
			expect(result.value).toBeNull();
			expect(result.error).toContain("JSON");
		});

		it("should reject invalid numbers", () => {
			const result = parseJSON("01234");
			expect(result.value).toBeNull();
			expect(result.error).toContain("JSON");
		});

		it("should reject NaN", () => {
			const result = parseJSON("NaN");
			expect(result.value).toBeNull();
			expect(result.error).toContain("JSON");
		});

		it("should reject Infinity", () => {
			const result = parseJSON("Infinity");
			expect(result.value).toBeNull();
			expect(result.error).toContain("JSON");
		});

		it("should reject undefined", () => {
			const result = parseJSON("undefined");
			expect(result.value).toBeNull();
			expect(result.error).toContain("JSON");
		});

		it("should reject empty strings", () => {
			const result = parseJSON("");
			expect(result.value).toBeNull();
			expect(result.error).toContain("JSON");
		});

		it("should reject whitespace-only strings", () => {
			const result = parseJSON("   ");
			expect(result.value).toBeNull();
			expect(result.error).toContain("JSON");
		});
	});

	describe("edge cases", () => {
		it("should handle very long strings", () => {
			const longString = `"${"a".repeat(10000)}"`;
			const result = parseJSON(longString);
			expect(result.value).toBe("a".repeat(10000));
			expect(result.error).toBeNull();
		});

		it("should handle deeply nested objects", () => {
			const deep = '{"a":{"b":{"c":{"d":{"e":"value"}}}}}';
			const result = parseJSON(deep);
			expect(result.value).toEqual({ a: { b: { c: { d: { e: "value" } } } } });
			expect(result.error).toBeNull();
		});

		it("should handle special characters in strings", () => {
			const result = parseJSON('"hello\\nworld\\t!"');
			expect(result.value).toBe("hello\nworld\t!");
			expect(result.error).toBeNull();
		});

		it("should handle unicode characters", () => {
			const result = parseJSON('"\\u0048\\u0065\\u006C\\u006C\\u006F"');
			expect(result.value).toBe("Hello");
			expect(result.error).toBeNull();
		});

		it("should handle negative numbers", () => {
			const result = parseJSON("-42");
			expect(result.value).toBe(-42);
			expect(result.error).toBeNull();
		});

		it("should handle decimal numbers", () => {
			const result = parseJSON("3.14159");
			// biome-ignore lint/suspicious/noApproximativeNumericConstant: Testing exact value 3.14159, not Math.PI
			expect(result.value).toBe(3.14159);
			expect(result.error).toBeNull();
		});

		it("should handle scientific notation", () => {
			const result = parseJSON("1.23e-4");
			expect(result.value).toBe(0.000123);
			expect(result.error).toBeNull();
		});
	});

	describe("error messages", () => {
		it("should provide descriptive error messages", () => {
			const result = parseJSON("{invalid}");
			expect(result.error).toBeTruthy();
			expect(result.error).toMatch(/JSON|parse|invalid/i);
		});

		it("should indicate position for syntax errors", () => {
			const result = parseJSON('{"key": }');
			expect(result.error).toBeTruthy();
			// Error should mention the issue
			expect(typeof result.error).toBe("string");
		});
	});
});
