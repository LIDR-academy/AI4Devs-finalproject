import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { occupiesPlanSlot } from "@/domain/subscriptions/eligibility";
import { prisma } from "@/db/prisma";
import { requireSurfacePage } from "@/http/auth-context";
import { copyStatus, queueStatus, simultaneousSets, subscriptionStatus } from "@/lib/status";
import { prismaQueueRepository } from "@/repositories/queue.repository.prisma";
import { prismaRentalRepository } from "@/repositories/rental.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";

import { OfferButtons } from "./portal-actions";

export const metadata = { title: "Mi portal" };

const DATE = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" });
const DAY = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });
const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

/** Cuántas filas se enseñan en corto antes de mandar a la pantalla completa. */
const RESUMEN = 3;

/**
 * Resumen del portal — `wireframes.md` §7.2.
 *
 * Responde a "¿puedo pedir un set?", que es la pregunta con la que se entra, y **no
 * repite** lo que hay en las otras cuatro pantallas: de "Mis sets" y "Mis colas"
 * enseña las tres primeras y manda a verlas enteras.
 */
export default async function PortalPage() {
  const { user } = await requireSurfacePage("portal");

  const [rentals, queueEntries, offers, subscription, plans, copyStates] = await Promise.all([
    prismaRentalRepository.listForUser(user.id, { activeOnly: true }),
    prismaQueueRepository.listEntriesForUser(user.id),
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
    prismaSubscriptionRepository.currentCopyStates(user.id),
  ]);

  const currentPlan = plans.find((plan) => plan.code === subscription?.planCode);
  // Se cuenta con el mismo conjunto que decide la elegibilidad, no con "los sets que
  // tengo en casa": si no, una copia en inspección desaparecería de la cuenta y el
  // número contradiría al veredicto de la ficha de set.
  const occupied = copyStates.filter(occupiesPlanSlot).length;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold tracking-tight">Hola, {user.fullName}</h1>

      {/* El único bloque del portal que reclama algo, y el único con tono de aviso: si
          todo grita, no grita nada. Se queda arriba del todo y en el resumen —no en su
          propia pestaña— porque esconder tras un clic lo único urgente, y que además
          caduca solo, sería el peor sitio posible. */}
      {offers.length > 0 ? (
        <section
          className="flex flex-col gap-3 rounded-md border border-[var(--tone-warning-border)] bg-[var(--tone-warning)] p-4 text-[var(--tone-warning-foreground)]"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Card asChild>
          <section aria-labelledby="tu-plan">
          <CardHeader>
            <CardTitle asChild>
              <h2 id="tu-plan" className="text-base">
                Tu plan
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription && currentPlan ? (
              <>
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <StatusBadge status={subscriptionStatus(subscription.status)} />
                  <span>
                    <strong>{currentPlan.name}</strong> ·{" "}
                    {EUR.format(Number(currentPlan.monthlyPrice))}/mes
                  </span>
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {simultaneousSets(subscription.maxSimultaneousSets)}
                </p>
              </>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">
                No tienes ningún plan activo, así que no puedes llevarte sets.
              </p>
            )}
            <Button asChild size="sm" variant="outline" className="self-start">
              <Link href={subscription ? "/portal/suscripcion" : "/planes"}>
                {subscription ? "Gestionar" : "Ver los planes"}
              </Link>
            </Button>
          </CardContent>
          </section>
        </Card>

        <Card asChild>
          <section aria-labelledby="ahora-mismo">
          <CardHeader>
            <CardTitle asChild>
              <h2 id="ahora-mismo" className="text-base">
                Ahora mismo
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* El dato que explica por adelantado el `PLAN_LIMIT_REACHED` que puede
                devolver la ficha de set. */}
            <p className="text-sm">
              {subscription
                ? `${occupied} de ${subscription.maxSimultaneousSets} plazas ocupadas`
                : `${occupied} set(s) en tu poder`}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {queueEntries.length === 1
                ? "1 cola activa"
                : `${queueEntries.length} colas activas`}
            </p>
            <Button asChild size="sm" variant="outline" className="self-start">
              <Link href="/catalogo">Explorar el catálogo</Link>
            </Button>
          </CardContent>
          </section>
        </Card>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="resumen-sets">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="resumen-sets" className="text-lg font-semibold">
            Mis sets ({rentals.length})
          </h2>
          <Link href="/portal/sets" className="text-sm hover:underline">
            Ver todos ›
          </Link>
        </div>
        {rentals.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No tienes ningún set ahora mismo.{" "}
            <Link href="/catalogo" className="underline">
              Explorar el catálogo
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {rentals.slice(0, RESUMEN).map((rental) => (
              <li key={rental.id} className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{rental.setName}</span>
                <StatusBadge status={copyStatus(rental.copyState, "subscriber")} />
                <span className="text-[var(--muted-foreground)]">
                  desde el {DAY.format(rental.startedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="resumen-colas">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="resumen-colas" className="text-lg font-semibold">
            Mis colas ({queueEntries.length})
          </h2>
          <Link href="/portal/sets" className="text-sm hover:underline">
            Ver todas ›
          </Link>
        </div>
        {queueEntries.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No estás en ninguna cola.{" "}
            <Link href="/catalogo" className="underline">
              Explorar el catálogo
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {queueEntries.slice(0, RESUMEN).map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{entry.setName}</span>
                <StatusBadge status={queueStatus(entry.status, "subscriber")} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
