import { describe, expect, it } from "vitest";
import type { TrainingClass } from "@/domain/types/class";
import {
  groupClassesByDay,
  gymDayKey,
  isCalendarClass,
  isOnWaitingListFor,
  isRelevantBusyClass,
  isWithinReach,
  weekDays,
} from "./coacheeWeekView";

const baseLevel = { id: "lv-1", name: "Intermedio", color: "#fff", sortOrder: 3 };

function classRow(overrides: Partial<TrainingClass> = {}): TrainingClass {
  return {
    id: "cl-1",
    classType: "GROUP",
    assignedCoach: { id: "coach-1", name: "Coach Uno" },
    level: baseLevel,
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
    ...overrides,
  };
}

describe("gymDayKey", () => {
  it("maps an instant to its Europe/Madrid calendar day", () => {
    expect(gymDayKey("2026-08-22T16:00:00.000Z")).toBe("2026-08-22");
  });

  it("rolls over to the next Madrid day after midnight", () => {
    expect(gymDayKey("2026-08-22T22:30:00.000Z")).toBe("2026-08-23");
  });

  it("handles the winter offset (UTC+1)", () => {
    expect(gymDayKey("2026-01-22T23:30:00.000Z")).toBe("2026-01-23");
  });
});

describe("weekDays", () => {
  it("returns the 7 days from Monday to Sunday", () => {
    expect(weekDays("2026-08-17")).toEqual([
      "2026-08-17",
      "2026-08-18",
      "2026-08-19",
      "2026-08-20",
      "2026-08-21",
      "2026-08-22",
      "2026-08-23",
    ]);
  });
});

describe("isCalendarClass", () => {
  it("keeps enrolled (blue) classes, including canceled ones", () => {
    expect(isCalendarClass(classRow({ visibility: "blue" }))).toBe(true);
    expect(isCalendarClass(classRow({ visibility: "blue", status: "CANCELED" }))).toBe(true);
  });

  it("keeps joinable (green) group classes", () => {
    expect(isCalendarClass(classRow({ visibility: "green" }))).toBe(true);
  });

  it("keeps busy (gray) group classes that are within reach of the coachee", () => {
    expect(
      isCalendarClass(classRow({ visibility: "gray", level: { ...baseLevel, sortOrder: 3 } }), 3),
    ).toBe(true);
  });

  it("drops busy (gray) group classes that are out of the coachee's reach", () => {
    expect(
      isCalendarClass(classRow({ visibility: "gray", level: { ...baseLevel, sortOrder: 5 } }), 3),
    ).toBe(false);
  });

  it("drops busy (gray) individual classes even when in reach", () => {
    expect(
      isCalendarClass(
        classRow({
          classType: "INDIVIDUAL",
          level: null,
          visibility: "gray",
        }),
        3,
      ),
    ).toBe(false);
  });

  it("drops busy (gray) group classes when the coachee has no level", () => {
    expect(isCalendarClass(classRow({ visibility: "gray" }))).toBe(false);
    expect(isCalendarClass(classRow({ visibility: "gray" }), null)).toBe(false);
  });

  it("excludes classes with unknown visibility", () => {
    expect(isCalendarClass(classRow({ visibility: undefined }))).toBe(false);
  });
});

describe("isRelevantBusyClass", () => {
  const group = classRow();

  it("is true only for group classes within reach of the coachee's level", () => {
    expect(isRelevantBusyClass(group, 3)).toBe(true);
    expect(isRelevantBusyClass(group, 2)).toBe(true);
    expect(isRelevantBusyClass(group, 4)).toBe(true);
    expect(isRelevantBusyClass(group, 5)).toBe(false);
  });

  it("is false for individual classes, missing levels, or a coachee without a level", () => {
    const individual = classRow({ classType: "INDIVIDUAL", level: null });
    const noLevel = classRow({ level: null });
    expect(isRelevantBusyClass(individual, 3)).toBe(false);
    expect(isRelevantBusyClass(noLevel, 3)).toBe(false);
    expect(isRelevantBusyClass(group, undefined)).toBe(false);
    expect(isRelevantBusyClass(group, null)).toBe(false);
  });
});

describe("isWithinReach", () => {
  it("follows the ±1 reach rule", () => {
    expect(isWithinReach(3, 3)).toBe(true);
    expect(isWithinReach(3, 2)).toBe(true);
    expect(isWithinReach(3, 4)).toBe(true);
    expect(isWithinReach(3, 5)).toBe(false);
    expect(isWithinReach(3, 1)).toBe(false);
  });
});

describe("isOnWaitingListFor", () => {
  const entries = [{ class: { id: "cl-1" } }, { class: { id: "cl-2" } }];

  it("is true when the coachee is on the waiting list for the class", () => {
    expect(isOnWaitingListFor(entries, "cl-1")).toBe(true);
    expect(isOnWaitingListFor(entries, "cl-2")).toBe(true);
  });

  it("is false for classes not in the coachee's waiting lists", () => {
    expect(isOnWaitingListFor(entries, "cl-3")).toBe(false);
    expect(isOnWaitingListFor([], "cl-1")).toBe(false);
  });
});

describe("groupClassesByDay", () => {
  const days = weekDays("2026-08-17");

  it("groups classes under their gym day and sorts by start time", () => {
    const later = classRow({ id: "late", startTime: "2026-08-22T18:00:00.000Z" });
    const earlier = classRow({ id: "early", startTime: "2026-08-22T16:00:00.000Z" });
    const grouped = groupClassesByDay([later, earlier], days);
    expect(grouped["2026-08-22"].map((c) => c.id)).toEqual(["early", "late"]);
  });

  it("gives every day an entry, empty when no classes", () => {
    const grouped = groupClassesByDay([], days);
    for (const day of days) {
      expect(grouped[day]).toEqual([]);
    }
  });

  it("drops classes that fall outside the week", () => {
    const outside = classRow({ id: "outside", startTime: "2026-09-01T16:00:00.000Z" });
    const grouped = groupClassesByDay([outside], days);
    expect(Object.values(grouped).every((list) => list.length === 0)).toBe(true);
  });
});
