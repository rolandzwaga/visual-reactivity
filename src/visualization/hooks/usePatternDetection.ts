import { createEffect, onCleanup } from "solid-js";
import type { PatternDetector } from "../../analysis/patternDetector";
import type { PatternStore } from "../../stores/patternStore";

export function usePatternDetection(
	detector: PatternDetector,
	store: PatternStore,
): void {
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	const runAnalysis = (): void => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			try {
				store.setStatus("analyzing");
				const result = detector.runAnalysis();
				store.clearPatterns();
				store.addPatterns(result.patterns);
				store.setStatus("success");
			} catch (error) {
				console.error("Pattern detection failed:", error);
				store.setStatus("error", String(error));
			}
		}, 300);
	};

	createEffect(() => {
		runAnalysis();
	});

	onCleanup(() => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
	});
}
