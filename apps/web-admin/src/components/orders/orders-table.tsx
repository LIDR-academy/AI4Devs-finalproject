'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderStatusBadge, OrderModeBadge } from './order-status-badge';
import { SortableColumnHeader } from './sortable-column-header';
import { formatDate, formatCurrency, formatFullName } from '@/lib/utils';
import type { AdminOrder, SortByColumn, SortDir } from '@/types/api';

interface OrdersTableProps {
  orders: AdminOrder[];
  sortBy: SortByColumn;
  sortDir: SortDir;
}

export function OrdersTable({ orders, sortBy, sortDir }: OrdersTableProps) {
  const ariaSortFor = (col: SortByColumn): 'ascending' | 'descending' | 'none' => {
    if (col !== sortBy) return 'none';
    return sortDir === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col" aria-sort={ariaSortFor('ref')}>
            <SortableColumnHeader
              column="ref"
              label="Referencia"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead scope="col" aria-sort={ariaSortFor('store')}>
            <SortableColumnHeader
              column="store"
              label="Tienda"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead scope="col" aria-sort={ariaSortFor('user')}>
            <SortableColumnHeader
              column="user"
              label="Usuario"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead scope="col" aria-sort={ariaSortFor('amount')}>
            <SortableColumnHeader
              column="amount"
              label="Importe"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead scope="col">Estado</TableHead>
          <TableHead scope="col">Modo</TableHead>
          <TableHead scope="col" aria-sort={ariaSortFor('date')}>
            <SortableColumnHeader
              column="date"
              label="Fecha"
              currentSort={sortBy}
              currentDir={sortDir}
            />
          </TableHead>
          <TableHead scope="col" className="w-10">
            <span className="sr-only">Chat</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const orderNumber = order.externalOrderNumber ?? order.externalOrderId;
          const conversationId = order.conversations[0]?.id;

          return (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{orderNumber}</TableCell>
              <TableCell>{order.store.name}</TableCell>
              <TableCell>
                <div className="font-medium">
                  {formatFullName(order.user.firstName, order.user.lastName)}
                </div>
                {order.user.phone && (
                  <div className="text-xs text-gray-500">{order.user.phone.e164}</div>
                )}
              </TableCell>
              <TableCell>
                {formatCurrency(order.totalAmount, order.currency)}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell>
                <OrderModeBadge mode={order.orderMode} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(order.webhookReceivedAt)}
              </TableCell>
              <TableCell>
                {conversationId && (
                  <Link
                    href={`/conversations/${conversationId}`}
                    aria-label={`Ver conversación del pedido ${orderNumber}`}
                    className="inline-flex items-center justify-center rounded-md p-1.5 text-brand-teal hover:bg-brand-teal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
