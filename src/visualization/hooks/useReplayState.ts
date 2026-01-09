import { createSignal, onCleanup } from "solid-js";
import type { ReplayStore } from "../../stores/replayStore";
import type { ReplayState } from "../../types/replay";

export function useReplayState(store: ReplayStore): () => ReplayState {
	const [replayState, setReplayState] = createSignal<ReplayState>(
		store.state(),
	);

	const unsubscribe = store.subscribe((state) => {
		setReplayState(state);
	});

	onCleanup(() => {
		unsubscribe();
	});

	return replayState;
}
