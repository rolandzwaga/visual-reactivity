import type { Component } from "solid-js";
import type { SignalEntry } from "../../types/panel";
import styles from "./SignalRow.module.css";

export interface SignalRowProps {
	signal: SignalEntry;
	isSelected: boolean;
	onClick: () => void;
	onValueEdit: (id: string, newValue: unknown) => void;
}

/**
 * A single row displaying a signal's name, type, value, and metadata.
 */
export const SignalRow: Component<SignalRowProps> = (props) => {
	const handleClick = () => {
		props.onClick();
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			props.onClick();
		}
	};

	const formatTimestamp = (timestamp: number): string => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString();
	};

	const displayName = () => props.signal.name || props.signal.id;

	const displayValue = () => {
		if (props.signal.serializedValue === null) {
			return "[Unserializable]";
		}
		return props.signal.serializedValue;
	};

	const typeLabel = () => {
		if (props.signal.type === "memo") {
			return "memo (read-only)";
		}
		return "signal";
	};

	return (
		// biome-ignore lint/a11y/useSemanticElements: div with role="button" is intentional for list row
		// biome-ignore lint/a11y/useFocusableInteractive: tabindex is present on line 54
		// biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-selected needed for list item selection state
		<div
			class={`${styles.row} ${props.isSelected ? styles.selected : ""}`}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			role="button"
			tabindex={0}
			aria-selected={props.isSelected}
		>
			<div class={styles.header}>
				<span class={styles.name}>{displayName()}</span>
				<span class={styles.type}>{typeLabel()}</span>
			</div>

			<div class={styles.value}>{displayValue()}</div>

			<div class={styles.metadata}>
				<span class={styles.updateCount}>
					Updates: {props.signal.updateCount}
				</span>
				<span class={styles.timestamp}>
					{formatTimestamp(props.signal.lastUpdatedAt)}
				</span>
			</div>
		</div>
	);
};
