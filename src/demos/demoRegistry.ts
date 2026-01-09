import { BatchUpdates } from "./BatchUpdates";
import { ComponentTree } from "./ComponentTree";
import { ConditionalDependencies } from "./ConditionalDependencies";
import { DeepChain } from "./DeepChain";
import { createDemoContext } from "./DemoContext";
import { DerivedState } from "./DerivedState";
import { DiamondPattern } from "./DiamondPattern";
import { NestedEffects } from "./NestedEffects";
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
	"diamond-pattern": {
		metadata: {
			id: "diamond-pattern",
			name: "Diamond Pattern",
			concept: "Glitch-Free Execution",
			description:
				"Demonstrates glitch-free execution where one signal feeds two memos, which both feed one effect. The effect runs exactly once per signal update.",
			instructions:
				"Change the input value to update the signal. Watch how both memo branches update before the final effect runs, ensuring consistent state.",
		},
		component: DiamondPattern,
		setup: () => createDemoContext(() => {}),
	},
	"batch-updates": {
		metadata: {
			id: "batch-updates",
			name: "Batch Updates",
			concept: "Batching",
			description:
				"Shows how batch() groups multiple signal updates so dependent effects run only once. Compare with individual updates that trigger effects multiple times.",
			instructions:
				'Click "Update All (Batched)" to see one effect execution. Click "Update Individually" to see three separate effect executions. Watch the timeline view to see batching in action.',
		},
		component: BatchUpdates,
		setup: () => createDemoContext(() => {}),
	},
	"nested-effects": {
		metadata: {
			id: "nested-effects",
			name: "Nested Effects",
			concept: "Ownership & Disposal",
			description:
				"Demonstrates ownership tree and automatic disposal of nested computations when parent re-runs. Old child effects are cleaned up and new ones are created.",
			instructions:
				"Click Toggle State to switch between effect sets. Watch the ownership tree view to see child effects being disposed and recreated as the parent effect runs.",
		},
		component: NestedEffects,
		setup: () => createDemoContext(() => {}),
	},
	"conditional-dependencies": {
		metadata: {
			id: "conditional-dependencies",
			name: "Conditional Dependencies",
			concept: "Dynamic Dependencies",
			description:
				"Shows how dependency edges change at runtime based on conditional logic. The effect depends on different signals depending on the condition.",
			instructions:
				"Click Toggle Source to switch between Signal A and Signal B. Update each signal independently and observe that only the active dependency triggers the effect.",
		},
		component: ConditionalDependencies,
		setup: () => createDemoContext(() => {}),
	},
	"deep-chain": {
		metadata: {
			id: "deep-chain",
			name: "Deep Chain",
			concept: "Propagation Depth",
			description:
				"Demonstrates synchronous propagation through a long chain of dependent computations. Updates cascade through all 5 nodes in sequence.",
			instructions:
				"Click Increment A to update the source signal. Watch the animation cascade from Signal A → Memo B → Memo C → Memo D → Effect E in the dependency graph.",
		},
		component: DeepChain,
		setup: () => createDemoContext(() => {}),
	},
	"component-tree": {
		metadata: {
			id: "component-tree",
			name: "Component Tree",
			concept: "Component Hierarchy",
			description:
				"Shows realistic component hierarchy with shared state. Multiple components react to the same signals, and component disposal cleans up effects properly.",
			instructions:
				"Toggle Theme to see shared signal affecting all components. Add/Delete todos to observe component creation and disposal in the ownership tree view.",
		},
		component: ComponentTree,
		setup: () => createDemoContext(() => {}),
	},
};

export const DEMO_LIST: Demo[] = [
	DEMO_REGISTRY["simple-counter"],
	DEMO_REGISTRY["derived-state"],
	DEMO_REGISTRY["diamond-pattern"],
	DEMO_REGISTRY["batch-updates"],
	DEMO_REGISTRY["nested-effects"],
	DEMO_REGISTRY["conditional-dependencies"],
	DEMO_REGISTRY["deep-chain"],
	DEMO_REGISTRY["component-tree"],
];

export function getDemo(id: string): Demo | undefined {
	return DEMO_REGISTRY[id];
}

export function getAllDemos(): Demo[] {
	return DEMO_LIST;
}
