import type { ClassType, ListMeta } from "@/domain/types/class";

export interface WaitingListEntry {
  id: string;
  classId: string;
  coacheeId: string;
  joinedAt: string;
}

export type JoinWaitingListResponse = WaitingListEntry;

export interface LeaveWaitingListResponse {
  message: string;
}

export interface WaitingListItem {
  id: string;
  class: {
    id: string;
    classType: ClassType;
    startTime: string;
    level: { name: string; color: string } | null;
    assignedCoach: { name: string };
  };
  joinedAt: string;
  hasOpenSpots: boolean;
}

export interface WaitingListListResponse {
  data: WaitingListItem[];
  meta: ListMeta;
}
