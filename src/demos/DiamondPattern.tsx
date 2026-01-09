import {
	createTrackedEffect,
	createTrackedMemo,
	createTrackedSignal,
} from "../instrumentation";

export function DiamondPattern() {
	const [value, setValue] = createTrackedSignal(1, { name: "value" });

	const double = createTrackedMemo(() => value() * 2, { name: "double" });
	const triple = createTrackedMemo(() => value() * 3, { name: "triple" });

	createTrackedEffect(
		() => {
			const sum = double() + triple();
			return sum;
		},
		{ name: "sum" },
	);

	const sum = () => double() + triple();

	return (
		<div style={{ padding: "20px" }}>
			<div style={{ "margin-bottom": "16px" }}>
				<div style={{ "font-size": "20px", "margin-bottom": "8px" }}>
					Value: {value()}
				</div>
				<div style={{ "font-size": "20px", "font-weight": "600" }}>
					Sum: {sum()}
				</div>
			</div>
			<div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
				<label for="value-input">Change value:</label>
				<input
					id="value-input"
					type="number"
					value={value()}
					onInput={(e) => setValue(Number(e.currentTarget.value))}
					style={{
						padding: "4px 8px",
						border: "1px solid #d1d5db",
						"border-radius": "4px",
						width: "80px",
					}}
				/>
			</div>
		</div>
	);
}
