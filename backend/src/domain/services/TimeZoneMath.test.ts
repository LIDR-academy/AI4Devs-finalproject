import { describe, expect, it } from "vitest";
import { addWallClockDays, zonedDateTimeToUtc, zonedWallClockParts } from "./TimeZoneMath.js";

describe("TimeZoneMath", () => {
  describe("zonedDateTimeToUtc", () => {
    it("converts a winter wall-clock time (CET, UTC+1)", () => {
      expect(zonedDateTimeToUtc("2026-01-15", "15:00").toISOString()).toBe(
        "2026-01-15T14:00:00.000Z",
      );
    });

    it("converts a summer wall-clock time (CEST, UTC+2)", () => {
      expect(zonedDateTimeToUtc("2026-08-17", "15:00").toISOString()).toBe(
        "2026-08-17T13:00:00.000Z",
      );
    });

    it("handles the spring-forward transition (nonexistent local hour)", () => {
      expect(zonedDateTimeToUtc("2026-03-29", "03:00").toISOString()).toBe(
        "2026-03-29T01:00:00.000Z",
      );
    });

    it("handles the fall-back transition", () => {
      expect(zonedDateTimeToUtc("2026-10-25", "03:00").toISOString()).toBe(
        "2026-10-25T02:00:00.000Z",
      );
    });
  });

  describe("zonedWallClockParts", () => {
    it("returns the Madrid wall-clock date, time, and weekday", () => {
      const parts = zonedWallClockParts(new Date("2026-08-17T13:00:00.000Z"));
      expect(parts.date).toBe("2026-08-17");
      expect(parts.time).toBe("15:00");
      expect(parts.weekday).toBe(1);
    });
  });

  describe("addWallClockDays", () => {
    it("keeps the wall-clock time stable across a DST transition", () => {
      const base = zonedDateTimeToUtc("2026-03-22", "15:00");
      const shifted = addWallClockDays(base, 7);
      const parts = zonedWallClockParts(shifted);
      expect(parts.date).toBe("2026-03-29");
      expect(parts.time).toBe("15:00");
      expect(shifted.toISOString()).toBe("2026-03-29T13:00:00.000Z");
    });
  });
});
