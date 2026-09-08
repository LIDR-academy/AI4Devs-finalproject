import type { ClassStatus, ClassType } from "@prisma/client";

export type ClassVisibility = "blue" | "green" | "gray";

export interface CoacheeStatusDTO {
  isEnrolled: boolean;
  isOnWaitingList: boolean;
  isWithinReach: boolean;
}

export interface ListMetaDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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
  waitingListCoachees: EnrolledCoacheeDTO[];
  isRecurring: boolean;
  recurrenceSeriesId: string | null;
  visibility?: ClassVisibility;
  coacheeStatus?: CoacheeStatusDTO;
}

export type WaitingListRowLike =
  | { coachee: { id: string; name: string } }
  | { id: string; class_id: string; coachee_id: string; joined_at: Date };

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
  waitingLists: WaitingListRowLike[];
}

export interface ToTrainingClassDTOOptions {
  viewerRole?: string;
  viewerId?: string;
  visibility?: ClassVisibility;
  coacheeStatus?: CoacheeStatusDTO;
  revealCoacheeNames?: boolean;
}

export function toTrainingClassDTO(
  row: TrainingClassRowLike,
  options: ToTrainingClassDTOOptions = {},
): TrainingClassDTO {
  const { viewerRole, viewerId, visibility, coacheeStatus, revealCoacheeNames } = options;
  const isOwnClass =
    viewerRole === "COACHEE" &&
    row.enrollments.some((enrollment) => enrollment.coachee.id === viewerId);
  const canRevealNames =
    revealCoacheeNames ?? (viewerRole !== "COACHEE" || isOwnClass || visibility === "blue");

  const enrolledCoachees = canRevealNames
    ? row.enrollments.map((enrollment) => ({
        id: enrollment.coachee.id,
        name: enrollment.coachee.name,
      }))
    : [];

  const waitingListCoachees = canRevealNames
    ? row.waitingLists.flatMap((entry) =>
        "coachee" in entry && entry.coachee
          ? [{ id: entry.coachee.id, name: entry.coachee.name }]
          : [],
      )
    : [];

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
    enrollmentCount: canRevealNames ? enrolledCoachees.length : row.enrollments.length,
    capacity: row.class_type === "GROUP" ? 4 : 1,
    hasWaitingList: row.waitingLists.length > 0,
    waitingListCount: row.waitingLists.length,
    waitingListCoachees,
    isRecurring: row.recurrence_series_id !== null,
    recurrenceSeriesId: row.recurrence_series_id,
    ...(visibility ? { visibility } : {}),
    ...(coacheeStatus ? { coacheeStatus } : {}),
  };
}
