import {
  addWallClockDays,
  GYM_TIMEZONE,
  zonedDateTimeToUtc,
  zonedWallClockParts,
} from "./TimeZoneMath.js";

export const DEFAULT_RECURRING_INSTANCE_COUNT = 12;
export const WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

export function generateWeeklyDates(
  firstOccurrence: Date,
  count: number,
  timeZone: string = GYM_TIMEZONE,
): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < count; i++) {
    dates.push(addWallClockDays(firstOccurrence, i * 7, timeZone));
  }
  return dates;
}

export function combineDateWithTime(
  startDate: Date,
  startDateTime: Date,
  timeZone: string = GYM_TIMEZONE,
): Date {
  const wallClock = zonedWallClockParts(startDateTime, timeZone);
  const startDateStr = startDate.toISOString().slice(0, 10);
  return zonedDateTimeToUtc(startDateStr, wallClock.time, timeZone);
}
