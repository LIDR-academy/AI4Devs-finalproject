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
