export type ClassType = "INDIVIDUAL" | "GROUP";

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
