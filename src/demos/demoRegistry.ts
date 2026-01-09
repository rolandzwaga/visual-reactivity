import { createDemoContext } from "./DemoContext";
import { DerivedState } from "./DerivedState";
import { SimpleCounter } from "./SimpleCounter";
import type { Demo, DemoRegistry } from "./types";

export const DEMO_REGISTRY: DemoRegistry = {
	"simple-counter": {
		metadata: {
			id: "simple-counter",
			name: "Simple Counter",
			concept: "Signal → Effect",
			description:
				"Demonstrates the basic reactive relationship between a signal and an effect. When the signal updates, the effect automatically re-runs.",
			instructions:
				"Click the Increment button to update the signal. Watch the dependency graph animate as the effect responds to the signal change.",
		},
		component: SimpleCounter,
		setup: () => createDemoContext(() => {}),
	},
	"derived-state": {
		metadata: {
			id: "derived-state",
			name: "Derived State",
			concept: "Signal → Memo → Effect",
			description:
				"Shows how memos cache derived computations. The memo only recalculates when its dependency (the signal) changes, not on every read.",
			instructions:
				"Click Increment to update the signal. Notice the memo automatically recomputes the doubled value, and the effect observes the memo.",
		},
		component: DerivedState,
		setup: () => createDemoContext(() => {}),
	},
};

export const DEMO_LIST: Demo[] = [
	DEMO_REGISTRY["simple-counter"],
	DEMO_REGISTRY["derived-state"],
];

export function getDemo(id: string): Demo | undefined {
	return DEMO_REGISTRY[id];
}

export function getAllDemos(): Demo[] {
	return DEMO_LIST;
}
