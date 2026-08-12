import { requireSession } from "@/http/auth-context";
import { toProblemResponse } from "@/http/problem";
import { prismaSetRepository } from "@/repositories/set.repository.prisma";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";
import { checkSetEligibility } from "@/use-cases/subscriptions/check-eligibility";

/**
 * ¿Puede quien pregunta llevarse este set, y si no, por qué?
 *
 * Devuelve **200 con el veredicto**, no un 403: no poder llevarse un set ahora mismo
 * no es un error de la petición, es información que el portal necesita para decidir
 * qué botón enseñar. El rechazo con código de error llega cuando se intenta la acción.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId } = await params;
  try {
    const { user } = await requireSession();

    const result = await checkSetEligibility(
      {
        subscriptions: prismaSubscriptionRepository,
        sets: prismaSetRepository,
        settings: prismaSettingsRepository,
      },
      { userId: user.id, setId }
    );

    return Response.json(result);
  } catch (error) {
    return toProblemResponse(error, `/api/sets/${setId}/eligibility`);
  }
}
