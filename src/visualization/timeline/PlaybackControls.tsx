import type { Component } from "solid-js";
import type { PlaybackControlsProps } from "../../types/timeline";
import styles from "./PlaybackControls.module.css";

export const PlaybackControls: Component<PlaybackControlsProps> = (props) => {
	return (
		<div class={styles.controls}>
			<button
				type="button"
				onClick={props.playback.isPlaying ? props.onPause : props.onPlay}
				class={styles.button}
			>
				{props.playback.isPlaying ? "⏸" : "▶"}
			</button>
			<select
				value={props.playback.speed}
				onChange={(e) => props.onSpeedChange?.(Number(e.target.value))}
				class={styles.select}
			>
				<option value={0.5}>0.5x</option>
				<option value={1}>1x</option>
				<option value={2}>2x</option>
				<option value={5}>5x</option>
			</select>
		</div>
	);
};
