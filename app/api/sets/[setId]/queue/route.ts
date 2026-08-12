import { requireSession } from "@/http/auth-context";
import { toProblemResponse } from "@/http/problem";
import { prismaQueueRepository } from "@/repositories/queue.repository.prisma";
import { prismaSetRepository } from "@/repositories/set.repository.prisma";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";
import { joinQueue } from "@/use-cases/queue/join-queue";

/** Une al suscriptor a la cola de este set. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId } = await params;
  try {
    const { user } = await requireSession();

    const entry = await joinQueue(
      {
        queue: prismaQueueRepository,
        subscriptions: prismaSubscriptionRepository,
        sets: prismaSetRepository,
        settings: prismaSettingsRepository,
      },
      { userId: user.id, setId }
    );

    return Response.json({ entry }, { status: 201 });
  } catch (error) {
    return toProblemResponse(error, `/api/sets/${setId}/queue`);
  }
}
