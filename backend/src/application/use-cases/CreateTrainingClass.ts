import type { ClassType, PrismaClient } from "@prisma/client";
import type { CalendarProvider } from "../../domain/ports/CalendarProvider.js";

export interface CreateTrainingClassData {
  classType: ClassType;
  assignedCoachId: string;
  levelId?: string;
  startTime: Date;
  description?: string;
  recurrenceSeriesId?: string;
  createdBy: string;
}

export class CreateTrainingClass {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly calendar: CalendarProvider,
  ) {}

  async execute(data: CreateTrainingClassData) {
    const durationMinutes = 60;
    const endTime = new Date(data.startTime.getTime() + durationMinutes * 60 * 1000);
    const levelName = data.levelId
      ? ((await this.prisma.level.findUnique({ where: { id: data.levelId } }))?.name ?? "")
      : "";
    const title = levelName
      ? `${data.classType.replace("_", " ")} - ${levelName}`
      : data.classType.replace("_", " ");

    const eventId = await this.calendar.createEvent({
      title,
      startTime: data.startTime,
      endTime,
      timezone: "Europe/Madrid",
      description: data.description,
    });

    return this.prisma.trainingClass.create({
      data: {
        class_type: data.classType,
        assigned_coach_id: data.assignedCoachId,
        level_id: data.levelId ?? null,
        start_time: data.startTime,
        duration_minutes: durationMinutes,
        description: data.description ?? null,
        recurrence_series_id: data.recurrenceSeriesId ?? null,
        google_event_id: eventId,
        created_by: data.createdBy,
      },
      include: {
        assignedCoach: true,
        level: true,
        enrollments: true,
      },
    });
  }
}
