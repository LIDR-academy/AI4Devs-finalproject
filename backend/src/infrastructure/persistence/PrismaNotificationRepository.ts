import { PrismaClient } from "@prisma/client";
import type {
  CreateNotificationInput,
  NotificationRepository,
} from "../../domain/ports/NotificationRepository.js";

export class PrismaNotificationRepository implements NotificationRepository {
  private _prisma: PrismaClient | null = null;

  private get prisma(): PrismaClient {
    if (!this._prisma) {
      this._prisma = new PrismaClient();
    }
    return this._prisma;
  }

  async create(input: CreateNotificationInput): Promise<{ id: string }> {
    const record = await this.prisma.notification.create({
      data: {
        notification_type: input.type,
        recipient_id: input.recipientId,
        content: input.content,
        class_id: input.classId ?? null,
      },
    });
    return { id: record.id };
  }
}
