import { PrismaClient } from "@prisma/client";
import { Notification } from "../../domain/entities/Notification.js";
import type {
  CreateNotificationInput,
  CursorPaginatedResult,
  ListNotificationsFilters,
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

  async findById(id: string): Promise<Notification | null> {
    const record = await this.prisma.notification.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async listByRecipient(
    filters: ListNotificationsFilters,
  ): Promise<CursorPaginatedResult<Notification>> {
    const limit = filters.limit ?? 20;
    const where: Record<string, unknown> = { recipient_id: filters.recipientId };

    if (filters.unreadOnly) {
      where.is_read = false;
    }

    if (filters.todayOnly) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      where.sent_at = { gte: startOfDay };
    }

    if (filters.cursor) {
      where.sent_at = {
        ...((where.sent_at as Record<string, unknown>) || {}),
        lt: await this.getSentAtById(filters.cursor),
      };
    }

    const [records, totalCount, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { sent_at: "desc" },
        take: limit + 1,
      }),
      this.prisma.notification.count({ where: { recipient_id: filters.recipientId } }),
      this.prisma.notification.count({
        where: { recipient_id: filters.recipientId, is_read: false },
      }),
    ]);

    const hasMore = records.length > limit;
    const data = records.slice(0, limit).map((r) => this.toDomain(r));
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    return {
      data,
      meta: { hasMore, nextCursor, totalCount, unreadCount },
    };
  }

  async countUnreadByRecipient(recipientId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { recipient_id: recipientId, is_read: false },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const record = await this.prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
    return this.toDomain(record);
  }

  private async getSentAtById(id: string): Promise<Date> {
    const record = await this.prisma.notification.findUniqueOrThrow({
      where: { id },
      select: { sent_at: true },
    });
    return record.sent_at;
  }

  private toDomain(record: {
    id: string;
    notification_type: number;
    recipient_id: string;
    class_id: string | null;
    content: string;
    is_read: boolean;
    sent_at: Date;
    created_at: Date;
    updated_at: Date;
  }): Notification {
    return new Notification(
      record.id,
      record.notification_type,
      record.recipient_id,
      record.content,
      record.is_read,
      record.sent_at,
      record.created_at,
      record.updated_at,
      record.class_id,
    );
  }
}
