import { type Component, createSignal, For, Show } from "solid-js";
import type { RecordingStore } from "../../stores/recordingStore";
import type { RecordingMetadata } from "../../types/replay";
import styles from "./RecordingManager.module.css";

export interface RecordingManagerProps {
	recordingStore: RecordingStore;
	onLoad: (id: number) => void;
	onSave: (name: string) => void | Promise<void>;
}

export const RecordingManager: Component<RecordingManagerProps> = (props) => {
	const [recordings, setRecordings] = createSignal<RecordingMetadata[]>([]);
	const [isOpen, setIsOpen] = createSignal(false);
	const [saveName, setSaveName] = createSignal("");
	const [error, setError] = createSignal<string | null>(null);
	const [deleteConfirm, setDeleteConfirm] = createSignal<number | null>(null);

	const loadRecordings = async () => {
		const list = await props.recordingStore.list();
		setRecordings(list);
	};

	const handleOpen = () => {
		setIsOpen(true);
		loadRecordings();
	};

	const handleSave = async () => {
		const name = saveName().trim();
		const validationError = props.recordingStore.validateName(name);

		if (validationError) {
			setError(validationError.message);
			return;
		}

		const exists = await props.recordingStore.exists(name);
		if (exists) {
			setError(`Recording "${name}" already exists`);
			return;
		}

		try {
			await props.onSave(name);
			setSaveName("");
			setError(null);
			await loadRecordings();
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		}
	};

	const handleDelete = async (id: number) => {
		await props.recordingStore.delete(id);
		setDeleteConfirm(null);
		await loadRecordings();
	};

	return (
		<div class={styles.container}>
			<button type="button" onClick={handleOpen} class={styles.triggerButton}>
				📼 Recordings
			</button>

			<Show when={isOpen()}>
				<div
					class={styles.modal}
					onClick={() => setIsOpen(false)}
					onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
					role="dialog"
					aria-modal="true"
				>
					<div
						class={styles.content}
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
						role="document"
					>
						<h2 class={styles.title}>Recording Manager</h2>

						<div class={styles.saveSection}>
							<input
								type="text"
								value={saveName()}
								onInput={(e) => setSaveName(e.currentTarget.value)}
								placeholder="Recording name..."
								class={styles.input}
							/>
							<button
								type="button"
								onClick={handleSave}
								class={styles.saveButton}
							>
								Save Current
							</button>
						</div>

						<Show when={error()}>
							<div class={styles.error}>{error()}</div>
						</Show>

						<div class={styles.list}>
							<For each={recordings()}>
								{(recording) => (
									<div class={styles.recordingItem}>
										<div class={styles.recordingInfo}>
											<div class={styles.recordingName}>{recording.name}</div>
											<div class={styles.recordingMeta}>
												{recording.eventCount} events •{" "}
												{new Date(recording.dateCreated).toLocaleDateString()}
											</div>
										</div>
										<div class={styles.recordingActions}>
											<button
												type="button"
												onClick={() => props.onLoad(recording.id)}
												class={styles.loadButton}
											>
												Load
											</button>
											<Show when={deleteConfirm() === recording.id}>
												<button
													type="button"
													onClick={() => handleDelete(recording.id)}
													class={styles.confirmDelete}
												>
													Confirm Delete
												</button>
												<button
													type="button"
													onClick={() => setDeleteConfirm(null)}
													class={styles.cancelButton}
												>
													Cancel
												</button>
											</Show>
											<Show when={deleteConfirm() !== recording.id}>
												<button
													type="button"
													onClick={() => setDeleteConfirm(recording.id)}
													class={styles.deleteButton}
												>
													Delete
												</button>
											</Show>
										</div>
									</div>
								)}
							</For>
						</div>

						<button
							type="button"
							onClick={() => setIsOpen(false)}
							class={styles.closeButton}
						>
							Close
						</button>
					</div>
				</div>
			</Show>
		</div>
	);
};
