import { describe, expect, it } from "vitest";
import {
  INITIAL_PULL_STATE,
  PULL_MAX_DISTANCE_PX,
  PULL_THRESHOLD_PX,
  pullGesture,
} from "./pullGesture";

describe("pullGesture", () => {
  it("only starts when the scroll container is at the top", () => {
    expect(pullGesture(INITIAL_PULL_STATE, { type: "START", atTop: false })).toEqual(
      INITIAL_PULL_STATE,
    );
    expect(pullGesture(INITIAL_PULL_STATE, { type: "START", atTop: true })).toEqual({
      active: true,
      distance: 0,
      ready: false,
      triggered: false,
    });
  });

  it("tracks the pull distance and ignores upward movement", () => {
    let state = pullGesture(INITIAL_PULL_STATE, { type: "START", atTop: true });
    state = pullGesture(state, { type: "MOVE", deltaY: 24 });
    state = pullGesture(state, { type: "MOVE", deltaY: -10 });
    expect(state.distance).toBe(24);
    state = pullGesture(state, { type: "MOVE", deltaY: 8 });
    expect(state.distance).toBe(32);
  });

  it("clamps the distance to the maximum pull length", () => {
    let state = pullGesture(INITIAL_PULL_STATE, { type: "START", atTop: true });
    state = pullGesture(state, { type: "MOVE", deltaY: PULL_MAX_DISTANCE_PX + 50 });
    expect(state.distance).toBe(PULL_MAX_DISTANCE_PX);
    expect(state.ready).toBe(true);
  });

  it("enables the trigger once the threshold is crossed", () => {
    let state = pullGesture(INITIAL_PULL_STATE, { type: "START", atTop: true });
    expect(state.ready).toBe(false);
    state = pullGesture(state, { type: "MOVE", deltaY: PULL_THRESHOLD_PX - 1 });
    expect(state.ready).toBe(false);
    state = pullGesture(state, { type: "MOVE", deltaY: 2 });
    expect(state.ready).toBe(true);
  });

  it("cancels on release below the threshold", () => {
    let state = pullGesture(INITIAL_PULL_STATE, { type: "START", atTop: true });
    state = pullGesture(state, { type: "MOVE", deltaY: PULL_THRESHOLD_PX - 10 });
    const ended = pullGesture(state, { type: "END" });
    expect(ended).toEqual({ ...INITIAL_PULL_STATE, triggered: false });
  });

  it("triggers the refetch on release above the threshold", () => {
    let state = pullGesture(INITIAL_PULL_STATE, { type: "START", atTop: true });
    state = pullGesture(state, { type: "MOVE", deltaY: PULL_THRESHOLD_PX + 5 });
    const ended = pullGesture(state, { type: "END" });
    expect(ended).toEqual({ ...INITIAL_PULL_STATE, triggered: true });
  });

  it("ignores move events while the gesture is not active", () => {
    const moved = pullGesture(INITIAL_PULL_STATE, { type: "MOVE", deltaY: 40 });
    expect(moved).toEqual(INITIAL_PULL_STATE);
  });

  it("starts a fresh gesture after a trigger", () => {
    const second = pullGesture(
      { ...INITIAL_PULL_STATE, triggered: true },
      { type: "START", atTop: true },
    );
    expect(second.triggered).toBe(false);
    expect(second.distance).toBe(0);
  });
});
