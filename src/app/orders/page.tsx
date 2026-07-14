import Link from "next/link";

import { canManageOrders } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { listOrders } from "@/modules/orders/queries";

type OrdersPageProps = {
  searchParams: Promise<{
    created?: string;
    warning?: string;
  }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  await requireRole(canManageOrders);

  const orders = await listOrders();
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-16">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Tickets T-07 y T-08
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
              Órdenes de cliente
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Órdenes creadas con cálculo básico y trazabilidad por proveedor principal.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-white">
              Panel
            </Link>
            <Link href="/orders/new" className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800">
              Nueva orden
            </Link>
          </div>
        </div>

        {params.created ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Orden creada correctamente.
          </p>
        ) : null}

        {params.warning === "mixed-suppliers" ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            La última orden contiene productos de distintos proveedores. Se recomienda dividirla para simplificar la operación.
          </p>
        ) : null}

        <section className="rounded-[2rem] bg-white shadow-sm">
          <div className="grid grid-cols-[1.2fr_1.4fr_1fr_0.8fr_0.8fr] gap-4 border-b border-stone-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            <span>Número</span>
            <span>Cliente</span>
            <span>Proveedor</span>
            <span>Estado</span>
            <span>Total</span>
          </div>
          {orders.length === 0 ? (
            <div className="px-6 py-10 text-sm text-stone-600">Todavía no hay órdenes registradas.</div>
          ) : (
            <ul>
              {orders.map((order) => (
                <li key={order.id} className="border-b border-stone-100 last:border-b-0">
                  <Link href={`/orders/${order.id}`} className="grid grid-cols-[1.2fr_1.4fr_1fr_0.8fr_0.8fr] gap-4 px-6 py-5 text-sm text-stone-700 transition hover:bg-stone-50">
                    <span className="font-medium text-stone-950">{order.orderNumber}</span>
                    <span>{order.client.commercialName}</span>
                    <span>{order.supplier?.commercialName ?? "Múltiples proveedores"}</span>
                    <span>{order.commercialStatus.toLowerCase()}</span>
                    <span>{Number(order.total).toFixed(2)}</span>
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