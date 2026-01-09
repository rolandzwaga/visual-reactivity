import type { SelectionStore, ViewType } from "../../types/selection";

export interface KeyboardNavContext {
	activeView: ViewType;
}

export interface KeyboardNavController {
	handleKeyDown: (event: KeyboardEvent) => void;
	navContext: () => KeyboardNavContext;
}

export function useKeyboardNav(
	activeView: ViewType,
	selection: SelectionStore,
): KeyboardNavController {
	const navContext = (): KeyboardNavContext => ({
		activeView,
	});

	const handleKeyDown = (event: KeyboardEvent): void => {
		const currentNode = Array.from(selection.selectedNodeIds())[0];

		if (event.key === "Escape") {
			event.preventDefault();
			selection.clearSelection(activeView);
			return;
		}

		if (!currentNode) {
			return;
		}

		let nextNodeId: string | null = null;

		if (activeView === "graph") {
			if (event.key === "ArrowRight") {
				nextNodeId = selection.navigateToNextObserver(currentNode);
			} else if (event.key === "ArrowLeft") {
				nextNodeId = selection.navigateToNextSource(currentNode);
			}
		} else if (activeView === "tree") {
			if (event.key === "ArrowDown") {
				nextNodeId = selection.navigateToFirstChild(currentNode);
			} else if (event.key === "ArrowUp") {
				nextNodeId = selection.navigateToOwner(currentNode);
			}
		}

		if (nextNodeId) {
			event.preventDefault();
			selection.selectNode(nextNodeId, false, activeView);
		}
	};

	return {
		handleKeyDown,
		navContext,
	};
}
