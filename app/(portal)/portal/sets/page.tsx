import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { requireSurfacePage } from "@/http/auth-context";
import { conditionResult, copyStatus, queueStatus } from "@/lib/status";
import { prismaCopyRepository } from "@/repositories/copy.repository.prisma";
import { prismaQueueRepository } from "@/repositories/queue.repository.prisma";
import { prismaRentalRepository } from "@/repositories/rental.repository.prisma";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import { getDeliveryStatus } from "@/use-cases/rentals/delivery-and-return";

import { ReturnButton } from "../portal-actions";
import { DiscrepancyDialog } from "./discrepancy-dialog";

export const metadata = { title: "Mis sets" };

const DATE = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });
/**
 * La fecha límite se escribe **completa** y no como cuenta atrás: "quedan 36 horas"
 * obliga a un `aria-live` que interrumpe cada minuto y envejece mal en una página que
 * no se recarga (`wireframes.md` §5.5).
 */
const LIMITE = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" });

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

  // La revisión de la entrega (W3, §5.4): son como mucho dos o tres alquileres vivos,
  // así que se resuelven en paralelo y no hace falta una consulta agregada.
  const actor = { id: user.id, role: user.role };
  const deliveries = new Map(
    await Promise.all(
      rentals.map(async (rental) => {
        const status = await getDeliveryStatus(
          {
            rentals: prismaRentalRepository,
            copies: prismaCopyRepository,
            settings: prismaSettingsRepository,
          },
          { rentalId: rental.id, actor }
        );
        return [rental.id, status] as const;
      })
    )
  );

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
              const revision = deliveries.get(rental.id);
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

                  {/* La franja vive **dentro** de la tarjeta del set: es información
                      sobre ese set concreto, y en cuanto la ventana se cierra
                      desaparece sola (§5.2). */}
                  {revision?.confirmation?.status === "pending" && revision.deliveryReport ? (
                    <div className="w-full rounded-md border border-[var(--tone-warning-border)] bg-[var(--tone-warning)] p-3 text-sm text-[var(--tone-warning-foreground)]">
                      <p className="font-medium">
                        Revisa la entrega antes del{" "}
                        {LIMITE.format(revision.confirmation.expiresAt)}
                      </p>
                      <p className="mt-1">
                        Lo enviamos registrado como{" "}
                        <strong>
                          {conditionResult(revision.deliveryReport.result).label.toLowerCase()}
                        </strong>
                        . Si no coincide, dínoslo.
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <DiscrepancyDialog
                          rentalId={rental.id}
                          setName={rental.setName}
                          registeredAs={conditionResult(revision.deliveryReport.result).label}
                          registeredAt={LIMITE.format(revision.deliveryReport.createdAt)}
                          checklist={revision.deliveryReport.checklist}
                          notes={revision.deliveryReport.notes}
                        />
                        <span>Si no nos dices nada, damos la entrega por conforme.</span>
                      </div>
                    </div>
                  ) : null}

                  {revision?.confirmation?.status === "disputed" ? (
                    <p className="flex w-full flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <Badge tone="danger">Incidencia abierta</Badge>
                      Lo estamos revisando.
                    </p>
                  ) : null}
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
