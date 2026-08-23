import { describe, expect, it } from "vitest";
import type { CoacheeStatus, TrainingClass } from "@/domain/types/class";
import { applyOptimisticClassUpdate, deriveCalendarInteraction } from "./calendarInteraction";

function classRow(overrides: Partial<TrainingClass> = {}): TrainingClass {
  return {
    id: "cl-1",
    classType: "GROUP",
    assignedCoach: { id: "coach-1", name: "Coach Uno" },
    level: { id: "lv-1", name: "Intermedio", color: "#fff", sortOrder: 3 },
    startTime: "2026-08-22T16:00:00.000Z",
    durationMinutes: 60,
    status: "ACTIVE",
    description: null,
    enrolledCoachees: [],
    enrollmentCount: 0,
    capacity: 4,
    hasWaitingList: false,
    waitingListCount: 0,
    waitingListCoachees: [],
    isRecurring: false,
    recurrenceSeriesId: null,
    visibility: "blue",
    coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: false },
    ...overrides,
  };
}

function status(overrides: Partial<CoacheeStatus> = {}): CoacheeStatus {
  return { isEnrolled: false, isOnWaitingList: false, isWithinReach: false, ...overrides };
}

describe("deriveCalendarInteraction", () => {
  it("blue -> cancel", () => {
    expect(
      deriveCalendarInteraction({
        classType: "GROUP",
        status: "ACTIVE",
        visibility: "blue",
        coacheeStatus: status({ isEnrolled: true, isWithinReach: true }),
        enrollmentCount: 2,
        capacity: 4,
      }),
    ).toEqual({ kind: "cancel", reason: null });
  });

  it("green -> join", () => {
    expect(
      deriveCalendarInteraction({
        classType: "GROUP",
        status: "ACTIVE",
        visibility: "green",
        coacheeStatus: status(),
        enrollmentCount: 1,
        capacity: 4,
      }),
    ).toEqual({ kind: "join", reason: null });
  });

  it("gray full group within reach -> waitlist-join", () => {
    expect(
      deriveCalendarInteraction({
        classType: "GROUP",
        status: "ACTIVE",
        visibility: "gray",
        coacheeStatus: status({ isWithinReach: true }),
        enrollmentCount: 4,
        capacity: 4,
      }),
    ).toEqual({ kind: "waitlist-join", reason: null });
  });

  it("gray occupied individual within reach -> waitlist-join", () => {
    expect(
      deriveCalendarInteraction({
        classType: "INDIVIDUAL",
        status: "ACTIVE",
        visibility: "gray",
        coacheeStatus: status({ isWithinReach: true }),
        enrollmentCount: 1,
        capacity: 1,
      }),
    ).toEqual({ kind: "waitlist-join", reason: null });
  });

  it("gray already on waiting list -> waitlist-leave", () => {
    expect(
      deriveCalendarInteraction({
        classType: "GROUP",
        status: "ACTIVE",
        visibility: "gray",
        coacheeStatus: status({ isWithinReach: true, isOnWaitingList: true }),
        enrollmentCount: 4,
        capacity: 4,
      }),
    ).toEqual({ kind: "waitlist-leave", reason: null });
  });

  it("gray out-of-reach -> info", () => {
    expect(
      deriveCalendarInteraction({
        classType: "GROUP",
        status: "ACTIVE",
        visibility: "gray",
        coacheeStatus: status({ isWithinReach: false }),
        enrollmentCount: 4,
        capacity: 4,
      }),
    ).toEqual({ kind: "info", reason: "out-of-reach" });
  });

  it("gray group not full within reach -> info not-open", () => {
    expect(
      deriveCalendarInteraction({
        classType: "GROUP",
        status: "ACTIVE",
        visibility: "gray",
        coacheeStatus: status({ isWithinReach: true }),
        enrollmentCount: 2,
        capacity: 4,
      }),
    ).toEqual({ kind: "info", reason: "not-open" });
  });

  it("gray individual not full within reach -> info not-open", () => {
    expect(
      deriveCalendarInteraction({
        classType: "INDIVIDUAL",
        status: "ACTIVE",
        visibility: "gray",
        coacheeStatus: status({ isWithinReach: true }),
        enrollmentCount: 0,
        capacity: 1,
      }),
    ).toEqual({ kind: "info", reason: "not-open" });
  });

  it("canceled class -> info canceled regardless of visibility", () => {
    expect(
      deriveCalendarInteraction({
        classType: "GROUP",
        status: "CANCELED",
        visibility: "blue",
        coacheeStatus: status({ isEnrolled: true }),
        enrollmentCount: 2,
        capacity: 4,
      }),
    ).toEqual({ kind: "info", reason: "canceled" });
  });

  it("enrolled full group without visibility (detail view) -> cancel, never waitlist-join", () => {
    expect(
      deriveCalendarInteraction({
        classType: "GROUP",
        status: "ACTIVE",
        visibility: undefined,
        coacheeStatus: status({ isEnrolled: true, isWithinReach: true }),
        enrollmentCount: 4,
        capacity: 4,
      }),
    ).toEqual({ kind: "cancel", reason: null });
  });

  it("enrolled occupied individual without visibility (detail view) -> cancel, never waitlist-join", () => {
    expect(
      deriveCalendarInteraction({
        classType: "INDIVIDUAL",
        status: "ACTIVE",
        visibility: undefined,
        coacheeStatus: status({ isEnrolled: true, isWithinReach: true }),
        enrollmentCount: 1,
        capacity: 1,
      }),
    ).toEqual({ kind: "cancel", reason: null });
  });

  it("unknown visibility without coacheeStatus -> info not-open", () => {
    expect(
      deriveCalendarInteraction({
        classType: "GROUP",
        status: "ACTIVE",
        visibility: undefined,
        coacheeStatus: undefined,
        enrollmentCount: 0,
        capacity: 4,
      }),
    ).toEqual({ kind: "info", reason: "not-open" });
  });
});

