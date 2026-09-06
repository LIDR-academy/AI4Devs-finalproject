import type { ClientProfileResponse } from '../types/history.types';

interface ClientProfileHeaderProps {
  client: Pick<
    ClientProfileResponse,
    'fullName' | 'nationalId' | 'phone' | 'email'
  >;
}

export function ClientProfileHeader({ client }: ClientProfileHeaderProps) {
  return (
    <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">{client.fullName}</h1>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Identificación
          </dt>
          <dd className="mt-1 text-sm text-slate-800">{client.nationalId}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Teléfono
          </dt>
          <dd className="mt-1 text-sm text-slate-800">
            {client.phone ? (
              <a
                href={`tel:${client.phone}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {client.phone}
              </a>
            ) : (
              <span className="italic text-slate-400">Sin teléfono</span>
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Correo
          </dt>
          <dd className="mt-1 text-sm text-slate-800">
            {client.email ? (
              <a
                href={`mailto:${client.email}`}
                className="text-blue-600 hover:underline"
              >
                {client.email}
              </a>
            ) : (
              <span className="italic text-slate-400">Sin correo</span>
            )}
          </dd>
        </div>
      </dl>
    </header>
  );
}
