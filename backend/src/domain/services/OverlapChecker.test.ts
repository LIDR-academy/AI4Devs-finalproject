import { describe, expect, it } from "vitest";
import { hasOverlap, overlaps, type TimeInterval } from "./OverlapChecker.js";

function interval(start: number, end: number): TimeInterval {
  return { start: new Date(2000, 0, 1, start), end: new Date(2000, 0, 1, end) };
}

describe("OverlapChecker", () => {
  describe("overlaps", () => {
    it("returns true when a fully contains b", () => {
      expect(overlaps(interval(8, 11), interval(9, 10))).toBe(true);
    });

    it("returns true when b fully contains a", () => {
      expect(overlaps(interval(9, 10), interval(8, 11))).toBe(true);
    });

    it("returns true when intervals partially overlap", () => {
      expect(overlaps(interval(8, 10), interval(9, 11))).toBe(true);
    });

    it("returns true for identical intervals", () => {
      expect(overlaps(interval(8, 9), interval(8, 9))).toBe(true);
    });

    it("returns false when intervals touch at a single point", () => {
      expect(overlaps(interval(8, 9), interval(9, 10))).toBe(false);
    });

    it("returns false when intervals are adjacent", () => {
      expect(overlaps(interval(7, 8), interval(8, 9))).toBe(false);
    });

    it("returns false when intervals are far apart", () => {
      expect(overlaps(interval(7, 8), interval(9, 10))).toBe(false);
    });
  });

  describe("hasOverlap", () => {
    it("returns true when at least one interval overlaps the target", () => {
      const intervals = [interval(7, 8), interval(9, 10)];
      expect(hasOverlap(intervals, interval(8, 10))).toBe(true);
    });

    it("returns false when no interval overlaps the target", () => {
      const intervals = [interval(7, 8), interval(9, 10)];
      expect(hasOverlap(intervals, interval(8, 9))).toBe(false);
    });

    it("returns false for an empty interval list", () => {
      expect(hasOverlap([], interval(8, 9))).toBe(false);
    });
  });
});
