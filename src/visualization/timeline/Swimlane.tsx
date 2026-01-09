import { type Component, createMemo, For } from "solid-js";
import type { SwimlaneProps } from "../../types/timeline";
import { BatchIndicator } from "./BatchIndicator";
import { EventMark } from "./EventMark";
import styles from "./Swimlane.module.css";

export const Swimlane: Component<SwimlaneProps> = (props) => {
	const getOpacity = () => {
		if (props.swimlane.isDisposed) return 0.5;
		return 1;
	};

	const getBgOpacity = () => {
		if (props.isSelected) return 0.1;
		return 0.05;
	};

	const batches = createMemo(() => {
		const batchMap = new Map<string, typeof props.events>();
		for (const event of props.events) {
			if (event.batchId) {
				if (!batchMap.has(event.batchId)) {
					batchMap.set(event.batchId, []);
				}
				batchMap.get(event.batchId)!.push(event);
			}
		}
		return Array.from(batchMap.entries()).map(([batchId, events]) => {
			const timestamps = events.map((e) => e.timestamp);
			const startTime = Math.min(...timestamps);
			const endTime = Math.max(...timestamps);
			return {
				batchId,
				events,
				startTime,
				endTime,
				duration: endTime - startTime,
				eventCount: events.length,
			};
		});
	});

	return (
		<g
			class={styles.swimlane}
			transform={`translate(0, ${props.swimlane.yPosition})`}
			opacity={getOpacity()}
		>
			<rect
				x={0}
				y={0}
				width={props.scale.width}
				height={props.swimlane.height}
				fill={props.swimlane.color}
				opacity={getBgOpacity()}
			/>

			<text
				x={10}
				y={props.swimlane.height / 2}
				dominant-baseline="middle"
				font-size="12"
				fill="#666"
			>
				{props.swimlane.nodeName || props.swimlane.nodeId}
			</text>

			<For each={batches()}>
				{(batch) => (
					<BatchIndicator
						x1={props.scale.scale(batch.startTime)}
						x2={props.scale.scale(batch.endTime)}
						y={0}
						height={props.swimlane.height}
						isHovered={false}
						batch={{
							id: batch.batchId,
							startTime: batch.startTime,
							endTime: batch.endTime,
							duration: batch.duration,
							eventIds: batch.events.map((e) => e.id),
							eventCount: batch.eventCount,
						}}
					/>
				)}
			</For>

			<For each={props.events}>
				{(event) => (
					<EventMark
						event={event}
						x={props.scale.scale(event.timestamp)}
						y={props.swimlane.height / 2}
						isSelected={false}
						isHovered={false}
						isSnapped={false}
						onClick={() => props.onEventClick?.(event)}
						onHover={(hovered) =>
							hovered ? props.onEventHover?.(event) : props.onEventHover?.(null)
						}
					/>
				)}
			</For>
		</g>
	);
};
