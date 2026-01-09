import { createSignal } from "solid-js";
import type { ReactivityEvent } from "../types/events";
import type { Recording, ReplayState } from "../types/replay";

export interface ReplayStore {
	state: () => ReplayState;
	setCursor: (timestamp: number) => void;
	clearCursor: () => void;
	stepForward: (events: ReactivityEvent[]) => number | null;
	stepBackward: (events: ReactivityEvent[]) => number | null;
	jumpToStart: (events: ReactivityEvent[]) => void;
	jumpToEnd: (events: ReactivityEvent[]) => void;
	loadRecording: (recording: Recording) => void;
	unloadRecording: () => void;
	subscribe: (callback: (state: ReplayState) => void) => () => void;
}

export function createReplayStore(): ReplayStore {
	const [state, setState] = createSignal<ReplayState>({
		active: false,
		cursorTimestamp: null,
		recordingId: null,
		mode: "live",
	});

	const subscribers = new Set<(state: ReplayState) => void>();

	function notifySubscribers() {
		const currentState = state();
		for (const callback of subscribers) {
			callback(currentState);
		}
	}

	function setCursor(timestamp: number) {
		if (timestamp < 0) {
			throw new Error("Cursor timestamp must be >= 0");
		}

		setState((prev) => ({
			...prev,
			active: true,
			cursorTimestamp: timestamp,
		}));
		notifySubscribers();
	}

	function clearCursor() {
		setState((prev) => ({
			...prev,
			active: false,
			cursorTimestamp: null,
		}));
		notifySubscribers();
	}

	function stepForward(events: ReactivityEvent[]): number | null {
		const current = state().cursorTimestamp;
		if (current === null) return null;

		const nextEvent = events.find((e) => e.timestamp > current);
		if (nextEvent) {
			setCursor(nextEvent.timestamp);
			return nextEvent.timestamp;
		}
		return null;
	}

	function stepBackward(events: ReactivityEvent[]): number | null {
		const current = state().cursorTimestamp;
		if (current === null) return null;

		const prevEvents = events.filter((e) => e.timestamp < current);
		if (prevEvents.length > 0) {
			const prevEvent = prevEvents[prevEvents.length - 1];
			setCursor(prevEvent.timestamp);
			return prevEvent.timestamp;
		}
		return null;
	}

	function jumpToStart(events: ReactivityEvent[]) {
		if (events.length > 0) {
			setCursor(events[0].timestamp);
		}
	}

	function jumpToEnd(events: ReactivityEvent[]) {
		if (events.length > 0) {
			setCursor(events[events.length - 1].timestamp);
		}
	}

	function loadRecording(recording: Recording) {
		setState({
			active: false,
			cursorTimestamp: null,
			recordingId: recording.id,
			mode: "replay",
		});
		notifySubscribers();
	}

	function unloadRecording() {
		setState({
			active: false,
			cursorTimestamp: null,
			recordingId: null,
			mode: "live",
		});
		notifySubscribers();
	}

	function subscribe(callback: (state: ReplayState) => void): () => void {
		subscribers.add(callback);
		callback(state());

		return () => {
			subscribers.delete(callback);
		};
	}

	return {
		state,
		setCursor,
		clearCursor,
		stepForward,
		stepBackward,
		jumpToStart,
		jumpToEnd,
		loadRecording,
		unloadRecording,
		subscribe,
	};
}
