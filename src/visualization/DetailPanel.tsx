import { For, Show } from "solid-js";
import type { DetailPanelProps } from "./types";

function truncateValue(value: unknown, maxLength = 100): string {
	if (value === null) return "null";
	if (value === undefined) return "undefined";

	const str = typeof value === "string" ? `"${value}"` : JSON.stringify(value);

	if (str.length > maxLength) {
		return `${str.slice(0, maxLength)}...`;
	}
	return str;
}

function formatTimestamp(timestamp: number | null): string {
	if (timestamp === null) return "Never";
	return new Date(timestamp).toLocaleTimeString();
}

const panelStyles = {
	container: {
		position: "absolute" as const,
		top: "10px",
		right: "10px",
		width: "280px",
		"background-color": "#1e1e2f",
		border: "1px solid #3d3d5c",
		"border-radius": "8px",
		padding: "16px",
		color: "#e0e0e0",
		"font-family": "system-ui, sans-serif",
		"font-size": "14px",
		"box-shadow": "0 4px 12px rgba(0, 0, 0, 0.3)",
	},
	header: {
		display: "flex",
		"justify-content": "space-between",
		"align-items": "center",
		"margin-bottom": "12px",
		"padding-bottom": "8px",
		"border-bottom": "1px solid #3d3d5c",
	},
	title: {
		margin: "0",
		"font-size": "16px",
		"font-weight": "600",
	},
	closeButton: {
		background: "none",
		border: "none",
		color: "#888",
		cursor: "pointer",
		"font-size": "18px",
		padding: "0",
		"line-height": "1",
	},
	section: {
		"margin-bottom": "12px",
	},
	label: {
		color: "#888",
		"font-size": "12px",
		"margin-bottom": "4px",
	},
	value: {
		color: "#fff",
		"word-break": "break-all" as const,
	},
	badge: {
		display: "inline-block",
		padding: "2px 8px",
		"border-radius": "4px",
		"font-size": "12px",
		"text-transform": "uppercase" as const,
	},
	list: {
		"list-style": "none",
		padding: "0",
		margin: "0",
	},
	listItem: {
		padding: "4px 0",
		"border-bottom": "1px solid #2d2d4d",
	},
};

const typeColors: Record<string, string> = {
	signal: "#3b82f6",
	memo: "#8b5cf6",
	effect: "#22c55e",
	root: "#94a3b8",
};

export function DetailPanel(props: DetailPanelProps) {
	return (
		<Show when={props.data}>
			{(data) => (
				<div style={panelStyles.container}>
					<div style={panelStyles.header}>
						<h3 style={panelStyles.title}>
							{data().node.name || data().node.id}
						</h3>
						<button
							type="button"
							style={panelStyles.closeButton}
							onClick={() => props.onClose()}
							aria-label="Close panel"
						>
							×
						</button>
					</div>

					<div style={panelStyles.section}>
						<div style={panelStyles.label}>Type</div>
						<span
							style={{
								...panelStyles.badge,
								"background-color": typeColors[data().node.type] || "#666",
							}}
						>
							{data().node.type}
						</span>
					</div>

					<div style={panelStyles.section}>
						<div style={panelStyles.label}>ID</div>
						<div style={panelStyles.value}>{data().node.id}</div>
					</div>

					<Show
						when={data().node.type === "signal" || data().node.type === "memo"}
					>
						<div style={panelStyles.section}>
							<div style={panelStyles.label}>Value</div>
							<div style={panelStyles.value}>
								{truncateValue(data().node.value)}
							</div>
						</div>
					</Show>

					<Show when={data().sources.length > 0}>
						<div style={panelStyles.section}>
							<div style={panelStyles.label}>
								Sources ({data().sources.length})
							</div>
							<ul style={panelStyles.list}>
								<For each={data().sources}>
									{(source) => (
										<li style={panelStyles.listItem}>
											{source.name || source.id}
										</li>
									)}
								</For>
							</ul>
						</div>
					</Show>

					<Show when={data().observers.length > 0}>
						<div style={panelStyles.section}>
							<div style={panelStyles.label}>
								Observers ({data().observers.length})
							</div>
							<ul style={panelStyles.list}>
								<For each={data().observers}>
									{(observer) => (
										<li style={panelStyles.listItem}>
											{observer.name || observer.id}
										</li>
									)}
								</For>
							</ul>
						</div>
					</Show>

					<Show
						when={data().node.type === "memo" || data().node.type === "effect"}
					>
						<div style={panelStyles.section}>
							<div style={panelStyles.label}>Execution Count</div>
							<div style={panelStyles.value}>{data().node.executionCount}</div>
						</div>

						<div style={panelStyles.section}>
							<div style={panelStyles.label}>Last Executed</div>
							<div style={panelStyles.value}>
								{formatTimestamp(data().node.lastExecutedAt)}
							</div>
						</div>
					</Show>

					<div style={panelStyles.section}>
						<div style={panelStyles.label}>Created At</div>
						<div style={panelStyles.value}>
							{formatTimestamp(data().node.createdAt)}
						</div>
					</div>
				</div>
			)}
		</Show>
	);
}
