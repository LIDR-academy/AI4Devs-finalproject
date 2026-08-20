import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import {
  copyStatus,
  notificationLabel,
  queueStatus,
  simultaneousSets,
  subscriptionStatus,
} from "@/lib/status";
import { prisma } from "@/db/prisma";
import { requireSurfacePage } from "@/http/auth-context";
import { prismaNotificationRepository } from "@/repositories/notification.repository.prisma";
import { prismaQueueRepository } from "@/repositories/queue.repository.prisma";
import { prismaRentalRepository } from "@/repositories/rental.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";

import { OfferButtons, PlanSwitcher, ReturnButton } from "./portal-actions";

export const metadata = { title: "Mi portal" };

const DATE = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" });

/** Estados de copia en los que el suscriptor todavía puede iniciar la devolución. */
const RETURNABLE = "ALQUILADA";

/**
 * Portal del suscriptor: lo que tiene fuera, en qué colas está y qué le han avisado.
 *
 * Es la pantalla que cierra el circuito para el cliente: desde aquí devuelve un set y
 * responde a una oferta de cola, que son las dos únicas acciones que le corresponden.
 */
export default async function PortalPage() {
  const { user } = await requireSurfacePage("portal");

  const [rentals, queueEntries, notifications, offers, subscription, plans] = await Promise.all([
    prismaRentalRepository.listForUser(user.id, { activeOnly: true }),
    prismaQueueRepository.listEntriesForUser(user.id),
    prismaNotificationRepository.listForUser(user.id, { limit: 10 }),
    // Ofertas vivas dirigidas a este usuario; es lo que convierte "te toca" en una
    // acción que puede ejecutar sin salir de aquí.
    prisma.reservationOffer.findMany({
      where: { status: "PENDING", queueEntry: { userId: user.id } },
      select: {
        id: true,
        windowExpiresAt: true,
        queueEntry: { select: { set: { select: { name: true } } } },
      },
    }),
    prismaSubscriptionRepository.findCurrentSubscription(user.id),
    prismaSubscriptionRepository.listPlans(),
  ]);

  const currentPlan = plans.find((plan) => plan.code === subscription?.planCode);
  // Solo los planes a los que puede cambiarse: el que ya tiene no es una opción.
  const otherPlans = plans.filter((plan) => plan.active && plan.code !== subscription?.planCode);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hola, {user.fullName}</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          <Link href="/catalogo" className="hover:underline">
            Explorar el catálogo
          </Link>
        </p>
      </div>

      {/* El único bloque del portal que reclama algo, y el único con tono de
          aviso: si todo grita, no grita nada. La ventana caduca sola. */}
      {offers.length > 0 ? (
        <section
          className="space-y-3 rounded-md border border-[var(--tone-warning-border)] bg-[var(--tone-warning)] p-4 text-[var(--tone-warning-foreground)]"
          aria-labelledby="te-toca"
        >
          <h2 id="te-toca" className="text-lg font-semibold">
            Te toca
          </h2>
          {offers.map((offer) => (
            <div key={offer.id} className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">
                <strong>{offer.queueEntry.set.name}</strong> está disponible para ti. Tienes hasta
                el {DATE.format(offer.windowExpiresAt)} para confirmar.
              </p>
              <OfferButtons offerId={offer.id} />
            </div>
          ))}
        </section>
      ) : null}

      <section className="space-y-3" aria-labelledby="portal-plan">
        <h2 id="portal-plan" className="text-lg font-semibold">Tu plan</h2>
        {subscription && subscription.status === "ACTIVE" && currentPlan ? (
          <div className="space-y-3 rounded-md border p-4">
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <StatusBadge status={subscriptionStatus(subscription.status)} />
              <span>
                <strong>{currentPlan.name}</strong> · {currentPlan.monthlyPrice} €/mes ·{" "}
                {simultaneousSets(currentPlan.maxSimultaneousSets)}
              </span>
            </p>
            <PlanSwitcher options={otherPlans} />
          </div>
        ) : (
          <div className="space-y-2 rounded-md border p-4">
            {subscription ? <StatusBadge status={subscriptionStatus(subscription.status)} /> : null}
            <p className="text-sm text-[var(--muted-foreground)]">
              No tienes ningún plan activo, así que no puedes llevarte sets.{" "}
              <Link href="/planes" className="hover:underline">
                Ver los planes
              </Link>
            </p>
          </div>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="portal-sets">
        <h2 id="portal-sets" className="text-lg font-semibold">Mis sets</h2>
        {rentals.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No tienes ningún set ahora mismo.
          </p>
        ) : (
          <ul className="space-y-3">
            {rentals.map((rental) => {
              // Al suscriptor no se le cuenta el estado exacto de la copia: los
              // cuatro pasos del circuito de devolución son "devolución en curso".
              const status = copyStatus(rental.copyState, "subscriber");
              return (
                <li
                  key={rental.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
                >
                  <div className="space-y-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {rental.setName}
                      <StatusBadge status={status} />
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Desde el {DATE.format(rental.startedAt)}
                      {status.hint ? ` · ${status.hint}` : ""}
                    </p>
                  </div>
                  {rental.copyState === RETURNABLE ? <ReturnButton rentalId={rental.id} /> : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="portal-colas">
        <h2 id="portal-colas" className="text-lg font-semibold">Mis colas</h2>
        {queueEntries.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No estás en ninguna cola.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {queueEntries.map((entry) => (
              <li key={entry.id} className="space-y-1 rounded-md border p-3">
                <p className="flex flex-wrap items-center gap-2">
                  <strong>{entry.setName}</strong>
                  <StatusBadge status={queueStatus(entry.status, "subscriber")} />
                </p>
                <p className="text-[var(--muted-foreground)]">
                  Desde el {DATE.format(entry.enqueuedAt)}
                  {entry.appliedBonusDays > 0
                    ? ` · ventaja de ${entry.appliedBonusDays} días`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="portal-avisos">
        <h2 id="portal-avisos" className="text-lg font-semibold">Avisos</h2>
        {notifications.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">Nada nuevo.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {notifications.map((notification) => (
              <li key={notification.id} className="rounded-md border p-3">
                {/* En la base el aviso se llama `QUEUE_TURN`; en pantalla, no. */}
                <span className="font-medium">{notificationLabel(notification.type)}</span>{" "}
                <span className="text-[var(--muted-foreground)]">
                  · {DATE.format(notification.sentAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
