import { describe, expect, it } from "vitest";
import type { TrainingClass } from "@/domain/types/class";
import { sortClassesByGymTime } from "@/domain/utils/todaySchedule";

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
    isRecurring: false,
    recurrenceSeriesId: null,
    ...overrides,
  };
}

describe("sortClassesByGymTime", () => {
  it("orders classes chronologically by gym-timezone wall-clock start time", () => {
    const classes = [
      buildClass({
        id: "class-3",
        startTime: "2026-08-18T16:00:00.000Z",
        enrolledCoachees: [{ id: "coachee-3", name: "Marc" }],
      }),
      buildClass({
        id: "class-1",
        startTime: "2026-08-18T05:00:00.000Z",
        enrolledCoachees: [{ id: "coachee-1", name: "Lucia" }],
      }),
      buildClass({
        id: "class-2",
        startTime: "2026-08-18T07:00:00.000Z",
        enrolledCoachees: [{ id: "coachee-2", name: "Tomas" }],
      }),
    ];

    const sorted = sortClassesByGymTime(classes);
    expect(sorted.map((c) => c.id)).toEqual(["class-1", "class-2", "class-3"]);
    expect(classes.map((c) => c.id)).toEqual(["class-3", "class-1", "class-2"]);
  });

  it("returns an empty array for empty input", () => {
    expect(sortClassesByGymTime([])).toEqual([]);
  });
});
