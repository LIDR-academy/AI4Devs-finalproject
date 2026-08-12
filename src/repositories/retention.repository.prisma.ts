import { prisma } from "@/db/prisma";
import { SYSTEM_SETTINGS } from "@/domain/settings/system-settings";
import type {
  RetentionCandidate,
  RetentionRepository,
} from "@/repositories/retention.repository";

/** Adaptador Prisma del puerto `RetentionRepository`. */

/** Tipo de notificación de este flujo. El catálogo completo llega con el bloque 7. */
export const RETENTION_REMINDER_TYPE = "RETENTION_REMINDER";

export const prismaRetentionRepository: RetentionRepository = {
  async findConfig(setId) {
    return prisma.retentionReminderConfig.findUnique({
      where: { setId },
      select: { setId: true, enabled: true, cadenceDays: true, activatedByAdminId: true },
    });
  },

  async upsertConfig({ setId, enabled, cadenceDays, adminId }) {
    return prisma.retentionReminderConfig.upsert({
      where: { setId },
      update: { enabled, cadenceDays, activatedByAdminId: adminId },
      create: { setId, enabled, cadenceDays, activatedByAdminId: adminId },
      select: { setId: true, enabled: true, cadenceDays: true, activatedByAdminId: true },
    });
  },

  async findRetentionCandidates() {
    // Filtro grueso: alquileres vivos de sets con recordatorios activados. Si toca
    // recordar hoy lo decide el dominio, no esta consulta.
    const rentals = await prisma.rental.findMany({
      where: {
        status: { not: "COMPLETED" },
        copy: { state: "ALQUILADA", set: { retentionConfig: { enabled: true } } },
      },
      select: {
        id: true,
        userId: true,
        startedAt: true,
        copy: {
          select: {
            set: {
              select: {
                id: true,
                name: true,
                retentionConfig: { select: { cadenceDays: true } },
              },
            },
          },
        },
      },
    });

    if (rentals.length === 0) return [];

    const setIds = [...new Set(rentals.map((rental) => rental.copy.set.id))];
    const rentalIds = rentals.map((rental) => rental.id);

    const [queueCounts, lastReminders] = await Promise.all([
      prisma.reservationQueueEntry.groupBy({
        by: ["setId"],
        where: { setId: { in: setIds }, status: { in: ["WAITING", "OFFERED"] } },
        _count: { _all: true },
      }),
      // Último recordatorio por alquiler: se deduce de las notificaciones ya enviadas,
      // así no hace falta una columna extra que mantener en sincronía.
      prisma.notification.groupBy({
        by: ["relatedEntityId"],
        where: {
          type: RETENTION_REMINDER_TYPE,
          relatedEntityType: "Rental",
          relatedEntityId: { in: rentalIds },
        },
        _max: { sentAt: true },
      }),
    ]);

    const queueBySet = new Map(queueCounts.map((row) => [row.setId, row._count._all]));
    const lastByRental = new Map(
      lastReminders.map((row) => [row.relatedEntityId, row._max.sentAt])
    );

    return rentals.map(
      (rental): RetentionCandidate => ({
        rentalId: rental.id,
        userId: rental.userId,
        setId: rental.copy.set.id,
        setName: rental.copy.set.name,
        cadenceDays:
          rental.copy.set.retentionConfig?.cadenceDays ??
          SYSTEM_SETTINGS.retentionReminderCadenceDays,
        queueLength: queueBySet.get(rental.copy.set.id) ?? 0,
        lastReminderAt: lastByRental.get(rental.id) ?? null,
        rentalStartedAt: rental.startedAt,
      })
    );
  },

  async recordReminderSent({ userId, rentalId, setId, setName, at }) {
    await prisma.notification.create({
      data: {
        userId,
        type: RETENTION_REMINDER_TYPE,
        payload: { setId, setName },
        relatedEntityType: "Rental",
        relatedEntityId: rentalId,
        sentAt: at,
      },
    });
  },
};
