import type { Animation, AnimationQueueState, AnimationState } from "./types";

let animationIdCounter = 0;

function generateAnimationId(): string {
	return `anim-${++animationIdCounter}`;
}

export interface AnimationQueueInstance {
	enqueue(animation: Omit<Animation, "id" | "state" | "progress">): string;
	cancel(animationId: string): void;
	cancelForTarget(targetId: string): void;
	getState(): AnimationQueueState;
	tick(deltaTime: number, speedMultiplier: number): void;
	pause(): void;
	resume(): void;
	clear(): void;
}

export function createAnimationQueue(): AnimationQueueInstance {
	const pending: Animation[] = [];
	const active = new Map<string, Animation>();
	let completedCount = 0;
	let isPaused = false;

	function enqueue(
		input: Omit<Animation, "id" | "state" | "progress">,
	): string {
		const id = generateAnimationId();

		const animation: Animation = {
			...input,
			id,
			state: "pending" as AnimationState,
			progress: 0,
		};

		if (active.has(input.targetId)) {
			active.delete(input.targetId);
		}

		const existingPendingIndex = pending.findIndex(
			(a) => a.targetId === input.targetId,
		);
		if (existingPendingIndex !== -1) {
			pending.splice(existingPendingIndex, 1);
		}

		pending.push(animation);
		return id;
	}

	function cancel(animationId: string): void {
		const pendingIndex = pending.findIndex((a) => a.id === animationId);
		if (pendingIndex !== -1) {
			pending.splice(pendingIndex, 1);
			return;
		}

		for (const [targetId, anim] of active) {
			if (anim.id === animationId) {
				active.delete(targetId);
				return;
			}
		}
	}

	function cancelForTarget(targetId: string): void {
		const pendingIndex = pending.findIndex((a) => a.targetId === targetId);
		if (pendingIndex !== -1) {
			pending.splice(pendingIndex, 1);
		}

		active.delete(targetId);
	}

	function getState(): AnimationQueueState {
		return {
			pending: [...pending],
			active: new Map(active),
			completedCount,
		};
	}

	function tick(deltaTime: number, speedMultiplier: number): void {
		if (isPaused) {
			return;
		}

		while (pending.length > 0) {
			const animation = pending.shift();
			if (animation) {
				animation.state = "running";
				animation.startTime = performance.now();
				active.set(animation.targetId, animation);
			}
		}

		const toComplete: string[] = [];

		for (const [targetId, animation] of active) {
			const effectiveDelta = deltaTime * speedMultiplier;
			const progressIncrement = effectiveDelta / animation.duration;
			animation.progress = Math.min(1, animation.progress + progressIncrement);

			if (animation.progress >= 1) {
				toComplete.push(targetId);
			}
		}

		for (const targetId of toComplete) {
			active.delete(targetId);
			completedCount++;
		}
	}

	function pause(): void {
		isPaused = true;
		for (const animation of active.values()) {
			animation.state = "paused";
		}
	}

	function resume(): void {
		isPaused = false;
		for (const animation of active.values()) {
			animation.state = "running";
		}
	}

	function clear(): void {
		pending.length = 0;
		active.clear();
	}

	return {
		enqueue,
		cancel,
		cancelForTarget,
		getState,
		tick,
		pause,
		resume,
		clear,
	};
}
