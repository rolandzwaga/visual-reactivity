import {
	createTrackedEffect,
	createTrackedMemo,
	createTrackedSignal,
} from "../instrumentation";

export function DerivedState() {
	const [count, setCount] = createTrackedSignal(0, { name: "count" });

	const doubled = createTrackedMemo(() => count() * 2, { name: "doubled" });

	createTrackedEffect(
		() => {
			doubled();
		},
		{ name: "logger" },
	);

	return (
		<div style={{ padding: "20px" }}>
			<div style={{ "margin-bottom": "16px" }}>
				<div style={{ "font-size": "20px", "margin-bottom": "8px" }}>
					Count: {count()}
				</div>
				<div style={{ "font-size": "20px", "font-weight": "600" }}>
					Doubled: {doubled()}
				</div>
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
