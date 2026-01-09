import type { HierarchyPointNode } from "d3-hierarchy";
import {
	createEffect,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { tracker } from "../instrumentation";
import type { ReactiveNode } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { useHierarchyLayout } from "./hooks/useHierarchyLayout";
import { useKeyboardNav } from "./hooks/useKeyboardNav";
import { useSelectionSync } from "./hooks/useSelectionSync";
import { useTreeState } from "./hooks/useTreeState";
import { Notification } from "./Notification";
import { EffectNode, MemoNode, SignalNode } from "./nodes";
import styles from "./OwnershipTree.module.css";

export interface OwnershipTreeProps {
	width?: number;
	height?: number;
	selectedNodeId?: string | null;
	onSelectNode?: (nodeId: string | null) => void;
	class?: string;
	selection?: import("../types/selection").SelectionStore;
}

const DEFAULT_EXPANSION_DEPTH = 2;

function computeInitiallyExpandedNodes(
	roots: HierarchyPointNode<ReactiveNode>[],
	maxDepth: number,
): Set<string> {
	const expanded = new Set<string>();
	for (const root of roots) {
		root.descendants().forEach((node) => {
			if (node.depth < maxDepth) {
				expanded.add(node.data.id);
			}
		});
	}
	return expanded;
}

export function OwnershipTree(props: OwnershipTreeProps) {
	const [nodes, setNodes] = createSignal(new Map(tracker.getNodes()));
	const layout = useHierarchyLayout(nodes);
	const initialExpanded = computeInitiallyExpandedNodes(
		layout.roots(),
		DEFAULT_EXPANSION_DEPTH,
	);
	const state = useTreeState(initialExpanded);

	const selectionSync = props.selection
		? useSelectionSync("tree", props.selection)
		: null;

	const keyboardNav = props.selection
		? useKeyboardNav("tree", props.selection)
		: null;

	const [contextMenu, setContextMenu] = createSignal<{
		x: number;
		y: number;
		nodeId: string;
	} | null>(null);
	const [showConfirmDialog, setShowConfirmDialog] = createSignal(false);
	const [nodeToDispose, setNodeToDispose] = createSignal<string | null>(null);
	const [notification, setNotification] = createSignal<string | null>(null);

	let svgRef: SVGSVGElement | undefined;

	onMount(() => {
		const unsubscribe = tracker.subscribe((event) => {
			switch (event.type) {
				case "signal-create":
				case "computation-create":
				case "computation-dispose":
					setNodes(new Map(tracker.getNodes()));
					break;
			}
		});

		onCleanup(() => {
			unsubscribe();
		});
	});

	createEffect(() => {
		const selectedId = props.selectedNodeId;
		if (selectedId && svgRef) {
			const nodeElement = svgRef.querySelector(
				`[data-node-id="${selectedId}"]`,
			);
			if (nodeElement) {
				nodeElement.scrollIntoView({
					behavior: "smooth",
					block: "center",
					inline: "center",
				});
			}
		}
	});

	createEffect(() => {
		if (selectionSync) {
			const selectedIds = selectionSync.highlightedNodeIds();
			for (const selectedId of selectedIds) {
				const node = nodes().get(selectedId);
				if (node?.owner) {
					let currentId: string | null = node.owner;
					while (currentId) {
						const idToExpand = currentId;
						state.setExpandedNodes((prev) => {
							const next = new Set(prev);
							next.add(idToExpand);
							return next;
						});
						const parentNode = nodes().get(currentId);
						currentId = parentNode?.owner ?? null;
					}
				}
			}
		}
	});

	const countDescendants = (nodeId: string): number => {
		const node = nodes().get(nodeId);
		if (!node) return 0;

		let count = node.owned.length;
		for (const childId of node.owned) {
			count += countDescendants(childId);
		}
		return count;
	};

	const handleContextMenu = (e: MouseEvent, nodeId: string) => {
		e.preventDefault();
		const node = nodes().get(nodeId);
		if (node && node.owner === null) {
			setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
		}
	};

	const handleDisposeClick = () => {
		const menu = contextMenu();
		if (menu) {
			setNodeToDispose(menu.nodeId);
			setShowConfirmDialog(true);
			setContextMenu(null);
		}
	};

	const handleConfirmDispose = () => {
		const nodeId = nodeToDispose();
		if (nodeId) {
			const descendantCount = countDescendants(nodeId);
			state.markDisposing(nodeId);
			setNotification(
				`Disposed 1 root and ${descendantCount} ${descendantCount === 1 ? "child" : "children"}`,
			);
		}
		setShowConfirmDialog(false);
		setNodeToDispose(null);
	};

	const getNodeComponent = (type: string) => {
		switch (type) {
			case "signal":
				return SignalNode;
			case "memo":
				return MemoNode;
			case "effect":
			case "renderEffect":
				return EffectNode;
			default:
				return SignalNode;
		}
	};

	const isNodeVisible = (node: HierarchyPointNode<ReactiveNode>): boolean => {
		if (!node.parent) return true;
		if (!state.expandedNodes().has(node.parent.data.id)) return false;
		return isNodeVisible(node.parent);
	};

	const getVisibleNodes = (
		root: HierarchyPointNode<ReactiveNode>,
	): HierarchyPointNode<ReactiveNode>[] => {
		return root.descendants().filter(isNodeVisible);
	};

	const getVisibleEdges = (
		root: HierarchyPointNode<ReactiveNode>,
	): Array<{
		source: HierarchyPointNode<ReactiveNode>;
		target: HierarchyPointNode<ReactiveNode>;
	}> => {
		const visibleNodes = getVisibleNodes(root);
		const visibleNodeIds = new Set(visibleNodes.map((n) => n.data.id));
		return root
			.links()
			.filter(
				(link) =>
					visibleNodeIds.has(link.source.data.id) &&
					visibleNodeIds.has(link.target.data.id),
			);
	};

	const renderEdges = (root: HierarchyPointNode<ReactiveNode>) => {
		const edges = getVisibleEdges(root);
		return (
			<For each={edges}>
				{(link) => {
					const sourceX = link.source.x ?? 0;
					const sourceY = link.source.y ?? 0;
					const targetX = link.target.x ?? 0;
					const targetY = link.target.y ?? 0;

					return (
						<path
							class={styles.edgePath}
							d={`M${sourceX},${sourceY} L${targetX},${targetY}`}
						/>
					);
				}}
			</For>
		);
	};

	const getNodeTooltip = (
		treeNode: HierarchyPointNode<ReactiveNode>,
	): string => {
		const directChildren = treeNode.data.owned.length;
		const totalDescendants = treeNode.descendants().length - 1;
		return `${treeNode.data.name} (${treeNode.data.type})\nDirect children: ${directChildren}\nTotal descendants: ${totalDescendants}`;
	};

	const renderNodes = (root: HierarchyPointNode<ReactiveNode>) => {
		const visibleNodes = getVisibleNodes(root);
		return (
			<For each={visibleNodes}>
				{(treeNode) => {
					const NodeComponent = getNodeComponent(treeNode.data.type);
					const x = treeNode.x ?? 0;
					const y = treeNode.y ?? 0;
					const hasChildren = treeNode.data.owned.length > 0;
					const isExpanded = state.expandedNodes().has(treeNode.data.id);
					const isDisposed = treeNode.data.disposedAt !== null;
					const isDisposing = state.disposingNodes().has(treeNode.data.id);

					return (
						<g
							transform={`translate(${x}, ${y})`}
							data-node-id={treeNode.data.id}
							class={isDisposed || isDisposing ? styles.disposed : ""}
							onContextMenu={(e) => handleContextMenu(e, treeNode.data.id)}
						>
							<title>{getNodeTooltip(treeNode)}</title>
							<NodeComponent
								node={{
									id: treeNode.data.id,
									type: treeNode.data.type,
									name: treeNode.data.name,
									x,
									y,
									vx: 0,
									vy: 0,
									fx: null,
									fy: null,
									data: treeNode.data,
								}}
								isSelected={
									selectionSync
										? selectionSync.isNodeSelected(treeNode.data.id)
										: props.selectedNodeId === treeNode.data.id
								}
								isHovered={state.hoveredNodeId() === treeNode.data.id}
								isStale={treeNode.data.isStale}
								isExecuting={treeNode.data.isExecuting}
								onClick={(nodeId, event) => {
									if (selectionSync && event) {
										selectionSync.handleNodeClick(nodeId, event);
									} else {
										props.onSelectNode?.(nodeId);
									}
								}}
								onMouseEnter={() => {
									state.setHoveredNodeId(treeNode.data.id);
								}}
								onMouseLeave={() => {
									state.setHoveredNodeId(null);
								}}
							/>
							<Show when={hasChildren}>
								<g
									class={styles.expandButton}
									onClick={(e) => {
										e.stopPropagation();
										state.toggleExpanded(treeNode.data.id);
									}}
									style={{ cursor: "pointer" }}
								>
									<circle r="8" fill="white" stroke="#666" stroke-width="1" />
									<Show
										when={isExpanded}
										fallback={
											<text
												text-anchor="middle"
												dominant-baseline="central"
												font-size="12"
												fill="#666"
											>
												+
											</text>
										}
									>
										<text
											text-anchor="middle"
											dominant-baseline="central"
											font-size="12"
											fill="#666"
										>
											−
										</text>
									</Show>
								</g>
							</Show>
							<Show when={isDisposed || isDisposing}>
								<text
									class={styles.disposedLabel}
									y="-25"
									text-anchor="middle"
									font-size="10"
									fill="#6b7280"
								>
									Disposed
								</text>
							</Show>
						</g>
					);
				}}
			</For>
		);
	};

	const hasNodes = () => nodes().size > 0;
	const hasRoots = () => layout.roots().length > 0;

	return (
		<div class={`${styles.container} ${props.class || ""}`}>
			<Show when={!hasNodes()}>
				<div class={styles.emptyState}>
					<p class={styles.emptyMessage}>No reactive primitives yet</p>
					<p class={styles.emptyHint}>
						Create signals, memos, or effects to see them visualized here
					</p>
				</div>
			</Show>

			<Show when={hasNodes() && !hasRoots()}>
				<div class={styles.emptyState}>
					<p class={styles.emptyMessage}>
						No ownership relationships - all nodes are independent
					</p>
					<p class={styles.emptyHint}>
						Nodes created outside createRoot or createEffect won't have owners
					</p>
				</div>
			</Show>

			<Show when={hasRoots()}>
				<svg
					ref={svgRef}
					class={styles.svg}
					width={layout.treeWidth()}
					height={layout.treeHeight()}
					tabindex={props.selection ? 0 : undefined}
					onKeyDown={(e) => keyboardNav?.handleKeyDown(e)}
				>
					<For each={layout.roots()}>
						{(root) => (
							<g>
								{renderEdges(root)}
								{renderNodes(root)}
							</g>
						)}
					</For>
				</svg>
			</Show>

			<Show when={contextMenu()}>
				{(menu) => (
					<div
						class={styles.contextMenu}
						style={{
							left: `${menu().x}px`,
							top: `${menu().y}px`,
						}}
					>
						<button
							type="button"
							class={styles.contextMenuItem}
							onClick={handleDisposeClick}
						>
							Dispose Node
						</button>
					</div>
				)}
			</Show>

			<ConfirmDialog
				isOpen={showConfirmDialog()}
				title="Confirm Disposal"
				message={`Are you sure you want to dispose this node and all its ${countDescendants(nodeToDispose() ?? "")} descendants? This action cannot be undone.`}
				onConfirm={handleConfirmDispose}
				onCancel={() => setShowConfirmDialog(false)}
			/>

			<Notification
				isOpen={notification() !== null}
				message={notification() ?? ""}
				onClose={() => setNotification(null)}
			/>
		</div>
	);
}
