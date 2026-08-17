import { describe, expect, it } from "vitest";
import { isWithinReach } from "./ReachCalculator.js";

describe("ReachCalculator", () => {
  it("returns true when the coachee level matches the class level", () => {
    expect(isWithinReach(3, 3)).toBe(true);
  });

  it("returns true when the coachee is one level above the class level", () => {
    expect(isWithinReach(4, 3)).toBe(true);
  });

  it("returns true when the coachee is one level below the class level", () => {
    expect(isWithinReach(2, 3)).toBe(true);
  });

  it("returns false when the coachee is two or more levels above the class level", () => {
    expect(isWithinReach(5, 3)).toBe(false);
  });

  it("returns false when the coachee is two or more levels below the class level", () => {
    expect(isWithinReach(1, 3)).toBe(false);
  });

  it("handles boundary levels correctly", () => {
    expect(isWithinReach(1, 1)).toBe(true);
    expect(isWithinReach(5, 5)).toBe(true);
    expect(isWithinReach(1, 5)).toBe(false);
  });
});
