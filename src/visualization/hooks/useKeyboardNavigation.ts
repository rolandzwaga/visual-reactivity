import { onCleanup, onMount } from "solid-js";
import type { ReplayStore } from "../../stores/replayStore";
import type { ReactivityEvent } from "../../types/events";

export function useKeyboardNavigation(
	replayStore: ReplayStore,
	events: () => ReactivityEvent[],
) {
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "ArrowRight") {
			e.preventDefault();
			replayStore.stepForward(events());
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			replayStore.stepBackward(events());
		} else if (e.key === "Home") {
			e.preventDefault();
			replayStore.jumpToStart(events());
		} else if (e.key === "End") {
			e.preventDefault();
			replayStore.jumpToEnd(events());
		}
	};

	onMount(() => {
		window.addEventListener("keydown", handleKeyDown);
	});

	onCleanup(() => {
		window.removeEventListener("keydown", handleKeyDown);
	});
}
