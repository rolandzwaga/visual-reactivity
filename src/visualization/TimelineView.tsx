import { type Component, createSignal, For, onMount, Show } from "solid-js";
import { tracker } from "../instrumentation";
import { batchEvents } from "../lib/eventBatcher";
import type { ReactivityEvent } from "../types/events";
import type { TimelineEvent, TimelineViewProps } from "../types/timeline";
import { useTimelineLayout } from "./hooks/useTimelineLayout";
import styles from "./TimelineView.module.css";
import { EventDetailsPanel } from "./timeline/EventDetailsPanel";
import { EventTooltip } from "./timeline/EventTooltip";
import { Swimlane } from "./timeline/Swimlane";
import { TimelineAxis } from "./timeline/TimelineAxis";

export const TimelineView: Component<TimelineViewProps> = (props) => {
	const [events, setEvents] = createSignal<ReactivityEvent[]>([]);
	const [hoveredEvent, setHoveredEvent] = createSignal<TimelineEvent | null>(
		null,
	);
	const [selectedEvent, setSelectedEvent] = createSignal<TimelineEvent | null>(
		null,
	);
	const [tooltipPos, setTooltipPos] = createSignal({ x: 0, y: 0 });

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
		if (event) {
			const x = layout.scale().scale(event.timestamp);
			const swimlane = layout
				.swimlanes()
				.find((s) => s.nodeId === event.nodeId);
			const y = swimlane ? swimlane.yPosition + swimlane.height / 2 : 0;
			setTooltipPos({ x, y });
		}
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
					visible={!!hoveredEvent()}
				/>
			</Show>

			<EventDetailsPanel
				event={selectedEvent()}
				onClose={() => setSelectedEvent(null)}
			/>
		</div>
	);
};
