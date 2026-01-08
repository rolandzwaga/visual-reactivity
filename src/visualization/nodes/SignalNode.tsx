import { NODE_STYLES, type NodeShapeProps } from "../types";

export function SignalNode(props: NodeShapeProps) {
	const style = NODE_STYLES.signal;

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
			<circle
				r={style.radius}
				fill={style.color}
				stroke="#fff"
				stroke-width={strokeWidth()}
			/>
		</g>
	);
}
