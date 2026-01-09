import type { Accessor, Setter } from "solid-js";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { tracker } from "./tracker";

let currentComputation: string | null = null;
let currentOwner: string | null = null;

export function getCurrentComputation(): string | null {
	return currentComputation;
}

export interface TrackedSignalOptions<T> {
	name?: string;
	equals?: false | ((prev: T, next: T) => boolean);
}

export type TrackedSignal<T> = [get: Accessor<T>, set: Setter<T>];

export function createTrackedSignal<T>(
	initialValue: T,
	options?: TrackedSignalOptions<T>,
): TrackedSignal<T> {
	const nodeId = tracker.registerNode(
		"signal",
		options?.name ?? null,
		initialValue,
	);

	tracker.emit("signal-create", nodeId, { value: initialValue });

	const [get, set] = createSignal<T>(
		initialValue,
		options?.equals !== undefined ? { equals: options.equals } : undefined,
	);

	const trackedGet: Accessor<T> = () => {
		const value = get();

		if (currentComputation) {
			const edgeId = `dependency-${nodeId}-${currentComputation}`;
			if (!tracker.getEdges().has(edgeId)) {
				tracker.addEdge("dependency", nodeId, currentComputation);
				tracker.emit("subscription-add", currentComputation, {
					sourceId: nodeId,
				});
			}
		}

		tracker.emit("signal-read", nodeId, { value });
		return value;
	};

	const trackedSet = ((newValueOrFn: T | ((prev: T) => T)): T => {
		const previousValue = get();
		const result = set(newValueOrFn as Parameters<typeof set>[0]);
		const newValue = get();

		tracker.updateNode(nodeId, { value: newValue });
		tracker.emit("signal-write", nodeId, { previousValue, newValue });

		return result;
	}) as Setter<T>;

	return [trackedGet, trackedSet];
}

export interface TrackedMemoOptions<T> {
	name?: string;
	equals?: false | ((prev: T, next: T) => boolean);
}

export function createTrackedMemo<T>(
	fn: () => T,
	options?: TrackedMemoOptions<T>,
): Accessor<T> {
	const nodeId = tracker.registerNode("memo", options?.name ?? null, undefined);

	tracker.emit("computation-create", nodeId, { computationType: "memo" });

	const wrappedFn = (): T => {
		const prevComputation = currentComputation;
		currentComputation = nodeId;

		tracker.emit("computation-execute-start", nodeId, {});
		const startTime = performance.now();

		try {
			const result = fn();
			tracker.updateNode(nodeId, { value: result });
			return result;
		} finally {
			const durationMs = performance.now() - startTime;
			tracker.emit("computation-execute-end", nodeId, { durationMs });

			const node = tracker.getNode(nodeId);
			if (node) {
				tracker.updateNode(nodeId, {
					executionCount: node.executionCount + 1,
					lastExecutedAt: Date.now(),
				});
			}

			currentComputation = prevComputation;
		}
	};

	if (currentOwner) {
		tracker.addEdge("ownership", currentOwner, nodeId);
		tracker.updateNode(nodeId, { owner: currentOwner });
		const ownerNode = tracker.getNode(currentOwner);
		if (ownerNode) {
			ownerNode.owned.push(nodeId);
		}
	}

	const memo = createMemo(
		wrappedFn,
		undefined,
		options?.equals !== undefined ? { equals: options.equals } : undefined,
	);

	const trackMemoRead = (() => {
		const value = memo();

		if (currentComputation && currentComputation !== nodeId) {
			const edgeId = `${nodeId}->${currentComputation}`;
			if (!tracker.getEdges().has(edgeId)) {
				tracker.addEdge("dependency", nodeId, currentComputation);
				tracker.emit("subscription-add", currentComputation, {
					sourceId: nodeId,
				});
			}
		}

		return value;
	}) as Accessor<T>;

	return trackMemoRead;
}

export interface TrackedEffectOptions {
	name?: string;
}

export function createTrackedEffect(
	fn: () => void,
	options?: TrackedEffectOptions,
): () => void {
	const nodeId = tracker.registerNode(
		"effect",
		options?.name ?? null,
		undefined,
	);

	tracker.emit("computation-create", nodeId, { computationType: "effect" });

	if (currentOwner) {
		tracker.addEdge("ownership", currentOwner, nodeId);
		tracker.updateNode(nodeId, { owner: currentOwner });
		const ownerNode = tracker.getNode(currentOwner);
		if (ownerNode) {
			ownerNode.owned.push(nodeId);
		}
	}

	let isDisposed = false;

	createEffect(() => {
		if (isDisposed) return;

		const prevComputation = currentComputation;
		const prevOwner = currentOwner;
		currentComputation = nodeId;
		currentOwner = nodeId;

		tracker.emit("computation-execute-start", nodeId, {});
		const startTime = performance.now();

		try {
			fn();
		} finally {
			const durationMs = performance.now() - startTime;
			tracker.emit("computation-execute-end", nodeId, { durationMs });

			const node = tracker.getNode(nodeId);
			if (node) {
				tracker.updateNode(nodeId, {
					executionCount: node.executionCount + 1,
					lastExecutedAt: Date.now(),
				});
			}

			currentComputation = prevComputation;
			currentOwner = prevOwner;
		}

		onCleanup(() => {
			if (!isDisposed) {
				tracker.emit("computation-dispose", nodeId, {});
				tracker.updateNode(nodeId, { disposedAt: Date.now() });
			}
		});
	});

	return () => {
		if (!isDisposed) {
			isDisposed = true;
			tracker.emit("computation-dispose", nodeId, {});
			tracker.updateNode(nodeId, { disposedAt: Date.now() });
		}
	};
}
