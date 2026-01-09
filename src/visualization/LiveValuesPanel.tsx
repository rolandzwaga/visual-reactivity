import { type Component, createSignal, Show } from "solid-js";
import type { LiveValuesPanelProps } from "../types/panel";
import { useSelectionSync } from "./hooks/useSelectionSync";
import { useSignalList } from "./hooks/useSignalList";
import styles from "./LiveValuesPanel.module.css";
import { SignalList } from "./list/SignalList";

const MIN_WIDTH = 200;
const MAX_WIDTH_RATIO = 0.5; // 50% of viewport width

/**
 * Live Values Panel - displays all tracked signals with their current values.
 * Features resizing, selection, and real-time updates.
 */
export const LiveValuesPanel: Component<LiveValuesPanelProps> = (props) => {
	const [selectedSignalId, setSelectedSignalId] = createSignal<string | null>(
		null,
	);
	const [_isResizing, setIsResizing] = createSignal(false);

	const selectionSync = props.selection
		? useSelectionSync("list", props.selection)
		: null;

	const { signals } = useSignalList();

	// Handle resize start
	const handleResizeStart = (e: MouseEvent) => {
		e.preventDefault();
		setIsResizing(true);

		const startX = e.clientX;
		const startWidth = props.width;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			// Calculate new width (panel is on right side, so moving left increases width)
			const deltaX = startX - moveEvent.clientX;
			let newWidth = startWidth + deltaX;

			// Apply constraints
			newWidth = Math.max(MIN_WIDTH, newWidth);
			const maxWidth = window.innerWidth * MAX_WIDTH_RATIO;
			newWidth = Math.min(newWidth, maxWidth);

			props.onWidthChange(newWidth);
		};

		const handleMouseUp = () => {
			setIsResizing(false);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const handleClose = () => {
		props.onVisibilityChange(false);
	};

	const handleSignalClick = (id: string) => {
		setSelectedSignalId(id);
	};

	const handleValueEdit = (id: string, newValue: unknown) => {
		// Value editing will be implemented in Phase 4 (User Story 2)
		console.log("Edit signal", id, "to", newValue);
	};

	return (
		<Show when={props.isVisible}>
			<div
				class={styles.panel}
				style={{
					width: `${props.width}px`,
				}}
			>
				{/* Resize handle */}
				<div class={styles.resizeHandle} onMouseDown={handleResizeStart} />

				{/* Header */}
				<div class={styles.header}>
					<h2 class={styles.title}>Live Values</h2>
					<button
						type="button"
						class={styles.closeButton}
						onClick={handleClose}
						aria-label="Close"
						title="Close panel"
					>
						×
					</button>
				</div>

				{/* Signal list */}
				<div class={styles.content}>
					<SignalList
						signals={signals()}
						selectedId={
							selectionSync
								? (Array.from(selectionSync.highlightedNodeIds())[0] ?? null)
								: selectedSignalId()
						}
						onSignalClick={(id, event) => {
							if (selectionSync && event) {
								selectionSync.handleNodeClick(id, event);
							} else {
								handleSignalClick(id);
							}
						}}
						onValueEdit={handleValueEdit}
						selectionSync={selectionSync}
					/>
				</div>
			</div>
		</Show>
	);
};
