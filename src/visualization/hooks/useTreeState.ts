import { type Accessor, createSignal, type Setter } from "solid-js";

export interface TreeState {
	expandedNodes: Accessor<Set<string>>;
	setExpandedNodes: Setter<Set<string>>;
	disposingNodes: Accessor<Map<string, number>>;
	setDisposingNodes: Setter<Map<string, number>>;
	selectedNodeId: Accessor<string | null>;
	setSelectedNodeId: Setter<string | null>;
	hoveredNodeId: Accessor<string | null>;
	setHoveredNodeId: Setter<string | null>;
	toggleExpanded: (nodeId: string) => void;
	markDisposing: (nodeId: string) => void;
	reset: () => void;
}

export function useTreeState(initialExpanded?: Set<string>): TreeState {
	const [expandedNodes, setExpandedNodes] = createSignal<Set<string>>(
		initialExpanded ?? new Set(),
	);
	const [disposingNodes, setDisposingNodes] = createSignal<Map<string, number>>(
		new Map(),
	);
	const [selectedNodeId, setSelectedNodeId] = createSignal<string | null>(null);
	const [hoveredNodeId, setHoveredNodeId] = createSignal<string | null>(null);

	function toggleExpanded(nodeId: string): void {
		setExpandedNodes((prev) => {
			const next = new Set(prev);
			if (next.has(nodeId)) {
				next.delete(nodeId);
			} else {
				next.add(nodeId);
			}
			return next;
		});
	}

	function markDisposing(nodeId: string): void {
		setDisposingNodes((prev) => {
			const next = new Map(prev);
			next.set(nodeId, Date.now());
			return next;
		});

		setTimeout(() => {
			setDisposingNodes((prev) => {
				const next = new Map(prev);
				next.delete(nodeId);
				return next;
			});
		}, 5000);
	}

	function reset(): void {
		setExpandedNodes(new Set<string>());
		setDisposingNodes(new Map<string, number>());
		setSelectedNodeId(null);
		setHoveredNodeId(null);
	}

	return {
		expandedNodes,
		setExpandedNodes,
		disposingNodes,
		setDisposingNodes,
		selectedNodeId,
		setSelectedNodeId,
		hoveredNodeId,
		setHoveredNodeId,
		toggleExpanded,
		markDisposing,
		reset,
	};
}
