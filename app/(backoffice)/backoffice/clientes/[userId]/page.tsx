import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { rentalStatus, subscriptionStatus } from "@/lib/status";
import { requireSurfacePage } from "@/http/auth-context";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaBackofficeRepository } from "@/repositories/backoffice.repository.prisma";
import { viewCustomer } from "@/use-cases/backoffice/manage-backoffice";

export const metadata = { title: "Historial de cliente" };

const DATE = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

/**
 * Historial de un cliente. El operador **sí** lo ve: es justo lo que necesita para dar
 * soporte por teléfono (D6). Lo que no ve son sus datos de contacto y dirección.
 */
export default async function CustomerPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const { user } = await requireSurfacePage("backoffice");

  const { customer, history } = await viewCustomer(
    { backoffice: prismaBackofficeRepository, audit: prismaAuditRepository },
    { userId, actor: { id: user.id, role: user.role } }
  );

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{customer.fullName}</h1>
        <p className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <span>{customer.planCode ?? "Sin suscripción"}</span>
          {customer.subscriptionStatus ? (
            <StatusBadge status={subscriptionStatus(customer.subscriptionStatus)} />
          ) : null}
          {customer.email ? <span>· {customer.email}</span> : null}
        </p>
        {customer.address ? (
          <p className="text-sm text-[var(--muted-foreground)]">{customer.address}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Historial de alquileres</h2>
        {history.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">Todavía no ha alquilado nada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead className="text-left text-[var(--muted-foreground)]">
                <tr>
                  <th className="py-2 font-medium">Set</th>
                  <th className="py-2 font-medium">Estado</th>
                  <th className="py-2 font-medium">Desde</th>
                  <th className="py-2 font-medium">Cerrado</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.rentalId} className="border-t">
                    <td className="py-2 pr-4">{entry.setName}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={rentalStatus(entry.status, "backoffice")} />
                    </td>
                    <td className="py-2 pr-4">{DATE.format(entry.startedAt)}</td>
                    <td className="py-2">
                      {entry.completedAt ? DATE.format(entry.completedAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Link href="/backoffice/clientes" className="text-sm hover:underline">
        ← Volver a clientes
      </Link>
    </section>
  );
}
