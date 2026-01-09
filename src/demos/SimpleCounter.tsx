import { createTrackedEffect, createTrackedSignal } from "../instrumentation";

export function SimpleCounter() {
	const [count, setCount] = createTrackedSignal(0, { name: "count" });

	createTrackedEffect(
		() => {
			count();
		},
		{ name: "display" },
	);

	return (
		<div style={{ padding: "20px" }}>
			<div
				style={{
					"font-size": "24px",
					"margin-bottom": "16px",
					"font-weight": "600",
				}}
			>
				Count: {count()}
			</div>
			<button
				type="button"
				onClick={() => setCount(count() + 1)}
				style={{
					padding: "8px 16px",
					background: "#3b82f6",
					color: "white",
					border: "none",
					"border-radius": "6px",
					cursor: "pointer",
					"font-weight": "500",
				}}
			>
				Increment
			</button>
		</div>
	);
}
