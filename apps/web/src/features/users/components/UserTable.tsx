'use client';

import { Button } from '@/shared/components/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { UserListItem } from '../types/user.types';
import { UserRoleBadge } from './UserRoleBadge';
import { UserStatusBadge } from './UserStatusBadge';

interface UserTableProps {
  users: UserListItem[];
  onEdit: (user: UserListItem) => void;
  onDeactivate: (user: UserListItem) => void;
}

export function UserTable({ users, onEdit, onDeactivate }: UserTableProps) {
  const { user: currentUser } = useAuth();

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-700">
              Nombre
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-700">
              Correo
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-700">
              Rol
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-700">
              Estado
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium text-slate-700">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {users.map((user) => {
            const isCurrentUser = user.id === currentUser?.id;
            const canDeactivate = user.active && !isCurrentUser;

            return (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{user.fullName}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <UserRoleBadge
                    role={user.role}
                    canActAsMechanic={user.canActAsMechanic}
                  />
                </td>
                <td className="px-4 py-3">
                  <UserStatusBadge active={user.active} />
                </td>
                <td className="px-4 py-3 text-right">
                  {user.active ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onEdit(user)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 disabled:text-slate-400"
                        disabled={!canDeactivate}
                        title={
                          isCurrentUser
                            ? 'No puedes desactivar tu propia cuenta'
                            : undefined
                        }
                        onClick={() => onDeactivate(user)}
                      >
                        Desactivar
                      </Button>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
