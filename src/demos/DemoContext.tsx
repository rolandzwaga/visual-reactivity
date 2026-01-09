import { createRoot } from "solid-js";
import { tracker } from "../instrumentation";
import type { DemoContext } from "./types";

export function createDemoContext(fn: () => void): DemoContext {
	let dispose: (() => void) | null = null;

	createRoot((d) => {
		dispose = d;
		fn();
	});

	return {
		dispose: () => {
			if (dispose) {
				dispose();
			}
			tracker.reset();
		},
	};
}
