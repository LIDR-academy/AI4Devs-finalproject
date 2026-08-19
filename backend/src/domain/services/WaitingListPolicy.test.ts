import { describe, expect, it } from "vitest";
import {
  type JoinEligibilityInput,
  type JoinVerdict,
  WaitingListPolicy,
} from "./WaitingListPolicy.js";

const policy = new WaitingListPolicy();

const baseJoinInput = (): JoinEligibilityInput => ({
  classType: "GROUP",
  status: "ACTIVE",
  enrollmentCount: 4,
  capacity: 4,
  waitingListCount: 0,
  isAlreadyEnrolled: false,
  isAlreadyOnWaitingList: false,
  coacheeLevelSortOrder: 3,
  classLevelSortOrder: 3,
});

describe("WaitingListPolicy.assertJoinEligible", () => {
  it("allows joining the waiting list of a full group class", () => {
    const verdict = policy.assertJoinEligible(baseJoinInput());
    expect(verdict).toEqual({ ok: true });
  });

  it("allows joining the waiting list of an occupied individual slot", () => {
    const verdict = policy.assertJoinEligible({
      ...baseJoinInput(),
      classType: "INDIVIDUAL",
      capacity: 1,
      enrollmentCount: 1,
    });
    expect(verdict).toEqual({ ok: true });
  });

  it("rejects a canceled class first (CANCELED_CLASS)", () => {
    const verdict = policy.assertJoinEligible({ ...baseJoinInput(), status: "CANCELED" });
    expect(verdict).toEqual({ ok: false, code: "CANCELED_CLASS" });
  });

  it("rejects a not-full group class with GROUP_NOT_FULL before searching reach/enrolled/list-full", () => {
    const verdict = policy.assertJoinEligible({ ...baseJoinInput(), enrollmentCount: 3 });
    expect(verdict).toEqual({ ok: false, code: "GROUP_NOT_FULL" });
  });

  it("rejects an unoccupied individual slot with SLOT_NOT_OCCUPIED", () => {
    const verdict = policy.assertJoinEligible({
      ...baseJoinInput(),
      classType: "INDIVIDUAL",
      capacity: 1,
      enrollmentCount: 0,
    });
    expect(verdict).toEqual({ ok: false, code: "SLOT_NOT_OCCUPIED" });
  });

  it("rejects a full group class in which the coachee is already enrolled with ALREADY_ENROLLED", () => {
    const verdict = policy.assertJoinEligible({ ...baseJoinInput(), isAlreadyEnrolled: true });
    expect(verdict).toEqual({ ok: false, code: "ALREADY_ENROLLED" });
  });

  it("rejects a coachee already on the same waiting list with ALREADY_ON_WAITING_LIST", () => {
    const verdict = policy.assertJoinEligible({
      ...baseJoinInput(),
      isAlreadyOnWaitingList: true,
    });
    expect(verdict).toEqual({ ok: false, code: "ALREADY_ON_WAITING_LIST" });
  });

  it("rejects a coachee without a level with LEVEL_MISMATCH", () => {
    const verdict = policy.assertJoinEligible({ ...baseJoinInput(), coacheeLevelSortOrder: null });
    expect(verdict).toEqual({ ok: false, code: "LEVEL_MISMATCH" });
  });

  it("rejects a group class without a level with LEVEL_MISMATCH", () => {
    const verdict = policy.assertJoinEligible({ ...baseJoinInput(), classLevelSortOrder: null });
    expect(verdict).toEqual({ ok: false, code: "LEVEL_MISMATCH" });
  });

  it("rejects an out-of-reach class two levels away with LEVEL_MISMATCH", () => {
    const verdict = policy.assertJoinEligible({ ...baseJoinInput(), classLevelSortOrder: 5 });
    expect(verdict).toEqual({ ok: false, code: "LEVEL_MISMATCH" });
  });

  it("allows a group class one level above the coachee (within reach)", () => {
    const verdict = policy.assertJoinEligible({ ...baseJoinInput(), classLevelSortOrder: 4 });
    expect(verdict).toEqual({ ok: true });
  });

  it("allows an individual slot one level below the coachee (within reach)", () => {
    const verdict = policy.assertJoinEligible({
      ...baseJoinInput(),
      classType: "INDIVIDUAL",
      capacity: 1,
      enrollmentCount: 1,
      classLevelSortOrder: 2,
    });
    expect(verdict).toEqual({ ok: true });
  });

  it("rejects a full waiting list with WAITING_LIST_FULL", () => {
    const verdict = policy.assertJoinEligible({ ...baseJoinInput(), waitingListCount: 4 });
    expect(verdict).toEqual({ ok: false, code: "WAITING_LIST_FULL" });
  });

  it("allows the 4th waiting-list entry into a list with 3 members", () => {
    const verdict = policy.assertJoinEligible({ ...baseJoinInput(), waitingListCount: 3 });
    expect(verdict).toEqual({ ok: true });
  });

  it("rejects a full individual-slot waiting list with WAITING_LIST_FULL", () => {
    const verdict = policy.assertJoinEligible({
      ...baseJoinInput(),
      classType: "INDIVIDUAL",
      capacity: 1,
      enrollmentCount: 1,
      waitingListCount: 4,
    });
    expect(verdict).toEqual({ ok: false, code: "WAITING_LIST_FULL" });
  });

  it("rejects a canceled individual-class slot with CANCELED_CLASS", () => {
    const verdict = policy.assertJoinEligible({
      ...baseJoinInput(),
      classType: "INDIVIDUAL",
      capacity: 1,
      enrollmentCount: 1,
      status: "CANCELED",
    });
    expect(verdict).toEqual({ ok: false, code: "CANCELED_CLASS" });
  });

  it("evaluates rules in order: canceled > type-eligibility > enrolled > on-list > reach > list-full", () => {
    const conflicting = {
      ...baseJoinInput(),
      status: "CANCELED" as "ACTIVE" | "CANCELED",
      coacheeLevelSortOrder: null,
      isAlreadyEnrolled: true,
      isAlreadyOnWaitingList: true,
      waitingListCount: 4,
    };
    const step = (patch: Partial<JoinEligibilityInput>): JoinEligibilityInput => ({
      ...conflicting,
      ...patch,
    });

    expect(policy.assertJoinEligible(step({}))).toEqual({
      ok: false,
      code: "CANCELED_CLASS",
    });

    expect(policy.assertJoinEligible(step({ status: "ACTIVE", enrollmentCount: 3 }))).toEqual({
      ok: false,
      code: "GROUP_NOT_FULL",
    });

    expect(policy.assertJoinEligible(step({ status: "ACTIVE", enrollmentCount: 4 }))).toEqual({
      ok: false,
      code: "ALREADY_ENROLLED",
    });

    expect(
      policy.assertJoinEligible(
        step({ status: "ACTIVE", enrollmentCount: 4, isAlreadyEnrolled: false }),
      ),
    ).toEqual({ ok: false, code: "ALREADY_ON_WAITING_LIST" });

    expect(
      policy.assertJoinEligible(
        step({
          status: "ACTIVE",
          enrollmentCount: 4,
          isAlreadyEnrolled: false,
          isAlreadyOnWaitingList: false,
        }),
      ),
    ).toEqual({ ok: false, code: "LEVEL_MISMATCH" });

    expect(
      policy.assertJoinEligible(
        step({
          status: "ACTIVE",
          enrollmentCount: 4,
          isAlreadyEnrolled: false,
          isAlreadyOnWaitingList: false,
          coacheeLevelSortOrder: 3,
          classLevelSortOrder: 3,
        }),
      ),
    ).toEqual({ ok: false, code: "WAITING_LIST_FULL" });
  });
});

