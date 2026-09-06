import { prisma } from "@/db/prisma";
import type {
  NotificationRepository,
  NotificationView,
} from "@/repositories/notification.repository";

/** Adaptador Prisma del puerto `NotificationRepository`. */
export const prismaNotificationRepository: NotificationRepository = {
  async create({ userId, type, payload, relatedEntityType, relatedEntityId, dedupeKey, at }) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type,
          payload: (payload ?? undefined) as never,
          relatedEntityType,
          relatedEntityId,
          dedupeKey,
          sentAt: at,
        },
      });
      return true;
    } catch (error) {
      // El índice único de `dedupeKey` es quien decide: si ya se envió, este intento
      // pierde y no es un error. Comprobar antes de insertar dejaría una ventana en
      // la que dos ejecuciones simultáneas verían "no existe" a la vez.
      if (isDedupeViolation(error)) return false;
      throw error;
    }
  },

  async listStaffRecipients() {
    const staff = await prisma.user.findMany({
      where: { role: { in: ["OPERATOR", "ADMIN"] }, status: "ACTIVE" },
      select: { id: true },
    });
    return staff.map((user) => user.id);
  },

  async listForUser(userId, options = {}) {
    const rows = await prisma.notification.findMany({
      where: { userId, ...(options.unreadOnly ? { readAt: null } : {}) },
      select: { id: true, type: true, payload: true, sentAt: true, readAt: true },
      orderBy: { sentAt: "desc" },
      take: options.limit ?? 50,
    });
    return rows.map(
      (row): NotificationView => ({
        ...row,
        payload: row.payload as Record<string, unknown> | null,
      })
    );
  },

  async countUnread(userId) {
    return prisma.notification.count({ where: { userId, readAt: null } });
  },

  async markRead({ notificationId, userId, at }) {
    // El `userId` va en el WHERE, no en una comprobación previa: así es imposible
    // marcar como leída la notificación de otro, ni siquiera por un fallo de lógica.
    const { count } = await prisma.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: at },
    });
    return count > 0;
  },
};

function isDedupeViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { code, meta } = error as { code?: string; meta?: { target?: unknown } };
  if (code !== "P2002") return false;

  const target = meta?.target;
  const fields = Array.isArray(target) ? target : typeof target === "string" ? [target] : [];
  // Con driver adapter puede no venir `target`; en `notifications` el único índice
  // único que esta inserción puede violar es el de `dedupeKey`.
  return fields.length === 0 || fields.some((field) => String(field).includes("dedupeKey"));
}
