import type { CoacheeNextClass } from "@/domain/types/coachee";
import { GYM_TIMEZONE } from "@/domain/utils/gymDateTime";

export function hasNextClass(nextClass: CoacheeNextClass | null): nextClass is CoacheeNextClass {
  return nextClass !== null;
}

export function formatNextClassTime(startIso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: GYM_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(startIso));
}
