export interface UseNextCandidate {
  id: string;
  expirationDate: Date | null;
  createdAt: Date;
}

function toUtcStartOfDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

export function daysUntilExpiration(expirationDate: Date, now: Date): number {
  const start = toUtcStartOfDay(now);
  const end = toUtcStartOfDay(expirationDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
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

  const aExp = a.expirationDate ? a.expirationDate.getTime() : Number.MAX_SAFE_INTEGER;
  const bExp = b.expirationDate ? b.expirationDate.getTime() : Number.MAX_SAFE_INTEGER;
  if (aExp !== bExp) {
    return aExp - bExp;
  }

  const createdDiff = a.createdAt.getTime() - b.createdAt.getTime();
  if (createdDiff !== 0) {
    return createdDiff;
  }

  return a.id.localeCompare(b.id);
}
