import { onCleanup, onMount, Show } from "solid-js";
import styles from "./Notification.module.css";

export interface NotificationProps {
	isOpen: boolean;
	message: string;
	duration?: number;
	onClose: () => void;
}

export function Notification(props: NotificationProps) {
	const duration = () => props.duration ?? 3000;

	onMount(() => {
		if (props.isOpen) {
			const timer = setTimeout(() => {
				props.onClose();
			}, duration());

			onCleanup(() => clearTimeout(timer));
		}
	});

	return (
		<Show when={props.isOpen}>
			<div class={styles.notification}>
				<span class={styles.message}>{props.message}</span>
				<button
					type="button"
					class={styles.closeButton}
					data-action="close"
					onClick={props.onClose}
				>
					×
				</button>
			</div>
		</Show>
	);
}
