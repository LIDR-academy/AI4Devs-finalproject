export const GYM_TIMEZONE = "Europe/Madrid";

function zonedOffsetMs(instant: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(instant);
  const values: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
  return asUtc - instant.getTime();
}

export function toGymIsoDateTime(date: string, time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));

  const guess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
  const offsetGuess = zonedOffsetMs(guess, GYM_TIMEZONE);
  const adjusted = new Date(guess.getTime() - offsetGuess);
  const offsetAdjusted = zonedOffsetMs(adjusted, GYM_TIMEZONE);
  const verified = new Date(adjusted.getTime() - (offsetAdjusted - offsetGuess));
  return verified.toISOString();
}
