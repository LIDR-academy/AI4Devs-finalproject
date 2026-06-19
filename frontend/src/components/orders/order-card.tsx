'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { OrderListResponse } from '../../types/order';
import { STATUS_CONFIG, buildImageUrl } from '../../lib/product-utils';

interface OrderCardProps {
  order: OrderListResponse;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function OrderCard({ order }: OrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status];

  return (
    <article className="rounded-lg bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <p className="font-semibold text-foreground">{order.id}</p>
          <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
        </div>
        {statusConfig && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
          >
            {statusConfig.label}
          </span>
        )}
      </header>

      <ul className="mt-4 space-y-3">
        {order.items.map((item) => (
          <li key={`${item.productId}-${item.size ?? ''}-${item.color ?? ''}`}>
            <Link href={`/product/${item.productId}`} className="flex items-center gap-3">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={buildImageUrl(item.image)}
                  alt={item.productName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × {formatCurrency(item.productPrice)} €
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-bold text-foreground">
        <span>Total</span>
        <span>{formatCurrency(order.total)} €</span>
      </div>
    </article>
  );
}
