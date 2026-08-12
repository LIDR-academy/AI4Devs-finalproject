import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";
import { changeSubscriptionStatus } from "@/use-cases/subscriptions/manage-subscription";

const INSTANCE = "/api/subscriptions/me";

const StatusSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]),
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
 * Pausa, cancela o reactiva la propia suscripción.
 *
 * Siempre sobre la del usuario en sesión, nunca por id: así no existe la posibilidad
 * de tocar la suscripción de otro, ni siquiera por un fallo de comprobación.
 */
export async function PUT(request: Request) {
  try {
    const { user } = await requireSession();
    const { status } = await parseJsonBody(request, StatusSchema);

    const subscription = await changeSubscriptionStatus(deps(), { userId: user.id, status });
    return Response.json({ subscription });
  } catch (error) {
    return toProblemResponse(error, INSTANCE);
  }
}
