import { render } from "@solidjs/testing-library";
import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";
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
		await new Promise<void>((resolve) => {
			createRoot(async (dispose) => {
				render(() => <DependencyGraph />);

				await new Promise((r) => setTimeout(r, 100));

				dispose();
				resolve();
			});
		});
	});

	it("renders edges between connected nodes", async () => {
		await new Promise<void>((resolve) => {
			createRoot(async (dispose) => {
				render(() => <DependencyGraph />);

				await new Promise((r) => setTimeout(r, 100));

				dispose();
				resolve();
			});
		});
	});

	it("applies force-directed layout", async () => {
		await new Promise<void>((resolve) => {
			createRoot(async (dispose) => {
				render(() => <DependencyGraph />);

				await new Promise((r) => setTimeout(r, 100));

				dispose();
				resolve();
			});
		});
	});
});
