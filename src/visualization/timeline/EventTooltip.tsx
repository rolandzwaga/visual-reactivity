import { type Component, Show } from "solid-js";
import type { EventTooltipProps } from "../../types/timeline";
import styles from "./EventTooltip.module.css";

export const EventTooltip: Component<EventTooltipProps> = (props) => {
	return (
		<Show when={props.visible && props.event}>
			<div
				class={styles.tooltip}
				style={{
					left: `${props.x + 10}px`,
					top: `${props.y - 30}px`,
					position: "absolute",
					"pointer-events": "none",
				}}
			>
				<div class={styles.type}>{props.event!.type}</div>
				<div class={styles.timestamp}>{props.event!.timestamp}ms</div>
				<div class={styles.node}>Node: {props.event!.nodeId}</div>
			</div>
		</Show>
	);
};
