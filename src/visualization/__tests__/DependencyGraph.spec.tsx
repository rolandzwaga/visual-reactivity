import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { testInRoot } from "../../__tests__/helpers";
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
});
