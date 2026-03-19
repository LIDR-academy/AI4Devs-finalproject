import { Suspense } from 'react';
import { getAddresses } from '@/lib/api';
import {
  VALID_ADDRESS_SORT_COLUMNS,
  DEFAULT_ADDRESS_SORT,
  DEFAULT_ADDRESS_DIR,
  type AddressSortByColumn,
  type SortDir,
  type AddressesFilters,
} from '@/types/api';

export const dynamic = 'force-dynamic';
import { AddressesTable } from '@/components/addresses/addresses-table';
import { AddressesEmptyState } from '@/components/addresses/addresses-empty-state';
import { AddressesFilterBar } from '@/components/addresses/addresses-filter-bar';
import { AddressesTableSkeleton } from '@/components/addresses/addresses-table-skeleton';

export const metadata = { title: 'Direcciones | Adresles Admin' };

export default async function AddressesPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    dir?: string;
    q?: string;
    favorite?: string;
  }>;
}) {
  const { sort, dir, q, favorite } = await searchParams;

  const isValidSort = VALID_ADDRESS_SORT_COLUMNS.includes(sort as AddressSortByColumn);
  const sortBy: AddressSortByColumn = isValidSort
    ? (sort as AddressSortByColumn)
    : DEFAULT_ADDRESS_SORT;
  const sortDir: SortDir = isValidSort
    ? dir === 'asc' || dir === 'desc'
      ? dir
      : DEFAULT_ADDRESS_DIR
    : DEFAULT_ADDRESS_DIR;

  const parsedQ = q?.trim() ?? '';
  const parsedFavorite: 'true' | 'false' | undefined =
    favorite === 'true' || favorite === 'false' ? favorite : undefined;

  const filters: AddressesFilters = {
    q: parsedQ || undefined,
    favorite: parsedFavorite,
  };

  const hasFilters = Boolean(parsedQ || parsedFavorite);

  const { data: addresses, meta } = await getAddresses(1, 50, sortBy, sortDir, filters);

  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Direcciones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meta.total} dirección{meta.total !== 1 ? 'es' : ''} encontrada{meta.total !== 1 ? 's' : ''}
        </p>
      </div>

      <AddressesFilterBar
        initialQ={parsedQ}
        initialFavorite={parsedFavorite}
        sortBy={sortBy}
        sortDir={sortDir}
      />

      {addresses.length === 0 ? (
        <AddressesEmptyState hasFilters={hasFilters} />
      ) : (
        <Suspense fallback={<AddressesTableSkeleton />}>
          <div className="rounded-lg border bg-card">
            <AddressesTable addresses={addresses} sortBy={sortBy} sortDir={sortDir} />
          </div>
        </Suspense>
      )}
    </div>
  );
}
