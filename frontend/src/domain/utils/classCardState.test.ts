import { describe, expect, it } from "vitest";
import type { ClassCardStateInput } from "@/domain/utils/classCardState";
import { deriveClassCardState } from "@/domain/utils/classCardState";

function group(overrides: Partial<ClassCardStateInput> = {}): ClassCardStateInput {
  return {
    classType: "GROUP",
    status: "ACTIVE",
    enrollmentCount: 2,
    capacity: 4,
    coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: true },
    ...overrides,
  };
}

describe("deriveClassCardState", () => {
  it("renders no action for a CANCELED class even when enrolled", () => {
    expect(
      deriveClassCardState(
        group({
          status: "CANCELED",
          coacheeStatus: { isEnrolled: true, isOnWaitingList: false, isWithinReach: true },
        }),
      ),
    ).toEqual({ action: "none", reason: "canceled" });
  });

  it("renders no action for a CANCELED individual class", () => {
    expect(
      deriveClassCardState(
        group({
          classType: "INDIVIDUAL",
          status: "CANCELED",
          coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: false },
        }),
      ),
    ).toEqual({ action: "none", reason: "canceled" });
  });

  it("offers Cancel when the Coachee is enrolled in a group class (blue)", () => {
    expect(
      deriveClassCardState(
        group({
          coacheeStatus: { isEnrolled: true, isOnWaitingList: false, isWithinReach: true },
        }),
      ),
    ).toEqual({ action: "cancel", reason: null });
  });

  it("offers Cancel when the Coachee is enrolled in an individual (assigned) class", () => {
    expect(
      deriveClassCardState(
        group({
          classType: "INDIVIDUAL",
          coacheeStatus: { isEnrolled: true, isOnWaitingList: false, isWithinReach: false },
        }),
      ),
    ).toEqual({ action: "cancel", reason: null });
  });

  it("renders no action for an individual class that is not assigned to the Coachee", () => {
    expect(
      deriveClassCardState(
        group({
          classType: "INDIVIDUAL",
          coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: false },
        }),
      ),
    ).toEqual({ action: "none", reason: "individual" });
  });

  it("renders the waiting-list informational state when the Coachee is on the waiting list", () => {
    expect(
      deriveClassCardState(
        group({
          coacheeStatus: { isEnrolled: false, isOnWaitingList: true, isWithinReach: true },
        }),
      ),
    ).toEqual({ action: "none", reason: "waiting" });
  });

  it("offers the Waiting list affordance on a full class within reach (replaces Join)", () => {
    expect(
      deriveClassCardState(
        group({
          enrollmentCount: 4,
          capacity: 4,
          coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: true },
        }),
      ),
    ).toEqual({ action: "waiting-list", reason: null });
  });

  it("renders no action on a full class out of reach", () => {
    expect(
      deriveClassCardState(
        group({
          enrollmentCount: 4,
          capacity: 4,
          coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: false },
        }),
      ),
    ).toEqual({ action: "none", reason: "out-of-reach" });
  });

  it("offers Join on a group class with an open spot within reach (green)", () => {
    expect(
      deriveClassCardState(
        group({
          coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: true },
        }),
      ),
    ).toEqual({ action: "join", reason: null });
  });

  it("renders no action on a group class out of reach with an open spot (gray)", () => {
    expect(
      deriveClassCardState(
        group({
          coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: false },
        }),
      ),
    ).toEqual({ action: "none", reason: "out-of-reach" });
  });

  it("falls back to visibility when coacheeStatus is absent (blue means enrolled)", () => {
    expect(deriveClassCardState(group({ coacheeStatus: undefined, visibility: "blue" }))).toEqual({
      action: "cancel",
      reason: null,
    });
  });

  it("falls back to visibility when coacheeStatus is absent (green means within reach)", () => {
    expect(deriveClassCardState(group({ coacheeStatus: undefined, visibility: "green" }))).toEqual({
      action: "join",
      reason: null,
    });
  });

  it("falls back to visibility when coacheeStatus is absent (gray means out of reach)", () => {
    expect(deriveClassCardState(group({ coacheeStatus: undefined, visibility: "gray" }))).toEqual({
      action: "none",
      reason: "out-of-reach",
    });
  });
});
