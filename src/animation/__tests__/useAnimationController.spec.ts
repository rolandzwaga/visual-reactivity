import { afterEach, describe, expect, it } from "vitest";
import { testInRoot } from "../../__tests__/helpers";
import type { AnimationControllerOptions } from "../types";
import { createAnimationController } from "../useAnimationController";

describe("useAnimationController", () => {
	describe("creation", () => {
		it("should create controller with default options", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				expect(controller).toBeDefined();
				expect(controller.playback).toBeDefined();
			});
		});

		it("should accept custom options", () => {
			testInRoot(() => {
				const options: AnimationControllerOptions = {
					baseDuration: 500,
					showBatchIndicator: false,
				};
				const controller = createAnimationController(options);
				expect(controller).toBeDefined();
			});
		});
	});

	describe("playback", () => {
		it("should start in playing state", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				expect(controller.playback.state().isPaused).toBe(false);
			});
		});

		it("should toggle pause state", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				controller.playback.togglePause();
				expect(controller.playback.state().isPaused).toBe(true);
				controller.playback.togglePause();
				expect(controller.playback.state().isPaused).toBe(false);
			});
		});

		it("should set pause state directly", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				controller.playback.setPaused(true);
				expect(controller.playback.state().isPaused).toBe(true);
			});
		});

		it("should have default speed of 1.0", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				expect(controller.playback.state().speedMultiplier).toBe(1.0);
			});
		});

		it("should set speed multiplier", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				controller.playback.setSpeed(0.5);
				expect(controller.playback.state().speedMultiplier).toBe(0.5);
			});
		});

		it("should clamp speed to valid range", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				controller.playback.setSpeed(0.1);
				expect(controller.playback.state().speedMultiplier).toBe(0.25);
				controller.playback.setSpeed(5.0);
				expect(controller.playback.state().speedMultiplier).toBe(2.0);
			});
		});
	});

	describe("node visual state", () => {
		it("should return reactive getter for node state", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				const getState = controller.getNodeVisualState("node-1");
				expect(typeof getState).toBe("function");
				expect(getState().nodeId).toBe("node-1");
			});
		});

		it("should return default values for unknown node", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				const state = controller.getNodeVisualState("unknown")();
				expect(state.pulseScale).toBe(1);
				expect(state.isStale).toBe(false);
				expect(state.isExecuting).toBe(false);
			});
		});
	});

	describe("edge visual state", () => {
		it("should return reactive getter for edge state", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				const getState = controller.getEdgeVisualState("edge-1");
				expect(typeof getState).toBe("function");
				expect(getState().edgeId).toBe("edge-1");
			});
		});

		it("should return default values for unknown edge", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				const state = controller.getEdgeVisualState("unknown")();
				expect(state.particleProgress).toBeNull();
				expect(state.addProgress).toBe(1);
				expect(state.removeProgress).toBe(0);
			});
		});
	});

	describe("animations", () => {
		it("should trigger signal write animation", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				controller.animateSignalWrite("node-1");
				expect(controller.getNodeVisualState("node-1")).toBeDefined();
			});
		});

		it("should trigger execution start animation", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				controller.animateExecutionStart("node-1");
				expect(controller.getNodeVisualState("node-1")().isExecuting).toBe(
					true,
				);
			});
		});

		it("should trigger execution end animation", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				controller.animateExecutionStart("node-1");
				controller.animateExecutionEnd("node-1");
				expect(controller.getNodeVisualState("node-1")().isExecuting).toBe(
					false,
				);
			});
		});

		it("should set node stale state", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				controller.setNodeStale("node-1", true);
				expect(controller.getNodeVisualState("node-1")().isStale).toBe(true);
			});
		});

		it("should trigger edge add animation", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				controller.animateEdgeAdd("edge-1");
				expect(controller.getEdgeVisualState("edge-1")).toBeDefined();
			});
		});

		it("should trigger edge remove animation", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				controller.animateEdgeRemove("edge-1");
				expect(controller.getEdgeVisualState("edge-1")).toBeDefined();
			});
		});

		it("should trigger disposal animation", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				controller.animateDisposal("node-1");
				expect(controller.getNodeVisualState("node-1")).toBeDefined();
			});
		});
	});

	describe("batch handling", () => {
		it("should start and end batch", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				controller.startBatch();
				controller.animateSignalWrite("node-1");
				controller.animateSignalWrite("node-2");
				controller.endBatch();
			});
		});
	});

	describe("dispose", () => {
		it("should cleanup on dispose", () => {
			testInRoot(() => {
				const controller = createAnimationController();
				controller.dispose();
			});
		});
	});
});
