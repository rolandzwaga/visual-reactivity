import type {
	EdgeType,
	EventData,
	EventType,
	NodeType,
	ReactiveEdge,
	ReactiveNode,
	ReactivityEvent,
} from "../types";
import {
	createReactiveEdge,
	createReactiveNode,
	createReactivityEvent,
} from "../types";

export type EventCallback = (event: ReactivityEvent) => void;

class ReactivityTracker {
	private nodes = new Map<string, ReactiveNode>();
	private edges = new Map<string, ReactiveEdge>();
	private subscribers = new Set<EventCallback>();
	private nodeCounter = 0;
	private eventCounter = 0;

	registerNode(type: NodeType, name: string | null, value: unknown): string {
		const id = this.generateNodeId(type);
		const node = createReactiveNode(id, type, name, value);
		this.nodes.set(id, node);
		return id;
	}

	getNode(id: string): ReactiveNode | undefined {
		return this.nodes.get(id);
	}

	getNodes(): ReadonlyMap<string, ReactiveNode> {
		return this.nodes;
	}

	updateNode(id: string, updates: Partial<ReactiveNode>): void {
		const node = this.nodes.get(id);
		if (node) {
			Object.assign(node, updates);
		}
	}

	addEdge(type: EdgeType, source: string, target: string): string {
		const edge = createReactiveEdge(type, source, target);
		this.edges.set(edge.id, edge);

		const sourceNode = this.nodes.get(source);
		const targetNode = this.nodes.get(target);

		if (sourceNode && !sourceNode.observers.includes(target)) {
			sourceNode.observers.push(target);
		}
		if (targetNode && !targetNode.sources.includes(source)) {
			targetNode.sources.push(source);
		}

		return edge.id;
	}

	removeEdge(edgeId: string): void {
		const edge = this.edges.get(edgeId);
		if (!edge) return;

		const sourceNode = this.nodes.get(edge.source);
		const targetNode = this.nodes.get(edge.target);

		if (sourceNode) {
			sourceNode.observers = sourceNode.observers.filter(
				(id) => id !== edge.target,
			);
		}
		if (targetNode) {
			targetNode.sources = targetNode.sources.filter(
				(id) => id !== edge.source,
			);
		}

		this.edges.delete(edgeId);
	}

	getEdges(): ReadonlyMap<string, ReactiveEdge> {
		return this.edges;
	}

	getEdgesByType(type: EdgeType): ReactiveEdge[] {
		return Array.from(this.edges.values()).filter((edge) => edge.type === type);
	}

	getEdgesForNode(nodeId: string): ReactiveEdge[] {
		return Array.from(this.edges.values()).filter(
			(edge) => edge.source === nodeId || edge.target === nodeId,
		);
	}

	private generateNodeId(type: NodeType): string {
		return `${type}-${++this.nodeCounter}`;
	}

	generateEventId(): string {
		return `event-${++this.eventCounter}`;
	}

	subscribe(callback: EventCallback): () => void {
		this.subscribers.add(callback);
		return () => {
			this.subscribers.delete(callback);
		};
	}

	emit(type: EventType, nodeId: string, data: EventData): void {
		const event = createReactivityEvent(
			this.generateEventId(),
			type,
			nodeId,
			data,
		);
		for (const callback of this.subscribers) {
			callback(event);
		}
	}

	reset(): void {
		this.nodes.clear();
		this.edges.clear();
		this.subscribers.clear();
		this.nodeCounter = 0;
		this.eventCounter = 0;
	}
}

export const tracker = new ReactivityTracker();
