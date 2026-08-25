import { describe, expect, it } from "vitest";
import type { CoacheeNextClass } from "@/domain/types/coachee";
import { formatNextClassTime, hasNextClass } from "./nextClassInfo";

const sampleNextClass: CoacheeNextClass = {
  id: "cl-1",
  classType: "GROUP",
  startTime: "2026-08-19T18:00:00.000Z",
  assignedCoach: { id: "coach-1", name: "Coach Uno" },
  level: { id: "lv-1", name: "Intermedio", color: "#fff" },
  status: "ACTIVE",
};

describe("hasNextClass", () => {
  it("is false when there is no next class", () => {
    expect(hasNextClass(null)).toBe(false);
  });

  it("is true when a next class is present", () => {
    expect(hasNextClass(sampleNextClass)).toBe(true);
  });
});

describe("formatNextClassTime", () => {
  it("renders the Madrid wall-clock hour for a summer (CEST) instant", () => {
    expect(formatNextClassTime("2026-08-19T18:00:00.000Z")).toContain("20:00");
  });

  it("renders the Madrid wall-clock hour for a winter (CET) instant", () => {
    expect(formatNextClassTime("2026-01-15T09:00:00.000Z")).toContain("10:00");
  });

  it("shifts across a midnight boundary in the gym timezone", () => {
    expect(formatNextClassTime("2026-03-24T23:00:00.000Z")).toContain("00:00");
  });
});
