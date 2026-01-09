import { describe, it, expect } from "vitest";

describe("demoRegistry", () => {
	it("DEMO_REGISTRY is an object with string keys", async () => {
		const { DEMO_REGISTRY } = await import("../demoRegistry");

		expect(DEMO_REGISTRY).toBeDefined();
		expect(typeof DEMO_REGISTRY).toBe("object");
		expect(DEMO_REGISTRY).not.toBeNull();
	});

	it("DEMO_LIST is an array derived from DEMO_REGISTRY", async () => {
		const { DEMO_LIST } = await import("../demoRegistry");

		expect(DEMO_LIST).toBeDefined();
		expect(Array.isArray(DEMO_LIST)).toBe(true);
	});

	it("registry lookup returns demo by ID", async () => {
		const { DEMO_REGISTRY } = await import("../demoRegistry");

		const demoIds = Object.keys(DEMO_REGISTRY);

		if (demoIds.length > 0) {
			const firstId = demoIds[0];
			const demo = DEMO_REGISTRY[firstId];

			expect(demo).toBeDefined();
			expect(demo.id).toBe(firstId);
		}
	});

	it("DEMO_LIST iteration works correctly", async () => {
		const { DEMO_LIST } = await import("../demoRegistry");

		DEMO_LIST.forEach((demo) => {
			expect(demo).toHaveProperty("id");
			expect(demo).toHaveProperty("metadata");
			expect(demo).toHaveProperty("render");
			expect(typeof demo.id).toBe("string");
			expect(typeof demo.render).toBe("function");
		});
	});

	it("all demo IDs are unique", async () => {
		const { DEMO_LIST } = await import("../demoRegistry");

		const ids = DEMO_LIST.map((demo) => demo.id);
		const uniqueIds = new Set(ids);

		expect(uniqueIds.size).toBe(ids.length);
	});

	it("demo metadata has required fields", async () => {
		const { DEMO_LIST } = await import("../demoRegistry");

		DEMO_LIST.forEach((demo) => {
			expect(demo.metadata).toHaveProperty("name");
			expect(demo.metadata).toHaveProperty("concept");
			expect(demo.metadata).toHaveProperty("description");
			expect(demo.metadata).toHaveProperty("instructions");

			expect(typeof demo.metadata.name).toBe("string");
			expect(typeof demo.metadata.concept).toBe("string");
			expect(typeof demo.metadata.description).toBe("string");
			expect(typeof demo.metadata.instructions).toBe("string");
		});
	});
});
