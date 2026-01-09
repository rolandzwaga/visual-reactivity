import { type Component } from "solid-js";
import type { TimelineCursorProps } from "../../types/timeline";
import styles from "./TimelineCursor.module.css";

export const TimelineCursor: Component<TimelineCursorProps> = (props) => {
	return (
		<line
			x1={props.cursor.x}
			y1={0}
			x2={props.cursor.x}
			y2={props.height}
			class={styles.cursor}
			stroke="#f59e0b"
			stroke-width={2}
		/>
	);
};
