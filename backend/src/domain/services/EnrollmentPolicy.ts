import { GROUP_MAX_COACHEES } from "./CapacityValidator.js";

export type ClassType = "INDIVIDUAL" | "GROUP";
export type ClassStatus = "ACTIVE" | "CANCELED";

export type JoinEligibilityInput = {
  classType: ClassType;
  status: ClassStatus;
  isAlreadyEnrolled: boolean;
  coacheeLevelSortOrder: number | null;
  classLevelSortOrder: number | null;
  overlapsExisting: boolean;
  enrollmentCount: number;
};

export type JoinVerdict =
  | { ok: true }
  | {
      ok: false;
      code:
        | "CANCELED_CLASS"
        | "INDIVIDUAL_CLASS"
        | "ALREADY_ENROLLED"
        | "LEVEL_MISMATCH"
        | "OVERLAP_DETECTED"
        | "CLASS_FULL";
    };

export type CancellationVerdict = { ok: true } | { ok: false; code: "CANCELED_CLASS" };

export class EnrollmentPolicy {
  static readonly GROUP_CAPACITY: number = GROUP_MAX_COACHEES;

  assertGroupJoinEligible(input: JoinEligibilityInput): JoinVerdict {
    if (input.status !== "ACTIVE") {
      return { ok: false, code: "CANCELED_CLASS" };
    }
    if (input.classType !== "GROUP") {
      return { ok: false, code: "INDIVIDUAL_CLASS" };
    }
    if (input.isAlreadyEnrolled) {
      return { ok: false, code: "ALREADY_ENROLLED" };
    }
    if (
      input.coacheeLevelSortOrder === null ||
      input.classLevelSortOrder === null ||
      Math.abs(input.coacheeLevelSortOrder - input.classLevelSortOrder) > 1
    ) {
      return { ok: false, code: "LEVEL_MISMATCH" };
    }
    if (input.overlapsExisting) {
      return { ok: false, code: "OVERLAP_DETECTED" };
    }
    if (input.enrollmentCount >= EnrollmentPolicy.GROUP_CAPACITY) {
      return { ok: false, code: "CLASS_FULL" };
    }
    return { ok: true };
  }

  canCancelEnrollment(actorId: string, enrollmentCoacheeId: string): boolean {
    return actorId === enrollmentCoacheeId;
  }

  assertCancellationAllowed(input: { status: ClassStatus }): CancellationVerdict {
    if (input.status !== "ACTIVE") {
      return { ok: false, code: "CANCELED_CLASS" };
    }
    return { ok: true };
  }

  openedSpotDetected(hasWaitingList: boolean): boolean {
    return hasWaitingList;
  }

  coachNotificationTypeForCancellation(classType: ClassType, hasWaitingList: boolean): number {
    if (classType === "INDIVIDUAL") {
      return 3;
    }
    return hasWaitingList ? 4 : 5;
  }
}
