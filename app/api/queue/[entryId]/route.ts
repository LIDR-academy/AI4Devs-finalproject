import { requireSession } from "@/http/auth-context";
import { toProblemResponse } from "@/http/problem";
import { prismaQueueRepository } from "@/repositories/queue.repository.prisma";
import { prismaSetRepository } from "@/repositories/set.repository.prisma";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";
import { leaveQueue } from "@/use-cases/queue/join-queue";

/** Abandona voluntariamente una cola. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const { entryId } = await params;
  try {
    const { user } = await requireSession();

    await leaveQueue(
      {
        queue: prismaQueueRepository,
        subscriptions: prismaSubscriptionRepository,
        sets: prismaSetRepository,
        settings: prismaSettingsRepository,
      },
      { userId: user.id, entryId }
    );

    return new Response(null, { status: 204 });
  } catch (error) {
    return toProblemResponse(error, `/api/queue/${entryId}`);
  }
}
