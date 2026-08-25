import "temporal-polyfill/global";
import type { CalendarEventExternal } from "@schedule-x/calendar";
import type { ClassType, TrainingClass } from "@/domain/types/class";
import { GYM_TIMEZONE } from "@/domain/utils/gymDateTime";

export const CLASS_TYPE_COLORS: Record<ClassType, string> = {
  INDIVIDUAL: "#3b82f6",
  GROUP: "#10b981",
};

export const CANCELED_CLASS_COLOR = "#6b7280";

export function gymTodayDate(): string {
  return Temporal.Now.zonedDateTimeISO(GYM_TIMEZONE).toPlainDate().toString();
}

export function currentGymWeekBounds(): { start: string; end: string } {
  const today = Temporal.Now.zonedDateTimeISO(GYM_TIMEZONE);
  const dayOfWeek = today.dayOfWeek;
  const start = today
    .subtract({ days: dayOfWeek - 1 })
    .toPlainDate()
    .toString();
  const end = today
    .add({ days: 7 - dayOfWeek })
    .toPlainDate()
    .toString();
  return { start, end };
}

export function addDays(isoDate: string, days: number): string {
  return Temporal.PlainDate.from(isoDate).add({ days }).toString();
}

export function weekBoundsOf(isoDate: string): { start: string; end: string } {
  const date = Temporal.PlainDate.from(isoDate);
  const start = date.subtract({ days: date.dayOfWeek - 1 });
  return { start: start.toString(), end: start.add({ days: 6 }).toString() };
}

export function classEventTitle(trainingClass: TrainingClass): string {
  if (trainingClass.classType === "GROUP") {
    return trainingClass.level ? `Group class - ${trainingClass.level.name}` : "Group class";
  }
  return trainingClass.enrolledCoachees[0]?.name ?? "Individual";
}

export function toClassCalendarEvent(trainingClass: TrainingClass): CalendarEventExternal {
  const startInstant = Temporal.Instant.from(trainingClass.startTime);
  const end = startInstant
    .add({ minutes: trainingClass.durationMinutes })
    .toZonedDateTimeISO(GYM_TIMEZONE);

  const cellColor =
    trainingClass.status === "CANCELED"
      ? CANCELED_CLASS_COLOR
      : CLASS_TYPE_COLORS[trainingClass.classType];

  return {
    id: trainingClass.id,
    title: classEventTitle(trainingClass),
    start: startInstant.toZonedDateTimeISO(GYM_TIMEZONE),
    end,
    _options: { disableDND: true, disableResize: true },
    kind: "CLASS",
    classType: trainingClass.classType,
    coachName: trainingClass.assignedCoach.name,
    cellColor,
    levelName: trainingClass.level?.name ?? null,
    status: trainingClass.status,
    isRecurring: trainingClass.isRecurring,
    enrollmentCount: trainingClass.enrollmentCount,
    capacity: trainingClass.capacity,
  };
}

export type ClassCalendarEventShape = CalendarEventExternal & {
  kind: "CLASS";
  classType: ClassType;
  coachName: string;
  cellColor: string;
  levelName: string | null;
  status: "ACTIVE" | "CANCELED";
  isRecurring: boolean;
  enrollmentCount: number;
  capacity: number;
};
