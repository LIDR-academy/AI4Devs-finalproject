import "temporal-polyfill/global";
import type { TrainingClass } from "@/domain/types/class";
import { GYM_TIMEZONE } from "@/domain/utils/gymDateTime";

export function gymDayKey(startTime: string): string {
  return Temporal.Instant.from(startTime).toZonedDateTimeISO(GYM_TIMEZONE).toPlainDate().toString();
}

export function weekDays(startDate: string): string[] {
  const start = Temporal.PlainDate.from(startDate);
  return Array.from({ length: 7 }, (_, index) => start.add({ days: index }).toString());
}

export function isWithinReach(coacheeSortOrder: number, classSortOrder: number): boolean {
  return Math.abs(coacheeSortOrder - classSortOrder) <= 1;
}

export function isRelevantBusyClass(
  trainingClass: TrainingClass,
  coacheeLevelSortOrder: number | null | undefined,
): boolean {
  if (trainingClass.classType !== "GROUP" || !trainingClass.level) {
    return false;
  }
  if (coacheeLevelSortOrder === null || coacheeLevelSortOrder === undefined) {
    return false;
  }
  return isWithinReach(coacheeLevelSortOrder, trainingClass.level.sortOrder);
}

export function isCalendarClass(
  trainingClass: TrainingClass,
  coacheeLevelSortOrder?: number | null,
): boolean {
  if (trainingClass.visibility === "blue" || trainingClass.visibility === "green") {
    return true;
  }
  if (trainingClass.visibility !== "gray") {
    return false;
  }
  return isRelevantBusyClass(trainingClass, coacheeLevelSortOrder);
}

export function isOnWaitingListFor(
  entries: ReadonlyArray<{ class: { id: string } }>,
  classId: string,
): boolean {
  return entries.some((entry) => entry.class.id === classId);
}

export function groupClassesByDay(
  trainingClasses: TrainingClass[],
  days: string[],
): Record<string, TrainingClass[]> {
  const daySet = new Set(days);
  const grouped: Record<string, TrainingClass[]> = {};
  for (const day of days) {
    grouped[day] = [];
  }
  for (const trainingClass of trainingClasses) {
    const day = gymDayKey(trainingClass.startTime);
    if (daySet.has(day)) {
      grouped[day].push(trainingClass);
    }
  }
  for (const day of days) {
    grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
  return grouped;
}
