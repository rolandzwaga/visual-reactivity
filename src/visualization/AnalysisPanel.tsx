import { type Component, createSignal, For, Show } from "solid-js";
import { getPatternAge } from "../lib/patternUtils";
import type { MetricsSummary, Pattern } from "../types/pattern";
import styles from "./AnalysisPanel.module.css";

const MIN_WIDTH = 300;
const MAX_WIDTH_RATIO = 0.5;

export interface AnalysisPanelProps {
	patterns: Pattern[];
	metrics: MetricsSummary;
	isExpanded: boolean;
	onToggle: () => void;
	onPatternClick: (pattern: Pattern) => void;
	onMarkExpected: (patternId: string, reason?: string) => void;
	onRemoveException: (patternId: string) => void;
	showExpectedPatterns: boolean;
	onToggleShowExpected: (show: boolean) => void;
	width?: number;
	onWidthChange?: (width: number) => void;
}

export const AnalysisPanel: Component<AnalysisPanelProps> = (props) => {
	const [_isResizing, setIsResizing] = createSignal(false);

	const handleResizeStart = (e: MouseEvent) => {
		e.preventDefault();
		setIsResizing(true);

		const startX = e.clientX;
		const startWidth = props.width || MIN_WIDTH;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			const deltaX = startX - moveEvent.clientX;
			let newWidth = startWidth + deltaX;

			newWidth = Math.max(MIN_WIDTH, newWidth);
			const maxWidth = window.innerWidth * MAX_WIDTH_RATIO;
			newWidth = Math.min(newWidth, maxWidth);

			props.onWidthChange?.(newWidth);
		};

		const handleMouseUp = () => {
			setIsResizing(false);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const visiblePatterns = () => {
		return props.patterns.filter(
			(p) => props.showExpectedPatterns || !p.isExpected,
		);
	};

	return (
		<Show when={props.isExpanded}>
			<div
				class={styles.panel}
				style={{ width: `${props.width || MIN_WIDTH}px` }}
			>
				<div class={styles.resizeHandle} onMouseDown={handleResizeStart} />

				<div class={styles.header}>
					<h2>Pattern Analysis</h2>
					<button
						type="button"
						class={styles.closeButton}
						onClick={props.onToggle}
					>
						×
					</button>
				</div>

				<div class={styles.metrics}>
					<div class={styles.metricItem}>
						<span class={styles.metricLabel}>Total:</span>
						<span class={styles.metricValue}>
							{props.metrics.totalPatterns}
						</span>
					</div>
					<div class={styles.metricItem}>
						<span class={styles.metricLabel}>High:</span>
						<span class={`${styles.metricValue} ${styles.high}`}>
							{props.metrics.bySeverity.high}
						</span>
					</div>
					<div class={styles.metricItem}>
						<span class={styles.metricLabel}>Medium:</span>
						<span class={`${styles.metricValue} ${styles.medium}`}>
							{props.metrics.bySeverity.medium}
						</span>
					</div>
					<div class={styles.metricItem}>
						<span class={styles.metricLabel}>Low:</span>
						<span class={`${styles.metricValue} ${styles.low}`}>
							{props.metrics.bySeverity.low}
						</span>
					</div>
				</div>

				<div class={styles.controls}>
					<label class={styles.checkbox}>
						<input
							type="checkbox"
							checked={props.showExpectedPatterns}
							onChange={(e) =>
								props.onToggleShowExpected(e.currentTarget.checked)
							}
						/>
						Show expected patterns
					</label>
				</div>

				<div class={styles.patternList}>
					<For each={visiblePatterns()}>
						{(pattern) => (
							<div class={`${styles.patternItem} ${styles[pattern.severity]}`}>
								<div class={styles.patternHeader}>
									<span class={styles.patternType}>{pattern.type}</span>
									<span class={styles.patternAge}>
										{getPatternAge(pattern)}
									</span>
								</div>
								<div class={styles.patternDescription}>
									{pattern.description}
								</div>
								<div class={styles.patternRemediation}>
									{pattern.remediation}
								</div>
								<div class={styles.patternActions}>
									<button
										type="button"
										class={styles.itemButton}
										onClick={() => props.onPatternClick(pattern)}
									>
										View
									</button>
									{!pattern.isExpected && (
										<button
											type="button"
											class={styles.actionButton}
											onClick={() => props.onMarkExpected(pattern.id)}
										>
											Mark Expected
										</button>
									)}
									{pattern.isExpected && (
										<button
											type="button"
											class={styles.actionButton}
											onClick={() => props.onRemoveException(pattern.id)}
										>
											Remove Exception
										</button>
									)}
								</div>
							</div>
						)}
					</For>
					<Show when={visiblePatterns().length === 0}>
						<div class={styles.emptyState}>No patterns detected</div>
					</Show>
				</div>
			</div>
		</Show>
	);
};
