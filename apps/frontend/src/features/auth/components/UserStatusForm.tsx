import React, { useState } from 'react';
import { Ban, CheckCircle2 } from 'lucide-react';
import { UsersService } from '../services/users.service.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';

interface UserStatusFormProps {
  onUpdated: (message: string) => void;
}

function useUserStatusForm(onUpdated: (message: string) => void) {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'BLOCK' | 'ACTIVATE' | null>(null);

  const handleAction = async (action: 'BLOCK' | 'ACTIVATE') => {
    if (!userId.trim()) {
      setError('Ingresa el ID del operario.');
      return;
    }
    setError(null);
    setPendingAction(action);

    try {
      const result = await UsersService.setUserStatus(userId.trim(), action);
      onUpdated(`Cuenta "${result.id}" ahora en estado ${result.status}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando el estado del operario.');
    } finally {
      setPendingAction(null);
    }
  };

  return { userId, setUserId, error, pendingAction, handleAction };
}

export const UserStatusForm: React.FC<UserStatusFormProps> = ({ onUpdated }) => {
  const form = useUserStatusForm(onUpdated);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {form.error && <ErrorBanner message={form.error} />}

      <div
        style={{
          padding: '10px 14px',
          backgroundColor: 'rgba(255, 170, 0, 0.1)',
          borderRadius: '8px',
          fontSize: '0.82rem',
          color: 'var(--color-warning)',
        }}
      >
        ⚠️ El backend todavía no expone un listado de operarios — ingresa el ID exacto de la
        cuenta que quieres bloquear o reactivar.
      </div>

      <div>
        <label htmlFor="input-status-user-id" className="form-label">
          ID del Operario:
        </label>
        <input
          type="text"
          id="input-status-user-id"
          className="input-touch"
          value={form.userId}
          onChange={(e) => form.setUserId(e.target.value)}
          placeholder="ej. usr-maria-2"
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          className="btn-touch btn-danger"
          disabled={form.pendingAction !== null}
          onClick={() => form.handleAction('BLOCK')}
          style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          <Ban size={18} />
          {form.pendingAction === 'BLOCK' ? 'Bloqueando...' : 'Bloquear'}
        </button>
        <button
          type="button"
          className="btn-touch btn-primary"
          disabled={form.pendingAction !== null}
          onClick={() => form.handleAction('ACTIVATE')}
          style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          <CheckCircle2 size={18} />
          {form.pendingAction === 'ACTIVATE' ? 'Reactivando...' : 'Reactivar'}
        </button>
      </div>
    </div>
  );
};
