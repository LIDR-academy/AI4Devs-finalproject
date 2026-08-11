import { prisma } from "@/db/prisma";
import type { AuditAction, AuditEntityType } from "@/domain/audit/actions";
import type { AuditRepository } from "@/repositories/audit.repository";

/** Adaptador Prisma del puerto `AuditRepository`. */
export const prismaAuditRepository: AuditRepository = {
  async record(entry) {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        metadata: (entry.metadata ?? undefined) as never,
        createdAt: entry.at,
      },
    });
  },

  async findByEntity({ entityType, entityId, limit = 50 }) {
    const rows = await prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return rows.map((row) => ({
      id: row.id,
      actorId: row.actorId,
      // La base guarda texto libre; al salir se reetiqueta con el vocabulario
      // cerrado del dominio, que es con el que trabaja el resto del código.
      action: row.action as AuditAction,
      entityType: row.entityType as AuditEntityType,
      entityId: row.entityId,
      metadata: row.metadata as Record<string, unknown> | null,
      at: row.createdAt,
    }));
  },
};
