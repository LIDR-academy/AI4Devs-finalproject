'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/components/Button';
import {
  ClientSearchBar,
  ClientSearchHint,
  ClientSearchResults,
} from '@/features/clients';
import { useClientSearch } from '@/features/clients/hooks/useClientSearch';

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isFetching, isLoading } = useClientSearch(searchQuery);
  const hasQuery = searchQuery.trim().length >= 2;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Busca un cliente existente antes de registrar uno nuevo.
          </p>
        </div>
        <Link href="/clients/new">
          <Button>Nuevo cliente</Button>
        </Link>
      </div>

      <ClientSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        isLoading={hasQuery && (isFetching || isLoading)}
      />
      <ClientSearchHint query={searchQuery} />

      <ClientSearchResults
        items={data?.items ?? []}
        isLoading={hasQuery && (isFetching || isLoading)}
        hasQuery={hasQuery}
        total={data?.total}
      />
    </div>
  );
}
