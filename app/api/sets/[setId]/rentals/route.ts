import { requireSession } from "@/http/auth-context";
import { toProblemResponse } from "@/http/problem";
import { prismaRentalRepository } from "@/repositories/rental.repository.prisma";
import { prismaSetRepository } from "@/repositories/set.repository.prisma";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";
import { emitter } from "@/use-cases/queue/deps";
import { requestSet } from "@/use-cases/rentals/request-set";

/**
 * Solicita este set y recibe una copia.
 *
 * Si no queda ninguna libre responde **200 con la opción de encolarse**, no un error:
 * la spec dice que en ese caso se le ofrece la cola, y un 4xx daría a entender que la
 * petición estaba mal.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId } = await params;
  try {
    const { user } = await requireSession();

    const result = await requestSet(
      {
        rentals: prismaRentalRepository,
        subscriptions: prismaSubscriptionRepository,
        sets: prismaSetRepository,
        settings: prismaSettingsRepository,
        emit: emitter(),
      },
      { userId: user.id, setId }
    );

    return result.outcome === "assigned"
      ? Response.json({ rental: result.rental }, { status: 201 })
      : Response.json(result);
  } catch (error) {
    return toProblemResponse(error, `/api/sets/${setId}/rentals`);
  }
}
