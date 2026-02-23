'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OrdersError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Orders page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-8">
      <h2 className="text-lg font-semibold text-foreground mb-2">
        No se pudieron cargar los pedidos
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Ocurrió un error al obtener los datos. Por favor, inténtalo de nuevo.
      </p>
      <Button onClick={reset} variant="outline">
        Reintentar
      </Button>
    </div>
  );
}
