import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { requireSurfacePage } from "@/http/auth-context";
import { copyStatus, queueStatus } from "@/lib/status";
import { prismaQueueRepository } from "@/repositories/queue.repository.prisma";
import { prismaRentalRepository } from "@/repositories/rental.repository.prisma";

import { ReturnButton } from "../portal-actions";

export const metadata = { title: "Mis sets" };

const DATE = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

/** Único estado desde el que el suscriptor puede iniciar la devolución. */
const RETURNABLE = "ALQUILADA";

/**
 * Mis sets — `wireframes.md` §7.3.
 *
 * Lo que el suscriptor tiene fuera y lo que está esperando, juntos. **Las colas viven
 * aquí** y no en una sexta ruta: la navegación son los cinco destinos que fija §2.3, y
 * una cola es lo mismo que un set en casa visto un paso antes. El resumen enseña las
 * dos listas en corto y manda aquí con "Ver todos".
 */
export default async function PortalSetsPage() {
  const { user } = await requireSurfacePage("portal");

  const [rentals, queueEntries] = await Promise.all([
    prismaRentalRepository.listForUser(user.id, { activeOnly: true }),
    prismaQueueRepository.listEntriesForUser(user.id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold tracking-tight">Mis sets</h1>

      <section className="flex flex-col gap-3" aria-labelledby="en-casa">
        <h2 id="en-casa" className="text-lg font-semibold">
          En tu poder ({rentals.length})
        </h2>
        {rentals.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No tienes ningún set ahora mismo.{" "}
            <Link href="/catalogo" className="underline">
              Explorar el catálogo
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rentals.map((rental) => {
              // Al suscriptor no se le cuenta el estado exacto de la copia: los cuatro
              // pasos del circuito de devolución son "devolución en curso".
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

      <section className="flex flex-col gap-3" aria-labelledby="mis-colas">
        <h2 id="mis-colas" className="text-lg font-semibold">
          Mis colas ({queueEntries.length})
        </h2>
        {queueEntries.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No estás en ninguna cola.{" "}
            <Link href="/catalogo" className="underline">
              Explorar el catálogo
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {queueEntries.map((entry) => (
              <li key={entry.id} className="space-y-1 rounded-md border p-3">
                <p className="flex flex-wrap items-center gap-2">
                  <Link href={`/catalogo/${entry.setId}`} className="font-medium hover:underline">
                    {entry.setName}
                  </Link>
                  <StatusBadge status={queueStatus(entry.status, "subscriber")} />
                </p>
                <p className="text-[var(--muted-foreground)]">
                  Esperando desde el {DATE.format(entry.enqueuedAt)}
                  {entry.appliedBonusDays > 0
                    ? ` · ventaja de ${entry.appliedBonusDays} días por tu plan`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
        {/* La posición no está en esta proyección — solo en la ficha del set
            (`wireframes.md` §8.4), y arreglarlo es cosa del repositorio, no de la
            pantalla. Hasta entonces, el enlace lleva a donde sí se ve. */}
        {queueEntries.length > 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Tu puesto exacto en cada cola se ve entrando en la ficha del set.
          </p>
        ) : null}
      </section>
    </div>
  );
}
