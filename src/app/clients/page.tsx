import Link from "next/link";

import { requireActiveUser } from "@/lib/auth/require-active-user";
import { canViewAllClients } from "@/lib/auth/roles";
import { listClientsVisibleToUser } from "@/modules/clients/queries";

export default async function ClientsPage() {
  const currentUser = await requireActiveUser();
  const visibleClients = await listClientsVisibleToUser(
    currentUser.authUser.id,
    canViewAllClients(currentUser.role),
  );

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-16">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Ticket T-04
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
              Clientes visibles para tu usuario
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Los vendedores solo ven clientes asignados. Administrador y Empresario/Socio pueden ver toda la cartera.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-white"
            >
              Panel
            </Link>
            <Link
              href="/clients/new"
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Nuevo cliente
            </Link>
          </div>
        </div>

        <section className="rounded-[2rem] bg-white shadow-sm">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-stone-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            <span>Cliente</span>
            <span>Estado</span>
            <span>Responsable</span>
            <span>Miembros</span>
          </div>

          {visibleClients.length === 0 ? (
            <div className="px-6 py-10 text-sm text-stone-600">
              No hay clientes visibles para este usuario todavía.
            </div>
          ) : (
            <ul>
              {visibleClients.map((client) => (
                <li key={client.id} className="border-b border-stone-100 last:border-b-0">
                  <Link
                    href={`/clients/${client.id}`}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-5 text-sm text-stone-700 transition hover:bg-stone-50"
                  >
                    <span>
                      <span className="block font-medium text-stone-950">{client.commercialName}</span>
                      <span className="block text-stone-500">{client.city ?? client.country ?? "Sin ubicación"}</span>
                    </span>
                    <span>{formatEnumLabel(client.status)}</span>
                    <span>{client.primaryOwner.fullName}</span>
                    <span>{client.assignments.length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function formatEnumLabel(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}