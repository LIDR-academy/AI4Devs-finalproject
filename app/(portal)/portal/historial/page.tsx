import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { requireSurfacePage } from "@/http/auth-context";
import { rentalStatus } from "@/lib/status";
import { prismaRentalRepository } from "@/repositories/rental.repository.prisma";

export const metadata = { title: "Historial" };

const DATE = new Intl.DateTimeFormat("es-ES", { dateStyle: "short" });

/**
 * Historial de alquileres — `wireframes.md` §7.3.
 *
 * El dato ya estaba: `listForUser` **sin** `activeOnly` devuelve todos los alquileres
 * ordenados por fecha. Lo único que faltaba era la pantalla.
 *
 * Con la granularidad del suscriptor: los cuatro estados del circuito de devolución
 * son un único "Devolución en curso". Detallárselos sería contarle nuestra logística.
 */
export default async function PortalHistorialPage() {
  const { user } = await requireSurfacePage("portal");
  const rentals = await prismaRentalRepository.listForUser(user.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Historial</h1>

      {rentals.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Aún no has alquilado nada.{" "}
          <Link href="/catalogo" className="underline">
            Explorar el catálogo
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <caption className="sr-only">
              Todos tus alquileres, del más reciente al más antiguo.
            </caption>
            <thead className="text-left text-[var(--muted-foreground)]">
              <tr>
                <th scope="col" className="py-2 font-medium">
                  Set
                </th>
                <th scope="col" className="py-2 font-medium">
                  Desde
                </th>
                <th scope="col" className="py-2 font-medium">
                  Hasta
                </th>
                <th scope="col" className="py-2 font-medium">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
                <tr key={rental.id} className="border-t">
                  <th scope="row" className="py-2 pr-4 text-left font-normal">
                    <Link href={`/catalogo/${rental.setId}`} className="hover:underline">
                      {rental.setName}
                    </Link>
                  </th>
                  <td className="py-2 pr-4 text-[var(--muted-foreground)]">
                    {DATE.format(rental.startedAt)}
                  </td>
                  <td className="py-2 pr-4 text-[var(--muted-foreground)]">
                    {/* Un alquiler abierto no tiene fecha de cierre, y una raya lo dice
                        mejor que una fecha inventada o una celda vacía. */}
                    {rental.completedAt ? DATE.format(rental.completedAt) : "—"}
                  </td>
                  <td className="py-2">
                    <StatusBadge status={rentalStatus(rental.status, "subscriber")} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
