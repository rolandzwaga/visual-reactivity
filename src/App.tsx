import { createSignal, Show } from "solid-js";
import { tracker } from "./instrumentation";
import { DependencyGraph, DetailPanel } from "./visualization";
import type { DetailPanelData } from "./visualization/types";

export function App() {
	const [selectedNodeId, setSelectedNodeId] = createSignal<string | null>(null);

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
			<DependencyGraph width={window.innerWidth} height={window.innerHeight} />
			<Show when={getDetailPanelData()}>
				{(data) => (
					<DetailPanel data={data()} onClose={() => setSelectedNodeId(null)} />
				)}
			</Show>
		</div>
	);
}
