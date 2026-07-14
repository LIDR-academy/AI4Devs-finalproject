import Link from "next/link";

import { ProductForm } from "@/app/products/new/product-form";
import { canManageProducts } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { listActiveSuppliers } from "@/modules/suppliers/active-suppliers";

export default async function NewProductPage() {
  await requireRole(canManageProducts);

  const suppliers = await listActiveSuppliers();

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-16">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <Link href="/products" className="text-sm font-medium text-stone-600 underline">
          Volver a productos
        </Link>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            Ticket T-06
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
            Crear producto con proveedor principal
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
            Solo se pueden crear productos asociados a proveedores activos. Si el producto está activo, debe tener proveedor principal.
          </p>
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <ProductForm
            suppliers={suppliers.map((supplier) => ({
              id: supplier.id,
              commercialName: supplier.commercialName,
            }))}
          />
        </section>
      </div>
    </main>
  );
}