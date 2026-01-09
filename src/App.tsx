import { createSignal, Show } from "solid-js";
import { tracker } from "./instrumentation";
import { createSelectionStore } from "./stores/selectionStore";
import { DependencyGraph, DetailPanel, OwnershipTree } from "./visualization";
import type { DetailPanelData } from "./visualization/types";

type ViewMode = "graph" | "tree";

export function App() {
	const [selectedNodeId, setSelectedNodeId] = createSignal<string | null>(null);
	const [viewMode, setViewMode] = createSignal<ViewMode>("graph");

	const selection = createSelectionStore();

	const getDetailPanelData = (): DetailPanelData | null => {
		const nodeId = selectedNodeId();
		if (!nodeId) return null;

		const node = tracker.getNode(nodeId);
		if (!node) return null;

		const nodes = tracker.getNodes();
		const sources = node.sources
			.map((id) => nodes.get(id))
			.filter((n): n is NonNullable<typeof n> => n !== undefined);
		const observers = node.observers
			.map((id) => nodes.get(id))
			.filter((n): n is NonNullable<typeof n> => n !== undefined);

		return { node, sources, observers };
	};

	return (
		<div style={{ position: "relative", width: "100vw", height: "100vh" }}>
			<div
				style={{
					position: "absolute",
					top: "16px",
					right: "16px",
					"z-index": "100",
					display: "flex",
					gap: "8px",
				}}
			>
				<button
					type="button"
					onClick={() => setViewMode("graph")}
					style={{
						padding: "8px 16px",
						background: viewMode() === "graph" ? "#3b82f6" : "white",
						color: viewMode() === "graph" ? "white" : "#1f2937",
						border: "1px solid #d1d5db",
						"border-radius": "6px",
						cursor: "pointer",
						"font-weight": "500",
					}}
				>
					Dependency Graph
				</button>
				<button
					type="button"
					onClick={() => setViewMode("tree")}
					style={{
						padding: "8px 16px",
						background: viewMode() === "tree" ? "#3b82f6" : "white",
						color: viewMode() === "tree" ? "white" : "#1f2937",
						border: "1px solid #d1d5db",
						"border-radius": "6px",
						cursor: "pointer",
						"font-weight": "500",
					}}
				>
					Ownership Tree
				</button>
			</div>

			<Show when={viewMode() === "graph"}>
				<DependencyGraph
					width={window.innerWidth}
					height={window.innerHeight}
					selection={selection}
				/>
			</Show>

			<Show when={viewMode() === "tree"}>
				<OwnershipTree
					width={window.innerWidth}
					height={window.innerHeight}
					selectedNodeId={selectedNodeId()}
					onSelectNode={setSelectedNodeId}
					selection={selection}
				/>
			</Show>

			<Show when={getDetailPanelData()}>
				{(data) => (
					<DetailPanel data={data()} onClose={() => setSelectedNodeId(null)} />
				)}
			</Show>
		</div>
	);
}
