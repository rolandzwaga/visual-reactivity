import { describe, expect, it } from "vitest";
import {
	createInitialTimelineState,
	DEFAULT_TIMELINE_STATE,
} from "../timelineStore";

describe("timelineStore", () => {
	describe("createInitialTimelineState", () => {
		it("returns default timeline state", () => {
			const state = createInitialTimelineState();

			expect(state.events).toEqual([]);
			expect(state.swimlanes).toEqual([]);
			expect(state.batches).toEqual([]);
			expect(state.clusters).toEqual([]);
			expect(state.liveMode).toBe("live");
		});

		it("includes initial time scale", () => {
			const state = createInitialTimelineState();

			expect(state.scale).toBeDefined();
			expect(state.scale.startTime).toBe(0);
			expect(state.scale.endTime).toBe(1000);
			expect(state.scale.width).toBe(1000);
		});

		it("includes initial cursor", () => {
			const state = createInitialTimelineState();

			expect(state.cursor).toBeDefined();
			expect(state.cursor.time).toBe(0);
			expect(state.cursor.x).toBe(0);
			expect(state.cursor.snappedEventId).toBeNull();
			expect(state.cursor.isSnapped).toBe(false);
		});

		it("includes initial filter", () => {
			const state = createInitialTimelineState();

			expect(state.filter).toBeDefined();
			expect(state.filter.enabledEventTypes).toBeInstanceOf(Set);
			expect(state.filter.selectedNodeIds).toBeNull();
			expect(state.filter.searchQuery).toBe("");
		});

		it("includes initial playback state", () => {
			const state = createInitialTimelineState();

			expect(state.playback).toBeDefined();
			expect(state.playback.isPlaying).toBe(false);
			expect(state.playback.speed).toBe(1);
			expect(state.playback.mode).toBe("manual");
			expect(state.playback.lastTickTime).toBeNull();
			expect(state.playback.rafId).toBeNull();
		});
	});

	describe("DEFAULT_TIMELINE_STATE", () => {
		it("is immutable", () => {
			const state1 = DEFAULT_TIMELINE_STATE();
			const state2 = DEFAULT_TIMELINE_STATE();

			expect(state1).not.toBe(state2);
		});
	});
});
