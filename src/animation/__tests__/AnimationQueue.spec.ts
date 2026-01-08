import { beforeEach, describe, expect, it } from "vitest";
import { createAnimationQueue } from "../AnimationQueue";
import { easeLinear } from "../easing";

describe("AnimationQueue", () => {
	let queue: ReturnType<typeof createAnimationQueue>;

	beforeEach(() => {
		queue = createAnimationQueue();
	});

	describe("enqueue", () => {
		it("should add animation to pending queue", () => {
			const id = queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			expect(id).toBeDefined();
			const state = queue.getState();
			expect(state.pending.length).toBe(1);
			expect(state.pending[0].id).toBe(id);
		});

		it("should assign pending state to new animations", () => {
			queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			const state = queue.getState();
			expect(state.pending[0].state).toBe("pending");
		});

		it("should assign progress 0 to new animations", () => {
			queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			const state = queue.getState();
			expect(state.pending[0].progress).toBe(0);
		});

		it("should generate unique IDs for each animation", () => {
			const id1 = queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			const id2 = queue.enqueue({
				type: "node-pulse",
				targetId: "node-2",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			expect(id1).not.toBe(id2);
		});
	});

	describe("tick", () => {
		it("should move pending animations to active on first tick", () => {
			queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			queue.tick(16, 1.0);

			const state = queue.getState();
			expect(state.pending.length).toBe(0);
			expect(state.active.size).toBe(1);
		});

		it("should update animation progress based on delta time", () => {
			queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			queue.tick(150, 1.0);

			const state = queue.getState();
			const animation = state.active.get("node-1");
			expect(animation?.progress).toBeCloseTo(0.5, 1);
		});

		it("should respect speed multiplier", () => {
			queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			queue.tick(75, 2.0);

			const state = queue.getState();
			const animation = state.active.get("node-1");
			expect(animation?.progress).toBeCloseTo(0.5, 1);
		});

		it("should mark animation complete when progress reaches 1", () => {
			queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			queue.tick(300, 1.0);
			queue.tick(16, 1.0);

			const state = queue.getState();
			expect(state.active.size).toBe(0);
			expect(state.completedCount).toBe(1);
		});

		it("should not process animations when paused", () => {
			queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			queue.tick(16, 1.0);
			queue.pause();
			queue.tick(150, 1.0);

			const state = queue.getState();
			const animation = state.active.get("node-1");
			expect(animation?.state).toBe("paused");
		});
	});

	describe("coalescing", () => {
		it("should cancel active animation when new one targets same node", () => {
			queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			queue.tick(16, 1.0);

			queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.3 },
			});

			queue.tick(16, 1.0);

			const state = queue.getState();
			expect(state.active.size).toBe(1);
			const animation = state.active.get("node-1");
			expect((animation?.data as { scale: number }).scale).toBe(1.3);
		});
	});

	describe("pause/resume", () => {
		it("should pause all active animations", () => {
			queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			queue.tick(16, 1.0);
			queue.pause();

			const state = queue.getState();
			const animation = state.active.get("node-1");
			expect(animation?.state).toBe("paused");
		});

		it("should resume paused animations", () => {
			queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			queue.tick(16, 1.0);
			queue.pause();
			queue.resume();

			const state = queue.getState();
			const animation = state.active.get("node-1");
			expect(animation?.state).toBe("running");
		});
	});

	describe("cancel", () => {
		it("should remove animation by ID", () => {
			const id = queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			queue.cancel(id);

			const state = queue.getState();
			expect(state.pending.length).toBe(0);
		});

		it("should cancel animations for specific target", () => {
			queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			queue.tick(16, 1.0);
			queue.cancelForTarget("node-1");

			const state = queue.getState();
			expect(state.active.size).toBe(0);
		});
	});

	describe("clear", () => {
		it("should remove all animations", () => {
			queue.enqueue({
				type: "node-pulse",
				targetId: "node-1",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			queue.enqueue({
				type: "node-pulse",
				targetId: "node-2",
				startTime: 0,
				duration: 300,
				easing: easeLinear,
				data: { type: "node-pulse", scale: 1.2 },
			});

			queue.tick(16, 1.0);
			queue.clear();

			const state = queue.getState();
			expect(state.pending.length).toBe(0);
			expect(state.active.size).toBe(0);
		});
	});
});
