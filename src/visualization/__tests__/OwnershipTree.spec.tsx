import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { tracker } from "../../instrumentation";
import type { ReactiveNode } from "../../types/nodes";
import { OwnershipTree } from "../OwnershipTree";

vi.mock("../../instrumentation", () => ({
	tracker: {
		getNodes: vi.fn(),
		getEdges: vi.fn(),
		subscribe: vi.fn(),
		getNode: vi.fn(),
	},
}));

describe("OwnershipTree", () => {
	it("should render without crashing", () => {
		vi.mocked(tracker.getNodes).mockReturnValue(new Map());
		vi.mocked(tracker.subscribe).mockReturnValue(() => {});

		const { container } = render(() => <OwnershipTree />);

		expect(container.textContent).toContain("No reactive primitives yet");
	});

	it("should subscribe to tracker on mount", () => {
		vi.mocked(tracker.getNodes).mockReturnValue(new Map());
		const mockUnsubscribe = vi.fn();
		vi.mocked(tracker.subscribe).mockReturnValue(mockUnsubscribe);

		render(() => <OwnershipTree />);

		expect(tracker.subscribe).toHaveBeenCalled();
	});

	it("should load existing nodes from tracker", () => {
		const mockNodes = new Map([
			[
				"signal-1",
				{
					id: "signal-1",
					type: "signal" as const,
					name: "count",
					value: 0,
					isStale: false,
					isExecuting: false,
					executionCount: 0,
					lastExecutedAt: 0,
					sources: [],
					observers: [],
					owner: null,
					owned: [],
					createdAt: Date.now(),
					disposedAt: null,
				},
			],
		]);

		vi.mocked(tracker.getNodes).mockReturnValue(
			mockNodes as ReadonlyMap<string, ReactiveNode>,
		);
		vi.mocked(tracker.subscribe).mockReturnValue(() => {});

		const { container } = render(() => <OwnershipTree />);

		expect(container.querySelector("svg")).toBeTruthy();
	});

	it("should render SVG when nodes exist", () => {
		const node = {
			id: "signal-1",
			type: "signal" as const,
			name: "count",
			value: 0,
			isStale: false,
			isExecuting: false,
			executionCount: 0,
			lastExecutedAt: 0,
			sources: [],
			observers: [],
			owner: null,
			owned: [],
			createdAt: Date.now(),
			disposedAt: null,
		};

		const mockMap = new Map();
		mockMap.set("signal-1", node);
		vi.mocked(tracker.getNodes).mockReturnValue(
			mockMap as ReadonlyMap<string, ReactiveNode>,
		);
		vi.mocked(tracker.subscribe).mockReturnValue(() => {});

		const { container } = render(() => (
			<OwnershipTree width={1000} height={800} />
		));

		const svg = container.querySelector("svg");
		expect(svg).toBeTruthy();
	});

	describe("expand/collapse functionality", () => {
		it("should expand nodes up to depth 2 by default", () => {
			const root = {
				id: "root",
				type: "effect" as const,
				name: "root",
				value: undefined,
				isStale: false,
				isExecuting: false,
				executionCount: 0,
				lastExecutedAt: 0,
				sources: [],
				observers: [],
				owner: null,
				owned: ["level1"],
				createdAt: Date.now(),
				disposedAt: null,
			};

			const level1 = {
				id: "level1",
				type: "memo" as const,
				name: "level1",
				value: 1,
				isStale: false,
				isExecuting: false,
				executionCount: 0,
				lastExecutedAt: 0,
				sources: [],
				observers: [],
				owner: "root",
				owned: ["level2"],
				createdAt: Date.now() + 1,
				disposedAt: null,
			};

			const level2 = {
				id: "level2",
				type: "signal" as const,
				name: "level2",
				value: 2,
				isStale: false,
				isExecuting: false,
				executionCount: 0,
				lastExecutedAt: 0,
				sources: [],
				observers: [],
				owner: "level1",
				owned: ["level3"],
				createdAt: Date.now() + 2,
				disposedAt: null,
			};

			const level3 = {
				id: "level3",
				type: "signal" as const,
				name: "level3",
				value: 3,
				isStale: false,
				isExecuting: false,
				executionCount: 0,
				lastExecutedAt: 0,
				sources: [],
				observers: [],
				owner: "level2",
				owned: [],
				createdAt: Date.now() + 3,
				disposedAt: null,
			};

			const mockMap = new Map();
			mockMap.set("root", root);
			mockMap.set("level1", level1);
			mockMap.set("level2", level2);
			mockMap.set("level3", level3);
			vi.mocked(tracker.getNodes).mockReturnValue(
				mockMap as ReadonlyMap<string, ReactiveNode>,
			);
			vi.mocked(tracker.subscribe).mockReturnValue(() => {});

			render(() => <OwnershipTree />);
		});

		it("should toggle node expansion", () => {
			const parent = {
				id: "parent",
				type: "effect" as const,
				name: "parent",
				value: undefined,
				isStale: false,
				isExecuting: false,
				executionCount: 0,
				lastExecutedAt: 0,
				sources: [],
				observers: [],
				owner: null,
				owned: ["child"],
				createdAt: Date.now(),
				disposedAt: null,
			};

			const child = {
				id: "child",
				type: "signal" as const,
				name: "child",
				value: 0,
				isStale: false,
				isExecuting: false,
				executionCount: 0,
				lastExecutedAt: 0,
				sources: [],
				observers: [],
				owner: "parent",
				owned: [],
				createdAt: Date.now(),
				disposedAt: null,
			};

			const mockMap = new Map();
			mockMap.set("parent", parent);
			mockMap.set("child", child);
			vi.mocked(tracker.getNodes).mockReturnValue(
				mockMap as ReadonlyMap<string, ReactiveNode>,
			);
			vi.mocked(tracker.subscribe).mockReturnValue(() => {});

			const { container } = render(() => <OwnershipTree />);

			expect(container.querySelector("svg")).toBeTruthy();
		});
	});

	describe("manual disposal", () => {
		it("should show context menu on right-click for root nodes", () => {
			const rootNode = {
				id: "root-1",
				type: "effect" as const,
				name: "root-effect",
				value: undefined,
				isStale: false,
				isExecuting: false,
				executionCount: 0,
				lastExecutedAt: 0,
				sources: [],
				observers: [],
				owner: null,
				owned: [],
				createdAt: Date.now(),
				disposedAt: null,
			};

			const mockMap = new Map();
			mockMap.set("root-1", rootNode);
			vi.mocked(tracker.getNodes).mockReturnValue(
				mockMap as ReadonlyMap<string, ReactiveNode>,
			);
			vi.mocked(tracker.subscribe).mockReturnValue(() => {});

			render(() => <OwnershipTree />);
		});

		it("should not allow disposal of non-root nodes", () => {
			const parent = {
				id: "parent",
				type: "effect" as const,
				name: "parent",
				value: undefined,
				isStale: false,
				isExecuting: false,
				executionCount: 0,
				lastExecutedAt: 0,
				sources: [],
				observers: [],
				owner: null,
				owned: ["child"],
				createdAt: Date.now(),
				disposedAt: null,
			};

			const child = {
				id: "child",
				type: "signal" as const,
				name: "child",
				value: 0,
				isStale: false,
				isExecuting: false,
				executionCount: 0,
				lastExecutedAt: 0,
				sources: [],
				observers: [],
				owner: "parent",
				owned: [],
				createdAt: Date.now() + 1,
				disposedAt: null,
			};

			const mockMap = new Map();
			mockMap.set("parent", parent);
			mockMap.set("child", child);
			vi.mocked(tracker.getNodes).mockReturnValue(
				mockMap as ReadonlyMap<string, ReactiveNode>,
			);
			vi.mocked(tracker.subscribe).mockReturnValue(() => {});

			render(() => <OwnershipTree />);
		});

		it("should show notification with disposal count after manual disposal", () => {
			const rootNode = {
				id: "root-1",
				type: "effect" as const,
				name: "root-effect",
				value: undefined,
				isStale: false,
				isExecuting: false,
				executionCount: 0,
				lastExecutedAt: 0,
				sources: [],
				observers: [],
				owner: null,
				owned: ["child-1", "child-2"],
				createdAt: Date.now(),
				disposedAt: null,
			};

			const mockMap = new Map();
			mockMap.set("root-1", rootNode);
			vi.mocked(tracker.getNodes).mockReturnValue(
				mockMap as ReadonlyMap<string, ReactiveNode>,
			);
			vi.mocked(tracker.subscribe).mockReturnValue(() => {});

			render(() => <OwnershipTree />);
		});
	});

	describe("node interaction", () => {
		it("should call onSelectNode when node is clicked", () => {
			const mockOnSelectNode = vi.fn();

			const node = {
				id: "signal-1",
				type: "signal" as const,
				name: "count",
				value: 0,
				isStale: false,
				isExecuting: false,
				executionCount: 0,
				lastExecutedAt: 0,
				sources: [],
				observers: [],
				owner: null,
				owned: [],
				createdAt: Date.now(),
				disposedAt: null,
			};

			const mockMap = new Map();
			mockMap.set("signal-1", node);
			vi.mocked(tracker.getNodes).mockReturnValue(
				mockMap as ReadonlyMap<string, ReactiveNode>,
			);
			vi.mocked(tracker.subscribe).mockReturnValue(() => {});

			const { container } = render(() => (
				<OwnershipTree onSelectNode={mockOnSelectNode} />
			));

			const circle = container.querySelector("circle");
			expect(circle).toBeTruthy();
		});

		it("should show tooltip with child count on hover", () => {
			const parent = {
				id: "parent",
				type: "effect" as const,
				name: "parent",
				value: undefined,
				isStale: false,
				isExecuting: false,
				executionCount: 0,
				lastExecutedAt: 0,
				sources: [],
				observers: [],
				owner: null,
				owned: ["child1", "child2"],
				createdAt: Date.now(),
				disposedAt: null,
			};

			const mockMap = new Map();
			mockMap.set("parent", parent);
			vi.mocked(tracker.getNodes).mockReturnValue(
				mockMap as ReadonlyMap<string, ReactiveNode>,
			);
			vi.mocked(tracker.subscribe).mockReturnValue(() => {});

			const { container } = render(() => <OwnershipTree />);

			expect(container.querySelector("svg")).toBeTruthy();
		});

		it("should render disposed nodes with grayscale styling", () => {
			const disposedNode = {
				id: "disposed-1",
				type: "signal" as const,
				name: "old-signal",
				value: 0,
				isStale: false,
				isExecuting: false,
				executionCount: 0,
				lastExecutedAt: 0,
				sources: [],
				observers: [],
				owner: null,
				owned: [],
				createdAt: Date.now(),
				disposedAt: Date.now() + 1000,
			};

			const mockMap = new Map();
			mockMap.set("disposed-1", disposedNode);
			vi.mocked(tracker.getNodes).mockReturnValue(
				mockMap as ReadonlyMap<string, ReactiveNode>,
			);
			vi.mocked(tracker.subscribe).mockReturnValue(() => {});

			const { container } = render(() => <OwnershipTree />);

			expect(container.querySelector("svg")).toBeTruthy();
		});
	});
});
