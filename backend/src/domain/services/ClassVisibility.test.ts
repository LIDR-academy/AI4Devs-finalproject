import { describe, expect, it } from "vitest";
import { classifyVisibility, type VisibilityClassLike } from "./ClassVisibility.js";
import { isWithinReach } from "./ReachCalculator.js";

const fullClass = (overrides: Partial<VisibilityClassLike> = {}): VisibilityClassLike => ({
  class_type: "GROUP",
  level: { sort_order: 3 },
  enrollments: [
    { coachee_id: "c1" },
    { coachee_id: "c2" },
    { coachee_id: "c3" },
    { coachee_id: "c4" },
  ],
  ...overrides,
});

const groupClass = (level: number, coacheeIds: string[]) => ({
  class_type: "GROUP" as "GROUP",
  level: { sort_order: level },
  enrollments: coacheeIds.map((coachee_id) => ({ coachee_id })),
});

const viewer = (viewerId: string, viewerLevelSortOrder: number | null) => ({
  viewerId,
  viewerLevelSortOrder,
});

describe("classifyVisibility", () => {
  it("returns blue when the viewer is enrolled", () => {
    const result = classifyVisibility(groupClass(3, ["v", "a"]), viewer("v", 3));
    expect(result).toBe("blue");
  });

  it("returns green for a group class within reach with an open spot", () => {
    const result = classifyVisibility(groupClass(3, ["a", "b", "c"]), viewer("v", 3));
    expect(result).toBe("green");
  });

  it("returns green for a group class one level above reach", () => {
    const result = classifyVisibility(groupClass(4, ["a"]), viewer("v", 3));
    expect(result).toBe("green");
  });

  it("returns gray for a full group class even when within reach", () => {
    const result = classifyVisibility(fullClass(), viewer("v", 3));
    expect(result).toBe("gray");
  });

  it("returns gray for a group class out of reach with an open spot", () => {
    const result = classifyVisibility(groupClass(1, ["a"]), viewer("v", 3));
    expect(result).toBe("gray");
  });

  it("returns gray when the viewer has no level assigned", () => {
    const result = classifyVisibility(groupClass(3, ["a"]), viewer("v", null));
    expect(result).toBe("gray");
  });

  it("returns gray for an individual class the viewer is not enrolled in", () => {
    const result = classifyVisibility(
      { class_type: "INDIVIDUAL" as "INDIVIDUAL", level: null, enrollments: [{ coachee_id: "x" }] },
      viewer("v", 3),
    );
    expect(result).toBe("gray");
  });

  it("returns gray for a class without a level", () => {
    const result = classifyVisibility(
      { class_type: "GROUP" as "GROUP", level: null, enrollments: [] },
      viewer("v", 3),
    );
    expect(result).toBe("gray");
  });

  it("isWithinReach boundary is consistent (adjacent levels reachable, two away not)", () => {
    expect(isWithinReach(3, 3)).toBe(true);
    expect(isWithinReach(3, 4)).toBe(true);
    expect(isWithinReach(3, 5)).toBe(false);
  });
});
