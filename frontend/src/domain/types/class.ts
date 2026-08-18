export type ClassType = "INDIVIDUAL" | "GROUP";

export type ClassVisibility = "blue" | "green" | "gray";

export interface CoacheeStatus {
  isEnrolled: boolean;
  isOnWaitingList: boolean;
  isWithinReach: boolean;
}

export interface ListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListClassesParams {
  start: string;
  end: string;
  classType?: ClassType;
  coachId?: string;
  page?: number;
  limit?: number;
}

export interface ListClassesResponse {
  data: TrainingClass[];
  meta: ListMeta;
}

export interface TrainingClass {
  id: string;
  classType: ClassType;
  assignedCoach: { id: string; name: string };
  level: { id: string; name: string; color: string; sortOrder: number } | null;
  startTime: string;
  durationMinutes: number;
  status: "ACTIVE" | "CANCELED";
  description: string | null;
  enrolledCoachees: Array<{ id: string; name: string }>;
  enrollmentCount: number;
  capacity: number;
  hasWaitingList: boolean;
  waitingListCount: number;
  isRecurring: boolean;
  recurrenceSeriesId: string | null;
  visibility?: ClassVisibility;
  coacheeStatus?: CoacheeStatus;
}

export type CancelClassScope = "single" | "series";

export interface CancelClassResponse {
  id: string;
  status: "ACTIVE" | "CANCELED";
  canceledInstances: number | null;
}

export interface RecurrenceInput {
  enabled: boolean;
  dayOfWeek?: number;
  startDate?: string;
}

export interface CreateClassPayload {
  classType: ClassType;
  assignedCoachId?: string;
  coacheeIds: string[];
  levelId?: string | null;
  startDateTime: string;
  description?: string | null;
  recurrence?: RecurrenceInput;
}

export interface CreateClassResponse {
  seriesId: string | null;
  recurrence: { enabled: boolean };
  instances: TrainingClass[];
}

export interface AvailableSlot {
  start: string;
  end: string;
  capacityAvailable: "individual" | "group" | "both";
}
