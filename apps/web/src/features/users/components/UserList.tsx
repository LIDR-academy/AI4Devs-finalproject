'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Modal } from '@/shared/components/Modal';
import { useUsers } from '../hooks/useUsers';
import type { UserListItem } from '../types/user.types';
import { mapUsersError } from '../utils/mapUsersError';
import { DeactivateUserDialog } from './DeactivateUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { UserForm } from './UserForm';
import { UserTable } from './UserTable';

export function UserList() {
  const { data: users, isLoading, isError, error, refetch, isFetching } = useUsers();
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserListItem | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<UserListItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Usuarios</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gestiona empleados activos e inactivos del taller.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Nuevo usuario
          </Button>
        </div>
      </div>

      {isLoading && <LoadingSpinner label="Cargando usuarios..." />}

      {isError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {mapUsersError(error)}
        </p>
      )}

      {!isLoading && !isError && users?.length === 0 && (
        <EmptyState
          title="No hay usuarios registrados"
          description="Crea el primer empleado para empezar."
          action={
            <Button type="button" onClick={() => setCreateOpen(true)}>
              Nuevo usuario
            </Button>
          }
        />
      )}

      {!isLoading && !isError && users && users.length > 0 && (
        <UserTable
          users={users}
          onEdit={(user) => setEditUser(user)}
          onDeactivate={(user) => setDeactivateUser(user)}
        />
      )}

      <Modal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nuevo usuario"
      >
        <UserForm
          onCancel={() => setCreateOpen(false)}
          onSuccess={() => {
            setCreateOpen(false);
            setToastMessage('Usuario creado correctamente');
          }}
        />
      </Modal>

      <EditUserDialog
        user={editUser}
        open={editUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditUser(null);
          }
        }}
        onSuccess={() => setToastMessage('Usuario actualizado')}
      />

      <DeactivateUserDialog
        user={deactivateUser}
        open={deactivateUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeactivateUser(null);
          }
        }}
        onSuccess={() => setToastMessage('Usuario desactivado correctamente')}
      />

      {toastMessage && (
        <p
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
        >
          {toastMessage}
        </p>
      )}
    </section>
  );
}
