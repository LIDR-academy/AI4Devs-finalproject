'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PackageOpen } from 'lucide-react';
import { fetchOrders } from '../../lib/api-client';
import { OrderCard } from '../../components/orders/order-card';
import type { OrderListResponse } from '../../types/order';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchOrders()
      .then((result) => {
        if (!isMounted) return;
        setOrders(result);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : 'No se pudieron cargar tus pedidos.';
        setError(message);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Cargando tus pedidos...</p>
      </main>
    );
  }

  if (error !== null) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16">
        <p role="alert" className="text-sm text-destructive text-center">
          {error}
        </p>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
        <PackageOpen size={64} className="text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Aún no tienes pedidos</h1>
        <p className="text-muted-foreground">
          Explora nuestro catálogo y realiza tu primera compra.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg bg-rm-cta hover:bg-rm-cta-hover text-rm-cta-fg font-medium transition-colors"
        >
          Explorar productos
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Mis pedidos</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Este historial muestra únicamente los pedidos realizados durante tu sesión actual.
      </p>

      <div className="flex flex-col gap-6">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </main>
  );
}
