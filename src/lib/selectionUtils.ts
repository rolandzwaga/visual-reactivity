/**
 * Selection utility functions
 * @module lib/selectionUtils
 * @feature 007-view-sync
 */

import { tracker } from "../instrumentation";
import type {
	SelectionAction,
	SelectionEvent,
	SelectionEventType,
} from "../types/selection";

/**
 * Validates that a node ID exists in the tracker
 */
export function validateNodeId(nodeId: string): boolean {
	return tracker.getNode(nodeId) !== undefined;
}

/**
 * Validates multiple node IDs exist in the tracker
 */
export function validateNodeIds(nodeIds: string[]): boolean {
	return nodeIds.every((id) => validateNodeId(id));
}

/**
 * Adds a node ID to a Set immutably
 */
export function addToSet(set: Set<string>, nodeId: string): Set<string> {
	const newSet = new Set(set);
	newSet.add(nodeId);
	return newSet;
}

/**
 * Removes a node ID from a Set immutably
 */
export function removeFromSet(set: Set<string>, nodeId: string): Set<string> {
	const newSet = new Set(set);
	newSet.delete(nodeId);
	return newSet;
}

/**
 * Toggles a node ID in a Set immutably
 */
export function toggleInSet(set: Set<string>, nodeId: string): Set<string> {
	const newSet = new Set(set);
	if (newSet.has(nodeId)) {
		newSet.delete(nodeId);
	} else {
		newSet.add(nodeId);
	}
	return newSet;
}

/**
 * Computes delta between two Sets (added and removed items)
 */
export function computeSetDelta(
	oldSet: Set<string>,
	newSet: Set<string>,
): { added: string[]; removed: string[] } {
	const added: string[] = [];
	const removed: string[] = [];

	for (const item of newSet) {
		if (!oldSet.has(item)) {
			added.push(item);
		}
	}

	for (const item of oldSet) {
		if (!newSet.has(item)) {
			removed.push(item);
		}
	}

	return { added, removed };
}

/**
 * Creates a SelectionEvent from state change
 */
export function createSelectionEvent(
	type: SelectionEventType,
	oldSelection: Set<string>,
	newSelection: Set<string>,
	triggeringAction: SelectionAction,
	source: string | null,
): SelectionEvent {
	const { added, removed } = computeSetDelta(oldSelection, newSelection);

	return {
		type,
		addedNodeIds: added,
		removedNodeIds: removed,
		currentSelection: new Set(newSelection),
		triggeringAction,
		timestamp: Date.now(),
		source: source as SelectionEvent["source"],
	};
}

/**
 * Maximum number of nodes that can be selected simultaneously
 */
export const MAX_SELECTION_SIZE = 1000;

/**
 * Checks if adding nodes would exceed selection limit
 */
export function canAddToSelection(
	currentSize: number,
	adding: number,
): boolean {
	return currentSize + adding <= MAX_SELECTION_SIZE;
}
