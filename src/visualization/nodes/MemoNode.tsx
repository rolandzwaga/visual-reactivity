import { NODE_STYLES, type NodeShapeProps } from "../types";

export function MemoNode(props: NodeShapeProps) {
	const style = NODE_STYLES.memo;
	const halfSize = style.size / 2;

	const strokeWidth = () => {
		if (props.isSelected) return 3;
		if (props.isHovered) return 2;
		return 1;
	};

	return (
		<g
			transform={`translate(${props.node.x}, ${props.node.y})`}
			onClick={() => props.onClick(props.node.id)}
			onMouseEnter={() => props.onMouseEnter(props.node.id)}
			onMouseLeave={() => props.onMouseLeave()}
			style={{ cursor: "pointer" }}
		>
			<rect
				x={-halfSize}
				y={-halfSize}
				width={style.size}
				height={style.size}
				fill={style.color}
				stroke="#fff"
				stroke-width={strokeWidth()}
				transform="rotate(45)"
			/>
		</g>
	);
}
