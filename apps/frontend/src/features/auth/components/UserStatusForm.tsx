import React, { useState, useEffect, useCallback } from 'react';
import { Ban, CheckCircle2, RefreshCw, Edit2, Save, X } from 'lucide-react';
import { UsersService, UserListItem } from '../services/users.service.js';
import { RolesService, RoleDto } from '../../security/services/roles.service.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';

interface UserStatusFormProps {
  onUpdated: (message: string) => void;
}

function useUserList() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [uList, rList] = await Promise.all([
        UsersService.listUsers(),
        RolesService.fetchRoles().catch(() => []),
      ]);
      setUsers(uList);
      setRoles(rList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error consultando el listado de operarios.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { users, roles, isLoading, error, pendingId, setPendingId, load };
}

interface UserRowProps {
  user: UserListItem;
  roles: RoleDto[];
  isPending: boolean;
  onToggle: (user: UserListItem) => void;
  onSaveEdit: (userId: string, data: { name?: string; role?: string; pin?: string }) => Promise<void>;
}

interface EditingUserFormProps {
  user: UserListItem;
  roles: RoleDto[];
  onCancel: () => void;
  onSaveEdit: (userId: string, data: { name?: string; role?: string; pin?: string }) => Promise<void>;
}

const EditingUserForm: React.FC<EditingUserFormProps> = ({ user, roles, onCancel, onSaveEdit }) => {
  const [editName, setEditName] = useState(user.name);
  const [editRole, setEditRole] = useState(user.role);
  const [editPin, setEditPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveEdit(user.id, {
        name: editName,
        role: editRole,
        pin: editPin.trim() ? editPin.trim() : undefined,
      });
      onCancel();
      setEditPin('');
    } catch {
      alert('Error al actualizar el usuario');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-column flex-gap-sm">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <label htmlFor={`edit-name-${user.id}`} className="form-label" style={{ fontSize: '0.75rem' }}>
            Nombre
          </label>
          <input
            id={`edit-name-${user.id}`}
            type="text"
            className="input-touch w-full"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            style={{ height: '38px', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label htmlFor={`edit-role-${user.id}`} className="form-label" style={{ fontSize: '0.75rem' }}>
            Rol
          </label>
          <select
            id={`edit-role-${user.id}`}
            className="input-touch w-full"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            style={{ height: '38px', fontSize: '0.85rem' }}
          >
            {roles.length > 0 ? (
              roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))
            ) : (
              <>
                <option value="KITCHEN_STAFF">KITCHEN_STAFF</option>
                <option value="ADMIN">ADMIN</option>
              </>
            )}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor={`edit-pin-${user.id}`} className="form-label" style={{ fontSize: '0.75rem' }}>
          Nuevo PIN (opcional)
        </label>
        <input
          id={`edit-pin-${user.id}`}
          type="password"
          className="input-touch w-full"
          placeholder="Dejar en blanco para conservar actual"
          value={editPin}
          onChange={(e) => setEditPin(e.target.value)}
          style={{ height: '38px', fontSize: '0.85rem' }}
        />
      </div>
      <div className="flex-gap-xs" style={{ justifyContent: 'flex-end', marginTop: '4px' }}>
        <button
          type="button"
          className="btn-touch btn-secondary flex-gap-xs"
          onClick={onCancel}
          style={{ padding: '6px 12px' }}
        >
          <X size={16} /> Cancelar
        </button>
        <button
          type="button"
          className="btn-touch btn-primary flex-gap-xs"
          onClick={handleSave}
          disabled={isSaving}
          style={{ padding: '6px 12px' }}
        >
          <Save size={16} /> {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
};

const UserRow: React.FC<UserRowProps> = ({ user, roles, isPending, onToggle, onSaveEdit }) => {
  const isBlocked = user.status === 'BLOCKED';
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div
      className="flex-column flex-gap-xs"
      style={{
        padding: '12px',
        borderBottom: '1px solid var(--border-card)',
        backgroundColor: 'var(--bg-root)',
        borderRadius: '6px',
        marginBottom: '8px',
      }}
    >
      {!isEditing ? (
        <div className="flex-between" style={{ gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
            <div className="text-secondary-color" style={{ fontSize: '0.8rem' }}>
              Rol: <strong className="text-primary-color">{user.role}</strong> · Estado:{' '}
              <span style={{ fontWeight: 700, color: isBlocked ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {user.status}
              </span>
            </div>
          </div>
          <div className="flex-gap-xs">
            <button
              type="button"
              className="btn-touch btn-secondary"
              onClick={() => setIsEditing(true)}
              style={{ padding: '6px 10px' }}
              title="Editar Operario"
            >
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              className={`btn-touch flex-center flex-gap-xs ${isBlocked ? 'btn-primary' : 'btn-danger'}`}
              disabled={isPending}
              onClick={() => onToggle(user)}
              style={{ minWidth: '100px' }}
            >
              {isBlocked ? <CheckCircle2 size={16} /> : <Ban size={16} />}
              {isPending ? '...' : isBlocked ? 'Reactivar' : 'Bloquear'}
            </button>
          </div>
        </div>
      ) : (
        <EditingUserForm user={user} roles={roles} onCancel={() => setIsEditing(false)} onSaveEdit={onSaveEdit} />
      )}
    </div>
  );
};

export const UserStatusForm: React.FC<UserStatusFormProps> = ({ onUpdated }) => {
  const list = useUserList();

  const handleToggle = async (user: UserListItem) => {
    list.setPendingId(user.id);
    const action = user.status === 'BLOCKED' ? 'ACTIVATE' : 'BLOCK';
    try {
      const result = await UsersService.setUserStatus(user.id, action);
      onUpdated(`Cuenta "${user.name}" ahora en estado ${result.status}.`);
      await list.load();
    } catch (err) {
      onUpdated(err instanceof Error ? `Error: ${err.message}` : 'Error actualizando el estado del operario.');
    } finally {
      list.setPendingId(null);
    }
  };

  const handleSaveEdit = async (userId: string, data: { name?: string; role?: string; pin?: string }) => {
    const updated = await UsersService.updateUser(userId, data);
    onUpdated(`Usuario "${updated.name}" actualizado correctamente.`);
    await list.load();
  };

  return (
    <div className="flex-column flex-gap-sm">
      {list.error && <ErrorBanner message={list.error} />}

      <div className="flex-between">
        <span className="text-secondary-color" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
          Personal Registrado ({list.users.length})
        </span>
        <button
          type="button"
          className="btn-touch btn-secondary"
          onClick={list.load}
          disabled={list.isLoading}
          id="btn-refresh-user-list"
        >
          <RefreshCw size={16} className={list.isLoading ? 'spin' : ''} />
        </button>
      </div>

      {list.isLoading ? (
        <div className="text-secondary-color text-center" style={{ padding: '24px' }}>Cargando operarios...</div>
      ) : list.users.length === 0 ? (
        <div className="text-secondary-color text-center" style={{ padding: '24px', fontSize: '0.9rem' }}>
          Sin operarios registrados todavía.
        </div>
      ) : (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {list.users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              roles={list.roles}
              isPending={list.pendingId === user.id}
              onToggle={handleToggle}
              onSaveEdit={handleSaveEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
