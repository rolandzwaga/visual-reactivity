import { select } from "d3-selection";
import { type ZoomBehavior, zoom } from "d3-zoom";
import {
	createMemo,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { createAnimationController } from "../animation";
import { tracker } from "../instrumentation";
import type { SubscriptionAddData, SubscriptionRemoveData } from "../types";
import { useForceSimulation, useGraphState } from "./hooks";
import { EffectNode, MemoNode, SignalNode } from "./nodes";
import {
	type DependencyGraphProps,
	EDGE_STYLES,
	type GraphNode,
	type ZoomTransform,
} from "./types";

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

export function DependencyGraph(props: DependencyGraphProps) {
	let svgRef: SVGSVGElement | undefined;

	const width = () => props.width ?? DEFAULT_WIDTH;
	const height = () => props.height ?? DEFAULT_HEIGHT;

	const state = useGraphState();
	const { positions, simulation } = useForceSimulation(
		state.nodes,
		state.edges,
		{
			width: width(),
			height: height(),
		},
	);

	const animationController = createAnimationController();

	const [transform, setTransform] = createSignal<ZoomTransform>({
		k: 1,
		x: 0,
		y: 0,
	});

	onMount(() => {
		const existingNodes = tracker.getNodes();
		for (const [, node] of existingNodes) {
			state.addNode(node);
		}

		const existingEdges = tracker.getEdges();
		for (const [, edge] of existingEdges) {
			state.addEdge(edge.source, edge.target, edge.type);
		}

		const unsubscribe = tracker.subscribe((event) => {
			switch (event.type) {
				case "signal-create":
				case "computation-create": {
					const node = tracker.getNode(event.nodeId);
					if (node) {
						state.addNode(node);
					}
					break;
				}
				case "signal-write": {
					animationController.animateSignalWrite(event.nodeId);
					const outgoingEdges = state.edges().filter((edge) => {
						const sourceId =
							typeof edge.source === "string" ? edge.source : edge.source.id;
						return sourceId === event.nodeId;
					});
					for (const edge of outgoingEdges) {
						const sourceId =
							typeof edge.source === "string" ? edge.source : edge.source.id;
						const targetId =
							typeof edge.target === "string" ? edge.target : edge.target.id;
						animationController.animateEdgeParticle(`${sourceId}->${targetId}`);
					}
					break;
				}
				case "computation-execute-start":
					animationController.animateExecutionStart(event.nodeId);
					break;
				case "computation-execute-end":
					animationController.animateExecutionEnd(event.nodeId);
					break;
				case "computation-dispose":
					animationController.animateDisposal(event.nodeId);
					state.removeNode(event.nodeId);
					break;
				case "subscription-add": {
					const data = event.data as SubscriptionAddData;
					const edgeId = `${data.sourceId}->${event.nodeId}`;
					state.addEdge(data.sourceId, event.nodeId, "dependency");
					animationController.animateEdgeAdd(edgeId);
					break;
				}
				case "subscription-remove": {
					const data = event.data as SubscriptionRemoveData;
					const edgeId = `${data.sourceId}->${event.nodeId}`;
					animationController.animateEdgeRemove(edgeId);
					state.removeEdge(data.sourceId, event.nodeId);
					break;
				}
			}
		});

		if (svgRef) {
			const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = zoom<
				SVGSVGElement,
				unknown
			>()
				.scaleExtent([0.1, 10])
				.on("zoom", (event) => {
					setTransform({
						k: event.transform.k,
						x: event.transform.x,
						y: event.transform.y,
					});
				});

			select<SVGSVGElement, unknown>(svgRef).call(zoomBehavior);
		}

		onCleanup(() => {
			unsubscribe();
			animationController.dispose();
		});
	});

	const nodePositions = createMemo(() => {
		const posMap = new Map<string, { x: number; y: number }>();
		for (const pos of positions()) {
			posMap.set(pos.id, { x: pos.x, y: pos.y });
		}
		return posMap;
	});

	const nodesWithPositions = createMemo(() => {
		const posMap = nodePositions();
		return state.nodes().map((node) => {
			const pos = posMap.get(node.id);
			return {
				...node,
				x: pos?.x ?? node.x,
				y: pos?.y ?? node.y,
			};
		});
	});

	const edgesWithPositions = createMemo(() => {
		const posMap = nodePositions();
		return state.edges().map((edge) => {
			const sourceId =
				typeof edge.source === "string" ? edge.source : edge.source.id;
			const targetId =
				typeof edge.target === "string" ? edge.target : edge.target.id;
			const sourcePos = posMap.get(sourceId);
			const targetPos = posMap.get(targetId);
			return {
				...edge,
				x1: sourcePos?.x ?? 0,
				y1: sourcePos?.y ?? 0,
				x2: targetPos?.x ?? 0,
				y2: targetPos?.y ?? 0,
			};
		});
	});

	const handleNodeClick = (nodeId: string) => {
		state.setSelectedNode(state.selectedNodeId() === nodeId ? null : nodeId);
	};

	const handleNodeMouseEnter = (nodeId: string) => {
		state.setHoveredNode(nodeId);
	};

	const handleNodeMouseLeave = () => {
		state.setHoveredNode(null);
	};

	const _handleNodeDragStart = (node: GraphNode) => {
		const sim = simulation();
		if (sim) {
			sim.alphaTarget(0.3).restart();
		}
		const graphNode = state.nodes().find((n) => n.id === node.id);
		if (graphNode) {
			graphNode.fx = graphNode.x;
			graphNode.fy = graphNode.y;
		}
	};

	const _handleNodeDrag = (node: GraphNode, x: number, y: number) => {
		const graphNode = state.nodes().find((n) => n.id === node.id);
		if (graphNode) {
			graphNode.fx = x;
			graphNode.fy = y;
		}
	};

	const _handleNodeDragEnd = (node: GraphNode) => {
		const sim = simulation();
		if (sim) {
			sim.alphaTarget(0);
		}
		const graphNode = state.nodes().find((n) => n.id === node.id);
		if (graphNode) {
			graphNode.fx = null;
			graphNode.fy = null;
		}
	};

	const isNodeConnected = (nodeId: string, hoveredId: string): boolean => {
		return state.edges().some((edge) => {
			const sourceId =
				typeof edge.source === "string" ? edge.source : edge.source.id;
			const targetId =
				typeof edge.target === "string" ? edge.target : edge.target.id;
			return (
				(sourceId === hoveredId && targetId === nodeId) ||
				(targetId === hoveredId && sourceId === nodeId)
			);
		});
	};

	const isEdgeConnectedToHovered = (edge: {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
		source: string | GraphNode;
		target: string | GraphNode;
	}): boolean => {
		const hoveredId = state.hoveredNodeId();
		if (!hoveredId) return false;
		const sourceId =
			typeof edge.source === "string" ? edge.source : edge.source.id;
		const targetId =
			typeof edge.target === "string" ? edge.target : edge.target.id;
		return sourceId === hoveredId || targetId === hoveredId;
	};

	const renderNode = (node: GraphNode) => {
		const isSelected = () => state.selectedNodeId() === node.id;
		const hoveredId = () => state.hoveredNodeId();
		const isHovered = () => {
			const hId = hoveredId();
			return hId === node.id || (hId !== null && isNodeConnected(node.id, hId));
		};
		const visualStateGetter = animationController.getNodeVisualState(node.id);
		const visualState = () => visualStateGetter();

		switch (node.type) {
			case "signal":
				return (
					<SignalNode
						node={node}
						isSelected={isSelected()}
						isHovered={isHovered()}
						onClick={handleNodeClick}
						onMouseEnter={handleNodeMouseEnter}
						onMouseLeave={handleNodeMouseLeave}
						pulseScale={visualState().pulseScale}
						isStale={visualState().isStale}
						isExecuting={visualState().isExecuting}
						highlightOpacity={visualState().highlightOpacity}
						disposeProgress={visualState().disposeProgress}
					/>
				);
			case "memo":
				return (
					<MemoNode
						node={node}
						isSelected={isSelected()}
						isHovered={isHovered()}
						onClick={handleNodeClick}
						onMouseEnter={handleNodeMouseEnter}
						onMouseLeave={handleNodeMouseLeave}
						pulseScale={visualState().pulseScale}
						isStale={visualState().isStale}
						isExecuting={visualState().isExecuting}
						highlightOpacity={visualState().highlightOpacity}
						disposeProgress={visualState().disposeProgress}
					/>
				);
			case "effect":
				return (
					<EffectNode
						node={node}
						isSelected={isSelected()}
						isHovered={isHovered()}
						onClick={handleNodeClick}
						onMouseEnter={handleNodeMouseEnter}
						onMouseLeave={handleNodeMouseLeave}
						pulseScale={visualState().pulseScale}
						isStale={visualState().isStale}
						isExecuting={visualState().isExecuting}
						highlightOpacity={visualState().highlightOpacity}
						disposeProgress={visualState().disposeProgress}
					/>
				);
			default:
				return null;
		}
	};

	const transformStyle = () =>
		`translate(${transform().x}, ${transform().y}) scale(${transform().k})`;

	const isEmpty = () => state.nodes().length === 0;

	return (
		<svg
			ref={svgRef}
			width={width()}
			height={height()}
			class={props.class}
			style={{ "background-color": "#1a1a2e" }}
		>
			<Show when={isEmpty()}>
				<text
					x={width() / 2}
					y={height() / 2}
					text-anchor="middle"
					fill="#888"
					font-size="16"
					font-family="system-ui, sans-serif"
				>
					No tracked primitives. Create signals, memos, or effects to visualize.
				</text>
			</Show>

			<defs>
				<marker
					id="arrowhead"
					markerWidth="10"
					markerHeight="7"
					refX="10"
					refY="3.5"
					orient="auto"
				>
					<polygon
						points="0 0, 10 3.5, 0 7"
						fill={EDGE_STYLES.dependency.stroke}
					/>
				</marker>
				<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="3" result="coloredBlur" />
					<feMerge>
						<feMergeNode in="coloredBlur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			<g transform={transformStyle()}>
				<g class="edges">
					<For each={edgesWithPositions()}>
						{(edge) => {
							const sourceId =
								typeof edge.source === "string" ? edge.source : edge.source.id;
							const targetId =
								typeof edge.target === "string" ? edge.target : edge.target.id;
							const edgeId = `${sourceId}->${targetId}`;
							const visualStateGetter =
								animationController.getEdgeVisualState(edgeId);
							const visualState = () => visualStateGetter();
							const particleProgress = () => visualState().particleProgress;
							const addProgress = () => visualState().addProgress;
							const removeProgress = () => visualState().removeProgress;

							const particleX = () => {
								const progress = particleProgress();
								if (progress === null) return 0;
								return edge.x1 + (edge.x2 - edge.x1) * progress;
							};
							const particleY = () => {
								const progress = particleProgress();
								if (progress === null) return 0;
								return edge.y1 + (edge.y2 - edge.y1) * progress;
							};

							return (
								<>
									<line
										x1={edge.x1}
										y1={edge.y1}
										x2={edge.x2}
										y2={edge.y2}
										stroke={EDGE_STYLES.dependency.stroke}
										stroke-width={
											isEdgeConnectedToHovered(edge)
												? EDGE_STYLES.dependency.strokeWidth + 1
												: EDGE_STYLES.dependency.strokeWidth
										}
										stroke-opacity={
											(state.hoveredNodeId() && !isEdgeConnectedToHovered(edge)
												? 0.3
												: 1) *
											(1 - removeProgress()) *
											addProgress()
										}
										marker-end="url(#arrowhead)"
									/>
									{particleProgress() !== null && (
										<circle
											cx={particleX()}
											cy={particleY()}
											r={5}
											fill="#fbbf24"
											filter="url(#glow)"
										/>
									)}
								</>
							);
						}}
					</For>
				</g>

				<g class="nodes">
					<For each={nodesWithPositions()}>{(node) => renderNode(node)}</For>
				</g>

				<g class="labels">
					<For each={nodesWithPositions()}>
						{(node) => (
							<text
								x={node.x}
								y={node.y + 35}
								text-anchor="middle"
								fill="#e0e0e0"
								font-size="12"
								font-family="system-ui, sans-serif"
								pointer-events="none"
								opacity={transform().k >= 0.5 ? 1 : 0}
							>
								{node.name || node.id}
							</text>
						)}
					</For>
				</g>
			</g>
		</svg>
	);
}
