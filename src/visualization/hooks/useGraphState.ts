import { createSignal } from "solid-js";
import type { EdgeType, ReactiveNode } from "../../types";
import { createReactiveEdge } from "../../types";
import {
	createGraphEdge,
	createGraphNode,
	type GraphEdge,
	type GraphNode,
} from "../types";

export interface GraphStateActions {
	nodes: () => GraphNode[];
	edges: () => GraphEdge[];
	selectedNodeId: () => string | null;
	hoveredNodeId: () => string | null;
	addNode: (node: ReactiveNode) => void;
	removeNode: (id: string) => void;
	addEdge: (source: string, target: string, type: EdgeType) => void;
	removeEdge: (source: string, target: string) => void;
	setSelectedNode: (id: string | null) => void;
	setHoveredNode: (id: string | null) => void;
	getNodeById: (id: string) => GraphNode | undefined;
	reset: () => void;
}

export function useGraphState(): GraphStateActions {
	const [nodes, setNodes] = createSignal<GraphNode[]>([]);
	const [edges, setEdges] = createSignal<GraphEdge[]>([]);
	const [selectedNodeId, setSelectedNodeId] = createSignal<string | null>(null);
	const [hoveredNodeId, setHoveredNodeId] = createSignal<string | null>(null);

	function addNode(reactiveNode: ReactiveNode): void {
		const graphNode = createGraphNode(
			reactiveNode,
			Math.random() * 400 + 200,
			Math.random() * 300 + 150,
		);
		setNodes((prev) => [...prev, graphNode]);
	}

	function removeNode(id: string): void {
		setNodes((prev) => prev.filter((n) => n.id !== id));
		setEdges((prev) =>
			prev.filter((e) => {
				const sourceId = typeof e.source === "string" ? e.source : e.source.id;
				const targetId = typeof e.target === "string" ? e.target : e.target.id;
				return sourceId !== id && targetId !== id;
			}),
		);
		if (selectedNodeId() === id) {
			setSelectedNodeId(null);
		}
		if (hoveredNodeId() === id) {
			setHoveredNodeId(null);
		}
	}

	function addEdge(source: string, target: string, type: EdgeType): void {
		const id = `${type}-${source}-${target}`;
		const existingEdge = edges().find((e) => e.id === id);
		if (existingEdge) return;

		const reactiveEdge = createReactiveEdge(type, source, target);
		const edge = createGraphEdge(reactiveEdge);
		setEdges((prev) => [...prev, edge]);
	}

	function removeEdge(source: string, target: string): void {
		setEdges((prev) =>
			prev.filter((e) => {
				const sourceId = typeof e.source === "string" ? e.source : e.source.id;
				const targetId = typeof e.target === "string" ? e.target : e.target.id;
				return !(sourceId === source && targetId === target);
			}),
		);
	}

	function setSelectedNode(id: string | null): void {
		setSelectedNodeId(id);
	}

	function setHoveredNode(id: string | null): void {
		setHoveredNodeId(id);
	}

	function getNodeById(id: string): GraphNode | undefined {
		return nodes().find((n) => n.id === id);
	}

	function reset(): void {
		setNodes([]);
		setEdges([]);
		setSelectedNodeId(null);
		setHoveredNodeId(null);
	}

	return {
		nodes,
		edges,
		selectedNodeId,
		hoveredNodeId,
		addNode,
		removeNode,
		addEdge,
		removeEdge,
		setSelectedNode,
		setHoveredNode,
		getNodeById,
		reset,
	};
}
