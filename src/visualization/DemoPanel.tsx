import { type JSX, Show } from "solid-js";
import type { DemoMetadata } from "../demos/types";
import styles from "./DemoPanel.module.css";

interface DemoPanelProps {
	metadata: DemoMetadata | null;
	children?: JSX.Element;
	onClose: () => void;
	onReset: () => void;
}

export function DemoPanel(props: DemoPanelProps) {
	return (
		<Show when={props.metadata}>
			{(metadata) => (
				<div class={styles.panel} data-testid="demo-panel">
					<div class={styles.header}>
						<div class={styles.headerContent}>
							<h3 class={styles.title}>{metadata().name}</h3>
							<div class={styles.concept}>{metadata().concept}</div>
						</div>
						<div class={styles.headerActions}>
							<button
								type="button"
								class={styles.resetButton}
								onClick={props.onReset}
								data-testid="demo-panel-reset"
							>
								Reset
							</button>
							<button
								type="button"
								class={styles.closeButton}
								onClick={props.onClose}
								data-testid="demo-panel-close"
								aria-label="Close demo"
							>
								×
							</button>
						</div>
					</div>
					<div class={styles.instructions}>{metadata().instructions}</div>
					<div class={styles.content}>{props.children}</div>
				</div>
			)}
		</Show>
	);
}
