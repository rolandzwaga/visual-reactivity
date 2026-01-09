/**
 * API Contract: ReplayStore
 *
 * Central store for managing replay mode state, cursor position, and recording loading.
 * Provides subscription mechanism for components to react to replay state changes.
 *
 * Feature: 009-timeline-playback
 *
 * @see data-model.md for ReplayState entity definition
 * @see research.md for incremental state reconstruction approach
 */

import type { ReactivityEvent } from "../../../src/types/events";
import type { Recording, ReplayState } from "../../../src/types/replay";

/**
 * Replay store interface returned by createReplayStore()
 */
export interface ReplayStore {
	/**
	 * Current replay state (reactive signal)
	 *
	 * @returns ReplayState object with active, cursorTimestamp, recordingId, mode
	 *
	 * @example
	 * const replay = createReplayStore();
	 * createEffect(() => {
	 *   console.log('Replay state:', replay.state());
	 * });
	 */
	state: () => ReplayState;

	/**
	 * Set cursor position on timeline
	 * Automatically activates replay mode (FR-012)
	 *
	 * @param timestamp - Time position in milliseconds (>= 0)
	 * @throws Error if timestamp < 0
	 *
	 * @example
	 * replay.setCursor(1000); // Position at 1 second
	 * // Result: { active: true, cursorTimestamp: 1000, ... }
	 */
	setCursor: (timestamp: number) => void;

	/**
	 * Clear cursor position and deactivate replay mode
	 * Returns to live mode
	 *
	 * @example
	 * replay.clearCursor();
	 * // Result: { active: false, cursorTimestamp: null, mode: 'live', ... }
	 */
	clearCursor: () => void;

	/**
	 * Step forward to next event in timeline
	 * Respects active filters (FR-011: skips hidden events)
	 *
	 * @param events - Full event array to search
	 * @returns New cursor timestamp, or null if at end
	 *
	 * @example
	 * const nextTime = replay.stepForward(timelineEvents);
	 * if (nextTime === null) {
	 *   console.log('Reached end of timeline');
	 * }
	 */
	stepForward: (events: ReactivityEvent[]) => number | null;

	/**
	 * Step backward to previous event in timeline
	 * Respects active filters (FR-011: skips hidden events)
	 *
	 * @param events - Full event array to search
	 * @returns New cursor timestamp, or null if at beginning
	 *
	 * @example
	 * const prevTime = replay.stepBackward(timelineEvents);
	 * if (prevTime === null) {
	 *   console.log('Reached start of timeline');
	 * }
	 */
	stepBackward: (events: ReactivityEvent[]) => number | null;

	/**
	 * Jump to first event in timeline
	 *
	 * @param events - Full event array
	 *
	 * @example
	 * replay.jumpToStart(timelineEvents);
	 * // Cursor now at events[0].timestamp
	 */
	jumpToStart: (events: ReactivityEvent[]) => void;

	/**
	 * Jump to last event in timeline
	 *
	 * @param events - Full event array
	 *
	 * @example
	 * replay.jumpToEnd(timelineEvents);
	 * // Cursor now at events[events.length - 1].timestamp
	 */
	jumpToEnd: (events: ReactivityEvent[]) => void;

	/**
	 * Load a recording into replay mode
	 * Clears cursor, sets recording ID, switches to replay mode
	 *
	 * @param recording - Recording to load
	 *
	 * @example
	 * const recording = await recordingStore.load(recordingId);
	 * replay.loadRecording(recording);
	 * // Result: { active: false, recordingId: 123, mode: 'replay', ... }
	 */
	loadRecording: (recording: Recording) => void;

	/**
	 * Unload current recording and return to live mode
	 * Clears cursor and recording ID
	 *
	 * @example
	 * replay.unloadRecording();
	 * // Result: { active: false, recordingId: null, mode: 'live', ... }
	 */
	unloadRecording: () => void;

	/**
	 * Subscribe to replay state changes
	 *
	 * @param callback - Function called on every state change
	 * @returns Unsubscribe function
	 *
	 * @example
	 * const unsubscribe = replay.subscribe((state) => {
	 *   if (state.active) {
	 *     console.log('Replay active at:', state.cursorTimestamp);
	 *   }
	 * });
	 *
	 * // Later: unsubscribe()
	 */
	subscribe: (callback: (state: ReplayState) => void) => () => void;
}

/**
 * Factory function to create replay store
 *
 * @returns ReplayStore instance with reactive state
 *
 * @example
 * // In App.tsx or root component
 * const replayStore = createReplayStore();
 *
 * // Pass to child components or use directly
 * <TimelineView replayStore={replayStore} />
 * <DependencyGraph replayStore={replayStore} />
 */
export function createReplayStore(): ReplayStore;

/**
 * Helper: Hook to subscribe to replay state in components
 *
 * @param store - ReplayStore instance
 * @returns Current replay state (reactive)
 *
 * @example
 * function MyComponent(props: { replayStore: ReplayStore }) {
 *   const replayState = useReplayState(props.replayStore);
 *
 *   return (
 *     <div>
 *       <Show when={replayState().active}>
 *         <ReplayIndicator time={replayState().cursorTimestamp!} />
 *       </Show>
 *     </div>
 *   );
 * }
 */
export function useReplayState(store: ReplayStore): () => ReplayState;
