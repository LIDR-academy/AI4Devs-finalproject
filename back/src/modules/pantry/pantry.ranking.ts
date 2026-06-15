/**
 * Pantry use-next ranking — canonical implementation.
 *
 * Scoring formula:
 *   score = daysUntilExpiration(item.expirationDate, now)
 *   Items without an expiration date receive Number.MAX_SAFE_INTEGER (lowest urgency).
 *   Negative scores mean the item has already expired (highest urgency).
 *
 * Tie-break chain (all ascending):
 *   1. Exact expiration timestamp (ms) — distinguishes same-day items with different times.
 *   2. createdAt — older pantry entries first (first-in, first-out).
 *   3. id (lexicographic) — guarantees deterministic ordering for identical inputs.
 *
 * Optional signal (not scored in MVP):
 *   Consumption recency from ConsumptionEvent could be used in a future iteration to
 *   surface "forgotten" pantry items. Tie-break 2 (createdAt) already captures a related
 *   signal without the query cost.
 */

export interface UseNextCandidate {
  id: string;
  expirationDate: Date | null;
  createdAt: Date;
}

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

function toUtcStartOfDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

export function daysUntilExpiration(expirationDate: Date, now: Date): number {
  const start = toUtcStartOfDay(now);
  const end = toUtcStartOfDay(expirationDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

export function riskFromDays(days: number | null): RiskLevel {
  if (days === null) {
    return "LOW";
  }
  if (days <= 1) {
    return "HIGH";
  }
  if (days <= 3) {
    return "MEDIUM";
  }
  return "LOW";
}

export function compareUseNextCandidates(
  a: UseNextCandidate,
  b: UseNextCandidate,
  now: Date,
): number {
  const aDays = a.expirationDate ? daysUntilExpiration(a.expirationDate, now) : Number.MAX_SAFE_INTEGER;
  const bDays = b.expirationDate ? daysUntilExpiration(b.expirationDate, now) : Number.MAX_SAFE_INTEGER;

  if (aDays !== bDays) {
    return aDays - bDays;
  }

  // Tie-break 1: exact expiration timestamp
  const aExp = a.expirationDate ? a.expirationDate.getTime() : Number.MAX_SAFE_INTEGER;
  const bExp = b.expirationDate ? b.expirationDate.getTime() : Number.MAX_SAFE_INTEGER;
  if (aExp !== bExp) {
    return aExp - bExp;
  }

  // Tie-break 2: older items in pantry first
  const createdDiff = a.createdAt.getTime() - b.createdAt.getTime();
  if (createdDiff !== 0) {
    return createdDiff;
  }

  // Tie-break 3: stable ID ordering
  return a.id.localeCompare(b.id);
}
