'use client';

import { useEffect, useState } from 'react';
import {
  ClientSearchBar,
  ClientSearchHint,
} from '@/features/clients';
import { useClientSearch } from '@/features/clients/hooks/useClientSearch';
import type { Client } from '@/features/clients/types/client.types';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/lib/cn';

interface ClientPickerProps {
  value: string | null;
  onChange: (client: Client) => void;
  readOnlyClient?: Client | null;
  selectedClient?: Client | null;
  error?: string;
}

export function ClientPicker({
  value,
  onChange,
  readOnlyClient = null,
  selectedClient = null,
  error,
}: ClientPickerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isFetching, isLoading } = useClientSearch(searchQuery);
  const hasQuery = searchQuery.trim().length >= 2;

  useEffect(() => {
    if (!modalOpen) {
      setSearchQuery('');
    }
  }, [modalOpen]);

  if (readOnlyClient) {
    return (
      <div className="space-y-1">
        <span className="block text-sm font-medium text-slate-700">
          Propietario
        </span>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">{readOnlyClient.fullName}</p>
          <p>Identificación: {readOnlyClient.nationalId}</p>
        </div>
        <input type="hidden" value={readOnlyClient.id} readOnly />
      </div>
    );
  }

  const displayClient = selectedClient;

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-slate-700">
        Propietario
      </span>

      {displayClient ? (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">{displayClient.fullName}</p>
          <p>Identificación: {displayClient.nationalId}</p>
          <Button
            type="button"
            variant="ghost"
            className="mt-2 px-0"
            onClick={() => setModalOpen(true)}
          >
            Cambiar propietario
          </Button>
        </div>
      ) : (
        <Button type="button" variant="secondary" onClick={() => setModalOpen(true)}>
          Buscar propietario
        </Button>
      )}

      {!value && error && <p className="text-sm text-red-600">{error}</p>}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="client-picker-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="client-picker-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Seleccionar propietario
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Busca un cliente existente para asignarlo como propietario.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                aria-label="Cerrar"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </Button>
            </div>

            <ClientSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              isLoading={hasQuery && (isFetching || isLoading)}
            />
            <ClientSearchHint query={searchQuery} />

            <div className="mt-4">
              {hasQuery && !isFetching && !isLoading && data?.items.length === 0 && (
                <p className="text-sm text-slate-600">
                  No se encontraron clientes. Registra uno nuevo en Clientes.
                </p>
              )}

              {hasQuery && (isFetching || isLoading) && (
                <p className="text-sm text-slate-500">Buscando clientes...</p>
              )}

              {data && data.items.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {data.items.map((client) => (
                    <li key={client.id}>
                      <button
                        type="button"
                        className={cn(
                          'w-full rounded-lg border border-slate-200 px-3 py-3 text-left text-sm transition hover:border-blue-300 hover:bg-blue-50',
                        )}
                        onClick={() => {
                          onChange(client);
                          setModalOpen(false);
                        }}
                      >
                        <p className="font-semibold text-slate-900">
                          {client.fullName}
                        </p>
                        <p className="text-slate-600">
                          Identificación: {client.nationalId}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
