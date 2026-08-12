import Link from "next/link";

import { can } from "@/domain/auth/permissions";
import { requireSurfacePage } from "@/http/auth-context";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaBackofficeRepository } from "@/repositories/backoffice.repository.prisma";
import { loadWorkQueue } from "@/use-cases/backoffice/manage-backoffice";

import { WorkQueueActions } from "./work-queue-actions";

export const metadata = { title: "Cola de trabajo · Clickoteca" };

/** Etiquetas legibles de los estados que requieren intervención. */
const STATE_LABELS: Record<string, string> = {
  INTAKE: "Pendientes de catalogar",
  EN_DEVOLUCION: "En camino de vuelta",
  EN_INSPECCION: "Pendientes de inspección",
  EN_HIGIENIZACION: "Pendientes de higienizar",
  INCOMPLETA: "Incompletas",
};

const ORDER = ["EN_INSPECCION", "EN_HIGIENIZACION", "INCOMPLETA", "EN_DEVOLUCION", "INTAKE"];

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cola de trabajo</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {items.length === 0
              ? "No hay copias esperando."
              : `${items.length} copia(s) esperando una acción.`}
          </p>
        </div>
        <nav className="flex gap-3 text-sm">
          <Link href="/backoffice/clientes" className="hover:underline">
            Clientes
          </Link>
          {can(user.role, "settings.manage") ? (
            <Link href="/backoffice/configuracion" className="hover:underline">
              Configuración
            </Link>
          ) : null}
          {can(user.role, "employee.manage") ? (
            <Link href="/backoffice/empleados" className="hover:underline">
              Personal
            </Link>
          ) : null}
        </nav>
      </div>

      {ORDER.filter((state) => byState.has(state)).map((state) => (
        <div key={state} className="space-y-3">
          <h2 className="text-lg font-semibold">
            {STATE_LABELS[state]}{" "}
            <span className="text-sm font-normal text-[var(--muted-foreground)]">
              ({byState.get(state)!.length})
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
                      <WorkQueueActions copyId={item.copyId} state={item.state} />
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
