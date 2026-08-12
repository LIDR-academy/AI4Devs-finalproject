import { prismaCopyRepository } from "@/repositories/copy.repository.prisma";
import { prismaNotificationRepository } from "@/repositories/notification.repository.prisma";
import { prismaQueueRepository } from "@/repositories/queue.repository.prisma";
import { prismaRentalRepository } from "@/repositories/rental.repository.prisma";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";

import { emitterFor } from "../notifications/notify";
import type { OfferDeps } from "./respond-to-offer";

/** Emisor de eventos de dominio cableado a la base. */
export function emitter() {
  return emitterFor({ notifications: prismaNotificationRepository });
}

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
    emit: emitter(),
  };
}
