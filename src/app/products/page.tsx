import Link from "next/link";

import { canManageProducts } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { listProducts } from "@/modules/products/queries";

type ProductsPageProps = {
  searchParams: Promise<{
    created?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  await requireRole(canManageProducts);

  const params = await searchParams;
  const products = await listProducts();

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-16">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Ticket T-06
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">Productos</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Productos del catálogo interno con proveedor principal, precio base y disponibilidad para órdenes.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-white">
              Panel
            </Link>
            <Link href="/products/new" className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800">
              Nuevo producto
            </Link>
          </div>
        </div>

        {params.created ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Producto creado correctamente.
          </p>
        ) : null}

        <section className="rounded-[2rem] bg-white shadow-sm">
          <div className="grid grid-cols-[1.1fr_1.7fr_1fr_0.8fr_0.8fr] gap-4 border-b border-stone-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            <span>SKU</span>
            <span>Producto</span>
            <span>Proveedor</span>
            <span>Estado</span>
            <span>Precio base</span>
          </div>
          {products.length === 0 ? (
            <div className="px-6 py-10 text-sm text-stone-600">Todavía no hay productos registrados.</div>
          ) : (
            <ul>
              {products.map((product) => (
                <li key={product.id} className="grid grid-cols-[1.1fr_1.7fr_1fr_0.8fr_0.8fr] gap-4 border-b border-stone-100 px-6 py-5 text-sm text-stone-700 last:border-b-0">
                  <span className="font-medium text-stone-950">{product.sku}</span>
                  <span>
                    <span className="block font-medium text-stone-950">{product.name}</span>
                    <span className="block text-stone-500">{product.category ?? "Sin categoría"}</span>
                  </span>
                  <span>{product.supplier.commercialName}</span>
                  <span>{product.status.toLowerCase()}</span>
                  <span>{Number(product.basePrice).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}