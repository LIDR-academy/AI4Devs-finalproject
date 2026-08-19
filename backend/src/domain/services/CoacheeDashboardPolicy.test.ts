import { describe, expect, it } from "vitest";
import {
  CoacheeDashboardPolicy,
  type PolicyClass,
  type PolicyEnrolledClass,
  type PolicyViewerContext,
  type PolicyWaitingListEntry,
} from "./CoacheeDashboardPolicy.js";

const policy = new CoacheeDashboardPolicy();

const NOW = new Date("2026-03-24T12:00:00.000Z");

function cls(overrides: Partial<PolicyClass> = {}): PolicyClass {
  return {
    id: "cl-1",
    class_type: "GROUP",
    status: "ACTIVE",
    start_time: new Date("2026-08-19T10:00:00.000Z"),
    level: { sort_order: 3 },
    enrollments: [],
    ...overrides,
  };
}

function enrolled(policyClass: PolicyClass): PolicyEnrolledClass {
  return { class: policyClass };
}

function viewer(overrides: Partial<PolicyViewerContext> = {}): PolicyViewerContext {
  return { viewerId: "viewer-1", viewerLevelSortOrder: 3, ...overrides };
}

function waitingEntry(status: "ACTIVE" | "CANCELED" = "ACTIVE"): PolicyWaitingListEntry {
  return { class: { status } };
}

const threeSeats = [
  { coachee_id: "a" },
  { coachee_id: "b" },
  { coachee_id: "c" },
  { coachee_id: "d" },
];

describe("CoacheeDashboardPolicy.pickNextClass", () => {
  it("returns null when the Coachee has no enrollments", () => {
    expect(policy.pickNextClass([], NOW)).toBeNull();
  });

  it("returns null when the only enrolled class is in the past", () => {
    const input = [enrolled(cls({ start_time: new Date("2026-03-20T10:00:00.000Z") }))];
    expect(policy.pickNextClass(input, NOW)).toBeNull();
  });

  it("returns null when the only enrolled class is canceled even though future", () => {
    const input = [enrolled(cls({ status: "CANCELED" }))];
    expect(policy.pickNextClass(input, NOW)).toBeNull();
  });

  it("picks the single future ACTIVE class", () => {
    const input = [enrolled(cls({ start_time: new Date("2026-03-25T10:00:00.000Z") }))];
    expect(policy.pickNextClass(input, NOW)?.id).toBe("cl-1");
  });

  it("accepts a future ACTIVE class that starts exactly at now", () => {
    const input = [enrolled(cls({ id: "boundary", start_time: NOW }))];
    expect(policy.pickNextClass(input, NOW)?.id).toBe("boundary");
  });

  it("returns the soonest of several future ACTIVE classes", () => {
    const input = [
      enrolled(cls({ id: "later", start_time: new Date("2026-03-27T10:00:00.000Z") })),
      enrolled(cls({ id: "sooner", start_time: new Date("2026-03-25T10:00:00.000Z") })),
    ];
    expect(policy.pickNextClass(input, NOW)?.id).toBe("sooner");
  });

  it("ignores past and canceled classes when a future ACTIVE class exists", () => {
    const input = [
      enrolled(cls({ id: "canceled", status: "CANCELED" })),
      enrolled(cls({ id: "past", start_time: new Date("2026-03-20T10:00:00.000Z") })),
      enrolled(cls({ id: "winner", start_time: new Date("2026-03-25T10:00:00.000Z") })),
    ];
    expect(policy.pickNextClass(input, NOW)?.id).toBe("winner");
  });
});

