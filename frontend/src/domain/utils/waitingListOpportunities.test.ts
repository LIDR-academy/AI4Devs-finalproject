import { describe, expect, it } from "vitest";
import type { CoacheeWaitlistEligibleClass } from "@/domain/types/coachee";
import {
  waitingListOpportunitiesEmptyCopy,
  waitingListOpportunitySummary,
} from "./waitingListOpportunities";

const sample: CoacheeWaitlistEligibleClass = {
  id: "cl-wl",
  classType: "GROUP",
  startTime: "2026-08-19T18:00:00.000Z",
  level: { id: "lv-1", name: "Intermedio", color: "#facc15" },
  assignedCoach: { id: "coach-1", name: "Coach Uno" },
  enrollmentCount: 4,
  capacity: 4,
  isWithinReach: true,
  isOnWaitingList: false,
};

describe("waitingListOpportunitiesEmptyCopy", () => {
  it("is distinct from the open-spot section empty copy", () => {
    const { title, description } = waitingListOpportunitiesEmptyCopy();
    expect(title).not.toBe("No classes to join right now");
    expect(title.length).toBeGreaterThan(0);
    expect(description.length).toBeGreaterThan(0);
  });

  it("mentions full classes and waiting-list space", () => {
    const copy = waitingListOpportunitiesEmptyCopy();
    expect(copy.title).toMatch(/waiting list/i);
    expect(copy.description).toMatch(/full/i);
  });
});

describe("waitingListOpportunitySummary", () => {
  it("renders every displayed field joined by separators", () => {
    const summary = waitingListOpportunitySummary(sample);
    expect(summary).toContain("Group class");
    expect(summary).toContain("Intermedio");
    expect(summary).toContain("Coach Uno");
    expect(summary).toContain("4/4");
    expect(summary).toContain(" · ");
  });

  it("uses Madrid wall-clock time for the date (summer CEST)", () => {
    expect(waitingListOpportunitySummary(sample)).toContain("20:00");
  });

  it("survives a whitespace-only coach name", () => {
    const summary = waitingListOpportunitySummary({
      ...sample,
      assignedCoach: { id: "coach-1", name: "  " },
    });
    expect(summary).not.toBe("");
  });
});
