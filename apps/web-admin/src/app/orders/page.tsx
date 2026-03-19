import { getOrders } from '@/lib/api';
import {
  VALID_SORT_COLUMNS,
  VALID_ORDER_STATUSES,
  VALID_ORDER_MODES,
  DEFAULT_SORT,
  DEFAULT_DIR,
  type SortByColumn,
  type SortDir,
  type OrderStatus,
  type OrderMode,
  type OrdersFilters,
} from '@/types/api';

export const dynamic = 'force-dynamic';
import { OrdersTable } from '@/components/orders/orders-table';
import { OrdersEmptyState } from '@/components/orders/orders-empty-state';
import { OrdersFilterBar } from '@/components/orders/orders-filter-bar';

export const metadata = { title: 'Pedidos | Adresles Admin' };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    dir?: string;
    q?: string;
    status?: string;
    mode?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const { sort, dir, q, status, mode, from, to } = await searchParams;

  const isValidSort = VALID_SORT_COLUMNS.includes(sort as SortByColumn);
  const sortBy: SortByColumn = isValidSort ? (sort as SortByColumn) : DEFAULT_SORT;
  const sortDir: SortDir = isValidSort
    ? dir === 'asc' || dir === 'desc' ? dir : DEFAULT_DIR
    : DEFAULT_DIR;

  const parsedQ = q?.trim() ?? '';

  const parsedStatus: OrderStatus[] = status
    ? (status.split(',').filter((s) =>
        VALID_ORDER_STATUSES.includes(s as OrderStatus),
      ) as OrderStatus[])
    : [];

  const parsedMode: OrderMode[] = mode
    ? (mode.split(',').filter((m) =>
        VALID_ORDER_MODES.includes(m as OrderMode),
      ) as OrderMode[])
    : [];

  const parsedFrom = from ?? undefined;
  const parsedTo = to ?? undefined;

  const filters: OrdersFilters = {
    q: parsedQ || undefined,
    status: parsedStatus.length ? parsedStatus : undefined,
    mode: parsedMode.length ? parsedMode : undefined,
    from: parsedFrom,
    to: parsedTo,
  };

  const hasFilters = Boolean(
    parsedQ || parsedStatus.length || parsedMode.length || parsedFrom || parsedTo,
  );

  const { data: orders, meta } = await getOrders(1, 50, sortBy, sortDir, filters);

  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meta.total} pedido{meta.total !== 1 ? 's' : ''} encontrado{meta.total !== 1 ? 's' : ''}
        </p>
      </div>

      <OrdersFilterBar
        initialQ={parsedQ}
        initialStatus={parsedStatus}
        initialMode={parsedMode}
        initialFrom={parsedFrom}
        initialTo={parsedTo}
        sortBy={sortBy}
        sortDir={sortDir}
      />

      {orders.length === 0 ? (
        <OrdersEmptyState hasFilters={hasFilters} />
      ) : (
        <div className="rounded-lg border bg-card">
          <OrdersTable orders={orders} sortBy={sortBy} sortDir={sortDir} />
        </div>
      )}
    </div>
  );
}
