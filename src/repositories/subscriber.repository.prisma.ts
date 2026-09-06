import { prisma } from "@/db/prisma";
import type { SubscriberRepository } from "@/repositories/subscriber.repository";

/** Adaptador Prisma del puerto `SubscriberRepository`. */
export const prismaSubscriberRepository: SubscriberRepository = {
  async createSubscriber(input) {
    try {
      const user = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            email: input.email,
            passwordHash: input.passwordHash,
            fullName: input.fullName,
            role: "SUBSCRIBER",
            isAdult: true,
            acceptedTermsAt: input.acceptedTermsAt,
          },
          select: { id: true },
        });

        await tx.address.create({
          data: { userId: created.id, ...input.address, isDefault: true },
        });

        await tx.paymentMethod.create({
          data: { userId: created.id, ...input.card, isDefault: true },
        });

        // La suscripción, aquí dentro: si su inserción falla, la transacción deshace
        // también la cuenta y el usuario reintenta. Fuera de la transacción quedaría
        // una cuenta que no puede alquilar y que nadie sabe reparar desde la interfaz
        // — justo el estado que este cambio elimina (design.md §1).
        await tx.subscription.create({
          data: {
            userId: created.id,
            planId: input.subscription.planId,
            status: "ACTIVE",
            startedAt: input.subscription.startedAt,
          },
        });

        return created;
      });

      return { outcome: "created" as const, userId: user.id };
    } catch (error) {
      // La unicidad del email se resuelve en la base, no con un SELECT previo: entre
      // la consulta y la inserción cabe otra alta con el mismo email, y el índice
      // único es el único que decide sin carreras.
      if (isUniqueEmailViolation(error)) return { outcome: "email_taken" as const };
      throw error;
    }
  },

  async resubscribe(input) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: input.userId },
        select: { id: true },
      });
      if (!user) return { outcome: "not_found" as const };

      // Dentro de la transacción: si dos altas simultáneas la vieran fuera, las dos
      // creerían que no hay ninguna vigente y el cliente acabaría con dos.
      const vigente = await tx.subscription.findFirst({
        where: { userId: input.userId, status: { not: "CANCELLED" } },
        select: { id: true },
      });
      if (vigente) return { outcome: "already_subscribed" as const };

      await tx.user.update({
        where: { id: input.userId },
        // Las condiciones se vuelven a aceptar en el formulario, así que la fecha es
        // la de ahora: es la que documenta a qué versión dijo que sí.
        data: { fullName: input.fullName, acceptedTermsAt: input.acceptedTermsAt },
      });

      // La dirección y la tarjeta de entonces no se borran —pueden estar referenciadas
      // por pagos y por el snapshot de un alquiler—, pero dejan de ser las de por defecto.
      await tx.address.updateMany({ where: { userId: input.userId }, data: { isDefault: false } });
      await tx.address.create({
        data: { userId: input.userId, ...input.address, isDefault: true },
      });

      await tx.paymentMethod.updateMany({
        where: { userId: input.userId },
        data: { isDefault: false },
      });
      await tx.paymentMethod.create({
        data: { userId: input.userId, ...input.card, isDefault: true },
      });

      await tx.subscription.create({
        data: {
          userId: input.userId,
          planId: input.subscription.planId,
          status: "ACTIVE",
          startedAt: input.subscription.startedAt,
        },
      });

      return { outcome: "resubscribed" as const };
    });
  },
};

/**
 * Detecta el P2002 de Prisma (violación de restricción única) sobre `email`.
 *
 * Con el **driver adapter** de Prisma 7 el error **no trae `meta.target`** —solo
 * `modelName`—, a diferencia del cliente clásico. Por eso hay dos caminos: si viene
 * el nombre del campo se usa, y si no, basta con que el P2002 sea de `User`, porque
 * el único índice único que esta inserción puede violar es el del email (el `id` es
 * un UUID que generamos nosotros).
 *
 * Se exporta solo para poder fijar este comportamiento en los tests.
 */
export function isUniqueEmailViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { code, meta } = error as {
    code?: string;
    meta?: { target?: unknown; modelName?: unknown };
  };
  if (code !== "P2002") return false;

  const target = meta?.target;
  const fields = Array.isArray(target) ? target : typeof target === "string" ? [target] : [];
  if (fields.length > 0) return fields.some((field) => String(field).includes("email"));

  return meta?.modelName === "User";
}
