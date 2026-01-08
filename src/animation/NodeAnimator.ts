import { easeQuadInOut } from "./easing";
import type { NodeVisualState } from "./types";
import { DEFAULT_ANIMATION_DURATION, PULSE_SCALE_MAX } from "./types";

interface PulseAnimation {
	nodeId: string;
	startTime: number;
	duration: number;
	progress: number;
}

export interface NodeAnimatorInstance {
	getVisualState(nodeId: string): NodeVisualState;
	startPulse(nodeId: string, duration?: number): void;
	setStale(nodeId: string, isStale: boolean): void;
	setExecuting(nodeId: string, isExecuting: boolean): void;
	startFadeOut(nodeId: string, duration?: number): void;
	startDisposal(nodeId: string, duration?: number): void;
	setSpeedMultiplier(multiplier: number): void;
	pause(): void;
	resume(): void;
	tick(deltaTime: number): void;
	getActiveCount(): number;
}

export function createNodeAnimator(): NodeAnimatorInstance {
	const visualStates = new Map<string, NodeVisualState>();
	const pulseAnimations = new Map<string, PulseAnimation>();
	const fadeOutAnimations = new Map<string, PulseAnimation>();
	const disposalAnimations = new Map<string, PulseAnimation>();
	let speedMultiplier = 1.0;
	let isPaused = false;

	function getOrCreateVisualState(nodeId: string): NodeVisualState {
		let state = visualStates.get(nodeId);
		if (!state) {
			state = {
				nodeId,
				isStale: false,
				isExecuting: false,
				pulseScale: 1,
				highlightOpacity: 0,
				disposeProgress: 0,
			};
			visualStates.set(nodeId, state);
		}
		return state;
	}

	function getVisualState(nodeId: string): NodeVisualState {
		return getOrCreateVisualState(nodeId);
	}

	function startPulse(
		nodeId: string,
		duration = DEFAULT_ANIMATION_DURATION,
	): void {
		pulseAnimations.set(nodeId, {
			nodeId,
			startTime: performance.now(),
			duration,
			progress: 0,
		});
	}

	function setStale(nodeId: string, isStale: boolean): void {
		const state = getOrCreateVisualState(nodeId);
		state.isStale = isStale;
	}

	function setExecuting(nodeId: string, isExecuting: boolean): void {
		const state = getOrCreateVisualState(nodeId);
		state.isExecuting = isExecuting;
		if (isExecuting) {
			state.highlightOpacity = 1;
		}
	}

	function startFadeOut(
		nodeId: string,
		duration = DEFAULT_ANIMATION_DURATION,
	): void {
		fadeOutAnimations.set(nodeId, {
			nodeId,
			startTime: performance.now(),
			duration,
			progress: 0,
		});
	}

	function startDisposal(
		nodeId: string,
		duration = DEFAULT_ANIMATION_DURATION,
	): void {
		disposalAnimations.set(nodeId, {
			nodeId,
			startTime: performance.now(),
			duration,
			progress: 0,
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

		for (const [nodeId, anim] of pulseAnimations) {
			const progressIncrement = effectiveDelta / anim.duration;
			anim.progress = Math.min(1, anim.progress + progressIncrement);

			const state = getOrCreateVisualState(nodeId);
			const easedProgress = easeQuadInOut(anim.progress);
			const pulsePhase =
				easedProgress <= 0.5 ? easedProgress * 2 : 2 - easedProgress * 2;
			state.pulseScale = 1 + (PULSE_SCALE_MAX - 1) * pulsePhase;

			if (anim.progress >= 1) {
				state.pulseScale = 1;
				pulseAnimations.delete(nodeId);
			}
		}

		for (const [nodeId, anim] of fadeOutAnimations) {
			const progressIncrement = effectiveDelta / anim.duration;
			anim.progress = Math.min(1, anim.progress + progressIncrement);

			const state = getOrCreateVisualState(nodeId);
			state.highlightOpacity = 1 - anim.progress;

			if (anim.progress >= 1) {
				state.highlightOpacity = 0;
				fadeOutAnimations.delete(nodeId);
			}
		}

		for (const [nodeId, anim] of disposalAnimations) {
			const progressIncrement = effectiveDelta / anim.duration;
			anim.progress = Math.min(1, anim.progress + progressIncrement);

			const state = getOrCreateVisualState(nodeId);
			state.disposeProgress = anim.progress;

			if (anim.progress >= 1) {
				disposalAnimations.delete(nodeId);
			}
		}
	}

	function getActiveCount(): number {
		return (
			pulseAnimations.size + fadeOutAnimations.size + disposalAnimations.size
		);
	}

	return {
		getVisualState,
		startPulse,
		setStale,
		setExecuting,
		startFadeOut,
		startDisposal,
		setSpeedMultiplier,
		pause,
		resume,
		tick,
		getActiveCount,
	};
}
