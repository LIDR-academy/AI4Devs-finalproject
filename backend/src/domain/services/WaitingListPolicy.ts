import { GROUP_MAX_COACHEES, INDIVIDUAL_CLASS_COACHEES } from "./CapacityValidator.js";
import { isWithinReach } from "./ReachCalculator.js";

export type ClassType = "INDIVIDUAL" | "GROUP";
export type ClassStatus = "ACTIVE" | "CANCELED";

export type JoinEligibilityInput = {
  classType: ClassType;
  status: ClassStatus;
  enrollmentCount: number;
  capacity: number;
  waitingListCount: number;
  isAlreadyEnrolled: boolean;
  isAlreadyOnWaitingList: boolean;
  coacheeLevelSortOrder: number | null;
  classLevelSortOrder: number | null;
};

export type JoinVerdict =
  | { ok: true }
  | {
      ok: false;
      code:
        | "CANCELED_CLASS"
        | "GROUP_NOT_FULL"
        | "SLOT_NOT_OCCUPIED"
        | "ALREADY_ENROLLED"
        | "ALREADY_ON_WAITING_LIST"
        | "LEVEL_MISMATCH"
        | "WAITING_LIST_FULL";
    };

export class WaitingListPolicy {
  static readonly MAX_LIST_SIZE: number = 4;

  assertJoinEligible(input: JoinEligibilityInput): JoinVerdict {
    if (input.status !== "ACTIVE") {
      return { ok: false, code: "CANCELED_CLASS" };
    }
    if (input.classType === "GROUP") {
      if (input.enrollmentCount < input.capacity) {
        return { ok: false, code: "GROUP_NOT_FULL" };
      }
    } else {
      if (input.enrollmentCount < INDIVIDUAL_CLASS_COACHEES) {
        return { ok: false, code: "SLOT_NOT_OCCUPIED" };
      }
    }
    if (input.isAlreadyEnrolled) {
      return { ok: false, code: "ALREADY_ENROLLED" };
    }
    if (input.isAlreadyOnWaitingList) {
      return { ok: false, code: "ALREADY_ON_WAITING_LIST" };
    }
    if (
      input.coacheeLevelSortOrder === null ||
      input.classLevelSortOrder === null ||
      !isWithinReach(input.coacheeLevelSortOrder, input.classLevelSortOrder)
    ) {
      return { ok: false, code: "LEVEL_MISMATCH" };
    }
    if (input.waitingListCount >= WaitingListPolicy.MAX_LIST_SIZE) {
      return { ok: false, code: "WAITING_LIST_FULL" };
    }
    return { ok: true };
  }

  isEligibleForWaitingList(input: JoinEligibilityInput): boolean {
    return this.assertJoinEligible(input).ok;
  }

  ownsEntry(actorId: string, entryCoacheeId: string): boolean {
    return actorId === entryCoacheeId;
  }

  hasOpenSpots(input: {
    classType: ClassType;
    enrollmentCount: number;
    capacity: number;
  }): boolean {
    return input.enrollmentCount < input.capacity;
  }

  notificationTypeForJoin(): number {
    return 9;
  }

  notificationTypeForLeave(): number {
    return 10;
  }

  static readonly GROUP_CAPACITY: number = GROUP_MAX_COACHEES;
}
