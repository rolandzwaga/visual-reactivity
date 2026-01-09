import { type Component, For } from "solid-js";
import type { SwimlaneProps } from "../../types/timeline";
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
