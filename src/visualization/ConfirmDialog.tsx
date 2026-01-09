import { Show } from "solid-js";
import styles from "./ConfirmDialog.module.css";

export interface ConfirmDialogProps {
	isOpen: boolean;
	title?: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmDialog(props: ConfirmDialogProps) {
	return (
		<Show when={props.isOpen}>
			<div class={styles.overlay}>
				<div class={styles.dialog}>
					<Show when={props.title}>
						<h2 class={styles.title}>{props.title}</h2>
					</Show>
					<p class={styles.message}>{props.message}</p>
					<div class={styles.actions}>
						<button
							type="button"
							class={styles.cancelButton}
							data-action="cancel"
							onClick={props.onCancel}
						>
							Cancel
						</button>
						<button
							type="button"
							class={styles.confirmButton}
							data-action="confirm"
							onClick={props.onConfirm}
						>
							Confirm
						</button>
					</div>
				</div>
			</div>
		</Show>
	);
}
