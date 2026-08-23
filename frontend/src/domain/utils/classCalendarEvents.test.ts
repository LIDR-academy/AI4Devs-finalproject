import { describe, expect, it } from "vitest";
import type { TrainingClass } from "@/domain/types/class";
import {
  addDays,
  CANCELED_CLASS_COLOR,
  CLASS_TYPE_COLORS,
  classEventTitle,
  currentGymWeekBounds,
  gymTodayDate,
  toClassCalendarEvent,
  weekBoundsOf,
} from "@/domain/utils/classCalendarEvents";

function buildClass(overrides: Partial<TrainingClass> = {}): TrainingClass {
  return {
    id: "class-1",
    classType: "INDIVIDUAL",
    assignedCoach: { id: "coach-1", name: "Ana Coach" },
    level: { id: "lvl-1", name: "Basic", color: "#50C878", sortOrder: 1 },
    startTime: "2026-08-18T07:00:00.000Z",
    durationMinutes: 60,
    status: "ACTIVE",
    description: null,
    enrolledCoachees: [{ id: "coachee-1", name: "Lucia" }],
    enrollmentCount: 1,
    capacity: 1,
    hasWaitingList: false,
    waitingListCount: 0,
    waitingListCoachees: [],
    isRecurring: false,
    recurrenceSeriesId: null,
    ...overrides,
  };
}

describe("classCalendarEvents", () => {
  it("exposes gym-local date helpers", () => {
    expect(gymTodayDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const { start, end } = currentGymWeekBounds();
    expect(start.length).toBe(10);
    expect(end.length).toBe(10);
    expect(`${start}T00:00:00` < `${end}T00:00:00`).toBe(true);
  });

  it("maps a class to a calendar event in the gym timezone", () => {
    const event = toClassCalendarEvent(buildClass());
    expect(event.id).toBe("class-1");
    expect(event.title).toBe("Lucia");
    expect(String(event.start)).toContain("Europe/Madrid");
    expect(String(event.end)).toContain("Europe/Madrid");
    const startZdt = event.start as Temporal.ZonedDateTime;
    const endZdt = event.end as Temporal.ZonedDateTime;
    const durationMs = endZdt.epochMilliseconds - startZdt.epochMilliseconds;
    expect(durationMs).toBe(60 * 60 * 1000);
    expect(event.classType).toBe("INDIVIDUAL");
    expect(event.coachName).toBe("Ana Coach");
    expect(event.cellColor).toBe("#3b82f6");
    expect(event.enrollmentCount).toBe(1);
  });

  it("titles recurring group classes with the level name", () => {
    const trainingClass = buildClass({
      classType: "GROUP",
      isRecurring: true,
      capacity: 6,
      enrolledCoachees: [{ id: "c", name: "Marc" }],
    });
    const event = toClassCalendarEvent(trainingClass);
    expect(event.title).toBe("Group class - Basic");
  });

  it("keeps canceled status", () => {
    const event = toClassCalendarEvent(buildClass({ status: "CANCELED" }));
    expect(event.status).toBe("CANCELED");
  });
});

describe("class type colors", () => {
  it("derives the cell color from the class type for individual classes", () => {
    const event = toClassCalendarEvent(buildClass());
    expect(event.cellColor).toBe(CLASS_TYPE_COLORS.INDIVIDUAL);
  });

  it("derives a different cell color for group classes", () => {
    const event = toClassCalendarEvent(buildClass({ classType: "GROUP" }));
    expect(event.cellColor).toBe(CLASS_TYPE_COLORS.GROUP);
    expect(event.cellColor).not.toBe(CLASS_TYPE_COLORS.INDIVIDUAL);
  });

  it("does not use the level color for the calendar cell", () => {
    const event = toClassCalendarEvent(
      buildClass({ level: { id: "lvl-1", name: "Basic", color: "#50C878", sortOrder: 1 } }),
    );
    expect(event.cellColor).toBe(CLASS_TYPE_COLORS.INDIVIDUAL);
    expect(event.cellColor).not.toBe("#50C878");
  });

  it("resolves canceled classes to the gray color regardless of class type", () => {
    const individual = toClassCalendarEvent(buildClass({ status: "CANCELED" }));
    const group = toClassCalendarEvent(buildClass({ classType: "GROUP", status: "CANCELED" }));
    expect(individual.cellColor).toBe(CANCELED_CLASS_COLOR);
    expect(group.cellColor).toBe(CANCELED_CLASS_COLOR);
  });
});

describe("classEventTitle", () => {
  it("uses the first enrolled coachee for individual classes", () => {
    const trainingClass = buildClass();
    expect(classEventTitle(trainingClass)).toBe("Lucia");
  });

  it("falls back for individual classes without coachees", () => {
    const trainingClass = buildClass({ enrolledCoachees: [], enrollmentCount: 0 });
    expect(classEventTitle(trainingClass)).toBe("Individual");
  });
});

describe("date helpers", () => {
  it("addDays shifts ISO dates across month boundaries", () => {
    expect(addDays("2026-08-18", 1)).toBe("2026-08-19");
    expect(addDays("2026-08-31", 1)).toBe("2026-09-01");
    expect(addDays("2026-08-18", -1)).toBe("2026-08-17");
  });

  it("weekBoundsOf returns the week containing a Tuesday", () => {
    expect(weekBoundsOf("2026-08-18")).toEqual({
      start: "2026-08-17",
      end: "2026-08-23",
    });
  });

  it("weekBoundsOf snaps a Sunday back to its Monday", () => {
    expect(weekBoundsOf("2026-08-23")).toEqual({
      start: "2026-08-17",
      end: "2026-08-23",
    });
  });

  it("weekBoundsOf keeps a Monday as the week start", () => {
    expect(weekBoundsOf("2026-08-17")).toEqual({
      start: "2026-08-17",
      end: "2026-08-23",
    });
  });
});
