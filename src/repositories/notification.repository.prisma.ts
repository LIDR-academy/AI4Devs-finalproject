import { prisma } from "@/db/prisma";
import type { NotificationRepository } from "@/repositories/notification.repository";

/** Adaptador Prisma del puerto `NotificationRepository`. */
export const prismaNotificationRepository: NotificationRepository = {
  async create({ userId, type, payload, relatedEntityType, relatedEntityId, at }) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        payload: (payload ?? undefined) as never,
        relatedEntityType,
        relatedEntityId,
        sentAt: at,
      },
      select: { id: true },
    });
  },

  async listForUser(userId, options = {}) {
    const rows = await prisma.notification.findMany({
      where: { userId, ...(options.unreadOnly ? { readAt: null } : {}) },
      select: { id: true, type: true, payload: true, sentAt: true, readAt: true },
      orderBy: { sentAt: "desc" },
      take: options.limit ?? 50,
    });
    return rows.map((row) => ({
      ...row,
      payload: row.payload as Record<string, unknown> | null,
    }));
  },
};
