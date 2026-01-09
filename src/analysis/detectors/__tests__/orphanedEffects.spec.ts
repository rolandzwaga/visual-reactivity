import { describe, expect, it } from "vitest";
import { createReactiveNode } from "../../../types/nodes";
import { detectOrphanedEffects } from "../orphanedEffects";

describe("detectOrphanedEffects", () => {
	it("detects effects with null owner", () => {
		const nodes = [
			createReactiveNode("effect-1", "effect", "orphaned-effect", null),
			createReactiveNode("signal-1", "signal", "count", 0),
		];
		nodes[0].owner = null;
		nodes[1].owner = "root";

		const patterns = detectOrphanedEffects(nodes);

		expect(patterns).toHaveLength(1);
		expect(patterns[0].type).toBe("orphaned-effect");
		expect(patterns[0].affectedNodeIds).toEqual(["effect-1"]);
		expect(patterns[0].severity).toBe("high");
	});

	it("does not flag effects with owner", () => {
		const nodes = [
			createReactiveNode("effect-1", "effect", "valid-effect", null),
		];
		nodes[0].owner = "root";

		const patterns = detectOrphanedEffects(nodes);

		expect(patterns).toHaveLength(0);
	});

	it("generates correct pattern ID", () => {
		const nodes = [createReactiveNode("effect-1", "effect", "orphaned", null)];
		nodes[0].owner = null;

		const patterns = detectOrphanedEffects(nodes);

		expect(patterns[0].id).toMatch(/^orphaned-effect-\d+-[a-f0-9]{8}$/);
	});

	it("includes correct metadata", () => {
		const nodes = [createReactiveNode("effect-1", "effect", "orphaned", null)];
		nodes[0].owner = null;

		const patterns = detectOrphanedEffects(nodes);

		expect(patterns[0].metadata).toHaveProperty("effectId", "effect-1");
		expect(patterns[0].metadata).toHaveProperty("createdAt");
		expect(patterns[0].metadata).toHaveProperty("lastRunAt");
	});
});
