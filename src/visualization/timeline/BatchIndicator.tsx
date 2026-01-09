import type { Component } from "solid-js";
import type { BatchIndicatorProps } from "../../types/timeline";
import styles from "./BatchIndicator.module.css";

export const BatchIndicator: Component<BatchIndicatorProps> = (props) => {
	return (
		<rect
			x={props.x1}
			y={props.y}
			width={props.x2 - props.x1}
			height={props.height}
			class={styles.batch}
			fill="rgba(100, 100, 200, 0.2)"
			stroke="rgba(100, 100, 200, 0.5)"
			stroke-width={1}
			onClick={props.onClick}
		/>
	);
};
