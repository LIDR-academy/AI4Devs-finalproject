import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";
import { changePlan, changeSubscriptionStatus } from "@/use-cases/subscriptions/manage-subscription";

const INSTANCE = "/api/subscriptions/me";

/**
 * Estado y plan viajan por el mismo endpoint (design.md §4). Ambos son opcionales pero
 * hace falta al menos uno: un PUT vacío no es una petición, es un despiste.
 */
const UpdateSchema = z
  .object({
    status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]).optional(),
    planCode: z.enum(["BASIC", "PREMIUM"]).optional(),
  })
  .refine(
    (body) => body.status !== undefined || body.planCode !== undefined,
    "Indica el estado o el plan que quieres cambiar."
  );

function deps() {
  return { subscriptions: prismaSubscriptionRepository, audit: prismaAuditRepository };
}

/** Suscripción del usuario en sesión. */
export async function GET() {
  try {
    const { user } = await requireSession();
    const subscription = await prismaSubscriptionRepository.findCurrentSubscription(user.id);
    return Response.json({ subscription });
  } catch (error) {
    return toProblemResponse(error, INSTANCE);
  }
}

/**
 * Pausa, cancela o reactiva la propia suscripción, y/o le cambia el plan.
 *
 * Siempre sobre la del usuario en sesión, nunca por id: así no existe la posibilidad
 * de tocar la suscripción de otro, ni siquiera por un fallo de comprobación. Es
 * también la razón de que el cambio de plan no tenga endpoint propio: duplicar la
 * resolución de identidad es duplicar el sitio donde puede olvidarse.
 */
export async function PUT(request: Request) {
  try {
    const { user } = await requireSession();
    const { status, planCode } = await parseJsonBody(request, UpdateSchema);

    // El estado primero: reactivar y cambiar de plan en la misma petición debe acabar
    // con la suscripción activa en el plan nuevo, no al revés.
    let subscription = status
      ? await changeSubscriptionStatus(deps(), { userId: user.id, status })
      : null;
    if (planCode) {
      subscription = await changePlan(deps(), { userId: user.id, planCode });
    }

    return Response.json({ subscription });
  } catch (error) {
    return toProblemResponse(error, INSTANCE);
  }
}
