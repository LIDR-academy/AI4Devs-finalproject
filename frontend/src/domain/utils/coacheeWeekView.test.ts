import { describe, expect, it } from "vitest";
import type { TrainingClass } from "@/domain/types/class";
import { groupClassesByDay, gymDayKey, isCoacheeRelevant, weekDays } from "./coacheeWeekView";

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

describe("isCoacheeRelevant", () => {
  it("keeps enrolled (blue) and joinable (green) classes", () => {
    expect(isCoacheeRelevant(classRow({ visibility: "blue" }))).toBe(true);
    expect(isCoacheeRelevant(classRow({ visibility: "green" }))).toBe(true);
  });

  it("excludes busy (gray) or unknown visibility classes", () => {
    expect(isCoacheeRelevant(classRow({ visibility: "gray" }))).toBe(false);
    expect(isCoacheeRelevant(classRow({ visibility: undefined }))).toBe(false);
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