describe("applyOptimisticClassUpdate", () => {
  it("join: green -> blue, isEnrolled true, enrollmentCount+1", () => {
    const cls = classRow({ visibility: "green", coacheeStatus: status() });
    const next = applyOptimisticClassUpdate(cls, "join");
    expect(next.visibility).toBe("blue");
    expect(next.coacheeStatus?.isEnrolled).toBe(true);
    expect(next.enrollmentCount).toBe(1);
    expect(next.id).toBe(cls.id);
    expect(next).not.toBe(cls);
  });

  it("cancel group: blue -> green, isEnrolled false, enrollmentCount-1", () => {
    const cls = classRow({
      classType: "GROUP",
      visibility: "blue",
      coacheeStatus: status({ isEnrolled: true }),
      enrollmentCount: 2,
    });
    const next = applyOptimisticClassUpdate(cls, "cancel");
    expect(next.visibility).toBe("green");
    expect(next.coacheeStatus?.isEnrolled).toBe(false);
    expect(next.enrollmentCount).toBe(1);
    expect(next).not.toBe(cls);
  });

  it("cancel individual: blue -> gray, isEnrolled false, enrollmentCount-1", () => {
    const cls = classRow({
      classType: "INDIVIDUAL",
      visibility: "blue",
      coacheeStatus: status({ isEnrolled: true }),
      enrollmentCount: 1,
      capacity: 1,
    });
    const next = applyOptimisticClassUpdate(cls, "cancel");
    expect(next.visibility).toBe("gray");
    expect(next.coacheeStatus?.isEnrolled).toBe(false);
    expect(next.enrollmentCount).toBe(0);
  });

  it("waitlist-join: gray stays gray, isOnWaitingList true, waitingListCount+1", () => {
    const cls = classRow({
      visibility: "gray",
      coacheeStatus: status({ isWithinReach: true }),
      waitingListCount: 2,
    });
    const next = applyOptimisticClassUpdate(cls, "waitlist-join");
    expect(next.visibility).toBe("gray");
    expect(next.coacheeStatus?.isOnWaitingList).toBe(true);
    expect(next.waitingListCount).toBe(3);
    expect(next).not.toBe(cls);
  });

  it("waitlist-leave: gray stays gray, isOnWaitingList false, waitingListCount-1", () => {
    const cls = classRow({
      visibility: "gray",
      coacheeStatus: status({ isWithinReach: true, isOnWaitingList: true }),
      waitingListCount: 3,
    });
    const next = applyOptimisticClassUpdate(cls, "waitlist-leave");
    expect(next.visibility).toBe("gray");
    expect(next.coacheeStatus?.isOnWaitingList).toBe(false);
    expect(next.waitingListCount).toBe(2);
    expect(next).not.toBe(cls);
  });

  it("preserves unrelated fields (startTime, coach, level)", () => {
    const cls = classRow({ visibility: "green", coacheeStatus: status() });
    const next = applyOptimisticClassUpdate(cls, "join");
    expect(next.startTime).toBe(cls.startTime);
    expect(next.assignedCoach).toBe(cls.assignedCoach);
    expect(next.level).toBe(cls.level);
    expect(next.status).toBe("ACTIVE");
  });
});
