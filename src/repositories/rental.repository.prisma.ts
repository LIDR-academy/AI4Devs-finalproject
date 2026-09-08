import { prisma } from "@/db/prisma";
import type { CopyState } from "@/domain/copy/lifecycle";
import { applyTransition } from "@/repositories/copy-transitions";
import type {
  AssignCopyOutcome,
  ConditionReportSummary,
  RentalRepository,
  RentalSummary,
} from "@/repositories/rental.repository";

/** Adaptador Prisma del puerto `RentalRepository`. */

const RENTAL_SELECT = {
  id: true,
  copyId: true,
  userId: true,
  type: true,
  status: true,
  price: true,
  startedAt: true,
  returnInitiatedAt: true,
  receivedAt: true,
  completedAt: true,
  copy: { select: { state: true, setId: true, set: { select: { name: true } } } },
} as const;

type RentalRow = {
  id: string;
  copyId: string;
  userId: string;
  type: "SUBSCRIPTION" | "ONE_OFF";
  status: "ACTIVE" | "RETURN_INITIATED" | "IN_INSPECTION" | "COMPLETED";
  price: { toFixed(dp: number): string } | null;
  startedAt: Date;
  returnInitiatedAt: Date | null;
  receivedAt: Date | null;
  completedAt: Date | null;
  copy: { state: string; setId: string; set: { name: string } };
};

function toRental(row: RentalRow): RentalSummary {
  return {
    id: row.id,
    copyId: row.copyId,
    setId: row.copy.setId,
    setName: row.copy.set.name,
    userId: row.userId,
    type: row.type,
    status: row.status,
    copyState: row.copy.state as CopyState,
    price: row.price?.toFixed(2) ?? null,
    startedAt: row.startedAt,
    returnInitiatedAt: row.returnInitiatedAt,
    receivedAt: row.receivedAt,
    completedAt: row.completedAt,
  };
}

export const prismaRentalRepository: RentalRepository = {
  async findById(rentalId) {
    const row = await prisma.rental.findUnique({ where: { id: rentalId }, select: RENTAL_SELECT });
    return row ? toRental(row as RentalRow) : null;
  },

  async listForUser(userId, options = {}) {
    const rows = await prisma.rental.findMany({
      where: { userId, ...(options.activeOnly ? { status: { not: "COMPLETED" } } : {}) },
      select: RENTAL_SELECT,
      orderBy: { startedAt: "desc" },
    });
    return rows.map((row) => toRental(row as RentalRow));
  },

  async findLatestByCopy(copyId) {
    const row = await prisma.rental.findFirst({
      where: { copyId },
      select: RENTAL_SELECT,
      orderBy: { startedAt: "desc" },
    });
    return row ? toRental(row as RentalRow) : null;
  },

  async assignAvailableCopy(input): Promise<AssignCopyOutcome> {
    // Se recorren las copias libres de la más antigua a la más nueva y se intenta
    // reservar cada una con CAS. Rotar por antigüedad reparte el desgaste en vez de
    // castigar siempre a la misma copia.
    const candidates = await prisma.copy.findMany({
      where: { setId: input.setId, state: "DISPONIBLE" },
      select: { id: true },
      orderBy: { acquiredAt: "asc" },
    });

    for (const candidate of candidates) {
      const rental = await prisma.$transaction(async (tx) => {
        const applied = await applyTransition(tx, {
          copyId: candidate.id,
          fromState: "DISPONIBLE",
          toState: "ALQUILADA",
          actorId: input.userId,
          reason: "Asignación de copia al solicitar el set",
          at: input.at,
        });
        // Otro proceso se le adelantó con esta copia: se prueba con la siguiente.
        if (!applied) return null;

        return tx.rental.create({
          data: {
            copyId: candidate.id,
            userId: input.userId,
            subscriptionId: input.subscriptionId,
            type: input.type,
            status: "ACTIVE",
            // Snapshot inmutable: cambiar la dirección después no altera este envío
            // (D10 / spec `accounts-roles`).
            shippingAddress: input.shippingAddress as never,
            price: input.price,
            startedAt: input.at,
          },
          select: RENTAL_SELECT,
        });
      });

      if (rental) return { outcome: "assigned", rental: toRental(rental as RentalRow) };
    }

    return { outcome: "no_copy_available" };
  },

  async recordConditionReport(input) {
    const report = await prisma.conditionReport.create({
      data: {
        copyId: input.copyId,
        rentalId: input.rentalId,
        operatorId: input.operatorId,
        kind: input.kind,
        result: input.result,
        checklist: (input.checklist ?? undefined) as never,
        notes: input.notes,
        createdAt: input.at,
      },
      select: {
        id: true,
        rentalId: true,
        kind: true,
        result: true,
        operatorId: true,
        createdAt: true,
        checklist: true,
        notes: true,
      },
    });
    return report as ConditionReportSummary;
  },

  async findConditionReports(rentalId) {
    const rows = await prisma.conditionReport.findMany({
      where: { rentalId },
      // Las casillas y las observaciones salen con el informe: son lo que el suscriptor
      // ve en el diálogo de discrepancia para saber contra qué se compara (W3, §5.3).
      select: {
        id: true,
        rentalId: true,
        kind: true,
        result: true,
        operatorId: true,
        createdAt: true,
        checklist: true,
        notes: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return rows as ConditionReportSummary[];
  },

  async openIncident(input) {
    return prisma.incident.create({
      data: {
        copyId: input.copyId,
        rentalId: input.rentalId,
        reportedById: input.reportedById,
        type: input.type,
        status: "OPEN",
        notes: input.notes,
        createdAt: input.at,
      },
      select: { id: true },
    });
  },

  async hasOpenIncidentOfType(rentalId, type) {
    return (await prisma.incident.count({ where: { rentalId, type } })) > 0;
  },

  async recordShipment(input) {
    return prisma.shipment.create({
      data: {
        rentalId: input.rentalId,
        direction: input.direction,
        status: input.status,
        markedByOperatorId: input.markedByOperatorId,
        createdAt: input.at,
      },
      select: { id: true },
    });
  },

  async findDefaultAddress(userId) {
    const address = await prisma.address.findFirst({
      where: { userId },
      orderBy: { isDefault: "desc" },
      select: { line1: true, city: true, postalCode: true, country: true },
    });
    return address;
  },
};
