import type { ClassType, PrismaClient } from "@prisma/client";
import type { CalendarProvider } from "../../domain/ports/CalendarProvider.js";

export interface UpdateTrainingClassData {
  classType?: ClassType;
  levelId?: string;
  startTime?: Date;
  description?: string;
}

export class UpdateTrainingClass {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly calendar: CalendarProvider,
  ) {}

  async execute(id: string, data: UpdateTrainingClassData) {
    const existing = await this.prisma.trainingClass.findUniqueOrThrow({ where: { id } });

    const classType = data.classType ?? existing.class_type;
    const levelId = data.levelId ?? existing.level_id;
    const startTime = data.startTime ?? existing.start_time;
    const durationMinutes = existing.duration_minutes;
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const levelName = levelId
      ? ((await this.prisma.level.findUnique({ where: { id: levelId } }))?.name ?? "")
      : "";
    const title = levelName
      ? `${classType.replace("_", " ")} - ${levelName}`
      : classType.replace("_", " ");

    if (existing.google_event_id) {
      await this.calendar.updateEvent(existing.google_event_id, {
        title,
        startTime,
        endTime,
        timezone: "Europe/Madrid",
        description: data.description ?? existing.description ?? undefined,
      });
    }

    return this.prisma.trainingClass.update({
      where: { id },
      data: {
        class_type: classType,
        level_id: levelId ?? null,
        start_time: startTime,
        description: data.description ?? null,
      },
      include: {
        assignedCoach: true,
        level: true,
        enrollments: { include: { coachee: true } },
        waitingLists: true,
      },
    });
  }
}
