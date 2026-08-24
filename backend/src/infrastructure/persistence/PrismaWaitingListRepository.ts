import type { PrismaClient } from "@prisma/client";
import type {
  WaitingListEntry,
  WaitingListRepository,
} from "../../domain/ports/WaitingListRepository.js";

export class PrismaWaitingListRepository implements WaitingListRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByClassId(classId: string): Promise<WaitingListEntry[]> {
    const entries = await this.prisma.waitingList.findMany({
      where: { class_id: classId },
      orderBy: { joined_at: "asc" },
    });
    return entries.map((e) => ({
      id: e.id,
      classId: e.class_id,
      coacheeId: e.coachee_id,
      joinedAt: e.joined_at,
    }));
  }

  async findByClassIdAndCoacheeId(
    classId: string,
    coacheeId: string,
  ): Promise<WaitingListEntry | null> {
    const entry = await this.prisma.waitingList.findUnique({
      where: {
        class_id_coachee_id: {
          class_id: classId,
          coachee_id: coacheeId,
        },
      },
    });
    if (!entry) return null;
    return {
      id: entry.id,
      classId: entry.class_id,
      coacheeId: entry.coachee_id,
      joinedAt: entry.joined_at,
    };
  }

  async deleteByClassIdAndCoacheeId(classId: string, coacheeId: string): Promise<void> {
    await this.prisma.waitingList.deleteMany({
      where: {
        class_id: classId,
        coachee_id: coacheeId,
      },
    });
  }
}
