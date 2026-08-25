import "temporal-polyfill/global";
import type { TrainingClass } from "@/domain/types/class";
import { GYM_TIMEZONE } from "@/domain/utils/gymDateTime";

export function sortClassesByGymTime(classes: TrainingClass[]): TrainingClass[] {
  return [...classes].sort((a, b) => {
    const aWallClock = wallClockMinutes(a.startTime);
    const bWallClock = wallClockMinutes(b.startTime);
    if (aWallClock !== bWallClock) {
      return aWallClock - bWallClock;
    }
    return a.id.localeCompare(b.id);
  });
}

function wallClockMinutes(isoInstant: string): number {
  const zdt = Temporal.Instant.from(isoInstant).toZonedDateTimeISO(GYM_TIMEZONE);
  return zdt.hour * 60 + zdt.minute;
}
