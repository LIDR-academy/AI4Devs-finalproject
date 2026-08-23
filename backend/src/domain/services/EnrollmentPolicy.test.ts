import { describe, expect, it } from "vitest";
import {
  type CancellationVerdict,
  EnrollmentPolicy,
  type JoinEligibilityInput,
  type JoinVerdict,
} from "./EnrollmentPolicy.js";

const policy = new EnrollmentPolicy();

const baseJoinInput = (): JoinEligibilityInput => ({
  classType: "GROUP",
  status: "ACTIVE",
  isAlreadyEnrolled: false,
  coacheeLevelSortOrder: 3,
  classLevelSortOrder: 3,
  overlapsExisting: false,
  enrollmentCount: 2,
});

describe("EnrollmentPolicy.assertGroupJoinEligible", () => {
  it("allows an eligible join", () => {
    const verdict = policy.assertGroupJoinEligible(baseJoinInput());
    expect(verdict).toEqual({ ok: true });
  });

  it("rejects a canceled class first (CANCELED_CLASS)", () => {
    const verdict = policy.assertGroupJoinEligible(baseJoinInput());
    const canceled = policy.assertGroupJoinEligible({ ...baseJoinInput(), status: "CANCELED" });
    expect(canceled).toEqual({ ok: false, code: "CANCELED_CLASS" });
    expect(verdict).toEqual({ ok: true });
  });

  it("rejects an individual class with INDIVIDUAL_CLASS even when the class is full", () => {
    const verdict = policy.assertGroupJoinEligible({
      ...baseJoinInput(),
      classType: "INDIVIDUAL",
      enrollmentCount: 1,
    });
    expect(verdict).toEqual({ ok: false, code: "INDIVIDUAL_CLASS" });
  });

  it("rejects an already-enrolled coachee with ALREADY_ENROLLED before capacity is evaluated", () => {
    const verdict = policy.assertGroupJoinEligible({
      ...baseJoinInput(),
      isAlreadyEnrolled: true,
      enrollmentCount: 4,
    });
    expect(verdict).toEqual({ ok: false, code: "ALREADY_ENROLLED" });
  });

  it("rejects a coachee without a level with LEVEL_MISMATCH", () => {
    const verdict = policy.assertGroupJoinEligible({
      ...baseJoinInput(),
      coacheeLevelSortOrder: null,
    });
    expect(verdict).toEqual({ ok: false, code: "LEVEL_MISMATCH" });
  });

  it("rejects a class without a level with LEVEL_MISMATCH", () => {
    const verdict = policy.assertGroupJoinEligible({
      ...baseJoinInput(),
      classLevelSortOrder: null,
    });
    expect(verdict).toEqual({ ok: false, code: "LEVEL_MISMATCH" });
  });

  it("rejects an out-of-reach class two levels away with LEVEL_MISMATCH", () => {
    const verdict = policy.assertGroupJoinEligible({
      ...baseJoinInput(),
      classLevelSortOrder: 5,
    });
    expect(verdict).toEqual({ ok: false, code: "LEVEL_MISMATCH" });
  });

  it("allows a class one level above the coachee (within reach)", () => {
    const verdict = policy.assertGroupJoinEligible({
      ...baseJoinInput(),
      classLevelSortOrder: 4,
    });
    expect(verdict).toEqual({ ok: true });
  });

  it("allows a class one level below the coachee (within reach)", () => {
    const verdict = policy.assertGroupJoinEligible({
      ...baseJoinInput(),
      classLevelSortOrder: 2,
    });
    expect(verdict).toEqual({ ok: true });
  });

  it("rejects an overlapping class with OVERLAP_DETECTED before capacity is evaluated", () => {
    const verdict = policy.assertGroupJoinEligible({
      ...baseJoinInput(),
      overlapsExisting: true,
      enrollmentCount: 4,
    });
    expect(verdict).toEqual({ ok: false, code: "OVERLAP_DETECTED" });
  });

  it("rejects a full class with CLASS_FULL", () => {
    const verdict = policy.assertGroupJoinEligible({ ...baseJoinInput(), enrollmentCount: 4 });
    expect(verdict).toEqual({ ok: false, code: "CLASS_FULL" });
  });

  it("allows the 4th enrollment into a class with 3 enrolled", () => {
    const verdict = policy.assertGroupJoinEligible({ ...baseJoinInput(), enrollmentCount: 3 });
    expect(verdict).toEqual({ ok: true });
  });

  it("evaluates rules in order: canceled > individual > already-enrolled > reach > overlap > capacity", () => {
    const conflicting = {
      ...baseJoinInput(),
      status: "CANCELED" as const,
      classType: "INDIVIDUAL" as const,
      isAlreadyEnrolled: true,
      coacheeLevelSortOrder: null,
      overlapsExisting: true,
      enrollmentCount: 4,
    };
    expect(policy.assertGroupJoinEligible(conflicting)).toEqual({
      ok: false,
      code: "CANCELED_CLASS",
    });

    expect(
      policy.assertGroupJoinEligible({
        ...conflicting,
        status: "ACTIVE",
      }),
    ).toEqual({ ok: false, code: "INDIVIDUAL_CLASS" });

    expect(
      policy.assertGroupJoinEligible({
        ...conflicting,
        status: "ACTIVE",
        classType: "GROUP",
      }),
    ).toEqual({ ok: false, code: "ALREADY_ENROLLED" });

    expect(
      policy.assertGroupJoinEligible({
        ...conflicting,
        status: "ACTIVE",
        classType: "GROUP",
        isAlreadyEnrolled: false,
      }),
    ).toEqual({ ok: false, code: "LEVEL_MISMATCH" });

    expect(
      policy.assertGroupJoinEligible({
        ...conflicting,
        status: "ACTIVE",
        classType: "GROUP",
        isAlreadyEnrolled: false,
        coacheeLevelSortOrder: 3,
        classLevelSortOrder: 3,
      }),
    ).toEqual({ ok: false, code: "OVERLAP_DETECTED" });

    expect(
      policy.assertGroupJoinEligible({
        ...conflicting,
        status: "ACTIVE",
        classType: "GROUP",
        isAlreadyEnrolled: false,
        coacheeLevelSortOrder: 3,
        classLevelSortOrder: 3,
        overlapsExisting: false,
      }),
    ).toEqual({ ok: false, code: "CLASS_FULL" });
  });
});