describe("WaitingListPolicy.ownsEntry", () => {
  it("allows the waitlisted coachee to remove their own entry", () => {
    expect(policy.ownsEntry("coachee-1", "coachee-1")).toBe(true);
  });

  it("denies any other user from removing an entry", () => {
    expect(policy.ownsEntry("other-user", "coachee-1")).toBe(false);
  });
});

describe("WaitingListPolicy.hasOpenSpots", () => {
  it("is true for a group class below capacity", () => {
    expect(policy.hasOpenSpots({ classType: "GROUP", enrollmentCount: 2, capacity: 4 })).toBe(true);
  });

  it("is false for a full group class", () => {
    expect(policy.hasOpenSpots({ classType: "GROUP", enrollmentCount: 4, capacity: 4 })).toBe(
      false,
    );
  });

  it("is true for an unoccupied individual slot", () => {
    expect(policy.hasOpenSpots({ classType: "INDIVIDUAL", enrollmentCount: 0, capacity: 1 })).toBe(
      true,
    );
  });

  it("is false for an occupied individual slot", () => {
    expect(policy.hasOpenSpots({ classType: "INDIVIDUAL", enrollmentCount: 1, capacity: 1 })).toBe(
      false,
    );
  });
});

describe("WaitingListPolicy.notificationType", () => {
  it("maps joining to type 9 and leaving to type 10", () => {
    expect(policy.notificationTypeForJoin()).toBe(9);
    expect(policy.notificationTypeForLeave()).toBe(10);
  });
});

describe("WaitingListPolicy.maxWaitingListSize", () => {
  it("is 4", () => {
    expect(WaitingListPolicy.MAX_LIST_SIZE).toBe(4);
  });
});

// Keeps the union type referenced so its members are type-checked as errors evolve.
const _typeGuard = (_v: JoinVerdict): string => (_v.ok ? "ok" : _v.code);
void _typeGuard;
