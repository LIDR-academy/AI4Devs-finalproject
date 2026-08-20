import { CopyActions } from "@/components/backoffice/copy-actions";
import { StatusBadge } from "@/components/status-badge";
import { copyStatus } from "@/lib/status";
import { requireSurfacePage } from "@/http/auth-context";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaBackofficeRepository } from "@/repositories/backoffice.repository.prisma";
import { loadWorkQueue } from "@/use-cases/backoffice/manage-backoffice";

export const metadata = { title: "Cola de trabajo" };

/**
 * Orden de la cola: primero lo que bloquea a un cliente (una copia en inspección es
 * un set que alguien está esperando), al final lo que solo engorda el inventario.
 * Las etiquetas ya no viven aquí — salen del vocabulario común (`lib/status.ts`),
 * que es el que garantiza que un estado se llame igual en toda la aplicación.
 */
const ORDER = ["EN_INSPECCION", "EN_HIGIENIZACION", "INCOMPLETA", "EN_DEVOLUCION", "INTAKE"] as const;

const DATE = new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short" });

/**
 * Panel de operador: la cola de trabajo (8.1).
 *
 * Se agrupa por estado y, dentro de cada grupo, lo más antiguo primero: el criterio de
 * "qué hago ahora" es la espera, no el orden de llegada a la pantalla.
 */
export default async function BackofficePage() {
  const { user } = await requireSurfacePage("backoffice");
  const actor = { id: user.id, role: user.role };

  const items = await loadWorkQueue(
    { backoffice: prismaBackofficeRepository, audit: prismaAuditRepository },
    actor
  );

  const byState = new Map<string, typeof items>();
  for (const item of items) {
    byState.set(item.state, [...(byState.get(item.state) ?? []), item]);
  }

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cola de trabajo</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          {items.length === 0
            ? "No hay copias esperando."
            : `${items.length} copia(s) esperando una acción.`}
        </p>
      </div>

      {ORDER.filter((state) => byState.has(state)).map((state) => (
        <div key={state} className="space-y-3">
          {/* El grupo se titula con la propia píldora del estado: así el color
              dice de un vistazo qué cubos queman y cuáles solo esperan. */}
          <h2 className="flex flex-wrap items-center gap-2">
            <StatusBadge status={copyStatus(state, "backoffice")} className="text-sm" />
            <span className="text-sm text-[var(--muted-foreground)]">
              {byState.get(state)!.length} copia(s)
            </span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="text-left text-[var(--muted-foreground)]">
                <tr>
                  <th className="py-2 font-medium">Set</th>
                  <th className="py-2 font-medium">Suscriptor</th>
                  <th className="py-2 font-medium">Desde</th>
                  <th className="py-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {byState.get(state)!.map((item) => (
                  <tr key={item.copyId} className="border-t">
                    <td className="py-2 pr-4">{item.setName}</td>
                    <td className="py-2 pr-4 text-[var(--muted-foreground)]">
                      {item.subscriberName ?? "—"}
                    </td>
                    <td className="py-2 pr-4 text-[var(--muted-foreground)]">
                      {DATE.format(item.since)}
                    </td>
                    <td className="py-2">
                      {/* El nombre del set distingue un botón de otro al tabular:
                          sin él, cuatro "Recepcionar" seguidos suenan igual. */}
                      <CopyActions
                        copyId={item.copyId}
                        state={item.state}
                        subject={item.setName}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}
