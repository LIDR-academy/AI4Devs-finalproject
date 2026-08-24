import React, { useState, useEffect, useCallback } from 'react';
import { Ban, CheckCircle2, RefreshCw } from 'lucide-react';
import { UsersService, UserListItem } from '../services/users.service.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';

interface UserStatusFormProps {
  onUpdated: (message: string) => void;
}

function useUserList() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await UsersService.listUsers();
      setUsers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error consultando el listado de operarios.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { users, isLoading, error, pendingId, setPendingId, load };
}

interface UserRowProps {
  user: UserListItem;
  isPending: boolean;
  onToggle: (user: UserListItem) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, isPending, onToggle }) => {
  const isBlocked = user.status === 'BLOCKED';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderBottom: '1px solid var(--border-card)',
        gap: '12px',
      }}
    >
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          {user.role} · <span style={{ color: isBlocked ? 'var(--color-danger)' : 'var(--color-primary)' }}>{user.status}</span>
        </div>
      </div>
      <button
        type="button"
        className={`btn-touch ${isBlocked ? 'btn-primary' : 'btn-danger'}`}
        disabled={isPending}
        onClick={() => onToggle(user)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '120px', justifyContent: 'center' }}
      >
        {isBlocked ? <CheckCircle2 size={16} /> : <Ban size={16} />}
        {isPending ? '...' : isBlocked ? 'Reactivar' : 'Bloquear'}
      </button>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {list.error && <ErrorBanner message={list.error} />}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-touch btn-secondary" onClick={list.load} disabled={list.isLoading} id="btn-refresh-user-list">
          <RefreshCw size={16} className={list.isLoading ? 'spin' : ''} />
        </button>
      </div>

      {list.isLoading ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>Cargando operarios...</div>
      ) : list.users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Sin operarios registrados todavía.
        </div>
      ) : (
        <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
          {list.users.map((user) => (
            <UserRow key={user.id} user={user} isPending={list.pendingId === user.id} onToggle={handleToggle} />
          ))}
        </div>
      )}
    </div>
  );
};
