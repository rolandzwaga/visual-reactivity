import { describe, expect, it } from "vitest";
import { testInRoot } from "../../__tests__/helpers/solidjs";
import type { Pattern } from "../../types/pattern";
import { createPatternStore } from "../patternStore";

describe("PatternStore", () => {
	it("initializes with empty patterns", () => {
		testInRoot(() => {
			const store = createPatternStore();
			expect(store.patterns()).toEqual([]);
		});
	});

	it("adds pattern to store", () => {
		testInRoot(() => {
			const store = createPatternStore();
			const pattern: Pattern = {
				id: "test-1",
				type: "orphaned-effect",
				severity: "high",
				affectedNodeIds: ["node-1"],
				timestamp: Date.now(),
				description: "Test pattern",
				remediation: "Fix it",
				metadata: {},
				isExpected: false,
			};

			store.addPattern(pattern);
			expect(store.patterns()).toHaveLength(1);
			expect(store.patterns()[0].id).toBe("test-1");
		});
	});

	it("removes pattern from store", () => {
		testInRoot(() => {
			const store = createPatternStore();
			const pattern: Pattern = {
				id: "test-1",
				type: "orphaned-effect",
				severity: "high",
				affectedNodeIds: ["node-1"],
				timestamp: Date.now(),
				description: "Test pattern",
				remediation: "Fix it",
				metadata: {},
				isExpected: false,
			};

			store.addPattern(pattern);
			store.removePattern("test-1");
			expect(store.patterns()).toHaveLength(0);
		});
	});

	it("marks pattern as expected", () => {
		testInRoot(() => {
			const store = createPatternStore();
			const pattern: Pattern = {
				id: "test-1",
				type: "orphaned-effect",
				severity: "high",
				affectedNodeIds: ["node-1"],
				timestamp: Date.now(),
				description: "Test pattern",
				remediation: "Fix it",
				metadata: {},
				isExpected: false,
			};

			store.addPattern(pattern);
			store.markAsExpected("test-1", "Intentional design");
			expect(store.patterns()[0].isExpected).toBe(true);
			expect(store.isExpected("test-1")).toBe(true);
		});
	});

	it("filters patterns by type", () => {
		testInRoot(() => {
			const store = createPatternStore();
			store.addPattern({
				id: "test-1",
				type: "orphaned-effect",
				severity: "high",
				affectedNodeIds: ["node-1"],
				timestamp: Date.now(),
				description: "Test",
				remediation: "Fix",
				metadata: {},
				isExpected: false,
			});
			store.addPattern({
				id: "test-2",
				type: "deep-chain",
				severity: "medium",
				affectedNodeIds: ["node-2"],
				timestamp: Date.now(),
				description: "Test",
				remediation: "Fix",
				metadata: {},
				isExpected: false,
			});

			const orphanedPatterns = store.getPatternsByType("orphaned-effect");
			expect(orphanedPatterns).toHaveLength(1);
			expect(orphanedPatterns[0].type).toBe("orphaned-effect");
		});
	});
});
