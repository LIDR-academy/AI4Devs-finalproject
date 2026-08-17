import type { PrismaClient } from "@prisma/client";

export class ListTrainingClasses {
  constructor(private readonly prisma: PrismaClient) {}

  async execute() {
    return this.prisma.trainingClass.findMany({
      include: {
        assignedCoach: true,
        level: true,
        enrollments: { include: { coachee: true } },
        waitingLists: true,
      },
      orderBy: { start_time: "asc" },
    });
  }
}
