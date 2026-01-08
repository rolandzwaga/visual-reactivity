import { createSignal } from "solid-js";
import { createEdgeAnimator } from "./EdgeAnimator";
import { createNodeAnimator } from "./NodeAnimator";
import type {
	AnimationControllerOptions,
	EdgeVisualState,
	NodeVisualState,
	PlaybackState,
} from "./types";
import {
	DEFAULT_ANIMATION_DURATION,
	MAX_SPEED_MULTIPLIER,
	MIN_SPEED_MULTIPLIER,
} from "./types";

export interface AnimationControllerInstance {
	playback: {
		state: () => PlaybackState;
		togglePause: () => void;
		setPaused: (paused: boolean) => void;
		setSpeed: (multiplier: number) => void;
	};
	getNodeVisualState: (nodeId: string) => () => NodeVisualState;
	getEdgeVisualState: (edgeId: string) => () => EdgeVisualState;
	animateSignalWrite: (nodeId: string) => void;
	animateExecutionStart: (nodeId: string) => void;
	animateExecutionEnd: (nodeId: string) => void;
	animateEdgeParticle: (edgeId: string) => void;
	animateEdgeAdd: (edgeId: string) => void;
	animateEdgeRemove: (edgeId: string) => void;
	animateDisposal: (nodeId: string) => void;
	setNodeStale: (nodeId: string, isStale: boolean) => void;
	startBatch: () => void;
	endBatch: () => void;
	dispose: () => void;
}

export function createAnimationController(
	options: AnimationControllerOptions = {},
): AnimationControllerInstance {
	const baseDuration = options.baseDuration ?? DEFAULT_ANIMATION_DURATION;

	const [isPaused, setIsPaused] = createSignal(false);
	const [speedMultiplier, setSpeedMultiplier] = createSignal(1.0);
	const [pendingCount, _setPendingCount] = createSignal(0);

	const nodeAnimator = createNodeAnimator();
	const edgeAnimator = createEdgeAnimator();

	const nodeStateGetters = new Map<string, () => NodeVisualState>();
	const edgeStateGetters = new Map<string, () => EdgeVisualState>();

	let animationFrameId: number | null = null;
	let lastFrameTime = 0;
	let isInBatch = false;
	const batchedNodeIds: string[] = [];

	function startAnimationLoop(): void {
		if (animationFrameId !== null) return;

		lastFrameTime = performance.now();

		function loop(currentTime: number): void {
			const deltaTime = currentTime - lastFrameTime;
			lastFrameTime = currentTime;

			if (!isPaused()) {
				nodeAnimator.tick(deltaTime);
				edgeAnimator.tick(deltaTime);
			}

			animationFrameId = requestAnimationFrame(loop);
		}

		animationFrameId = requestAnimationFrame(loop);
	}

	function stopAnimationLoop(): void {
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	}

	startAnimationLoop();

	const playback = {
		state: (): PlaybackState => ({
			isPaused: isPaused(),
			speedMultiplier: speedMultiplier(),
			pendingCount: pendingCount(),
		}),

		togglePause: (): void => {
			const newPaused = !isPaused();
			setIsPaused(newPaused);
			if (newPaused) {
				nodeAnimator.pause();
				edgeAnimator.pause();
			} else {
				nodeAnimator.resume();
				edgeAnimator.resume();
			}
		},

		setPaused: (paused: boolean): void => {
			setIsPaused(paused);
			if (paused) {
				nodeAnimator.pause();
				edgeAnimator.pause();
			} else {
				nodeAnimator.resume();
				edgeAnimator.resume();
			}
		},

		setSpeed: (multiplier: number): void => {
			const clamped = Math.max(
				MIN_SPEED_MULTIPLIER,
				Math.min(MAX_SPEED_MULTIPLIER, multiplier),
			);
			setSpeedMultiplier(clamped);
			nodeAnimator.setSpeedMultiplier(clamped);
			edgeAnimator.setSpeedMultiplier(clamped);
		},
	};

	function getNodeVisualState(nodeId: string): () => NodeVisualState {
		let getter = nodeStateGetters.get(nodeId);
		if (!getter) {
			getter = () => nodeAnimator.getVisualState(nodeId);
			nodeStateGetters.set(nodeId, getter);
		}
		return getter;
	}

	function getEdgeVisualState(edgeId: string): () => EdgeVisualState {
		let getter = edgeStateGetters.get(edgeId);
		if (!getter) {
			getter = () => edgeAnimator.getVisualState(edgeId);
			edgeStateGetters.set(edgeId, getter);
		}
		return getter;
	}

	function animateSignalWrite(nodeId: string): void {
		nodeAnimator.startPulse(nodeId, baseDuration);

		if (isInBatch) {
			batchedNodeIds.push(nodeId);
		}
	}

	function animateExecutionStart(nodeId: string): void {
		nodeAnimator.setStale(nodeId, false);
		nodeAnimator.setExecuting(nodeId, true);
	}

	function animateExecutionEnd(nodeId: string): void {
		nodeAnimator.setExecuting(nodeId, false);
		nodeAnimator.startPulse(nodeId, baseDuration);
		nodeAnimator.startFadeOut(nodeId, baseDuration);
	}

	function animateEdgeParticle(edgeId: string): void {
		edgeAnimator.startParticle(edgeId, baseDuration);
	}

	function animateEdgeAdd(edgeId: string): void {
		edgeAnimator.startAddAnimation(edgeId, baseDuration);
	}

	function animateEdgeRemove(edgeId: string): void {
		edgeAnimator.startRemoveAnimation(edgeId, baseDuration);
	}

	function animateDisposal(nodeId: string): void {
		nodeAnimator.startDisposal(nodeId, baseDuration);
	}

	function setNodeStale(nodeId: string, isStale: boolean): void {
		nodeAnimator.setStale(nodeId, isStale);
	}

	function startBatch(): void {
		isInBatch = true;
		batchedNodeIds.length = 0;
	}

	function endBatch(): void {
		isInBatch = false;
		batchedNodeIds.length = 0;
	}

	function dispose(): void {
		stopAnimationLoop();
		nodeStateGetters.clear();
		edgeStateGetters.clear();
	}

	return {
		playback,
		getNodeVisualState,
		getEdgeVisualState,
		animateSignalWrite,
		animateExecutionStart,
		animateExecutionEnd,
		animateEdgeParticle,
		animateEdgeAdd,
		animateEdgeRemove,
		animateDisposal,
		setNodeStale,
		startBatch,
		endBatch,
		dispose,
	};
}
