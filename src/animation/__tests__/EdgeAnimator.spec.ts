import { beforeEach, describe, expect, it } from "vitest";
import { createEdgeAnimator } from "../EdgeAnimator";
import { DEFAULT_ANIMATION_DURATION } from "../types";

describe("EdgeAnimator", () => {
	let animator: ReturnType<typeof createEdgeAnimator>;

	beforeEach(() => {
		animator = createEdgeAnimator();
	});

	describe("getVisualState", () => {
		it("should return default visual state for unknown edge", () => {
			const state = animator.getVisualState("unknown-edge");
			expect(state.edgeId).toBe("unknown-edge");
			expect(state.particleProgress).toBeNull();
			expect(state.addProgress).toBe(1);
			expect(state.removeProgress).toBe(0);
		});

		it("should track visual state per edge", () => {
			animator.startParticle("edge-1");
			animator.tick(0);

			const state1 = animator.getVisualState("edge-1");
			const state2 = animator.getVisualState("edge-2");

			expect(state1.particleProgress).not.toBeNull();
			expect(state2.particleProgress).toBeNull();
		});
	});

	describe("particle animation", () => {
		it("should start particle at progress 0", () => {
			animator.startParticle("edge-1");
			animator.tick(0);

			const state = animator.getVisualState("edge-1");
			expect(state.particleProgress).toBe(0);
		});

		it("should progress particle over time", () => {
			animator.startParticle("edge-1");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.5);

			const state = animator.getVisualState("edge-1");
			expect(state.particleProgress).toBeCloseTo(0.5, 1);
		});

		it("should complete particle at end of duration", () => {
			animator.startParticle("edge-1");
			animator.tick(DEFAULT_ANIMATION_DURATION);
			animator.tick(16);

			const state = animator.getVisualState("edge-1");
			expect(state.particleProgress).toBeNull();
		});

		it("should handle multiple particles simultaneously", () => {
			animator.startParticle("edge-1");
			animator.startParticle("edge-2");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.5);

			const state1 = animator.getVisualState("edge-1");
			const state2 = animator.getVisualState("edge-2");

			expect(state1.particleProgress).not.toBeNull();
			expect(state2.particleProgress).not.toBeNull();
		});

		it("should coalesce rapid particles on same edge", () => {
			animator.startParticle("edge-1");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.25);
			animator.startParticle("edge-1");

			const state = animator.getVisualState("edge-1");
			expect(state.particleProgress).toBeCloseTo(0, 1);
		});
	});

	describe("speed control", () => {
		it("should respect speed multiplier", () => {
			animator.setSpeedMultiplier(2.0);
			animator.startParticle("edge-1");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.25);

			const state = animator.getVisualState("edge-1");
			expect(state.particleProgress).toBeCloseTo(0.5, 1);
		});
	});

	describe("pause/resume", () => {
		it("should freeze animation when paused", () => {
			animator.startParticle("edge-1");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.25);
			const progressBefore = animator.getVisualState("edge-1").particleProgress;

			animator.pause();
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.5);

			const progressAfter = animator.getVisualState("edge-1").particleProgress;
			expect(progressAfter).toBeCloseTo(progressBefore as number, 5);
		});

		it("should continue animation when resumed", () => {
			animator.startParticle("edge-1");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.25);
			animator.pause();
			animator.tick(100);
			animator.resume();
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.75);
			animator.tick(16);

			const state = animator.getVisualState("edge-1");
			expect(state.particleProgress).toBeNull();
		});
	});

	describe("cleanup", () => {
		it("should remove completed animations", () => {
			animator.startParticle("edge-1");
			animator.tick(DEFAULT_ANIMATION_DURATION);
			animator.tick(16);

			expect(animator.getActiveCount()).toBe(0);
		});
	});
});
