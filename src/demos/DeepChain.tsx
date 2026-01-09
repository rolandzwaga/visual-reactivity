import {
	createTrackedEffect,
	createTrackedMemo,
	createTrackedSignal,
} from "../instrumentation";

export function DeepChain() {
	const [signalA, setSignalA] = createTrackedSignal(1, { name: "signalA" });

	const memoB = createTrackedMemo(() => signalA() + 10, { name: "memoB" });
	const memoC = createTrackedMemo(() => memoB() * 2, { name: "memoC" });
	const memoD = createTrackedMemo(() => memoC() + 5, { name: "memoD" });

	createTrackedEffect(
		() => {
			memoD();
		},
		{ name: "effectE" },
	);

	return (
		<div style={{ padding: "20px" }}>
			<div style={{ "margin-bottom": "16px" }}>
				<div style={{ "font-size": "16px", "margin-bottom": "4px" }}>
					Signal A: {signalA()}
				</div>
				<div style={{ "font-size": "16px", "margin-bottom": "4px" }}>
					Memo B: {memoB()} (A + 10)
				</div>
				<div style={{ "font-size": "16px", "margin-bottom": "4px" }}>
					Memo C: {memoC()} (B * 2)
				</div>
				<div style={{ "font-size": "16px", "margin-bottom": "4px" }}>
					Memo D: {memoD()} (C + 5)
				</div>
			</div>
			<div style={{ display: "flex", gap: "8px" }}>
				<button
					type="button"
					onClick={() => setSignalA(signalA() + 1)}
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
					Increment A
				</button>
				<button
					type="button"
					onClick={() => setSignalA(1)}
					style={{
						padding: "8px 16px",
						background: "#6b7280",
						color: "white",
						border: "none",
						"border-radius": "6px",
						cursor: "pointer",
						"font-weight": "500",
					}}
				>
					Reset
				</button>
			</div>
		</div>
	);
}
