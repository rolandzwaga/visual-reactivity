import { createTrackedEffect, createTrackedSignal } from "../instrumentation";

export function NestedEffects() {
	const [toggle, setToggle] = createTrackedSignal(false, { name: "toggle" });

	createTrackedEffect(
		() => {
			const isActive = toggle();

			if (isActive) {
				createTrackedEffect(() => {}, { name: "childA" });
				createTrackedEffect(() => {}, { name: "childB" });
			} else {
				createTrackedEffect(() => {}, { name: "childX" });
				createTrackedEffect(() => {}, { name: "childY" });
			}
		},
		{ name: "parent" },
	);

	return (
		<div style={{ padding: "20px" }}>
			<div style={{ "margin-bottom": "16px" }}>
				<div style={{ "font-size": "20px", "margin-bottom": "8px" }}>
					Toggle: {toggle() ? "Active" : "Inactive"}
				</div>
				<div style={{ "font-size": "14px", color: "#6b7280" }}>
					{toggle()
						? "Showing child effects: childA, childB"
						: "Showing child effects: childX, childY"}
				</div>
			</div>
			<button
				type="button"
				onClick={() => setToggle(!toggle())}
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
				Toggle State
			</button>
		</div>
	);
}
