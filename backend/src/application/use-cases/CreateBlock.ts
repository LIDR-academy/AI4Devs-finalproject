import type { BlockType, PrismaClient } from "@prisma/client";
import type { CalendarProvider } from "../../domain/ports/CalendarProvider.js";

export interface CreateBlockData {
  blockType: BlockType;
  coachId?: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  createdBy: string;
}

export class CreateBlock {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly calendar: CalendarProvider,
  ) {}

  async execute(data: CreateBlockData) {
    const title = data.blockType === "GYM_WIDE" ? "Gym Wide Block" : "Personal Block";

    const eventId = await this.calendar.createEvent({
      title,
      startTime: data.startTime,
      endTime: data.endTime,
      timezone: "Europe/Madrid",
      description: data.description,
    });

    return this.prisma.block.create({
      data: {
        block_type: data.blockType,
        coach_id: data.coachId ?? null,
        start_time: data.startTime,
        end_time: data.endTime,
        description: data.description ?? null,
        google_event_id: eventId,
        created_by: data.createdBy,
      },
      include: {
        coach: true,
      },
    });
  }
}
