import type { Component } from "solid-js";
import type { ReplayStore } from "../stores/replayStore";
import { useReplayState } from "./hooks/useReplayState";
import styles from "./ReplayModeIndicator.module.css";

export interface ReplayModeIndicatorProps {
	replayStore: ReplayStore;
	onExit?: () => void;
}

export const ReplayModeIndicator: Component<ReplayModeIndicatorProps> = (
	props,
) => {
	const replayState = useReplayState(props.replayStore);

	const handleExit = () => {
		props.replayStore.clearCursor();
		props.onExit?.();
	};

	return (
		<div class={styles.indicator}>
			<span class={styles.label}>
				Replay Mode: {new Date(replayState().cursorTimestamp!).toISOString()}
			</span>
			<button type="button" onClick={handleExit} class={styles.exitButton}>
				Exit Replay
			</button>
		</div>
	);
};