describe("CoacheeDashboardPolicy.isJoinable", () => {
  it("is true for an open ACTIVE group class within reach", () => {
    expect(policy.isJoinable(cls(), viewer())).toBe(true);
  });

  it("is false for an individual class even when open and within reach", () => {
    expect(policy.isJoinable(cls({ class_type: "INDIVIDUAL" }), viewer())).toBe(false);
  });

  it("is false for a canceled group class", () => {
    expect(policy.isJoinable(cls({ status: "CANCELED" }), viewer())).toBe(false);
  });

  it("is false when the Coachee is already enrolled", () => {
    expect(policy.isJoinable(cls({ enrollments: [{ coachee_id: "viewer-1" }] }), viewer())).toBe(
      false,
    );
  });

  it("is false when the Coachee has no level", () => {
    expect(policy.isJoinable(cls(), viewer({ viewerLevelSortOrder: null }))).toBe(false);
  });

  it("is false when the class has no level", () => {
    expect(policy.isJoinable(cls({ level: null }), viewer())).toBe(false);
  });

  it("is false when the class is two levels away", () => {
    expect(policy.isJoinable(cls({ level: { sort_order: 5 } }), viewer())).toBe(false);
  });

  it("is true when the class is one level above the Coachee", () => {
    expect(policy.isJoinable(cls({ level: { sort_order: 4 } }), viewer())).toBe(true);
  });

  it("is true when the class is one level below the Coachee", () => {
    expect(policy.isJoinable(cls({ level: { sort_order: 2 } }), viewer())).toBe(true);
  });

  it("is false when the class is full (4/4 enrolled)", () => {
    expect(policy.isJoinable(cls({ enrollments: threeSeats }), viewer())).toBe(false);
  });

  it("is true when the class has 3/4 enrolled (one seat left)", () => {
    const open = [{ coachee_id: "a" }, { coachee_id: "b" }, { coachee_id: "c" }];
    expect(policy.isJoinable(cls({ enrollments: open }), viewer())).toBe(true);
  });

  it("is false when multiple conditions conflict at once", () => {
    expect(
      policy.isJoinable(
        cls({
          status: "CANCELED",
          class_type: "INDIVIDUAL",
          enrollments: threeSeats,
          level: { sort_order: 5 },
        }),
        viewer({ viewerLevelSortOrder: null }),
      ),
    ).toBe(false);
  });
});

describe("CoacheeDashboardPolicy.filterJoinable", () => {
  it("returns only the joinable classes", () => {
    const offered = [
      cls({ id: "open", start_time: new Date("2026-03-25T10:00:00.000Z") }),
      cls({ id: "full", enrollments: threeSeats }),
      cls({ id: "individual", class_type: "INDIVIDUAL" }),
    ];
    expect(policy.filterJoinable(offered, viewer()).map((c) => c.id)).toEqual(["open"]);
  });

  it("returns an empty array when nothing is joinable", () => {
    expect(policy.filterJoinable([cls({ status: "CANCELED" })], viewer())).toEqual([]);
    expect(policy.filterJoinable([], viewer())).toEqual([]);
  });

  it("preserves the input order of the joinable entries", () => {
    const a = cls({ id: "a", start_time: new Date("2026-03-25T10:00:00.000Z") });
    const b = cls({ id: "b", start_time: new Date("2026-03-26T10:00:00.000Z") });
    expect(policy.filterJoinable([b, a], viewer()).map((c) => c.id)).toEqual(["b", "a"]);
  });
});

describe("CoacheeDashboardPolicy.countActiveWaitingLists", () => {
  it("counts only entries on ACTIVE classes", () => {
    const entries = [waitingEntry("ACTIVE"), waitingEntry("CANCELED"), waitingEntry("ACTIVE")];
    expect(policy.countActiveWaitingLists(entries)).toBe(2);
  });

  it("returns 0 when there are no entries", () => {
    expect(policy.countActiveWaitingLists([])).toBe(0);
  });

  it("returns 0 when every entry is on a CANCELED class", () => {
    expect(
      policy.countActiveWaitingLists([waitingEntry("CANCELED"), waitingEntry("CANCELED")]),
    ).toBe(0);
  });
});

describe("CoacheeDashboardPolicy.joinableWindow", () => {
  it("starts at midnight of the current Madrid calendar day (CET)", () => {
    const { start } = policy.joinableWindow(new Date("2026-03-24T12:00:00.000Z"));
    expect(start).toEqual(new Date("2026-03-23T23:00:00.000Z"));
  });

  it("ends 10 wall-clock days after the start across a DST transition", () => {
    const { end } = policy.joinableWindow(new Date("2026-03-24T12:00:00.000Z"));
    expect(end).toEqual(new Date("2026-04-02T22:00:00.000Z"));
  });

  it("uses the Madrid calendar date, not UTC, for start of today", () => {
    const { start } = policy.joinableWindow(new Date("2026-03-24T23:30:00.000Z"));
    expect(start).toEqual(new Date("2026-03-24T23:00:00.000Z"));
  });

  it("computes window boundaries in summer (CEST)", () => {
    const { start, end } = policy.joinableWindow(new Date("2026-08-19T09:00:00.000Z"));
    expect(start).toEqual(new Date("2026-08-18T22:00:00.000Z"));
    expect(end).toEqual(new Date("2026-08-28T22:00:00.000Z"));
  });

  it("returns a start strictly before the end", () => {
    const { start, end } = policy.joinableWindow(NOW);
    expect(start.getTime()).toBeLessThan(end.getTime());
  });
});
