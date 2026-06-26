/**
 * Mon–Sun (UTC) week helpers for the zero-waste streak and weekly badge evaluation.
 */
import { DAY_MS } from "./scoring";

const WEEK_MS = 7 * DAY_MS;

/** Returns midnight UTC of the Monday that starts the week containing `date`. */
export function getWeekStart(date: Date): Date {
  const utcMidnight = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayOfWeek = utcMidnight.getUTCDay(); // 0 = Sunday … 6 = Saturday
  const shiftToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  utcMidnight.setUTCDate(utcMidnight.getUTCDate() + shiftToMonday);
  return utcMidnight;
}

export interface WeekEvent {
  type: string;
  occurredAt: Date;
}

/**
 * Number of consecutive completed Mon–Sun weeks (ending with the most recently completed week)
 * that each had at least one event and zero wasted items. The in-progress current week is ignored.
 */
export function computeWeeklyStreak(events: WeekEvent[], now: Date): number {
  const currentWeekStart = getWeekStart(now).getTime();

  // Aggregate per-week activity: weekStart(ms) → { hasEvent, hasWaste }.
  const weeks = new Map<number, { hasEvent: boolean; hasWaste: boolean }>();
  for (const event of events) {
    const weekStart = getWeekStart(event.occurredAt).getTime();
    if (weekStart >= currentWeekStart) continue; // skip current/in-progress week
    const entry = weeks.get(weekStart) ?? { hasEvent: false, hasWaste: false };
    entry.hasEvent = true;
    if (event.type === "WASTED") entry.hasWaste = true;
    weeks.set(weekStart, entry);
  }

  let streak = 0;
  let weekStart = currentWeekStart - WEEK_MS; // most recently completed week
  // Bound the walk so a pathological dataset cannot loop unbounded.
  for (let i = 0; i < 520; i += 1) {
    const entry = weeks.get(weekStart);
    if (!entry || !entry.hasEvent || entry.hasWaste) break;
    streak += 1;
    weekStart -= WEEK_MS;
  }
  return streak;
}
