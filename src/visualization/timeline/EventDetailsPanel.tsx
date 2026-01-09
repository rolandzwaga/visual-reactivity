import { type Component, Show } from "solid-js";
import type { TimelineEvent } from "../../types/timeline";
import styles from "./EventDetailsPanel.module.css";

export interface EventDetailsPanelProps {
	event: TimelineEvent | null;
	onClose: () => void;
}

export const EventDetailsPanel: Component<EventDetailsPanelProps> = (props) => {
	return (
		<Show when={props.event}>
			<div class={styles.panel}>
				<div class={styles.header}>
					<h3>Event Details</h3>
					<button
						type="button"
						onClick={props.onClose}
						class={styles.closeButton}
					>
						×
					</button>
				</div>

				<div class={styles.content}>
					<div class={styles.row}>
						<span class={styles.label}>Type:</span>
						<span class={styles.value}>{props.event!.type}</span>
					</div>
					<div class={styles.row}>
						<span class={styles.label}>Timestamp:</span>
						<span class={styles.value}>{props.event!.timestamp}ms</span>
					</div>
					<div class={styles.row}>
						<span class={styles.label}>Node ID:</span>
						<span class={styles.value}>{props.event!.nodeId}</span>
					</div>
					<Show when={props.event!.batchId}>
						<div class={styles.row}>
							<span class={styles.label}>Batch ID:</span>
							<span class={styles.value}>{props.event!.batchId}</span>
						</div>
					</Show>
					<div class={styles.row}>
						<span class={styles.label}>Data:</span>
						<pre class={styles.data}>
							{JSON.stringify(props.event!.data, null, 2)}
						</pre>
					</div>
				</div>
			</div>
		</Show>
	);
};
