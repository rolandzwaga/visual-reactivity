import { NODE_STYLES, type NodeShapeProps } from "../types";

export function MemoNode(props: NodeShapeProps) {
	const style = NODE_STYLES.memo;
	const halfSize = style.size / 2;

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
			onClick={() => props.onClick(props.node.id)}
			onMouseEnter={() => props.onMouseEnter(props.node.id)}
			onMouseLeave={() => props.onMouseLeave()}
			style={{ cursor: "pointer", filter: grayscale() }}
			opacity={opacity()}
		>
			<rect
				x={-halfSize}
				y={-halfSize}
				width={style.size}
				height={style.size}
				fill={fillColor()}
				stroke="#fff"
				stroke-width={strokeWidth()}
				transform="rotate(45)"
				filter={glowFilter()}
			/>
			{props.highlightOpacity !== undefined && props.highlightOpacity > 0 && (
				<rect
					x={-halfSize - 4}
					y={-halfSize - 4}
					width={style.size + 8}
					height={style.size + 8}
					fill="none"
					stroke="#fbbf24"
					stroke-width={2}
					transform="rotate(45)"
					opacity={props.highlightOpacity}
				/>
			)}
		</g>
	);
}
