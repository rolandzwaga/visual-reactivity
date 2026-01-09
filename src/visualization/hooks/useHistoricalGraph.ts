import { createMemo } from "solid-js";
import { createStateReconstructor } from "../../lib/historicalState";
import type { ReplayStore } from "../../stores/replayStore";
import type { ReactivityEvent } from "../../types/events";
import type { HistoricalGraphState } from "../../types/replay";

export function useHistoricalGraph(
	replayStore: ReplayStore,
	events: () => ReactivityEvent[],
): () => HistoricalGraphState | null {
	const reconstructor = createMemo(() => {
		return createStateReconstructor(events());
	});

	return createMemo(() => {
		const replayState = replayStore.state();
		if (!replayState.active || replayState.cursorTimestamp === null) {
			return null;
		}

		return reconstructor().reconstructAt(replayState.cursorTimestamp);
	});
}
