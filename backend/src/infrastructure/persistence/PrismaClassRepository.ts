import type { PrismaClient } from "@prisma/client";
import type { ClassRepository, ClassWithRelations } from "../../domain/ports/ClassRepository.js";

export class PrismaClassRepository implements ClassRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByIdWithEnrollmentsAndWaitingLists(
    classId: string,
  ): Promise<ClassWithRelations | null> {
    const cls = await this.prisma.trainingClass.findUnique({
      where: { id: classId },
      include: {
        enrollments: { select: { id: true, coachee_id: true } },
        waitingLists: { select: { id: true, coachee_id: true } },
        level: { select: { id: true, name: true, sort_order: true } },
        assignedCoach: { select: { id: true, name: true } },
      },
    });
    if (!cls) return null;
    return {
      id: cls.id,
      classType: cls.class_type,
      status: cls.status,
      assignedCoachId: cls.assigned_coach_id,
      startTime: cls.start_time,
      enrollments: cls.enrollments.map((e) => ({ id: e.id, coacheeId: e.coachee_id })),
      waitingLists: cls.waitingLists.map((w) => ({ id: w.id, coacheeId: w.coachee_id })),
      level: cls.level
        ? { id: cls.level.id, name: cls.level.name, sortOrder: cls.level.sort_order }
        : null,
      assignedCoach: { id: cls.assignedCoach.id, name: cls.assignedCoach.name },
    };
  }
}
