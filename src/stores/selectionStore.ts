import { batch, createMemo, createSignal } from "solid-js";
import { tracker } from "../instrumentation";
import {
	addToSet,
	canAddToSelection,
	createSelectionEvent,
	MAX_SELECTION_SIZE,
	removeFromSet,
	toggleInSet,
	validateNodeId,
} from "../lib/selectionUtils";
import type {
	SelectionEvent,
	SelectionStore,
	ViewType,
} from "../types/selection";

export function createSelectionStore(): SelectionStore {
	const [selectedNodeIds, setSelectedNodeIds] = createSignal<Set<string>>(
		new Set(),
	);
	const [hoveredNodeId, setHoveredNodeId] = createSignal<string | null>(null);
	const [selectionSource, setSelectionSource] = createSignal<ViewType | null>(
		null,
	);
	const [_lastSelectionTime, setLastSelectionTime] = createSignal<number>(0);

	const selectionCount = createMemo(() => selectedNodeIds().size);

	const subscribers = new Map<string, (event: SelectionEvent) => void>();

	const emitEvent = (event: SelectionEvent) => {
		for (const callback of subscribers.values()) {
			callback(event);
		}
	};

	const isNodeSelected = (nodeId: string): boolean => {
		return selectedNodeIds().has(nodeId);
	};

	const selectNode = (
		nodeId: string,
		multiSelect: boolean,
		source: ViewType | null = null,
	): void => {
		if (!validateNodeId(nodeId)) {
			throw new Error(`Node ID "${nodeId}" does not exist in tracker`);
		}

		const oldSelection = selectedNodeIds();

		if (multiSelect) {
			if (!canAddToSelection(oldSelection.size, 1)) {
				throw new Error(
					`Cannot add node: selection limit of ${MAX_SELECTION_SIZE} exceeded`,
				);
			}
			const newSelection = addToSet(oldSelection, nodeId);

			batch(() => {
				setSelectedNodeIds(newSelection);
				setSelectionSource(source);
				setLastSelectionTime(Date.now());
			});

			emitEvent(
				createSelectionEvent(
					"selection-add",
					oldSelection,
					newSelection,
					"click",
					source,
				),
			);
		} else {
			const newSelection = new Set([nodeId]);

			batch(() => {
				setSelectedNodeIds(newSelection);
				setSelectionSource(source);
				setLastSelectionTime(Date.now());
			});

			emitEvent(
				createSelectionEvent(
					"selection-replace",
					oldSelection,
					newSelection,
					"click",
					source,
				),
			);
		}
	};

	const deselectNode = (
		nodeId: string,
		source: ViewType | null = null,
	): void => {
		const oldSelection = selectedNodeIds();
		const newSelection = removeFromSet(oldSelection, nodeId);

		batch(() => {
			setSelectedNodeIds(newSelection);
			setSelectionSource(source);
			setLastSelectionTime(Date.now());
		});

		emitEvent(
			createSelectionEvent(
				"selection-remove",
				oldSelection,
				newSelection,
				"click",
				source,
			),
		);
	};

	const toggleNodeSelection = (
		nodeId: string,
		source: ViewType | null = null,
	): void => {
		if (!validateNodeId(nodeId)) {
			throw new Error(`Node ID "${nodeId}" does not exist in tracker`);
		}

		const oldSelection = selectedNodeIds();
		const wasSelected = oldSelection.has(nodeId);

		if (!wasSelected && !canAddToSelection(oldSelection.size, 1)) {
			throw new Error(
				`Cannot add node: selection limit of ${MAX_SELECTION_SIZE} exceeded`,
			);
		}

		const newSelection = toggleInSet(oldSelection, nodeId);
		const eventType = wasSelected ? "selection-remove" : "selection-add";

		batch(() => {
			setSelectedNodeIds(newSelection);
			setSelectionSource(source);
			setLastSelectionTime(Date.now());
		});

		emitEvent(
			createSelectionEvent(
				eventType,
				oldSelection,
				newSelection,
				"click",
				source,
			),
		);
	};

	const setSelection = (
		nodeIds: Set<string> | string[],
		source: ViewType | null = null,
	): void => {
		const nodeIdArray = Array.isArray(nodeIds) ? nodeIds : Array.from(nodeIds);

		if (!canAddToSelection(0, nodeIdArray.length)) {
			throw new Error(
				`Cannot set selection: exceeds limit of ${MAX_SELECTION_SIZE} nodes`,
			);
		}

		const oldSelection = selectedNodeIds();
		const newSelection = new Set(nodeIdArray);

		batch(() => {
			setSelectedNodeIds(newSelection);
			setSelectionSource(source);
			setLastSelectionTime(Date.now());
		});

		emitEvent(
			createSelectionEvent(
				"selection-replace",
				oldSelection,
				newSelection,
				"batch",
				source,
			),
		);
	};

	const clearSelection = (source: ViewType | null = null): void => {
		const oldSelection = selectedNodeIds();
		const newSelection = new Set<string>();

		batch(() => {
			setSelectedNodeIds(newSelection);
			setSelectionSource(source);
			setLastSelectionTime(Date.now());
		});

		emitEvent(
			createSelectionEvent(
				"selection-clear",
				oldSelection,
				newSelection,
				"click",
				source,
			),
		);
	};

	const setHoveredNode = (
		nodeId: string | null,
		source: ViewType | null = null,
	): void => {
		batch(() => {
			setHoveredNodeId(nodeId);
			setSelectionSource(source);
		});
	};

	const navigateToNextObserver = (currentNodeId: string): string | null => {
		const node = tracker.getNode(currentNodeId);
		if (!node) return null;

		const edges = tracker.getEdgesForNode(currentNodeId);
		const observers = edges.filter((edge) => edge.source === currentNodeId);

		return observers.length > 0 ? observers[0].target : null;
	};

	const navigateToNextSource = (currentNodeId: string): string | null => {
		const node = tracker.getNode(currentNodeId);
		if (!node) return null;

		const edges = tracker.getEdgesForNode(currentNodeId);
		const sources = edges.filter((edge) => edge.target === currentNodeId);

		return sources.length > 0 ? sources[0].source : null;
	};

	const navigateToOwner = (currentNodeId: string): string | null => {
		const node = tracker.getNode(currentNodeId);
		if (!node) return null;

		return node.owner ?? null;
	};

	const navigateToFirstChild = (currentNodeId: string): string | null => {
		const node = tracker.getNode(currentNodeId);
		if (!node) return null;

		if (node.owned && node.owned.length > 0) {
			return node.owned[0];
		}

		return null;
	};

	const subscribe = (
		viewId: string,
		callback: (event: SelectionEvent) => void,
	): (() => void) => {
		subscribers.set(viewId, callback);

		return () => {
			subscribers.delete(viewId);
		};
	};

	return {
		selectedNodeIds,
		hoveredNodeId,
		selectionSource,
		selectionCount,
		isNodeSelected,
		selectNode,
		deselectNode,
		toggleNodeSelection,
		setSelection,
		clearSelection,
		setHoveredNode,
		navigateToNextObserver,
		navigateToNextSource,
		navigateToOwner,
		navigateToFirstChild,
		subscribe,
	};
}
