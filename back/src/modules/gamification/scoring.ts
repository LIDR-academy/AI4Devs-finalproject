/**
 * Pure scoring helpers shared by the points engine and the summary aggregation, so the
 * "before expiry" / "days to spare" judgement is defined in exactly one place.
 */
export const DAY_MS = 24 * 60 * 60 * 1000;

export function isConsumedBeforeExpiry(occurredAt: Date, expiry: Date | null): boolean {
  return expiry !== null && occurredAt.getTime() < expiry.getTime();
}

export function hasThreeDaysToSpare(occurredAt: Date, expiry: Date): boolean {
  return expiry.getTime() - occurredAt.getTime() >= 3 * DAY_MS;
}

export interface PointRow {
  delta: number;
  reason: "CONSUMED_BEFORE_EXPIRY" | "BONUS_3_DAYS" | "WASTED";
}

export interface ScorableEvent {
  type: string;
  occurredAt: Date;
  itemExpirationDate: Date | null;
}

/** Returns the `UserPoints` rows to persist for a consumption event (empty for 0-point cases). */
export function computePointRows(event: ScorableEvent): PointRow[] {
  if (event.type === "WASTED") {
    return [{ delta: -5, reason: "WASTED" }];
  }
  if (event.type === "CONSUMED" && isConsumedBeforeExpiry(event.occurredAt, event.itemExpirationDate)) {
    const rows: PointRow[] = [{ delta: 10, reason: "CONSUMED_BEFORE_EXPIRY" }];
    if (hasThreeDaysToSpare(event.occurredAt, event.itemExpirationDate as Date)) {
      rows.push({ delta: 5, reason: "BONUS_3_DAYS" });
    }
    return rows;
  }
  return [];
}
