import { describe, expect, it } from "vitest";
import { createReactiveNode } from "../../types/nodes";
import { createPatternDetector } from "../patternDetector";

describe("PatternDetector", () => {
	it("creates detector instance", () => {
		const detector = createPatternDetector(
			() => [],
			() => [],
		);
		expect(detector).toBeDefined();
		expect(detector.runAnalysis).toBeDefined();
	});

	it("runAnalysis returns result with empty patterns", () => {
		const detector = createPatternDetector(
			() => [],
			() => [],
		);
		const result = detector.runAnalysis();
		expect(result.patterns).toEqual([]);
		expect(result.nodesAnalyzed).toBe(0);
		expect(result.edgesAnalyzed).toBe(0);
	});

	it("detects orphaned effects", () => {
		const node = createReactiveNode("effect-1", "effect", "test-effect", null);
		node.owner = null;

		const detector = createPatternDetector(
			() => [node],
			() => [],
		);
		const result = detector.runAnalysis();
		expect(result.patterns.length).toBeGreaterThan(0);
		expect(result.patterns[0].type).toBe("orphaned-effect");
	});

	it("resets internal state", () => {
		const detector = createPatternDetector(
			() => [],
			() => [],
		);
		detector.reset();
		expect(detector.runAnalysis().patterns).toEqual([]);
	});
});
