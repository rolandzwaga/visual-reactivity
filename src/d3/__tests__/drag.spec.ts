import { describe, expect, it, vi } from "vitest";
import { createDragBehavior } from "../drag";

describe("createDragBehavior", () => {
	it("creates a drag behavior", () => {
		const behavior = createDragBehavior();
		expect(behavior).toBeDefined();
	});

	it("accepts drag start callback", () => {
		const onDragStart = vi.fn();
		const behavior = createDragBehavior({ onDragStart });
		expect(behavior).toBeDefined();
	});

	it("accepts drag callback", () => {
		const onDrag = vi.fn();
		const behavior = createDragBehavior({ onDrag });
		expect(behavior).toBeDefined();
	});

	it("accepts drag end callback", () => {
		const onDragEnd = vi.fn();
		const behavior = createDragBehavior({ onDragEnd });
		expect(behavior).toBeDefined();
	});
});
