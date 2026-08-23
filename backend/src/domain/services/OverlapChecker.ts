export interface TimeInterval {
  start: Date;
  end: Date;
}

export function overlaps(a: TimeInterval, b: TimeInterval): boolean {
  return a.start < b.end && b.start < a.end;
}

export function hasOverlap(intervals: TimeInterval[], target: TimeInterval): boolean {
  return intervals.some((interval) => overlaps(interval, target));
}
