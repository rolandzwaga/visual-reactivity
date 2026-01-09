import {
	type Component,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { tracker } from "../instrumentation";
import { batchEvents } from "../lib/eventBatcher";
import type { EventType, ReactivityEvent } from "../types/events";
import type {
	PlaybackState,
	TimelineEvent,
	TimelineFilter,
	TimelineViewProps,
} from "../types/timeline";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { useSelectionSync } from "./hooks/useSelectionSync";
import { useTimelineLayout } from "./hooks/useTimelineLayout";
import styles from "./TimelineView.module.css";
import { EventDetailsPanel } from "./timeline/EventDetailsPanel";
import { EventTooltip } from "./timeline/EventTooltip";
import { ExportImportControls } from "./timeline/ExportImportControls";
import { PlaybackControls } from "./timeline/PlaybackControls";
import { RecordingManager } from "./timeline/RecordingManager";
import { Swimlane } from "./timeline/Swimlane";
import { TimelineAxis } from "./timeline/TimelineAxis";
import { TimelineCursor } from "./timeline/TimelineCursor";
import { TimelineFilters } from "./timeline/TimelineFilters";

export const TimelineView: Component<TimelineViewProps> = (props) => {
	const [events, setEvents] = createSignal<ReactivityEvent[]>([]);
	const [currentRecording, setCurrentRecording] = createSignal<
		import("../types/replay").Recording | null
	>(null);
	const [hoveredEvent, setHoveredEvent] = createSignal<TimelineEvent | null>(
		null,
	);
	const [selectedEvent, setSelectedEvent] = createSignal<TimelineEvent | null>(
		null,
	);
	const [tooltipPos, setTooltipPos] = createSignal({ x: 0, y: 0 });
	const [cursorTime, setCursorTime] = createSignal<number | null>(null);
	const [filter, setFilter] = createSignal<TimelineFilter>({
		enabledEventTypes: new Set<EventType>([
			"signal-read",
			"signal-write",
			"computation-execute-start",
			"computation-execute-end",
			"computation-dispose",
		]),
		selectedNodeIds: null,
		searchQuery: "",
	});
	const [playback, setPlayback] = createSignal<PlaybackState>({
		isPlaying: false,
		speed: 1,
		mode: "manual",
		lastTickTime: null,
		rafId: null,
		loop: false,
	});

	const selectionSync = props.selection
		? useSelectionSync("timeline", props.selection)
		: null;

	const nodes = () => Array.from(tracker.getNodes().values());

	const timelineEvents = () => {
		const rawEvents = events().map((e, index) => ({
			...e,
			id: `event-${index}`,
			batchId: null,
		}));

		const { events: batchedEvents } = batchEvents(rawEvents);

		return batchedEvents.filter((e) =>
			filter().enabledEventTypes.has(e.type as EventType),
		);
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

	const handleSvgClick = (e: MouseEvent) => {
		const svgRect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
		const x = e.clientX - svgRect.left;
		const time = layout.scale().scale.invert(x).getTime();
		setCursorTime(time);

		if (playback().isPlaying) {
			handlePause();
		}
	};

	const handlePlay = () => {
		const play = () => {
			const current = cursorTime() || timelineEvents()[0]?.timestamp || 0;
			const maxTime =
				timelineEvents()[timelineEvents().length - 1]?.timestamp || 1000;

			if (current >= maxTime) {
				setCursorTime(timelineEvents()[0]?.timestamp || 0);
			}

			const tick = (timestamp: number) => {
				const last = playback().lastTickTime || timestamp;
				const delta = Math.min(timestamp - last, 50);
				const newTime = (cursorTime() || 0) + delta * playback().speed;

				if (newTime >= maxTime) {
					if (playback().loop) {
						setCursorTime(timelineEvents()[0]?.timestamp || 0);
						setPlayback({
							...playback(),
							lastTickTime: timestamp,
							rafId: requestAnimationFrame(tick),
						});
					} else {
						setCursorTime(maxTime);
						handlePause();
					}
					return;
				}

				setCursorTime(newTime);
				setPlayback({
					...playback(),
					lastTickTime: timestamp,
					rafId: requestAnimationFrame(tick),
				});
			};

			const rafId = requestAnimationFrame(tick);
			setPlayback({
				...playback(),
				isPlaying: true,
				rafId,
				lastTickTime: performance.now(),
			});
		};

		play();
	};

	const handlePause = () => {
		if (playback().rafId !== null) {
			cancelAnimationFrame(playback().rafId!);
		}
		setPlayback({
			...playback(),
			isPlaying: false,
			rafId: null,
			lastTickTime: null,
		});
	};

	const handleSpeedChange = (speed: number) => {
		setPlayback({ ...playback(), speed });
	};

	const handleStepForward = () => {
		if (props.replayStore) {
			props.replayStore.stepForward(events());
		}
	};

	const handleStepBackward = () => {
		if (props.replayStore) {
			props.replayStore.stepBackward(events());
		}
	};

	const handleJumpToStart = () => {
		if (props.replayStore) {
			props.replayStore.jumpToStart(events());
		}
	};

	const handleJumpToEnd = () => {
		if (props.replayStore) {
			props.replayStore.jumpToEnd(events());
		}
	};

	const handleToggleLoop = () => {
		setPlayback({ ...playback(), loop: !playback().loop });
	};

	if (props.replayStore) {
		useKeyboardNavigation(props.replayStore, events);
	}

	onCleanup(() => {
		if (playback().rafId !== null) {
			cancelAnimationFrame(playback().rafId!);
		}
	});

	return (
		<div
			style={{
				position: "relative",
				display: "flex",
				"flex-direction": "column",
			}}
		>
			<div style={{ display: "flex", gap: "1rem", padding: "0.5rem" }}>
				<TimelineFilters
					filter={filter()}
					availableNodes={nodes()}
					onChange={setFilter}
				/>
				<PlaybackControls
					playback={playback()}
					onPlay={handlePlay}
					onPause={handlePause}
					onSpeedChange={handleSpeedChange}
					onStepForward={handleStepForward}
					onStepBackward={handleStepBackward}
					onJumpToStart={handleJumpToStart}
					onJumpToEnd={handleJumpToEnd}
					onToggleLoop={handleToggleLoop}
				/>
				<Show when={props.recordingStore && props.replayStore}>
					<RecordingManager
						recordingStore={props.recordingStore!}
						onLoad={async (id) => {
							const recording = await props.recordingStore!.load(id);
							if (recording) {
								setEvents(recording.events);
								setCurrentRecording(recording);
								props.replayStore!.loadRecording(recording);
							}
						}}
						onSave={async (name) => {
							await props.recordingStore!.save(name, events());
						}}
					/>
					<ExportImportControls
						recordingStore={props.recordingStore!}
						currentRecording={currentRecording()}
					/>
				</Show>
			</div>

			<svg
				width={props.width}
				height={props.height}
				class={styles.timelineView}
				style={{ overflow: "visible", cursor: "crosshair" }}
				onPointerDown={handleSvgClick}
			>
				<g>
					<For each={layout.swimlanes()}>
						{(swimlane) => (
							<Swimlane
								swimlane={swimlane}
								events={getEventsForNode(swimlane.nodeId)}
								scale={layout.scale()}
								isSelected={
									selectionSync
										? selectionSync.isNodeSelected(swimlane.nodeId)
										: false
								}
								onEventClick={handleEventClick}
								onEventHover={handleEventHover}
								onSwimlaneClick={(event) => {
									if (selectionSync) {
										selectionSync.handleNodeClick(swimlane.nodeId, event);
									}
								}}
							/>
						)}
					</For>
				</g>

				<Show when={cursorTime() !== null}>
					<TimelineCursor
						cursor={{
							time: cursorTime()!,
							x: layout.scale().scale(cursorTime()!),
							snappedEventId: null,
							isSnapped: false,
						}}
						height={props.height - 30}
					/>
				</Show>

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
