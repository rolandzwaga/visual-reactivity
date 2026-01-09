import { NODE_STYLES, type NodeShapeProps } from "../types";

export function SignalNode(props: NodeShapeProps) {
	const style = NODE_STYLES.signal;

	const strokeWidth = () => {
		if (props.isSelected) return 3;
		if (props.isHovered) return 2;
		return 1;
	};

	const scale = () => props.pulseScale ?? 1;
	const disposeProgress = () => props.disposeProgress ?? 0;
	const opacity = () => 1 - disposeProgress();
	const grayscale = () =>
		disposeProgress() > 0
			? `grayscale(${disposeProgress() * 100}%)`
			: undefined;

	const fillColor = () => {
		if (props.isExecuting) return "#fbbf24";
		if (props.isStale) return "#9ca3af";
		return style.color;
	};

	const glowFilter = () => (props.isExecuting ? "url(#glow)" : undefined);

	return (
		<g
			transform={`translate(${props.node.x}, ${props.node.y}) scale(${scale()})`}
			onClick={(e) => props.onClick(props.node.id, e)}
			onMouseEnter={() => props.onMouseEnter(props.node.id)}
			onMouseLeave={() => props.onMouseLeave()}
			style={{ cursor: "pointer", filter: grayscale() }}
			opacity={opacity()}
		>
			<circle
				r={style.radius}
				fill={fillColor()}
				stroke="#fff"
				stroke-width={strokeWidth()}
				filter={glowFilter()}
			/>
			{props.highlightOpacity !== undefined && props.highlightOpacity > 0 && (
				<circle
					r={style.radius + 4}
					fill="none"
					stroke="#fbbf24"
					stroke-width={2}
					opacity={props.highlightOpacity}
				/>
			)}
		</g>
	);
}
