import React, { useState, useEffect, useCallback } from 'react';
import { Ban, CheckCircle2, RefreshCw, Edit2, Save, X } from 'lucide-react';
import { UsersService, UserListItem } from '../services/users.service.js';
import { RolesService, RoleDto } from '../../security/services/roles.service.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { mapToUserFriendlyError } from '../../../shared/utils/errorMessageMapper.js';


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

interface EditUserInlineFormProps {
  user: UserListItem;
  roles: RoleDto[];
  onSaveEdit: (userId: string, data: { name?: string; role?: string; pin?: string }) => Promise<void>;
  onCancel: () => void;
}

const EditUserInlineForm: React.FC<EditUserInlineFormProps> = ({ user, roles, onSaveEdit, onCancel }) => {
  const [editName, setEditName] = useState(user.name);
  const [editRole, setEditRole] = useState(user.role);
  const [editPin, setEditPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setFormError(null);
    try {
      await onSaveEdit(user.id, {
        name: editName,
        role: editRole,
        pin: editPin.trim() ? editPin.trim() : undefined,
      });
      onCancel();
      setEditPin('');
    } catch (err) {
      const friendly = mapToUserFriendlyError(err);
      setFormError(friendly.message);
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="flex-column flex-gap-sm">
      {formError && <ErrorBanner message={formError} />}
      <div className="edit-user-grid">
        <div>
          <label htmlFor={`edit-name-${user.id}`} className="form-label fs-xs">
            Nombre
          </label>
          <input
            id={`edit-name-${user.id}`}
            type="text"
            className="input-touch w-full input-touch-compact"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`edit-role-${user.id}`} className="form-label fs-xs">
            Rol
          </label>
          <select
            id={`edit-role-${user.id}`}
            className="input-touch w-full input-touch-compact"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
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
        <label htmlFor={`edit-pin-${user.id}`} className="form-label fs-xs">
          Nuevo PIN (opcional)
        </label>
        <input
          id={`edit-pin-${user.id}`}
          type="password"
          className="input-touch w-full input-touch-compact"
          placeholder="Dejar en blanco para conservar actual"
          value={editPin}
          onChange={(e) => setEditPin(e.target.value)}
        />
      </div>
      <div className="flex-gap-xs mt-1 justify-end">
        <button
          type="button"
          className="btn-touch btn-secondary flex-gap-xs edit-user-action-btn"
          onClick={onCancel}
        >
          <X size={16} /> Cancelar
        </button>
        <button
          type="button"
          className="btn-touch btn-primary flex-gap-xs edit-user-action-btn"
          onClick={handleSave}
          disabled={isSaving}
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
    <div className="flex-column flex-gap-xs user-row">
      {!isEditing ? (
        <div className="flex-between gap-3">
          <div>
            <div className="fs-md fw-bold">{user.name}</div>
            <div className="text-secondary-color fs-xs">
              Rol: <strong className="text-primary-color">{user.role}</strong> · Estado:{' '}
              <span className={`fw-bold ${isBlocked ? 'text-danger-color' : 'text-success-color'}`}>
                {user.status}
              </span>
            </div>
          </div>
          <div className="flex-gap-xs">
            <button
              type="button"
              className="btn-touch btn-secondary user-row-icon-btn"
              onClick={() => setIsEditing(true)}
              title="Editar Operario"
            >
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              className={`btn-touch flex-center flex-gap-xs user-row-toggle-btn ${isBlocked ? 'btn-primary' : 'btn-danger'}`}
              disabled={isPending}
              onClick={() => onToggle(user)}
            >
              {isBlocked ? <CheckCircle2 size={16} /> : <Ban size={16} />}
              {isPending ? '...' : isBlocked ? 'Reactivar' : 'Bloquear'}
            </button>
          </div>
        </div>
      ) : (
        <EditUserInlineForm user={user} roles={roles} onCancel={() => setIsEditing(false)} onSaveEdit={onSaveEdit} />
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
        <span className="text-secondary-color fs-sm fw-bold">
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
        <div className="text-secondary-color text-center p-6">Cargando operarios...</div>
      ) : list.users.length === 0 ? (
        <div className="text-secondary-color text-center p-6 fs-md">
          Sin operarios registrados todavía.
        </div>
      ) : (
        <div className="user-list-scroll">
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
