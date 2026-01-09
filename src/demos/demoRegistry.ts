import type { Demo, DemoRegistry } from "./types";

export const DEMO_REGISTRY: DemoRegistry = {};

export const DEMO_LIST: Demo[] = [];

export function getDemo(id: string): Demo | undefined {
	return DEMO_REGISTRY[id];
}

export function getAllDemos(): Demo[] {
	return DEMO_LIST;
}
