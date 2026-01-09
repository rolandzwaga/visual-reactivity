import type { Accessor } from "solid-js";
import type { SelectionStore, ViewType } from "../../types/selection";

export interface UseSelectionSyncReturn {
	isNodeSelected(nodeId: string): boolean;
	handleNodeClick(nodeId: string, event: MouseEvent): void;
	highlightedNodeIds: Accessor<Set<string>>;
}

export function useSelectionSync(
	viewType: ViewType,
	selection: SelectionStore,
): UseSelectionSyncReturn {
	const isNodeSelected = (nodeId: string): boolean => {
		return selection.isNodeSelected(nodeId);
	};

	const handleNodeClick = (nodeId: string, event: MouseEvent): void => {
		const multiSelect = event.ctrlKey || event.metaKey;
		if (multiSelect) {
			selection.toggleNodeSelection(nodeId, viewType);
		} else {
			selection.selectNode(nodeId, false, viewType);
		}
	};

	const highlightedNodeIds = selection.selectedNodeIds;

	return {
		isNodeSelected,
		handleNodeClick,
		highlightedNodeIds,
	};
}
