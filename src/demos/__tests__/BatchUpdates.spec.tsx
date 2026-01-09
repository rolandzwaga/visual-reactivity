import { render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { tracker } from "../../instrumentation";
import { BatchUpdates } from "../BatchUpdates";

describe("BatchUpdates Demo", () => {
	afterEach(() => {
		tracker.reset();
		document.body.innerHTML = "";
	});

	test("creates 3 signals and 1 effect", () => {
		tracker.reset();

		render(() => <BatchUpdates />);

		const nodes = tracker.getNodes();
		const signals = Array.from(nodes.values()).filter(
			(n) => n.type === "signal",
		);
		const effects = Array.from(nodes.values()).filter(
			(n) => n.type === "effect",
		);

		expect(signals).toHaveLength(3);
		expect(effects).toHaveLength(1);
	});

	test("nodes have correct names", () => {
		tracker.reset();

		render(() => <BatchUpdates />);

		const nodes = tracker.getNodes();
		const signals = Array.from(nodes.values()).filter(
			(n) => n.type === "signal",
		);
		const effect = Array.from(nodes.values()).find((n) => n.type === "effect");

		const signalNames = signals.map((s) => s.name).sort();
		expect(signalNames).toContain("firstName");
		expect(signalNames).toContain("lastName");
		expect(signalNames).toContain("age");
		expect(effect?.name).toBe("userProfile");
	});

	test("batched update executes effect once", async () => {
		tracker.reset();

		render(() => <BatchUpdates />);

		const effect = Array.from(tracker.getNodes().values()).find(
			(n) => n.type === "effect",
		);
		expect(effect).toBeTruthy();

		const initialExecutionCount = effect?.executionCount || 0;

		const batchButton = screen.getByRole("button", {
			name: /update all.*batched/i,
		});
		batchButton.click();
		await Promise.resolve();

		const updatedEffect = tracker.getNode(effect?.id || "");
		const finalExecutionCount = updatedEffect?.executionCount || 0;

		expect(finalExecutionCount).toBeGreaterThan(initialExecutionCount);
		expect(finalExecutionCount - initialExecutionCount).toBe(1);
	});

	test("individual updates execute effect multiple times", async () => {
		tracker.reset();

		render(() => <BatchUpdates />);

		const effect = Array.from(tracker.getNodes().values()).find(
			(n) => n.type === "effect",
		);
		expect(effect).toBeTruthy();

		const initialExecutionCount = effect?.executionCount || 0;

		const individualButton = screen.getByRole("button", {
			name: /update individually/i,
		});
		individualButton.click();
		await Promise.resolve();

		const updatedEffect = tracker.getNode(effect?.id || "");
		const finalExecutionCount = updatedEffect?.executionCount || 0;

		expect(finalExecutionCount - initialExecutionCount).toBeGreaterThanOrEqual(
			3,
		);
	});

	test("displays all signal values", () => {
		tracker.reset();

		render(() => <BatchUpdates />);

		expect(screen.getByText(/firstName:/i)).toBeTruthy();
		expect(screen.getByText(/lastName:/i)).toBeTruthy();
		expect(screen.getByText(/age:/i)).toBeTruthy();
	});
});
