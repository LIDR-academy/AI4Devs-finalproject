import { getUsers } from '@/lib/api';

export const dynamic = 'force-dynamic';
import { UsersTable } from '@/components/users/users-table';
import { UsersEmptyState } from '@/components/users/users-empty-state';

export const metadata = { title: 'Usuarios | Adresles Admin' };

export default async function UsersPage() {
  const { data: users } = await getUsers();

  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Usuarios que han interactuado con Adresles
        </p>
      </div>

      {users.length === 0 ? (
        <UsersEmptyState />
      ) : (
        <div className="rounded-lg border bg-card">
          <UsersTable users={users} />
        </div>
      )}
    </div>
  );
}
