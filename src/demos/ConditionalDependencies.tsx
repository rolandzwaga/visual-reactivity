import { createTrackedEffect, createTrackedSignal } from "../instrumentation";

export function ConditionalDependencies() {
	const [signalA, setSignalA] = createTrackedSignal(10, { name: "signalA" });
	const [signalB, setSignalB] = createTrackedSignal(20, { name: "signalB" });
	const [useA, setUseA] = createTrackedSignal(true, { name: "useA" });

	createTrackedEffect(
		() => {
			const result = useA() ? signalA() : signalB();
			return result;
		},
		{ name: "conditional" },
	);

	return (
		<div style={{ padding: "20px" }}>
			<div style={{ "margin-bottom": "16px" }}>
				<div style={{ "font-size": "20px", "margin-bottom": "8px" }}>
					Using: {useA() ? "Signal A" : "Signal B"}
				</div>
				<div style={{ "font-size": "16px", "margin-bottom": "4px" }}>
					Signal A: {signalA()}
				</div>
				<div style={{ "font-size": "16px", "margin-bottom": "4px" }}>
					Signal B: {signalB()}
				</div>
			</div>
			<div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap" }}>
				<button
					type="button"
					onClick={() => setUseA(!useA())}
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
					Toggle Source
				</button>
				<button
					type="button"
					onClick={() => setSignalA(signalA() + 1)}
					style={{
						padding: "8px 16px",
						background: "#10b981",
						color: "white",
						border: "none",
						"border-radius": "6px",
						cursor: "pointer",
						"font-weight": "500",
					}}
				>
					Increment A
				</button>
				<button
					type="button"
					onClick={() => setSignalB(signalB() + 1)}
					style={{
						padding: "8px 16px",
						background: "#f59e0b",
						color: "white",
						border: "none",
						"border-radius": "6px",
						cursor: "pointer",
						"font-weight": "500",
					}}
				>
					Increment B
				</button>
			</div>
		</div>
	);
}
