export interface UserRecord {
  id: string;
  name: string;
  role: "ADMIN" | "COACH" | "COACHEE";
}

export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
}
