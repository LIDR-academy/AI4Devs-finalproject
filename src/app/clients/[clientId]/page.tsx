import Link from "next/link";
import { notFound } from "next/navigation";

import { requireActiveUser } from "@/lib/auth/require-active-user";
import { canViewAllClients } from "@/lib/auth/roles";
import { getClientVisibleToUser } from "@/modules/clients/queries";

type ClientDetailPageProps = {
  params: Promise<{
    clientId: string;
  }>;
  searchParams: Promise<{
    created?: string;
  }>;
};

export default async function ClientDetailPage({ params, searchParams }: ClientDetailPageProps) {
  const currentUser = await requireActiveUser();

  const { clientId } = await params;
  const query = await searchParams;

  const client = await getClientVisibleToUser(
    clientId,
    currentUser.authUser.id,
    canViewAllClients(currentUser.role),
  );

  if (!client) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-16">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <Link href="/" className="text-sm font-medium text-stone-600 underline">
          Volver al panel
        </Link>
        <Link href="/clients" className="ml-4 text-sm font-medium text-stone-600 underline">
          Ver clientes
        </Link>

        {query.created === "1" ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Cliente creado correctamente.
          </p>
        ) : null}

        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Cliente</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
            {client.commercialName}
          </h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Estado {client.status.toLowerCase()} · Tipo {client.clientType.toLowerCase()} · Responsable principal {client.primaryOwner.fullName}
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-[2rem] bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-950">Datos generales</h2>
            <dl className="mt-4 space-y-3 text-sm text-stone-600">
              <div>
                <dt className="font-medium text-stone-900">Razón social</dt>
                <dd>{client.legalName ?? "No informada"}</dd>
              </div>
              <div>
                <dt className="font-medium text-stone-900">Ubicación</dt>
                <dd>{[client.city, client.country].filter(Boolean).join(", ") || "No informada"}</dd>
              </div>
              <div>
                <dt className="font-medium text-stone-900">Contacto</dt>
                <dd>{client.email ?? client.phone ?? "No informado"}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-[2rem] bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-950">Miembros asignados</h2>
            <ul className="mt-4 space-y-3 text-sm text-stone-600">
              {client.assignments.map((assignment) => (
                <li key={assignment.id}>
                  <span className="font-medium text-stone-900">{assignment.user.fullName}</span> · {assignment.memberRole.toLowerCase()}
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}