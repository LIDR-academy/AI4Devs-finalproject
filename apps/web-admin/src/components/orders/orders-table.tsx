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
import { formatDate, formatCurrency, formatFullName } from '@/lib/utils';
import type { AdminOrder } from '@/types/api';

interface OrdersTableProps {
  orders: AdminOrder[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">N.º pedido</TableHead>
          <TableHead scope="col">Tienda</TableHead>
          <TableHead scope="col">Usuario</TableHead>
          <TableHead scope="col">Importe</TableHead>
          <TableHead scope="col">Estado</TableHead>
          <TableHead scope="col">Modo</TableHead>
          <TableHead scope="col">Fecha</TableHead>
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
