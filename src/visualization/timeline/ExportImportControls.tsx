import { type Component, createSignal } from "solid-js";
import {
	exportRecording,
	importRecording,
} from "../../lib/recordingSerializer";
import type { RecordingStore } from "../../stores/recordingStore";
import type { ExportOptions, Recording } from "../../types/replay";
import styles from "./ExportImportControls.module.css";

export interface ExportImportControlsProps {
	recordingStore: RecordingStore;
	currentRecording?: Recording | null;
}

export const ExportImportControls: Component<ExportImportControlsProps> = (
	props,
) => {
	const [valueInclusion, setValueInclusion] = createSignal<
		"full" | "truncated" | "structure-only"
	>("truncated");
	const [error, setError] = createSignal<string | null>(null);

	const handleExport = () => {
		if (!props.currentRecording) {
			setError("No recording loaded to export");
			return;
		}

		const options: ExportOptions = {
			valueInclusion: valueInclusion(),
			truncationLimit: 10240,
			includeMetadata: true,
		};

		try {
			const json = exportRecording(props.currentRecording, options);
			const blob = new Blob([json], { type: "application/json" });
			const url = URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = `${props.currentRecording.name}.json`;
			a.click();

			URL.revokeObjectURL(url);
			setError(null);
		} catch (err: unknown) {
			setError(
				`Export failed: ${err instanceof Error ? err.message : String(err)}`,
			);
		}
	};

	const handleImport = async (e: Event) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		try {
			const text = await file.text();
			const recording = importRecording(text);
			await props.recordingStore.save(recording.name, recording.events);
			setError(null);
			alert(`Imported "${recording.name}" successfully!`);
		} catch (err: unknown) {
			setError(
				`Import failed: ${err instanceof Error ? err.message : String(err)}`,
			);
		}

		input.value = "";
	};

	return (
		<div class={styles.container}>
			<div class={styles.exportSection}>
				<label class={styles.label}>
					Export Mode:
					<select
						value={valueInclusion()}
						onChange={(e) =>
							setValueInclusion(
								e.currentTarget.value as
									| "full"
									| "truncated"
									| "structure-only",
							)
						}
						class={styles.select}
					>
						<option value="full">Full (with all values)</option>
						<option value="truncated">Truncated (10KB limit)</option>
						<option value="structure-only">Structure Only</option>
					</select>
				</label>
				<button
					type="button"
					onClick={handleExport}
					class={styles.exportButton}
					disabled={!props.currentRecording}
				>
					📤 Export
				</button>
			</div>

			<div class={styles.importSection}>
				<label class={styles.importLabel}>
					📥 Import
					<input
						type="file"
						accept=".json"
						onChange={handleImport}
						class={styles.fileInput}
					/>
				</label>
			</div>

			{error() && <div class={styles.error}>{error()}</div>}
		</div>
	);
};
