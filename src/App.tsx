import { createSignal, Show } from "solid-js";
import { createPatternDetector } from "./analysis/patternDetector";
import { tracker } from "./instrumentation";
import { createPatternStore } from "./stores/patternStore";
import { createRecordingStore } from "./stores/recordingStore";
import { createReplayStore } from "./stores/replayStore";
import { createSelectionStore } from "./stores/selectionStore";
import { DependencyGraph, DetailPanel, OwnershipTree } from "./visualization";
import { AnalysisPanel } from "./visualization/AnalysisPanel";
import { TimelineView } from "./visualization/TimelineView";
import type { DetailPanelData } from "./visualization/types";

type ViewMode = "graph" | "tree" | "timeline";

export function App() {
	const [selectedNodeId, setSelectedNodeId] = createSignal<string | null>(null);
	const [viewMode, setViewMode] = createSignal<ViewMode>("graph");
	const [analysisExpanded, setAnalysisExpanded] = createSignal(false);
	const [analysisPanelWidth, setAnalysisPanelWidth] = createSignal(350);
	const [showExpectedPatterns, setShowExpectedPatterns] = createSignal(false);

	const selection = createSelectionStore();
	const patternStore = createPatternStore();
	const replayStore = createReplayStore();
	const recordingStore = createRecordingStore();
	const _patternDetector = createPatternDetector(
		() => Array.from(tracker.getNodes().values()),
		() =>
			Array.from(tracker.getEdges().values()).map((e) => ({
				source: e.source,
				target: e.target,
				type: e.type,
			})),
	);

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
				<button
					type="button"
					onClick={() => setViewMode("timeline")}
					style={{
						padding: "8px 16px",
						background: viewMode() === "timeline" ? "#3b82f6" : "white",
						color: viewMode() === "timeline" ? "white" : "#1f2937",
						border: "1px solid #d1d5db",
						"border-radius": "6px",
						cursor: "pointer",
						"font-weight": "500",
					}}
				>
					Timeline
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

			<Show when={viewMode() === "timeline"}>
				<TimelineView
					width={window.innerWidth}
					height={window.innerHeight}
					selection={selection}
					replayStore={replayStore}
					recordingStore={recordingStore}
				/>
			</Show>

			<Show when={getDetailPanelData()}>
				{(data) => (
					<DetailPanel data={data()} onClose={() => setSelectedNodeId(null)} />
				)}
			</Show>

			<AnalysisPanel
				patterns={patternStore.patterns()}
				metrics={patternStore.metrics()}
				isExpanded={analysisExpanded()}
				onToggle={() => setAnalysisExpanded(!analysisExpanded())}
				onPatternClick={(pattern) => {
					selection.setSelection(new Set(pattern.affectedNodeIds), "graph");
				}}
				onMarkExpected={(patternId, reason) =>
					patternStore.markAsExpected(patternId, reason || "")
				}
				onRemoveException={(patternId) =>
					patternStore.removeException(patternId)
				}
				showExpectedPatterns={showExpectedPatterns()}
				onToggleShowExpected={setShowExpectedPatterns}
				width={analysisPanelWidth()}
				onWidthChange={setAnalysisPanelWidth}
			/>
		</div>
	);
}
