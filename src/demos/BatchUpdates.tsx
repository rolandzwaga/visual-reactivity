import { batch } from "solid-js";
import { createTrackedEffect, createTrackedSignal } from "../instrumentation";

export function BatchUpdates() {
	const [firstName, setFirstName] = createTrackedSignal("John", {
		name: "firstName",
	});
	const [lastName, setLastName] = createTrackedSignal("Doe", {
		name: "lastName",
	});
	const [age, setAge] = createTrackedSignal(30, { name: "age" });

	createTrackedEffect(
		() => {
			const profile = `${firstName()} ${lastName()}, ${age()} years old`;
			return profile;
		},
		{ name: "userProfile" },
	);

	const updateAllBatched = () => {
		batch(() => {
			setFirstName("Jane");
			setLastName("Smith");
			setAge(25);
		});
	};

	const updateIndividually = () => {
		setFirstName("Alice");
		setLastName("Brown");
		setAge(28);
	};

	return (
		<div style={{ padding: "20px" }}>
			<div style={{ "margin-bottom": "16px" }}>
				<div style={{ "font-size": "16px", "margin-bottom": "4px" }}>
					firstName: {firstName()}
				</div>
				<div style={{ "font-size": "16px", "margin-bottom": "4px" }}>
					lastName: {lastName()}
				</div>
				<div style={{ "font-size": "16px", "margin-bottom": "4px" }}>
					age: {age()}
				</div>
			</div>
			<div style={{ display: "flex", gap: "8px" }}>
				<button
					type="button"
					onClick={updateAllBatched}
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
					Update All (Batched)
				</button>
				<button
					type="button"
					onClick={updateIndividually}
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
					Update Individually
				</button>
			</div>
		</div>
	);
}
