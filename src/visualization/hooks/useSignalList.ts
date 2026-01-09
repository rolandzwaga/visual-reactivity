import type { Accessor } from "solid-js";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { tracker } from "../../instrumentation/tracker";
import { serializeValue } from "../../lib/valueSerializer";
import {
	createReactivityEvent,
	type ReactivityEvent,
} from "../../types/events";
import type { SignalEntry, UseSignalListReturn } from "../../types/panel";

/**
 * Hook for managing the list of tracked signals.
 *
 * Subscribes to tracker events and maintains a reactive list of SignalEntry objects.
 * Automatically updates when signals are created, updated, or disposed.
 *
 * @returns Signal list state and methods
 */
export function useSignalList(): UseSignalListReturn {
	// Map of signal entries by ID
	const [signalEntries, setSignalEntries] = createSignal<
		Map<string, SignalEntry>
	>(new Map());

	/**
	 * Create a SignalEntry from a tracker node.
	 */
	const createSignalEntry = (nodeId: string): SignalEntry | null => {
		const node = tracker.getNode(nodeId);
		if (!node) return null;

		// Only track signals and memos (not effects)
		if (node.type !== "signal" && node.type !== "memo") {
			return null;
		}

		const serialization = serializeValue(node.value);

		return {
			id: node.id,
			name: node.name,
			type: node.type,
			currentValue: node.value,
			serializedValue: serialization.serialized,
			isEditable: node.type === "signal",
			updateCount: 0,
			lastUpdatedAt: Date.now(),
			valueHistory: [],
		};
	};

	/**
	 * Handle tracker events.
	 */
	const handleEvent = (event: ReactivityEvent) => {
		setSignalEntries((entries) => {
			const newEntries = new Map(entries);

			switch (event.type) {
				case "signal-create":
				case "computation-create": {
					const entry = createSignalEntry(event.nodeId);
					if (entry) {
						newEntries.set(event.nodeId, entry);
					}
					break;
				}

				case "signal-write": {
					const existing = newEntries.get(event.nodeId);
					if (existing) {
						const node = tracker.getNode(event.nodeId);
						if (node) {
							const serialization = serializeValue(node.value);
							newEntries.set(event.nodeId, {
								...existing,
								currentValue: node.value,
								serializedValue: serialization.serialized,
								updateCount: existing.updateCount + 1,
								lastUpdatedAt: Date.now(),
							});
						}
					} else {
						// New signal we haven't seen yet
						const entry = createSignalEntry(event.nodeId);
						if (entry) {
							newEntries.set(event.nodeId, entry);
						}
					}
					break;
				}

				case "computation-dispose": {
					newEntries.delete(event.nodeId);
					break;
				}
			}

			return newEntries;
		});
	};

	// Subscribe to tracker events on mount
	onMount(() => {
		// Get initial signals from tracker
		const nodes = Array.from(tracker.getNodes().values());
		const initialEntries = new Map<string, SignalEntry>();

		for (const node of nodes) {
			const entry = createSignalEntry(node.id);
			if (entry) {
				initialEntries.set(node.id, entry);
			}
		}

		setSignalEntries(initialEntries);

		// Subscribe to future events
		const unsubscribe = tracker.subscribe(handleEvent);

		onCleanup(() => {
			unsubscribe();
		});
	});

	/**
	 * Sorted signal array (alphabetically by name).
	 */
	const signals = createMemo<SignalEntry[]>(() => {
		const entries = Array.from(signalEntries().values());
		return entries.sort((a, b) => {
			const nameA = a.name || a.id;
			const nameB = b.name || b.id;
			return nameA.localeCompare(nameB);
		});
	});

	/**
	 * Get a specific signal entry by ID.
	 */
	const getSignal = (id: string): SignalEntry | undefined => {
		return signalEntries().get(id);
	};

	/**
	 * Update a signal's value (for editing).
	 * Note: This updates the tracker's node value but doesn't call the actual signal setter.
	 * For full reactivity, we'd need to store and call the setter function.
	 */
	const updateSignalValue = (id: string, newValue: unknown) => {
		const node = tracker.getNode(id);
		if (node && node.type === "signal") {
			const previousValue = node.value;

			// Update the node value in the tracker
			tracker.updateNode(id, { value: newValue });

			// Emit the signal-write event to update the UI
			const event = createReactivityEvent(
				`event-${Date.now()}`,
				"signal-write",
				id,
				{ previousValue, newValue },
			);
			handleEvent(event);
		}
	};

	return {
		signalEntries: signalEntries as Accessor<Map<string, SignalEntry>>,
		signals: signals as Accessor<SignalEntry[]>,
		getSignal,
		updateSignalValue,
	};
}
