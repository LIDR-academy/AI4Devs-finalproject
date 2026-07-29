import type { PrismaClient } from "@prisma/client";
import type { CalendarProvider } from "../../domain/ports/CalendarProvider.js";

export class DeleteTrainingClass {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly calendar: CalendarProvider,
  ) {}

  async execute(id: string) {
    const existing = await this.prisma.trainingClass.findUniqueOrThrow({ where: { id } });

    if (existing.google_event_id) {
      await this.calendar.deleteEvent(existing.google_event_id);
    }

    await this.prisma.trainingClass.delete({ where: { id } });
  }
}
