import Link from "next/link";

import { canManageSuppliers } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { listSuppliers } from "@/modules/suppliers/queries";

type SuppliersPageProps = {
  searchParams: Promise<{
    created?: string;
  }>;
};

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  await requireRole(canManageSuppliers);

  const params = await searchParams;
  const suppliers = await listSuppliers();

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-16">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Ticket T-05
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
              Proveedores
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Catálogo operativo de proveedores para abastecimiento y asociación con productos.
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
              href="/suppliers/new"
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Nuevo proveedor
            </Link>
          </div>
        </div>

        {params.created ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Proveedor creado correctamente.
          </p>
        ) : null}

        <section className="rounded-[2rem] bg-white shadow-sm">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-stone-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            <span>Proveedor</span>
            <span>Estado</span>
            <span>País</span>
            <span>Lead time</span>
          </div>

          {suppliers.length === 0 ? (
            <div className="px-6 py-10 text-sm text-stone-600">Todavía no hay proveedores registrados.</div>
          ) : (
            <ul>
              {suppliers.map((supplier) => (
                <li key={supplier.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-stone-100 px-6 py-5 text-sm text-stone-700 last:border-b-0">
                  <span>
                    <span className="block font-medium text-stone-950">{supplier.commercialName}</span>
                    <span className="block text-stone-500">{supplier.email ?? supplier.phone ?? "Sin contacto"}</span>
                  </span>
                  <span>{formatEnumLabel(supplier.status)}</span>
                  <span>{supplier.country ?? "No informado"}</span>
                  <span>
                    {supplier.averageLeadTimeDays ? `${supplier.averageLeadTimeDays} días` : "No informado"}
                  </span>
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