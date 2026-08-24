export interface EnrollmentRecord {
  id: string;
  classId: string;
  coacheeId: string;
  joinedAt: Date;
}

export interface EnrollmentRepository {
  create(input: { classId: string; coacheeId: string }): Promise<EnrollmentRecord>;
  findByClassIdAndCoacheeId(classId: string, coacheeId: string): Promise<EnrollmentRecord | null>;
}
