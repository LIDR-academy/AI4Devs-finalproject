import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";
import {
  changePlan,
  changeSubscriptionStatus,
  openSubscription,
} from "@/use-cases/subscriptions/manage-subscription";

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

/** Contratar exige plan y nada más: la identidad la pone la sesión. */
const OpenSchema = z.object({
  planCode: z.enum(["BASIC", "PREMIUM"], "Elige el plan que quieres contratar."),
});

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
 * Contrata un plan cuando no hay ninguna suscripción vigente — la vuelta de quien
 * canceló, ya con sesión.
 *
 * `POST` y no `PUT`: aquí **se crea** una suscripción nueva, no se modifica la que
 * hay. Una cancelada no se reactiva (spec `accounts-roles` → "Volver a suscribirse"),
 * y por eso el `PUT` responde 404 a quien no tiene ninguna: no había nada que tocar, y
 * hasta ahora tampoco forma de empezar otra sin cerrar la sesión.
 */
export async function POST(request: Request) {
  try {
    const { user } = await requireSession();
    const { planCode } = await parseJsonBody(request, OpenSchema);

    const subscription = await openSubscription(deps(), { userId: user.id, planCode });

    return Response.json({ subscription }, { status: 201 });
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
