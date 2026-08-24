export interface ClassWithRelations {
  id: string;
  classType: "INDIVIDUAL" | "GROUP";
  status: "ACTIVE" | "CANCELED";
  assignedCoachId: string;
  startTime: Date;
  enrollments: Array<{ id: string; coacheeId: string }>;
  waitingLists: Array<{ id: string; coacheeId: string }>;
  level: { id: string; name: string; sortOrder: number } | null;
  assignedCoach: { id: string; name: string };
}

export interface ClassRepository {
  findByIdWithEnrollmentsAndWaitingLists(classId: string): Promise<ClassWithRelations | null>;
}
