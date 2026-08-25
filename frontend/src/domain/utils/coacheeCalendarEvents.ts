import "temporal-polyfill/global";
import type { CalendarEventExternal } from "@schedule-x/calendar";
import type { TrainingClass } from "@/domain/types/class";
import { GYM_TIMEZONE } from "@/domain/utils/gymDateTime";

export const COACHEE_VISIBILITY_COLORS = {
  blue: "#3b82f6",
  green: "#10b981",
  gray: "#6b7280",
} as const;

export const COACHEE_BUSY_TITLE = "Busy";

export function coacheeEventTitle(trainingClass: TrainingClass): string {
  if (trainingClass.status === "CANCELED") {
    return COACHEE_BUSY_TITLE;
  }
  if (trainingClass.visibility === "gray") {
    return COACHEE_BUSY_TITLE;
  }
  if (trainingClass.classType === "GROUP") {
    return trainingClass.level ? `Group class - ${trainingClass.level.name}` : "Group class";
  }
  return "Individual class";
}

export function toCoacheeCalendarEvent(trainingClass: TrainingClass): CalendarEventExternal {
  const start = Temporal.Instant.from(trainingClass.startTime);
  const end = start
    .add({ minutes: trainingClass.durationMinutes })
    .toZonedDateTimeISO(GYM_TIMEZONE);
  const canceled = trainingClass.status === "CANCELED";
  const visibility = canceled ? "gray" : (trainingClass.visibility ?? "gray");

  return {
    id: trainingClass.id,
    title: coacheeEventTitle(trainingClass),
    start: start.toZonedDateTimeISO(GYM_TIMEZONE),
    end,
    _options: { disableDND: true, disableResize: true },
    kind: "CLASS",
    classType: trainingClass.classType,
    coachName: trainingClass.assignedCoach.name,
    cellColor: COACHEE_VISIBILITY_COLORS[visibility],
    levelName: trainingClass.level?.name ?? null,
    status: trainingClass.status,
    isRecurring: trainingClass.isRecurring,
    enrollmentCount: trainingClass.enrollmentCount,
    capacity: trainingClass.capacity,
  };
}

export type CoacheeCalendarEventShape = CalendarEventExternal & {
  kind: "CLASS";
  classType: TrainingClass["classType"];
  coachName: string;
  cellColor: string;
  levelName: string | null;
  status: TrainingClass["status"];
  isRecurring: boolean;
  enrollmentCount: number;
  capacity: number;
};
