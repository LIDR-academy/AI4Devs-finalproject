import Link from 'next/link';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/Button';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import type { Client } from '../types/client.types';
import { ClientResultCard } from './ClientResultCard';

interface ClientSearchResultsProps {
  items: Client[];
  isLoading: boolean;
  hasQuery: boolean;
  total?: number;
}

export function ClientSearchResults({
  items,
  isLoading,
  hasQuery,
  total = 0,
}: ClientSearchResultsProps) {
  if (!hasQuery) {
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner label="Buscando clientes..." />;
  }

  return (
    <div aria-live="polite" className="space-y-4">
      {total > 0 && (
        <p className="text-sm text-slate-600">
          {total === 1 ? '1 cliente encontrado' : `${total} clientes encontrados`}
        </p>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="No se encontraron clientes"
          description="Prueba con otro término o crea un nuevo cliente."
          action={
            <Link href="/clients/new">
              <Button>Crear nuevo cliente</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((client) => (
            <ClientResultCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
