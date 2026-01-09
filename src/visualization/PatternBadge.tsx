import type { JSX } from "solid-js";
import { getSeverityColor } from "../lib/patternUtils";
import type { Pattern } from "../types/pattern";

export interface PatternBadgeProps {
	pattern: Pattern;
	patterns?: Pattern[];
	onClick: (pattern: Pattern) => void;
	x: number;
	y: number;
}

export function PatternBadge(props: PatternBadgeProps): JSX.Element {
	const patternCount = (): number => {
		return props.patterns?.length || 1;
	};

	const highestSeverity = (): "low" | "medium" | "high" => {
		if (!props.patterns || props.patterns.length === 0) {
			return props.pattern.severity;
		}

		const severities = props.patterns.map((p) => p.severity);
		if (severities.includes("high")) return "high";
		if (severities.includes("medium")) return "medium";
		return "low";
	};

	const color = (): string => {
		return getSeverityColor(highestSeverity());
	};

	return (
		<g
			class="pattern-badge"
			transform={`translate(${props.x}, ${props.y})`}
			onClick={() => props.onClick(props.pattern)}
			style={{ cursor: "pointer" }}
		>
			<circle r="12" fill={color()} stroke="white" stroke-width="2" />
			<text
				text-anchor="middle"
				dy="0.3em"
				fill="white"
				font-size="10"
				font-weight="bold"
			>
				{patternCount()}
			</text>
		</g>
	);
}
