import { describe, expect, it } from "vitest";
import { serializeValue } from "../valueSerializer";

describe("valueSerializer", () => {
	describe("primitive values", () => {
		it("should serialize numbers", () => {
			const result = serializeValue(42);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe("42");
			expect(result.error).toBeNull();
		});

		it("should serialize strings", () => {
			const result = serializeValue("hello");
			expect(result.success).toBe(true);
			expect(result.serialized).toBe('"hello"');
			expect(result.error).toBeNull();
		});

		it("should serialize booleans", () => {
			const result = serializeValue(true);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe("true");
			expect(result.error).toBeNull();
		});

		it("should serialize null", () => {
			const result = serializeValue(null);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe("null");
			expect(result.error).toBeNull();
		});

		it("should serialize undefined as null", () => {
			const result = serializeValue(undefined);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe("null");
			expect(result.error).toBeNull();
		});
	});

	describe("arrays and objects", () => {
		it("should serialize simple arrays", () => {
			const result = serializeValue([1, 2, 3]);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe("[1,2,3]");
			expect(result.error).toBeNull();
		});

		it("should serialize simple objects", () => {
			const result = serializeValue({ name: "test", value: 42 });
			expect(result.success).toBe(true);
			const parsed = JSON.parse(result.serialized!);
			expect(parsed).toEqual({ name: "test", value: 42 });
			expect(result.error).toBeNull();
		});

		it("should serialize nested objects up to depth 3", () => {
			const nested = {
				level1: {
					level2: {
						level3: {
							level4: "should be truncated",
						},
					},
				},
			};
			const result = serializeValue(nested);
			expect(result.success).toBe(true);
			const parsed = JSON.parse(result.serialized!);
			expect(parsed.level1.level2.level3).toBe("[Object]");
		});
	});

	describe("functions", () => {
		it("should serialize named functions as [Function: name]", () => {
			function myFunction() {
				return 42;
			}
			const result = serializeValue(myFunction);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe('"[Function: myFunction]"');
			expect(result.error).toBeNull();
		});

		it("should serialize anonymous functions as [Function]", () => {
			const result = serializeValue(() => 42);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe('"[Function]"');
			expect(result.error).toBeNull();
		});
	});

	describe("circular references", () => {
		it("should handle circular references in objects", () => {
			const obj: Record<string, unknown> = { name: "test" };
			obj.self = obj;
			const result = serializeValue(obj);
			expect(result.success).toBe(false);
			expect(result.serialized).toBeNull();
			expect(result.error).toContain("circular");
		});

		it("should handle circular references in arrays", () => {
			const arr: unknown[] = [1, 2];
			arr.push(arr);
			const result = serializeValue(arr);
			expect(result.success).toBe(false);
			expect(result.serialized).toBeNull();
			expect(result.error).toContain("circular");
		});
	});

	describe("special cases", () => {
		it("should handle Date objects", () => {
			const date = new Date("2026-01-09T12:00:00Z");
			const result = serializeValue(date);
			expect(result.success).toBe(true);
			expect(result.serialized).toContain("2026-01-09");
		});

		it("should handle Map as [Map]", () => {
			const map = new Map([["key", "value"]]);
			const result = serializeValue(map);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe('"[Map]"');
		});

		it("should handle Set as [Set]", () => {
			const set = new Set([1, 2, 3]);
			const result = serializeValue(set);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe('"[Set]"');
		});

		it("should handle symbols as [Symbol]", () => {
			const sym = Symbol("test");
			const result = serializeValue(sym);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe('"[Symbol: test]"');
		});

		it("should handle symbols without description", () => {
			const sym = Symbol();
			const result = serializeValue(sym);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe('"[Symbol]"');
		});
	});

	describe("edge cases", () => {
		it("should handle very large numbers", () => {
			const result = serializeValue(Number.MAX_SAFE_INTEGER);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe(String(Number.MAX_SAFE_INTEGER));
		});

		it("should handle NaN as null", () => {
			const result = serializeValue(Number.NaN);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe("null");
		});

		it("should handle Infinity as null", () => {
			const result = serializeValue(Number.POSITIVE_INFINITY);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe("null");
		});

		it("should handle empty objects", () => {
			const result = serializeValue({});
			expect(result.success).toBe(true);
			expect(result.serialized).toBe("{}");
		});

		it("should handle empty arrays", () => {
			const result = serializeValue([]);
			expect(result.success).toBe(true);
			expect(result.serialized).toBe("[]");
		});
	});
});
