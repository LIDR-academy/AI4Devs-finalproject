import { prismaCopyRepository } from "@/repositories/copy.repository.prisma";
import { prismaNotificationRepository } from "@/repositories/notification.repository.prisma";
import { prismaQueueRepository } from "@/repositories/queue.repository.prisma";
import { prismaRentalRepository } from "@/repositories/rental.repository.prisma";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";

import type { OfferDeps } from "./respond-to-offer";

/**
 * Cableado de los flujos de oferta. Se centraliza porque lo comparten los Route
 * Handlers y el scheduler, y una lista de dependencias duplicada en dos sitios acaba
 * divergiendo.
 */
export function offerDeps(): OfferDeps {
  return {
    queue: prismaQueueRepository,
    rentals: prismaRentalRepository,
    subscriptions: prismaSubscriptionRepository,
    settings: prismaSettingsRepository,
    repository: prismaCopyRepository,
    notify: async ({ userId, setId, setName, offerId, at }) => {
      await prismaNotificationRepository.create({
        userId,
        type: "OFFER_REMINDER",
        payload: { setId, setName },
        relatedEntityType: "ReservationOffer",
        relatedEntityId: offerId,
        at,
      });
    },
  };
}
