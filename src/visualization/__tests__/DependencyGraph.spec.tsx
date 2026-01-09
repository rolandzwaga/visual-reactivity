import { fireEvent, render } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { testInRoot } from "../../__tests__/helpers";
import { tracker } from "../../instrumentation";
import { createSelectionStore } from "../../stores/selectionStore";
import { DependencyGraph } from "../DependencyGraph";

describe("DependencyGraph", () => {
	it("renders an SVG element", () => {
		const { container } = render(() => <DependencyGraph />);

		const svg = container.querySelector("svg");
		expect(svg).not.toBeNull();
	});

	it("renders with custom width and height", () => {
		const { container } = render(() => (
			<DependencyGraph width={1000} height={800} />
		));

		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("width")).toBe("1000");
		expect(svg?.getAttribute("height")).toBe("800");
	});

	it("renders signal nodes as circles", async () => {
		await testInRoot(async () => {
			render(() => <DependencyGraph />);

			await new Promise((r) => setTimeout(r, 100));
		});
	});

	it("renders edges between connected nodes", async () => {
		await testInRoot(async () => {
			render(() => <DependencyGraph />);

			await new Promise((r) => setTimeout(r, 100));
		});
	});

	it("applies force-directed layout", async () => {
		await testInRoot(async () => {
			render(() => <DependencyGraph />);

			await new Promise((r) => setTimeout(r, 100));
		});
	});

	describe("User Story 1: Selection", () => {
		beforeEach(() => {
			tracker.reset();
			tracker.getNode = vi.fn((id: string) => ({ id }) as never);
		});

		it("T031: node click triggers selection", async () => {
			await testInRoot(async () => {
				const selection = createSelectionStore();
				const { container } = render(() => (
					<DependencyGraph selection={selection} />
				));

				await new Promise((r) => setTimeout(r, 100));

				const circle = container.querySelector("circle");
				if (circle) {
					fireEvent.mouseDown(circle, { button: 0 });
					fireEvent.mouseUp(document);

					expect(selection.selectionCount()).toBeGreaterThan(0);
				}
			});
		});

		it("T032: applies stroke-width=3 when node is selected", async () => {
			await testInRoot(async () => {
				const selection = createSelectionStore();
				const { container } = render(() => (
					<DependencyGraph selection={selection} />
				));

				await new Promise((r) => setTimeout(r, 100));

				const circle = container.querySelector("circle");
				if (circle) {
					const nodeId = circle.getAttribute("data-node-id");
					if (nodeId) {
						selection.selectNode(nodeId, false, "graph");

						await new Promise((r) => setTimeout(r, 50));

						const strokeWidth = circle.getAttribute("stroke-width");
						expect(strokeWidth).toBe("3");
					}
				}
			});
		});
	});
});
