export interface UserRecord {
  id: string;
  name: string;
  role: "ADMIN" | "COACH" | "COACHEE";
  levelId?: string | null;
  levelSortOrder?: number | null;
}

export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findActiveCoacheesByLevelReach(classSortOrder: number): Promise<UserRecord[]>;
}
