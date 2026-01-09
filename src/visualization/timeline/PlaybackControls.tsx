import type { Component } from "solid-js";
import type { PlaybackControlsProps } from "../../types/timeline";
import styles from "./PlaybackControls.module.css";

export const PlaybackControls: Component<PlaybackControlsProps> = (props) => {
	return (
		<div class={styles.controls}>
			<button
				type="button"
				onClick={props.onJumpToStart}
				class={styles.button}
				title="Jump to Start (Home)"
			>
				⏮
			</button>
			<button
				type="button"
				onClick={props.onStepBackward}
				class={styles.button}
				title="Step Backward (←)"
			>
				⏪
			</button>
			<button
				type="button"
				onClick={props.playback.isPlaying ? props.onPause : props.onPlay}
				class={styles.button}
			>
				{props.playback.isPlaying ? "⏸" : "▶"}
			</button>
			<button
				type="button"
				onClick={props.onStepForward}
				class={styles.button}
				title="Step Forward (→)"
			>
				⏩
			</button>
			<button
				type="button"
				onClick={props.onJumpToEnd}
				class={styles.button}
				title="Jump to End (End)"
			>
				⏭
			</button>
			<select
				value={props.playback.speed}
				onChange={(e) => props.onSpeedChange?.(Number(e.target.value))}
				class={styles.select}
			>
				<option value={0.25}>0.25x</option>
				<option value={0.5}>0.5x</option>
				<option value={1}>1x</option>
				<option value={2}>2x</option>
				<option value={5}>5x</option>
			</select>
			{props.onToggleLoop && (
				<button
					type="button"
					onClick={props.onToggleLoop}
					class={styles.button}
					title="Toggle Loop Mode"
					style={{
						"background-color": props.playback.loop ? "#4CAF50" : undefined,
					}}
				>
					🔁
				</button>
			)}
		</div>
	);
};
