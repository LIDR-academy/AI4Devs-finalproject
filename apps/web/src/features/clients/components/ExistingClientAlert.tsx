import Link from 'next/link';
import { Button } from '@/shared/components/Button';
import type { Client } from '../types/client.types';

interface ExistingClientAlertProps {
  client: Client;
}

export function ExistingClientAlert({ client }: ExistingClientAlertProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-300 bg-amber-50 p-4"
    >
      <p className="text-sm font-medium text-amber-900">
        Ya existe un cliente con esta identificación
      </p>
      <div className="mt-3 rounded-lg border border-amber-200 bg-white p-3 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">{client.fullName}</p>
        <p>Identificación: {client.nationalId}</p>
        <p>Teléfono: {client.phone ?? 'Sin teléfono'}</p>
        {client.email && <p>Correo: {client.email}</p>}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={`/vehicles/new?clientId=${client.id}`}>
          <Button>Usar este cliente</Button>
        </Link>
        <Link href="/clients">
          <Button variant="secondary">Volver a búsqueda</Button>
        </Link>
      </div>
    </div>
  );
}
