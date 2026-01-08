import { easeLinear } from "./easing";
import type { EdgeVisualState } from "./types";
import { DEFAULT_ANIMATION_DURATION } from "./types";

interface ParticleAnimation {
	edgeId: string;
	startTime: number;
	duration: number;
	progress: number;
}

interface EdgeAnimation {
	edgeId: string;
	startTime: number;
	duration: number;
	progress: number;
	type: "add" | "remove";
}

export interface EdgeAnimatorInstance {
	getVisualState(edgeId: string): EdgeVisualState;
	startParticle(edgeId: string, duration?: number): void;
	startAddAnimation(edgeId: string, duration?: number): void;
	startRemoveAnimation(edgeId: string, duration?: number): void;
	setSpeedMultiplier(multiplier: number): void;
	pause(): void;
	resume(): void;
	tick(deltaTime: number): void;
	getActiveCount(): number;
}

export function createEdgeAnimator(): EdgeAnimatorInstance {
	const visualStates = new Map<string, EdgeVisualState>();
	const particleAnimations = new Map<string, ParticleAnimation>();
	const edgeAnimations = new Map<string, EdgeAnimation>();
	let speedMultiplier = 1.0;
	let isPaused = false;

	function getOrCreateVisualState(edgeId: string): EdgeVisualState {
		let state = visualStates.get(edgeId);
		if (!state) {
			state = {
				edgeId,
				particleProgress: null,
				addProgress: 1,
				removeProgress: 0,
			};
			visualStates.set(edgeId, state);
		}
		return state;
	}

	function getVisualState(edgeId: string): EdgeVisualState {
		return getOrCreateVisualState(edgeId);
	}

	function startParticle(
		edgeId: string,
		duration = DEFAULT_ANIMATION_DURATION,
	): void {
		const state = getOrCreateVisualState(edgeId);
		state.particleProgress = 0;

		particleAnimations.set(edgeId, {
			edgeId,
			startTime: performance.now(),
			duration,
			progress: 0,
		});
	}

	function startAddAnimation(
		edgeId: string,
		duration = DEFAULT_ANIMATION_DURATION,
	): void {
		const state = getOrCreateVisualState(edgeId);
		state.addProgress = 0;

		edgeAnimations.set(edgeId, {
			edgeId,
			startTime: performance.now(),
			duration,
			progress: 0,
			type: "add",
		});
	}

	function startRemoveAnimation(
		edgeId: string,
		duration = DEFAULT_ANIMATION_DURATION,
	): void {
		const state = getOrCreateVisualState(edgeId);
		state.removeProgress = 0;

		edgeAnimations.set(edgeId, {
			edgeId,
			startTime: performance.now(),
			duration,
			progress: 0,
			type: "remove",
		});
	}

	function setSpeedMultiplier(multiplier: number): void {
		speedMultiplier = Math.max(0.25, Math.min(2.0, multiplier));
	}

	function pause(): void {
		isPaused = true;
	}

	function resume(): void {
		isPaused = false;
	}

	function tick(deltaTime: number): void {
		if (isPaused) {
			return;
		}

		const effectiveDelta = deltaTime * speedMultiplier;

		for (const [edgeId, anim] of particleAnimations) {
			const progressIncrement = effectiveDelta / anim.duration;
			anim.progress = Math.min(1, anim.progress + progressIncrement);

			const state = getOrCreateVisualState(edgeId);
			state.particleProgress = easeLinear(anim.progress);

			if (anim.progress >= 1) {
				state.particleProgress = null;
				particleAnimations.delete(edgeId);
			}
		}

		for (const [edgeId, anim] of edgeAnimations) {
			const progressIncrement = effectiveDelta / anim.duration;
			anim.progress = Math.min(1, anim.progress + progressIncrement);

			const state = getOrCreateVisualState(edgeId);
			if (anim.type === "add") {
				state.addProgress = anim.progress;
			} else {
				state.removeProgress = anim.progress;
			}

			if (anim.progress >= 1) {
				edgeAnimations.delete(edgeId);
			}
		}
	}

	function getActiveCount(): number {
		return particleAnimations.size + edgeAnimations.size;
	}

	return {
		getVisualState,
		startParticle,
		startAddAnimation,
		startRemoveAnimation,
		setSpeedMultiplier,
		pause,
		resume,
		tick,
		getActiveCount,
	};
}
