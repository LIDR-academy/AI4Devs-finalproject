import Link from 'next/link';
import { Button } from '@/shared/components/Button';
import type { Client } from '../types/client.types';

interface ClientResultCardProps {
  client: Client;
}

export function ClientResultCard({ client }: ClientResultCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900">{client.fullName}</h3>
        <p className="text-sm text-slate-600">
          <span className="font-medium">Identificación:</span> {client.nationalId}
        </p>
        <p className="text-sm text-slate-600">
          <span className="font-medium">Teléfono:</span>{' '}
          {client.phone ?? 'Sin teléfono'}
        </p>
        {client.email && (
          <p className="text-sm text-slate-600">
            <span className="font-medium">Correo:</span> {client.email}
          </p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={`/clients/${client.id}`}>
          <Button type="button" variant="secondary">
            Ver cliente
          </Button>
        </Link>
        <Link href={`/clients/${client.id}/edit`}>
          <Button type="button" variant="secondary">
            Editar cliente
          </Button>
        </Link>
        <Link href={`/vehicles/new?clientId=${client.id}`}>
          <Button type="button">Registrar vehículo</Button>
        </Link>
      </div>
    </article>
  );
}
