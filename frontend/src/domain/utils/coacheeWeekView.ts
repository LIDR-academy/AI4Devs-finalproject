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

export function isCoacheeRelevant(trainingClass: TrainingClass): boolean {
  return trainingClass.visibility === "blue" || trainingClass.visibility === "green";
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
