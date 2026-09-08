export const GYM_TIMEZONE = "Europe/Madrid";

export interface ZonedWallClockParts {
  date: string;
  time: string;
  weekday: number;
}

const WEEKDAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatZoned(
  instant: Date,
  timeZone: string,
  includeWeekday: boolean,
): Record<string, string> {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    ...(includeWeekday ? { weekday: "short" as const } : {}),
  });

  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(instant)) {
    if (part.type !== "literal") {
      parts[part.type] = part.value;
    }
  }
  return parts;
}

function zonedOffsetMs(instant: Date, timeZone: string): number {
  const parts = formatZoned(instant, timeZone, false);
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - instant.getTime();
}

export function zonedDateTimeToUtc(
  date: string,
  time: string,
  timeZone: string = GYM_TIMEZONE,
): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));

  const guess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
  const offsetGuess = zonedOffsetMs(guess, timeZone);
  const adjusted = new Date(guess.getTime() - offsetGuess);
  const offsetAdjusted = zonedOffsetMs(adjusted, timeZone);
  const verified = new Date(adjusted.getTime() - (offsetAdjusted - offsetGuess));
  return verified;
}

export function zonedWallClockParts(
  instant: Date,
  timeZone: string = GYM_TIMEZONE,
): ZonedWallClockParts {
  const parts = formatZoned(instant, timeZone, true);
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
    weekday: WEEKDAY_ORDER.indexOf(parts.weekday ?? ""),
  };
}

export function addWallClockDays(
  instant: Date,
  days: number,
  timeZone: string = GYM_TIMEZONE,
): Date {
  const parts = zonedWallClockParts(instant, timeZone);
  const [years, months, daysOfMonth] = parts.date.split("-").map(Number);
  const targetDate = new Date(Date.UTC(years, months - 1, daysOfMonth + days));
  const targetDateStr = targetDate.toISOString().slice(0, 10);
  return zonedDateTimeToUtc(targetDateStr, parts.time, timeZone);
}
