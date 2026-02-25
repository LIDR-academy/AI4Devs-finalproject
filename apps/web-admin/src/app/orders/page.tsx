import { getOrders } from '@/lib/api';
import {
  VALID_SORT_COLUMNS,
  DEFAULT_SORT,
  DEFAULT_DIR,
  type SortByColumn,
  type SortDir,
} from '@/types/api';

export const dynamic = 'force-dynamic';
import { OrdersTable } from '@/components/orders/orders-table';
import { OrdersEmptyState } from '@/components/orders/orders-empty-state';

export const metadata = { title: 'Pedidos | Adresles Admin' };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string }>;
}) {
  const { sort, dir } = await searchParams;

  const isValidSort = VALID_SORT_COLUMNS.includes(sort as SortByColumn);
  const sortBy: SortByColumn = isValidSort ? (sort as SortByColumn) : DEFAULT_SORT;
  const sortDir: SortDir = isValidSort
    ? dir === 'asc' || dir === 'desc' ? dir : DEFAULT_DIR
    : DEFAULT_DIR;

  const { data: orders } = await getOrders(1, 50, sortBy, sortDir);

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
          <OrdersTable orders={orders} sortBy={sortBy} sortDir={sortDir} />
        </div>
      )}
    </div>
  );
}
