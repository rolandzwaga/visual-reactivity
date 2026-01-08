import { beforeEach, describe, expect, it } from "vitest";
import { createNodeAnimator } from "../NodeAnimator";
import { DEFAULT_ANIMATION_DURATION, PULSE_SCALE_MAX } from "../types";

describe("NodeAnimator", () => {
	let animator: ReturnType<typeof createNodeAnimator>;

	beforeEach(() => {
		animator = createNodeAnimator();
	});

	describe("getVisualState", () => {
		it("should return default visual state for unknown node", () => {
			const state = animator.getVisualState("unknown-node");
			expect(state.nodeId).toBe("unknown-node");
			expect(state.pulseScale).toBe(1);
			expect(state.highlightOpacity).toBe(0);
			expect(state.isStale).toBe(false);
			expect(state.isExecuting).toBe(false);
			expect(state.disposeProgress).toBe(0);
		});

		it("should track visual state per node", () => {
			animator.startPulse("node-1");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.25);

			const state1 = animator.getVisualState("node-1");
			const state2 = animator.getVisualState("node-2");

			expect(state1.pulseScale).toBeGreaterThan(1);
			expect(state2.pulseScale).toBe(1);
		});
	});

	describe("pulse animation", () => {
		it("should increase scale when pulse starts", () => {
			animator.startPulse("node-1");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.25);

			const state = animator.getVisualState("node-1");
			expect(state.pulseScale).toBeGreaterThan(1);
		});

		it("should reach max scale at midpoint", () => {
			animator.startPulse("node-1");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.5);

			const state = animator.getVisualState("node-1");
			expect(state.pulseScale).toBeCloseTo(PULSE_SCALE_MAX, 1);
		});

		it("should return to normal scale at end", () => {
			animator.startPulse("node-1");
			animator.tick(DEFAULT_ANIMATION_DURATION);
			animator.tick(16);

			const state = animator.getVisualState("node-1");
			expect(state.pulseScale).toBeCloseTo(1, 1);
		});

		it("should handle multiple nodes pulsing simultaneously", () => {
			animator.startPulse("node-1");
			animator.startPulse("node-2");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.5);

			const state1 = animator.getVisualState("node-1");
			const state2 = animator.getVisualState("node-2");

			expect(state1.pulseScale).toBeGreaterThan(1);
			expect(state2.pulseScale).toBeGreaterThan(1);
		});

		it("should coalesce rapid pulses on same node", () => {
			animator.startPulse("node-1");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.25);
			animator.startPulse("node-1");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.25);

			const state = animator.getVisualState("node-1");
			expect(state.pulseScale).toBeGreaterThan(1);
		});
	});

	describe("speed control", () => {
		it("should respect speed multiplier", () => {
			animator.setSpeedMultiplier(2.0);
			animator.startPulse("node-1");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.25);

			const state = animator.getVisualState("node-1");
			expect(state.pulseScale).toBeCloseTo(PULSE_SCALE_MAX, 1);
		});

		it("should slow down with lower multiplier", () => {
			animator.setSpeedMultiplier(0.5);
			animator.startPulse("node-1");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.5);

			const state = animator.getVisualState("node-1");
			expect(state.pulseScale).toBeLessThan(PULSE_SCALE_MAX);
			expect(state.pulseScale).toBeGreaterThan(1);
		});
	});

	describe("pause/resume", () => {
		it("should freeze animation when paused", () => {
			animator.startPulse("node-1");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.25);
			const scaleBefore = animator.getVisualState("node-1").pulseScale;

			animator.pause();
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.5);

			const scaleAfter = animator.getVisualState("node-1").pulseScale;
			expect(scaleAfter).toBeCloseTo(scaleBefore, 5);
		});

		it("should continue animation when resumed", () => {
			animator.startPulse("node-1");
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.25);
			animator.pause();
			animator.tick(100);
			animator.resume();
			animator.tick(DEFAULT_ANIMATION_DURATION * 0.75);

			const state = animator.getVisualState("node-1");
			expect(state.pulseScale).toBeCloseTo(1, 1);
		});
	});

	describe("cleanup", () => {
		it("should remove completed animations", () => {
			animator.startPulse("node-1");
			animator.tick(DEFAULT_ANIMATION_DURATION);
			animator.tick(16);

			expect(animator.getActiveCount()).toBe(0);
		});
	});
});
