import {
	type Component,
	createEffect,
	createMemo,
	createSelector,
	For,
	Show,
} from "solid-js";
import type { SignalEntry } from "../../types/panel";
import { useVirtualScroll } from "../hooks/useVirtualScroll";
import styles from "./SignalList.module.css";
import { SignalRow } from "./SignalRow";

export interface SignalListProps {
	signals: SignalEntry[];
	selectedId: string | null;
	onSignalClick: (id: string, event?: MouseEvent) => void;
	onValueEdit: (id: string, newValue: unknown) => void;
	selectionSync?:
		| import("../hooks/useSelectionSync").UseSelectionSyncReturn
		| null;
}

const ITEM_HEIGHT = 80; // Approximate height of SignalRow in pixels
const VIRTUAL_SCROLL_THRESHOLD = 200; // Use virtual scrolling for 200+ items
const BUFFER_SIZE = 5; // Number of extra items to render above/below viewport

/**
 * List component that displays all signals.
 * Uses virtual scrolling for large lists (200+ items).
 */
export const SignalList: Component<SignalListProps> = (props) => {
	let containerRef: HTMLDivElement | undefined;
	const selectedRowRefs: Map<string, HTMLDivElement> = new Map();

	const useVirtualScrolling = () =>
		props?.signals?.length >= VIRTUAL_SCROLL_THRESHOLD;

	// Virtual scroll state - always create but only use when needed
	const virtualScroll = useVirtualScroll({
		totalItems: () => props?.signals?.length || 0,
		itemHeight: ITEM_HEIGHT,
		bufferSize: BUFFER_SIZE,
	});

	// Calculate visible items for virtual scrolling
	const visibleItems = createMemo(() => {
		if (!props?.signals || !useVirtualScrolling() || !virtualScroll) return [];

		const range = virtualScroll.getVisibleRange()();
		const items: number[] = [];
		for (
			let i = range.start;
			i < range.end && i < (props?.signals?.length || 0);
			i++
		) {
			items.push(i);
		}
		return items;
	});

	// Calculate total height for virtual scrolling
	const totalHeight = () => (props?.signals?.length || 0) * ITEM_HEIGHT;

	// Scroll selected signal into view
	createEffect(() => {
		const selectedId = props?.selectedId;
		if (!selectedId || !containerRef) return;

		// Find the index of the selected signal
		const index = props?.signals?.findIndex((s) => s.id === selectedId);
		if (index === undefined || index === -1) return;

		// If using virtual scrolling, scroll container to position first
		if (useVirtualScrolling()) {
			const scrollContainer = containerRef.querySelector(
				'[style*="overflow"]',
			) as HTMLElement;
			if (scrollContainer) {
				const targetScrollTop = index * ITEM_HEIGHT;
				scrollContainer.scrollTop = targetScrollTop;

				// Manually trigger virtual scroll update (programmatic scrollTop doesn't fire events)
				virtualScroll?.onScroll(targetScrollTop);

				// Wait for virtual scroll to update and render the element
				setTimeout(() => {
					const element = selectedRowRefs.get(selectedId);
					if (element) {
						element.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
					}
				}, 10);
				return;
			}
		}

		// For non-virtual scrolling, just scroll the element
		const element = selectedRowRefs.get(selectedId);
		if (element) {
			element.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
		}
	});

	const handleRowClick = (id: string, event?: MouseEvent) => {
		props.onSignalClick(id, event);
	};

	const handleValueEdit = (id: string, newValue: unknown) => {
		props.onValueEdit(id, newValue);
	};

	const setRowRef = (id: string, element: HTMLDivElement) => {
		selectedRowRefs.set(id, element);
	};

	const selectedIds = createMemo(() => {
		if (props.selectionSync) {
			return props.selectionSync.highlightedNodeIds();
		}
		return new Set(props.selectedId ? [props.selectedId] : []);
	});

	const isSelected = createSelector<string>(
		() => Array.from(selectedIds())[0] ?? "",
		(key, _id) => selectedIds().has(key),
	);

	return (
		<div class={styles.container} ref={containerRef}>
			<Show
				when={props?.signals?.length > 0}
				fallback={
					<div class={styles.empty}>
						<p>Empty - no tracked values yet</p>
					</div>
				}
			>
				<Show
					when={useVirtualScrolling()}
					fallback={
						// Regular rendering for small lists
						<div class={styles.list}>
							<For each={props?.signals || []}>
								{(signal) => (
									<div ref={(el) => setRowRef(signal.id, el)}>
										<SignalRow
											signal={signal}
											isSelected={isSelected(signal.id)}
											onClick={(event) => handleRowClick(signal.id, event)}
											onValueEdit={handleValueEdit}
										/>
									</div>
								)}
							</For>
						</div>
					}
				>
					{/* Virtual scrolling for large lists */}
					<div
						class={styles.virtualContainer}
						style={{
							height: "600px",
							overflow: "auto",
						}}
						onScroll={(e) => virtualScroll?.onScroll(e.currentTarget.scrollTop)}
					>
						<div
							style={{
								height: `${totalHeight()}px`,
								position: "relative",
							}}
						>
							<For each={visibleItems()}>
								{(index) => {
									const signal = props?.signals?.[index];
									if (!signal) return null;
									return (
										<div
											style={{
												position: "absolute",
												top: `${index * ITEM_HEIGHT}px`,
												left: "0",
												right: "0",
												height: `${ITEM_HEIGHT}px`,
											}}
											ref={(el) => setRowRef(signal.id, el)}
										>
											<SignalRow
												signal={signal}
												isSelected={isSelected(signal.id)}
												onClick={(event) => handleRowClick(signal.id, event)}
												onValueEdit={handleValueEdit}
											/>
										</div>
									);
								}}
							</For>
						</div>
					</div>
				</Show>
			</Show>
		</div>
	);
};
