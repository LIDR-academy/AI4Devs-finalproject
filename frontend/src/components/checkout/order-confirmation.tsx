'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import type { OrderResponse } from '../../types/order';

interface OrderConfirmationProps {
  order: OrderResponse;
}

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
      <CheckCircle2 size={64} className="text-green-600" />
      <h1 className="text-2xl font-bold text-foreground">¡Pedido confirmado!</h1>
      <p className="text-lg font-semibold text-foreground">
        Número de pedido: <span>{order.id}</span>
      </p>
      <p className="text-muted-foreground">
        Te hemos enviado la confirmación a{' '}
        <span className="font-medium text-foreground">{order.shippingEmail}</span>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-lg bg-rm-cta px-6 py-3 font-medium text-rm-cta-fg transition-colors hover:bg-rm-cta-hover"
        >
          Seguir comprando
        </Link>
        <Link
          href="/orders"
          className="rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-gray-50"
        >
          Ver mis pedidos
        </Link>
      </div>
    </main>
  );
}
