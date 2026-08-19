import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { subscriptionStatus } from "@/lib/status";
import { can } from "@/domain/auth/permissions";
import { requireSurfacePage } from "@/http/auth-context";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaBackofficeRepository } from "@/repositories/backoffice.repository.prisma";
import { listCustomers } from "@/use-cases/backoffice/manage-backoffice";

export const metadata = { title: "Clientes · Clickoteca" };

/**
 * Vista de clientes (8.3).
 *
 * El operador la ve en **lectura limitada** —lo justo para atender una llamada— y el
 * admin completa. El recorte lo hace el caso de uso, no esta página: si cada pantalla
 * decidiera qué ocultar, bastaría con olvidarlo una vez.
 */
export default async function CustomersPage() {
  const { user } = await requireSurfacePage("backoffice");
  const actor = { id: user.id, role: user.role };
  const full = can(user.role, "customer.read_full");

  const customers = await listCustomers(
    { backoffice: prismaBackofficeRepository, audit: prismaAuditRepository },
    actor
  );

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          {full
            ? "Vista completa: incluye datos de contacto y alta."
            : "Lectura limitada para soporte: sin datos de contacto ni dirección."}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="text-left text-[var(--muted-foreground)]">
            <tr>
              <th className="py-2 font-medium">Nombre</th>
              {full ? <th className="py-2 font-medium">Email</th> : null}
              <th className="py-2 font-medium">Plan</th>
              <th className="py-2 font-medium">Sets fuera</th>
              <th className="py-2 font-medium">En cola</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t">
                <td className="py-2 pr-4">{customer.fullName}</td>
                {full ? (
                  <td className="py-2 pr-4 text-[var(--muted-foreground)]">{customer.email}</td>
                ) : null}
                <td className="py-2 pr-4">
                  <span className="flex flex-wrap items-center gap-2">
                    {customer.planCode ?? "—"}
                    {/* La suscripción activa no se marca: es lo esperable, y una
                        píldora verde en cada fila no distinguiría nada. */}
                    {customer.subscriptionStatus && customer.subscriptionStatus !== "ACTIVE" ? (
                      <StatusBadge status={subscriptionStatus(customer.subscriptionStatus)} />
                    ) : null}
                  </span>
                </td>
                <td className="py-2 pr-4">{customer.activeRentals}</td>
                <td className="py-2 pr-4">{customer.queueEntries}</td>
                <td className="py-2">
                  <Link href={`/backoffice/clientes/${customer.id}`} className="hover:underline">
                    Historial
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/backoffice" className="text-sm hover:underline">
        ← Volver a la cola de trabajo
      </Link>
    </section>
  );
}
