import styles from "./DemoErrorFallback.module.css";

interface DemoErrorFallbackProps {
	error: Error;
	onClose: () => void;
	onRetry: () => void;
}

export function DemoErrorFallback(props: DemoErrorFallbackProps) {
	return (
		<div class={styles.container} data-testid="demo-error-fallback">
			<div class={styles.content}>
				<div class={styles.icon}>⚠️</div>
				<h3 class={styles.title}>Demo Error</h3>
				<p class={styles.message}>{props.error.message}</p>
				<div class={styles.actions}>
					<button
						type="button"
						class={styles.retryButton}
						onClick={props.onRetry}
						data-testid="demo-error-retry"
					>
						Retry
					</button>
					<button
						type="button"
						class={styles.closeButton}
						onClick={props.onClose}
						data-testid="demo-error-close"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
