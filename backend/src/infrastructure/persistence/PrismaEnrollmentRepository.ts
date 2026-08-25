import type { PrismaClient } from "@prisma/client";
import type {
  EnrollmentRecord,
  EnrollmentRepository,
} from "../../domain/ports/EnrollmentRepository.js";

export class PrismaEnrollmentRepository implements EnrollmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: { classId: string; coacheeId: string }): Promise<EnrollmentRecord> {
    const enrollment = await this.prisma.classEnrollment.create({
      data: {
        class_id: input.classId,
        coachee_id: input.coacheeId,
      },
    });
    return {
      id: enrollment.id,
      classId: enrollment.class_id,
      coacheeId: enrollment.coachee_id,
      joinedAt: enrollment.joined_at,
    };
  }

  async findByClassIdAndCoacheeId(
    classId: string,
    coacheeId: string,
  ): Promise<EnrollmentRecord | null> {
    const enrollment = await this.prisma.classEnrollment.findUnique({
      where: {
        class_id_coachee_id: {
          class_id: classId,
          coachee_id: coacheeId,
        },
      },
    });
    if (!enrollment) return null;
    return {
      id: enrollment.id,
      classId: enrollment.class_id,
      coacheeId: enrollment.coachee_id,
      joinedAt: enrollment.joined_at,
    };
  }
}
