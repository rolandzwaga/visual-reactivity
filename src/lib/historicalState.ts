import type {
	ReactivityEvent,
	SignalCreateData,
	SignalWriteData,
	SubscriptionAddData,
	SubscriptionRemoveData,
} from "../types/events";
import type { HistoricalGraphState } from "../types/replay";

interface CacheEntry {
	timestamp: number;
	state: HistoricalGraphState;
}

class LRUCache {
	private capacity: number;
	private cache: Map<number, CacheEntry>;
	private hits = 0;
	private misses = 0;

	constructor(capacity: number) {
		this.capacity = capacity;
		this.cache = new Map();
	}

	get(timestamp: number): HistoricalGraphState | null {
		const entry = this.cache.get(timestamp);
		if (entry) {
			this.hits++;
			this.cache.delete(timestamp);
			this.cache.set(timestamp, entry);
			return entry.state;
		}
		this.misses++;
		return null;
	}

	set(timestamp: number, state: HistoricalGraphState): void {
		if (this.cache.has(timestamp)) {
			this.cache.delete(timestamp);
		} else if (this.cache.size >= this.capacity) {
			const firstKey = this.cache.keys().next().value;
			if (firstKey !== undefined) {
				this.cache.delete(firstKey);
			}
		}
		this.cache.set(timestamp, { timestamp, state });
	}

	findNearest(timestamp: number): CacheEntry | null {
		let nearest: CacheEntry | null = null;
		for (const entry of this.cache.values()) {
			if (entry.timestamp <= timestamp) {
				if (!nearest || entry.timestamp > nearest.timestamp) {
					nearest = entry;
				}
			}
		}
		return nearest;
	}

	clear(): void {
		this.cache.clear();
		this.hits = 0;
		this.misses = 0;
	}

	getStats() {
		return {
			size: this.cache.size,
			hits: this.hits,
			misses: this.misses,
		};
	}
}

export interface StateReconstructor {
	reconstructAt(timestamp: number): HistoricalGraphState;
	clearCache(): void;
	getCacheStats(): { size: number; hits: number; misses: number };
}

export function createStateReconstructor(
	events: ReactivityEvent[],
): StateReconstructor {
	const cache = new LRUCache(100);

	function createEmptyState(timestamp: number): HistoricalGraphState {
		return {
			timestamp,
			activeNodes: new Map(),
			edges: [],
			disposedNodeIds: new Set(),
		};
	}

	function cloneState(state: HistoricalGraphState): HistoricalGraphState {
		return {
			timestamp: state.timestamp,
			activeNodes: new Map(state.activeNodes),
			edges: [...state.edges],
			disposedNodeIds: new Set(state.disposedNodeIds),
		};
	}

	function applyEvent(
		state: HistoricalGraphState,
		event: ReactivityEvent,
	): void {
		switch (event.type) {
			case "signal-create": {
				const signalData = event.data as SignalCreateData;
				state.activeNodes.set(event.nodeId, {
					node: {
						id: event.nodeId,
						name: event.nodeId,
						type: "signal",
					},
					value: signalData.value,
					lastUpdateTime: event.timestamp,
					createdAt: event.timestamp,
				});
				break;
			}

			case "computation-create": {
				state.activeNodes.set(event.nodeId, {
					node: {
						id: event.nodeId,
						name: event.nodeId,
						type: "computation",
					},
					value: undefined,
					lastUpdateTime: event.timestamp,
					createdAt: event.timestamp,
				});
				break;
			}

			case "signal-write": {
				const node = state.activeNodes.get(event.nodeId);
				if (node) {
					const writeData = event.data as SignalWriteData;
					node.value = writeData.newValue;
					node.lastUpdateTime = event.timestamp;
				}
				break;
			}

			case "computation-dispose": {
				state.activeNodes.delete(event.nodeId);
				state.disposedNodeIds.add(event.nodeId);
				break;
			}

			case "subscription-add": {
				const subData = event.data as SubscriptionAddData;
				state.edges.push({
					from: subData.sourceId,
					to: event.nodeId,
					type: "dependency",
				});
				break;
			}

			case "subscription-remove": {
				const subData = event.data as SubscriptionRemoveData;
				state.edges = state.edges.filter(
					(e) => !(e.from === subData.sourceId && e.to === event.nodeId),
				);
				break;
			}
		}
	}

	function reconstructAt(timestamp: number): HistoricalGraphState {
		const cached = cache.get(timestamp);
		if (cached) {
			return cached;
		}

		const nearest = cache.findNearest(timestamp);
		const startTime = nearest ? nearest.timestamp : 0;
		const startState = nearest
			? cloneState(nearest.state)
			: createEmptyState(timestamp);

		const relevantEvents = events.filter(
			(e) => e.timestamp > startTime && e.timestamp <= timestamp,
		);

		for (const event of relevantEvents) {
			applyEvent(startState, event);
		}

		startState.timestamp = timestamp;

		cache.set(timestamp, startState);

		return startState;
	}

	return {
		reconstructAt,
		clearCache: () => cache.clear(),
		getCacheStats: () => cache.getStats(),
	};
}
