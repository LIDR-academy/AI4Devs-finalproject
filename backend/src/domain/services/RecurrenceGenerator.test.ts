import { describe, expect, it } from "vitest";
import { combineDateWithTime, generateWeeklyDates } from "./RecurrenceGenerator.js";
import { zonedDateTimeToUtc, zonedWallClockParts } from "./TimeZoneMath.js";

describe("RecurrenceGenerator", () => {
  describe("generateWeeklyDates", () => {
    it("generates exactly the requested number of instances", () => {
      const first = zonedDateTimeToUtc("2026-08-17", "10:00");
      expect(generateWeeklyDates(first, 12)).toHaveLength(12);
    });

    it("keeps the same Madrid weekday and wall-clock time for every instance", () => {
      const first = zonedDateTimeToUtc("2026-08-17", "10:00");
      const dates = generateWeeklyDates(first, 6);
      for (const date of dates) {
        const parts = zonedWallClockParts(date);
        expect(parts.weekday).toBe(1);
        expect(parts.time).toBe("10:00");
      }
    });

    it("keeps wall-clock time stable across a DST transition", () => {
      const first = zonedDateTimeToUtc("2026-03-22", "15:00");
      const dates = generateWeeklyDates(first, 2);
      expect(zonedWallClockParts(dates[0]).date).toBe("2026-03-22");
      expect(zonedWallClockParts(dates[1]).date).toBe("2026-03-29");
      expect(zonedWallClockParts(dates[1]).time).toBe("15:00");
      expect(dates[1].toISOString()).toBe("2026-03-29T13:00:00.000Z");
    });

    it("returns an empty array when count is zero", () => {
      expect(generateWeeklyDates(new Date(), 0)).toHaveLength(0);
    });
  });

  describe("combineDateWithTime", () => {
    it("applies the Madrid time-of-day from startDateTime to startDate", () => {
      const date = new Date("2026-08-20T00:00:00.000Z");
      const dateTime = zonedDateTimeToUtc("2026-08-10", "09:30");
      const combined = combineDateWithTime(date, dateTime);
      expect(combined.toISOString()).toBe("2026-08-20T07:30:00.000Z");
      expect(zonedWallClockParts(combined).time).toBe("09:30");
    });
  });
});
