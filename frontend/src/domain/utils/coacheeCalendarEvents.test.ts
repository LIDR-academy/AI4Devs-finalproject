import { describe, expect, it } from "vitest";
import type { TrainingClass } from "@/domain/types/class";
import {
  COACHEE_BUSY_TITLE,
  COACHEE_VISIBILITY_COLORS,
  coacheeEventTitle,
  toCoacheeCalendarEvent,
} from "./coacheeCalendarEvents";

function classRow(overrides: Partial<TrainingClass> = {}): TrainingClass {
  return {
    id: "cl-1",
    classType: "GROUP",
    assignedCoach: { id: "coach-1", name: "Coach Uno" },
    level: { id: "lv-1", name: "Intermedio", color: "#fff", sortOrder: 3 },
    startTime: "2026-08-19T18:00:00.000Z",
    durationMinutes: 60,
    status: "ACTIVE",
    description: null,
    enrolledCoachees: [{ id: "c1", name: "Otro Coachee" }],
    enrollmentCount: 1,
    capacity: 4,
    hasWaitingList: false,
    waitingListCount: 0,
    isRecurring: false,
    recurrenceSeriesId: null,
    visibility: "green",
    ...overrides,
  };
}

describe("COACHEE_VISIBILITY_COLORS", () => {
  it("maps blue to the own-class blue", () => {
    expect(COACHEE_VISIBILITY_COLORS.blue).toBe("#3b82f6");
  });

  it("maps green to the joinable green", () => {
    expect(COACHEE_VISIBILITY_COLORS.green).toBe("#10b981");
  });

  it("maps gray to the neutral gray", () => {
    expect(COACHEE_VISIBILITY_COLORS.gray).toBe("#6b7280");
  });
});

describe("coacheeEventTitle", () => {
  it("titles a gray entry as Busy without any coachee name", () => {
    const title = coacheeEventTitle(classRow({ visibility: "gray" }));
    expect(title).toBe(COACHEE_BUSY_TITLE);
    expect(title).not.toContain("Otro Coachee");
  });

  it("titles a canceled class as Busy regardless of its visibility", () => {
    const title = coacheeEventTitle(
      classRow({ status: "CANCELED", visibility: "blue", classType: "INDIVIDUAL" }),
    );
    expect(title).toBe(COACHEE_BUSY_TITLE);
  });

  it("titles a green group class with its level name", () => {
    expect(coacheeEventTitle(classRow({ visibility: "green" }))).toBe("Group class - Intermedio");
  });

  it("titles a blue group class with its level name", () => {
    expect(coacheeEventTitle(classRow({ visibility: "blue" }))).toBe("Group class - Intermedio");
  });

  it("never renders a coachee name for an individual class", () => {
    const title = coacheeEventTitle(classRow({ classType: "INDIVIDUAL", visibility: "blue" }));
    expect(title).toBe("Individual class");
    expect(title).not.toContain("Otro Coachee");
  });
});

describe("toCoacheeCalendarEvent", () => {
  it("colors a blue class blue", () => {
    expect(toCoacheeCalendarEvent(classRow({ visibility: "blue" })).cellColor).toBe("#3b82f6");
  });

  it("colors a green class green", () => {
    expect(toCoacheeCalendarEvent(classRow({ visibility: "green" })).cellColor).toBe("#10b981");
  });

  it("colors a gray class gray", () => {
    expect(toCoacheeCalendarEvent(classRow({ visibility: "gray" })).cellColor).toBe("#6b7280");
  });

  it("colors a canceled class gray even when visibility is blue", () => {
    const event = toCoacheeCalendarEvent(classRow({ status: "CANCELED", visibility: "blue" }));
    expect(event.cellColor).toBe("#6b7280");
    expect(event.title).toBe(COACHEE_BUSY_TITLE);
  });

  it("preserves recurrence and level metadata", () => {
    const event = toCoacheeCalendarEvent(
      classRow({ visibility: "green", isRecurring: true, recurrenceSeriesId: "s-1" }),
    );
    expect(event.levelName).toBe("Intermedio");
    expect(event.isRecurring).toBe(true);
    expect(event.coachName).toBe("Coach Uno");
    expect(event.status).toBe("ACTIVE");
    expect(event.enrollmentCount).toBe(1);
    expect(event.capacity).toBe(4);
  });

  it("titles gray events as Busy in the calendar payload", () => {
    const event = toCoacheeCalendarEvent(classRow({ visibility: "gray" }));
    expect(event.title).toBe(COACHEE_BUSY_TITLE);
  });
});
