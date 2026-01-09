import { createRoot, type Owner } from "solid-js";
import { tracker } from "../instrumentation";
import type { DemoContext } from "./types";

export function createDemoContext(
	fn: (dispose: () => void) => void,
): DemoContext {
	let owner: Owner | null = null;

	const dispose = () => {
		if (owner) {
			owner = null;
		}
		tracker.reset();
	};

	createRoot((disposeRoot) => {
		owner = disposeRoot as unknown as Owner;
		fn(dispose);
	});

	return { dispose };
}
