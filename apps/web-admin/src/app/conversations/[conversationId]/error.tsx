'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ConversationError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Conversation page error:', error);
  }, [error]);

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 bg-brand-black px-6 py-4">
        <Link
          href="/orders"
          className="flex items-center gap-1 text-sm text-brand-teal hover:underline"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Volver a pedidos
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center flex-1 py-24 text-center px-8">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Conversación no disponible
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          No se pudo cargar esta conversación. Puede que haya expirado o no
          exista.
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
          >
            Reintentar
          </button>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Volver a pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}
