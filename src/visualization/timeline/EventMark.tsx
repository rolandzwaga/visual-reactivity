import type { Component } from "solid-js";
import type { EventMarkProps } from "../../types/timeline";
import { EVENT_COLORS } from "../../types/timeline";
import styles from "./EventMark.module.css";

export const EventMark: Component<EventMarkProps> = (props) => {
	const handleClick = () => {
		props.onClick?.();
	};

	const handleMouseEnter = () => {
		props.onHover?.(true);
	};

	const handleMouseLeave = () => {
		props.onHover?.(false);
	};

	const getColor = () => {
		return EVENT_COLORS[props.event.type] || "#999999";
	};

	const getRadius = () => {
		if (props.isHovered) return 6;
		if (props.isSelected || props.isSnapped) return 5;
		return 4;
	};

	const getStroke = () => {
		if (props.isSnapped) return "#f59e0b";
		if (props.isSelected) return "#2563eb";
		return "none";
	};

	const getStrokeWidth = () => {
		if (props.isSelected || props.isSnapped) return 2;
		return 0;
	};

	const getOpacity = () => {
		if (props.isHovered || props.isSelected || props.isSnapped) return 1;
		return 0.8;
	};

	const getClass = () => {
		const classes = [styles.eventMark];
		if (props.isSelected) classes.push("selected");
		if (props.isHovered) classes.push("hovered");
		if (props.isSnapped) classes.push("snapped");
		return classes.join(" ");
	};

	return (
		<circle
			class={getClass()}
			cx={props.x}
			cy={props.y}
			r={getRadius()}
			fill={getColor()}
			stroke={getStroke()}
			stroke-width={getStrokeWidth()}
			opacity={getOpacity()}
			onClick={handleClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			style={{
				cursor: "pointer",
				transition: "r 0.15s ease, opacity 0.15s ease",
			}}
		/>
	);
};