describe("EnrollmentPolicy.canCancelEnrollment", () => {
  it("allows the enrolled coachee to cancel their own enrollment", () => {
    expect(policy.canCancelEnrollment("coachee-1", "coachee-1")).toBe(true);
  });

  it("denies any other user from canceling an enrollment", () => {
    expect(policy.canCancelEnrollment("other-user", "coachee-1")).toBe(false);
  });
});

describe("EnrollmentPolicy.assertCancellationAllowed", () => {
  it("allows cancellation from an ACTIVE class", () => {
    const verdict = policy.assertCancellationAllowed({ status: "ACTIVE" });
    expect(verdict).toEqual({ ok: true });
  });

  it("rejects cancellation from a CANCELED class", () => {
    const verdict: CancellationVerdict = policy.assertCancellationAllowed({
      status: "CANCELED",
    });
    expect(verdict).toEqual({ ok: false, code: "CANCELED_CLASS" });
  });
});

describe("EnrollmentPolicy.openedSpotDetected", () => {
  it("is true when a waiting list exists", () => {
    expect(policy.openedSpotDetected(true)).toBe(true);
  });

  it("is false when there is no waiting list", () => {
    expect(policy.openedSpotDetected(false)).toBe(false);
  });
});

describe("EnrollmentPolicy.coachNotificationTypeForCancellation", () => {
  it("maps an individual class cancellation to type 3", () => {
    expect(policy.coachNotificationTypeForCancellation("INDIVIDUAL", false)).toBe(3);
    expect(policy.coachNotificationTypeForCancellation("INDIVIDUAL", true)).toBe(3);
  });

  it("maps a group cancellation with a waiting list to type 4", () => {
    expect(policy.coachNotificationTypeForCancellation("GROUP", true)).toBe(4);
  });

  it("maps a group cancellation without a waiting list to type 5", () => {
    expect(policy.coachNotificationTypeForCancellation("GROUP", false)).toBe(5);
  });
});

// Keeps the union type referenced so its members are type-checked as errors evolve.
const _typeGuard = (_v: JoinVerdict): string => (_v.ok ? "ok" : _v.code);
void _typeGuard;
