import Link from "next/link";
import { notFound } from "next/navigation";

import { canManageOrders } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { getOrderById } from "@/modules/orders/queries";

type OrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
  searchParams: Promise<{
    created?: string;
    warning?: string;
  }>;
};

export default async function OrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  await requireRole(canManageOrders);

  const { orderId } = await params;
  const query = await searchParams;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-16">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="flex gap-4">
          <Link href="/orders" className="text-sm font-medium text-stone-600 underline">
            Volver a órdenes
          </Link>
          <Link href="/" className="text-sm font-medium text-stone-600 underline">
            Panel
          </Link>
        </div>

        {query.created === "1" ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Orden creada correctamente.
          </p>
        ) : null}

        {query.warning === "mixed-suppliers" ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Esta orden tiene productos de más de un proveedor. Conviene dividirla para facilitar seguimiento y abastecimiento.
          </p>
        ) : null}

        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Orden</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">{order.orderNumber}</h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Cliente {order.client.commercialName} · Responsable {order.owner.fullName} · Estado {order.commercialStatus.toLowerCase()}
          </p>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            Proveedor asociado {order.supplier?.commercialName ?? "Múltiples proveedores"}
          </p>
        </section>

        <section className="rounded-[2rem] bg-white shadow-sm">
          <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-stone-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            <span>Producto</span>
            <span>Cantidad</span>
            <span>Proveedor</span>
            <span>Total</span>
          </div>
          <ul>
            {order.items.map((item) => (
              <li key={item.id} className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-stone-100 px-6 py-5 text-sm text-stone-700 last:border-b-0">
                <span>
                  <span className="block font-medium text-stone-950">{item.product.name}</span>
                  <span className="block text-stone-500">{item.product.sku}</span>
                </span>
                <span>{item.quantity}</span>
                <span>{item.product.supplier.commercialName}</span>
                <span>{Number(item.total).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Subtotal</h2>
            <p className="mt-4 text-2xl font-semibold text-stone-950">{Number(order.subtotal).toFixed(2)}</p>
          </article>
          <article className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Impuestos</h2>
            <p className="mt-4 text-2xl font-semibold text-stone-950">{Number(order.taxes).toFixed(2)}</p>
          </article>
          <article className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Total</h2>
            <p className="mt-4 text-2xl font-semibold text-stone-950">{Number(order.total).toFixed(2)}</p>
          </article>
        </section>
      </div>
    </main>
  );
}