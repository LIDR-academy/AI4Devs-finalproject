export const DEFAULT_REMINDER_INACTIVE_DAYS = 180;
export const MIN_REMINDER_INACTIVE_DAYS = 30;
export const MAX_REMINDER_INACTIVE_DAYS = 730;
export const MAX_REMINDER_BATCH_SIZE = 100;
export const DEFAULT_ELIGIBLE_LIMIT = 50;
export const MAX_ELIGIBLE_LIMIT = 100;

export function resolveReminderInactiveDays(
  envValue: string | undefined,
  queryDays?: number,
): number {
  if (queryDays !== undefined && Number.isFinite(queryDays)) {
    return clampDays(queryDays);
  }

  if (envValue !== undefined && envValue.trim() !== '') {
    const parsed = Number.parseInt(envValue, 10);
    if (Number.isFinite(parsed)) {
      return clampDays(parsed);
    }
  }

  return DEFAULT_REMINDER_INACTIVE_DAYS;
}

function clampDays(value: number): number {
  return Math.min(
    MAX_REMINDER_INACTIVE_DAYS,
    Math.max(MIN_REMINDER_INACTIVE_DAYS, Math.trunc(value)),
  );
}
