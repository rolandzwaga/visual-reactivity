import type { JSX } from "solid-js";

export interface DemoMetadata {
	id: string;
	name: string;
	concept: string;
	description: string;
	instructions: string;
}

export interface DemoContext {
	dispose: () => void;
}

export interface Demo {
	metadata: DemoMetadata;
	component: () => JSX.Element;
	setup: () => DemoContext;
}

export interface DemoRegistry {
	[key: string]: Demo;
}
