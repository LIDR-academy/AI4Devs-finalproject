import Link from "next/link";

import { OrderForm } from "@/app/orders/new/order-form";
import { canManageOrders, canViewAllClients } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { listClientsVisibleToUser } from "@/modules/clients/queries";
import { listActiveProducts } from "@/modules/products/queries";

export default async function NewOrderPage() {
  const currentUser = await requireRole(canManageOrders);

  const [clients, products] = await Promise.all([
    listClientsVisibleToUser(currentUser.authUser.id, canViewAllClients(currentUser.role)),
    listActiveProducts(),
  ]);

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-16">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <Link href="/orders" className="text-sm font-medium text-stone-600 underline">
          Volver a órdenes
        </Link>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            Tickets T-07 y T-08
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
            Crear orden de cliente
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
            La orden exige al menos un cliente y un producto. El sistema calcula subtotal y alerta si hay productos de varios proveedores.
          </p>
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <OrderForm
            clients={clients.map((client) => ({
              id: client.id,
              commercialName: client.commercialName,
            }))}
            products={products.map((product) => ({
              id: product.id,
              name: product.name,
              sku: product.sku,
              basePrice: Number(product.basePrice),
              supplierId: product.supplierId,
              supplierName: product.supplier.commercialName,
            }))}
          />
        </section>
      </div>
    </main>
  );
}