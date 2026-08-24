export interface WaitingListEntry {
  id: string;
  classId: string;
  coacheeId: string;
  joinedAt: Date;
}

export interface WaitingListRepository {
  findByClassId(classId: string): Promise<WaitingListEntry[]>;
  findByClassIdAndCoacheeId(classId: string, coacheeId: string): Promise<WaitingListEntry | null>;
  deleteByClassIdAndCoacheeId(classId: string, coacheeId: string): Promise<void>;
}
