import type { ClassVisibility, CoacheeStatus, TrainingClass } from "@/domain/types/class";

export type CalendarInteractionKind =
  | "cancel"
  | "join"
  | "waitlist-join"
  | "waitlist-leave"
  | "claim"
  | "info";

export type CalendarInteractionReason = "canceled" | "out-of-reach" | "not-open" | null;

export interface CalendarInteraction {
  kind: CalendarInteractionKind;
  reason: CalendarInteractionReason;
}

export type ClassOptimisticAction =
  | "join"
  | "cancel"
  | "waitlist-join"
  | "waitlist-leave"
  | "claim";

interface InteractionInput {
  classType: TrainingClass["classType"];
  status: TrainingClass["status"];
  visibility: TrainingClass["visibility"];
  coacheeStatus?: CoacheeStatus;
  enrollmentCount: number;
  capacity: number;
}

export function deriveCalendarInteraction(input: InteractionInput): CalendarInteraction {
  const { classType, status, visibility, coacheeStatus, enrollmentCount, capacity } = input;
  if (status === "CANCELED") {
    return { kind: "info", reason: "canceled" };
  }
  if (coacheeStatus?.isEnrolled) {
    return { kind: "cancel", reason: null };
  }
  if (visibility === "blue") {
    return { kind: "cancel", reason: null };
  }
  if (visibility === "green") {
    return { kind: "join", reason: null };
  }
  if (!coacheeStatus) {
    return { kind: "info", reason: "not-open" };
  }
  if (coacheeStatus.isOnWaitingList) {
    const hasOpenSpot = enrollmentCount < capacity;
    return hasOpenSpot ? { kind: "claim", reason: null } : { kind: "waitlist-leave", reason: null };
  }
  if (!coacheeStatus.isWithinReach) {
    return { kind: "info", reason: "out-of-reach" };
  }
  const groupFull = classType === "GROUP" && enrollmentCount >= capacity;
  const individualOccupied = classType === "INDIVIDUAL" && enrollmentCount >= 1;
  if (groupFull || individualOccupied) {
    return { kind: "waitlist-join", reason: null };
  }
  return { kind: "info", reason: "not-open" };
}

export function applyOptimisticClassUpdate(
  cls: TrainingClass,
  action: ClassOptimisticAction,
): TrainingClass {
  const coacheeStatus: CoacheeStatus = { ...(cls.coacheeStatus ?? null) } as CoacheeStatus;
  switch (action) {
    case "join":
      return {
        ...cls,
        visibility: "blue" as ClassVisibility,
        coacheeStatus: { ...coacheeStatus, isEnrolled: true },
        enrollmentCount: cls.enrollmentCount + 1,
      };
    case "cancel":
      return {
        ...cls,
        visibility: (cls.classType === "GROUP" ? "green" : "gray") as ClassVisibility,
        coacheeStatus: { ...coacheeStatus, isEnrolled: false },
        enrollmentCount: Math.max(0, cls.enrollmentCount - 1),
      };
    case "waitlist-join":
      return {
        ...cls,
        visibility: "gray" as ClassVisibility,
        coacheeStatus: { ...coacheeStatus, isOnWaitingList: true },
        waitingListCount: cls.waitingListCount + 1,
      };
    case "waitlist-leave":
      return {
        ...cls,
        visibility: "gray" as ClassVisibility,
        coacheeStatus: { ...coacheeStatus, isOnWaitingList: false },
        waitingListCount: Math.max(0, cls.waitingListCount - 1),
      };
    case "claim":
      return {
        ...cls,
        visibility: "blue" as ClassVisibility,
        coacheeStatus: { ...coacheeStatus, isEnrolled: true, isOnWaitingList: false },
        enrollmentCount: cls.enrollmentCount + 1,
        waitingListCount: Math.max(0, cls.waitingListCount - 1),
      };
  }
}
