import type { ClassStatus, ClassType } from "@prisma/client";

export interface AssignedCoachDTO {
  id: string;
  name: string;
}

export interface LevelDTO {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
}

export interface EnrolledCoacheeDTO {
  id: string;
  name: string;
}

export interface TrainingClassDTO {
  id: string;
  classType: ClassType;
  assignedCoach: AssignedCoachDTO;
  level: LevelDTO | null;
  startTime: string;
  durationMinutes: number;
  status: ClassStatus;
  description: string | null;
  enrolledCoachees: EnrolledCoacheeDTO[];
  enrollmentCount: number;
  capacity: number;
  hasWaitingList: boolean;
  waitingListCount: number;
  isRecurring: boolean;
  recurrenceSeriesId: string | null;
}

export interface TrainingClassRowLike {
  id: string;
  class_type: ClassType;
  assignedCoach: { id: string; name: string };
  level: { id: string; name: string; color: string; sort_order: number } | null;
  start_time: Date;
  duration_minutes: number;
  status: ClassStatus;
  description: string | null;
  recurrence_series_id: string | null;
  enrollments: Array<{ coachee: { id: string; name: string } }>;
  waitingLists: unknown[];
}

export function toTrainingClassDTO(row: TrainingClassRowLike): TrainingClassDTO {
  const enrolledCoachees = row.enrollments.map((enrollment) => ({
    id: enrollment.coachee.id,
    name: enrollment.coachee.name,
  }));

  return {
    id: row.id,
    classType: row.class_type,
    assignedCoach: {
      id: row.assignedCoach.id,
      name: row.assignedCoach.name,
    },
    level: row.level
      ? {
          id: row.level.id,
          name: row.level.name,
          color: row.level.color,
          sortOrder: row.level.sort_order,
        }
      : null,
    startTime: row.start_time.toISOString(),
    durationMinutes: row.duration_minutes,
    status: row.status,
    description: row.description,
    enrolledCoachees,
    enrollmentCount: enrolledCoachees.length,
    capacity: row.class_type === "GROUP" ? 4 : 1,
    hasWaitingList: row.waitingLists.length > 0,
    waitingListCount: row.waitingLists.length,
    isRecurring: row.recurrence_series_id !== null,
    recurrenceSeriesId: row.recurrence_series_id,
  };
}
