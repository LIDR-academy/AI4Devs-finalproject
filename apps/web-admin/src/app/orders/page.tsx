import { getOrders } from '@/lib/api';

export const dynamic = 'force-dynamic';
import { OrdersTable } from '@/components/orders/orders-table';
import { OrdersEmptyState } from '@/components/orders/orders-empty-state';

export const metadata = { title: 'Pedidos | Adresles Admin' };

export default async function OrdersPage() {
  const { data: orders } = await getOrders();

  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Todos los pedidos procesados por Adresles
        </p>
      </div>

      {orders.length === 0 ? (
        <OrdersEmptyState />
      ) : (
        <div className="rounded-lg border bg-card">
          <OrdersTable orders={orders} />
        </div>
      )}
    </div>
  );
}
