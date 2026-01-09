import { For, Show } from "solid-js";
import type { Demo } from "../demos/types";
import styles from "./DemoMenu.module.css";

interface DemoMenuProps {
	isOpen: boolean;
	demos: Demo[];
	activeDemoId: string | null;
	onSelect: (demoId: string) => void;
	onClose: () => void;
}

export function DemoMenu(props: DemoMenuProps) {
	const handleOverlayClick = () => {
		props.onClose();
	};

	const handleMenuClick = (e: MouseEvent) => {
		e.stopPropagation();
	};

	return (
		<Show when={props.isOpen}>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay click to close is intentional */}
			<div class={styles.overlay} onClick={handleOverlayClick}>
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: menu prevents propagation only */}
				<div
					class={styles.menu}
					data-testid="demo-menu"
					onClick={handleMenuClick}
				>
					<div class={styles.header}>
						<h2 class={styles.title}>Educational Demos</h2>
						<button
							type="button"
							class={styles.closeButton}
							onClick={props.onClose}
							aria-label="Close menu"
						>
							×
						</button>
					</div>
					<div class={styles.demoList}>
						<For each={props.demos}>
							{(demo, index) => (
								<button
									type="button"
									class={styles.demoItem}
									classList={{
										[styles.active]: demo.metadata.id === props.activeDemoId,
									}}
									data-testid={`demo-item-${index()}`}
									onClick={() => {
										props.onSelect(demo.metadata.id);
										props.onClose();
									}}
								>
									<div class={styles.demoName}>{demo.metadata.name}</div>
									<div class={styles.demoConcept}>{demo.metadata.concept}</div>
									<div class={styles.demoDescription}>
										{demo.metadata.description}
									</div>
								</button>
							)}
						</For>
					</div>
				</div>
			</div>
		</Show>
	);
}
