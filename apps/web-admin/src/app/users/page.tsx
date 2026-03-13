import { Suspense } from 'react';
import { getUsers } from '@/lib/api';
import {
  VALID_USER_SORT_COLUMNS,
  DEFAULT_USER_SORT,
  DEFAULT_USER_DIR,
  type UserSortByColumn,
  type SortDir,
  type UsersFilters,
} from '@/types/api';

export const dynamic = 'force-dynamic';
import { UsersTable } from '@/components/users/users-table';
import { UsersEmptyState } from '@/components/users/users-empty-state';
import { UsersFilterBar } from '@/components/users/users-filter-bar';
import { UsersTableSkeleton } from '@/components/users/users-table-skeleton';

export const metadata = { title: 'Usuarios | Adresles Admin' };

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    dir?: string;
    q?: string;
    registered?: string;
  }>;
}) {
  const { sort, dir, q, registered } = await searchParams;

  const isValidSort = VALID_USER_SORT_COLUMNS.includes(sort as UserSortByColumn);
  const sortBy: UserSortByColumn = isValidSort ? (sort as UserSortByColumn) : DEFAULT_USER_SORT;
  const sortDir: SortDir =
    isValidSort ? (dir === 'asc' || dir === 'desc' ? dir : DEFAULT_USER_DIR) : DEFAULT_USER_DIR;

  const parsedQ = q?.trim() ?? '';
  const parsedRegistered: 'true' | 'false' | undefined =
    registered === 'true' || registered === 'false' ? registered : undefined;

  const filters: UsersFilters = {
    q: parsedQ || undefined,
    registered: parsedRegistered,
  };

  const hasFilters = Boolean(parsedQ || parsedRegistered);

  const { data: users, meta } = await getUsers(1, 50, sortBy, sortDir, filters);

  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meta.total} usuario{meta.total !== 1 ? 's' : ''} encontrado{meta.total !== 1 ? 's' : ''}
        </p>
      </div>

      <UsersFilterBar
        initialQ={parsedQ}
        initialRegistered={parsedRegistered}
        sortBy={sortBy}
        sortDir={sortDir}
      />

      {users.length === 0 ? (
        <UsersEmptyState hasFilters={hasFilters} />
      ) : (
        <Suspense fallback={<UsersTableSkeleton />}>
          <div className="rounded-lg border bg-card">
            <UsersTable users={users} sortBy={sortBy} sortDir={sortDir} />
          </div>
        </Suspense>
      )}
    </div>
  );
}
