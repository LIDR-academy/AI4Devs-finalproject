import Link from "next/link";

import { SupplierForm } from "@/app/suppliers/new/supplier-form";
import { canManageSuppliers } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";

export default async function NewSupplierPage() {
  await requireRole(canManageSuppliers);

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-16">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <Link href="/suppliers" className="text-sm font-medium text-stone-600 underline">
          Volver a proveedores
        </Link>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            Ticket T-05
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
            Crear proveedor
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
            Registra proveedores con datos comerciales mínimos para que queden disponibles al crear productos.
          </p>
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <SupplierForm />
        </section>
      </div>
    </main>
  );
}