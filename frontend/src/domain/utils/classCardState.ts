import type { ClassType, ClassVisibility, CoacheeStatus } from "@/domain/types/class";

export type ClassCardAction = "join" | "cancel" | "waiting-list" | "leave" | "claim" | "none";

export type ClassCardReason = "canceled" | "individual" | "out-of-reach" | null;

export interface ClassCardState {
  action: ClassCardAction;
  reason: ClassCardReason;
}

export interface ClassCardStateInput {
  classType: ClassType;
  status: "ACTIVE" | "CANCELED";
  enrollmentCount: number;
  capacity: number;
  visibility?: ClassVisibility;
  coacheeStatus?: CoacheeStatus;
}

function fallbackFromVisibility(visibility: ClassVisibility | undefined): {
  isEnrolled: boolean;
  isWithinReach: boolean;
} {
  switch (visibility) {
    case "blue":
      return { isEnrolled: true, isWithinReach: true };
    case "green":
      return { isEnrolled: false, isWithinReach: true };
    default:
      return { isEnrolled: false, isWithinReach: false };
  }
}

export function deriveClassCardState(input: ClassCardStateInput): ClassCardState {
  if (input.status !== "ACTIVE") {
    return { action: "none", reason: "canceled" };
  }

  const fallback = fallbackFromVisibility(input.visibility);
  const isEnrolled = input.coacheeStatus?.isEnrolled ?? fallback.isEnrolled;
  const isOnWaitingList = input.coacheeStatus?.isOnWaitingList ?? false;
  const isWithinReach = input.coacheeStatus?.isWithinReach ?? fallback.isWithinReach;

  if (isEnrolled) {
    return { action: "cancel", reason: null };
  }
  if (isOnWaitingList) {
    const hasOpenSpot = input.enrollmentCount < input.capacity;
    return hasOpenSpot ? { action: "claim", reason: null } : { action: "leave", reason: null };
  }
  if (input.classType === "INDIVIDUAL") {
    return { action: "none", reason: "individual" };
  }

  const isFull = input.enrollmentCount >= input.capacity;
  if (isFull) {
    return isWithinReach
      ? { action: "waiting-list", reason: null }
      : { action: "none", reason: "out-of-reach" };
  }

  return isWithinReach
    ? { action: "join", reason: null }
    : { action: "none", reason: "out-of-reach" };
}
