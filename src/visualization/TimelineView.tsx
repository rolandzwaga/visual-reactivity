import { type Component, createSignal, For, onMount } from "solid-js";
import { tracker } from "../instrumentation";
import { batchEvents } from "../lib/eventBatcher";
import type { TimelineViewProps } from "../types/timeline";
import { useTimelineLayout } from "./hooks/useTimelineLayout";
import styles from "./TimelineView.module.css";
import { Swimlane } from "./timeline/Swimlane";
import { TimelineAxis } from "./timeline/TimelineAxis";

export const TimelineView: Component<TimelineViewProps> = (props) => {
	const [events, setEvents] = createSignal<any[]>([]);

	const nodes = () => Array.from(tracker.getNodes().values());

	const timelineEvents = () => {
		const rawEvents = events().map((e, index) => ({
			...e,
			id: `event-${index}`,
			batchId: null,
		}));

		const { events: batchedEvents } = batchEvents(rawEvents);
		return batchedEvents;
	};

	const layout = useTimelineLayout({
		get events() {
			return timelineEvents();
		},
		get nodes() {
			return nodes();
		},
		get width() {
			return props.width;
		},
		get height() {
			return props.height - 30;
		},
	});

	onMount(() => {
		const unsubscribe = tracker.subscribe((event) => {
			setEvents((prev) => [...prev, event]);
		});

		return () => unsubscribe();
	});

	const getEventsForNode = (nodeId: string) => {
		return timelineEvents().filter((e) => e.nodeId === nodeId);
	};

	const handleEventClick = (event: TimelineEvent) => {
		setSelectedEvent(event);
		props.onEventClick?.(event);
	};

	const handleEventHover = (event: TimelineEvent | null) => {
		setHoveredEvent(event);
	};

	return (
		<div style={{ position: "relative" }}>
			<svg
				width={props.width}
				height={props.height}
				class={styles.timelineView}
				style={{ overflow: "visible" }}
			>
				<g>
					<For each={layout.swimlanes()}>
						{(swimlane) => (
							<Swimlane
								swimlane={swimlane}
								events={getEventsForNode(swimlane.nodeId)}
								scale={layout.scale()}
								isSelected={false}
								onEventClick={handleEventClick}
								onEventHover={handleEventHover}
							/>
						)}
					</For>
				</g>

				<g transform={`translate(0, ${props.height - 30})`}>
					<TimelineAxis scale={layout.scale()} />
				</g>
			</svg>

			<Show when={hoveredEvent()}>
				<EventTooltip
					event={hoveredEvent()!}
					x={tooltipPos().x}
					y={tooltipPos().y}
					visible={true}
				/>
			</Show>

			<EventDetailsPanel
				event={selectedEvent()}
				onClose={() => setSelectedEvent(null)}
			/>
		</div>
	);
};
