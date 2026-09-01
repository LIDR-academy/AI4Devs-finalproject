import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

import { Modal } from '../../../shared/components/Modal.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { AuthService } from '../services/auth.service.js';

interface ForceChangePinModalProps {
  userId: string;
  onSuccess: () => void;
}

export const ForceChangePinModal: React.FC<ForceChangePinModalProps> = ({ userId, onSuccess }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPin || currentPin.length < 4) {
      setError('El PIN actual debe tener al menos 4 dígitos.');
      return;
    }
    if (!newPin || newPin.length < 4) {
      setError('El nuevo PIN debe tener al menos 4 dígitos.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('La confirmación no coincide con el nuevo PIN.');
      return;
    }
    if (currentPin === newPin) {
      setError('El nuevo PIN no puede ser idéntico al PIN actual.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await AuthService.changePin(userId, currentPin, newPin);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el PIN de seguridad.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal maxWidth="440px" width="100%" textAlign="center">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <div className="card-badge-icon" style={{ width: '56px', height: '56px', backgroundColor: 'color-mix(in srgb, var(--color-danger) 15%, transparent)', color: 'var(--color-danger)' }}>
          <ShieldAlert size={32} />
        </div>
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
        Cambio Obligatorio de PIN
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
        Modo Estricto de Seguridad (Guard 36): Por políticas del sistema debe reemplazar su PIN de acceso inicial antes de ingresar al tablero.
      </p>

      {error && (
        <ErrorBanner message={error} icon={<AlertCircle size={18} />} padding="10px 14px" fontSize="0.88rem" />
      )}

      <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
        <div>
          <label htmlFor="input-force-current-pin" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            PIN Actual de Acceso:
          </label>
          <input
            id="input-force-current-pin"
            type="password"
            className="input-touch"
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value)}
            maxLength={6}
            placeholder="****"
            disabled={isLoading}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label htmlFor="input-force-new-pin" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            Nuevo PIN Personal (4 a 6 dígitos):
          </label>
          <input
            id="input-force-new-pin"
            type="password"
            className="input-touch"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            maxLength={6}
            placeholder="****"
            disabled={isLoading}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label htmlFor="input-force-confirm-pin" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            Confirmar Nuevo PIN:
          </label>
          <input
            id="input-force-confirm-pin"
            type="password"
            className="input-touch"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            maxLength={6}
            placeholder="****"
            disabled={isLoading}
            style={{ width: '100%' }}
          />
        </div>


        <button
          type="submit"
          className="btn-touch btn-primary"
          disabled={isLoading || !currentPin || !newPin || !confirmPin}
          style={{ width: '100%', marginTop: '12px' }}
        >
          <CheckCircle2 size={20} />
          {isLoading ? 'Actualizando PIN...' : 'Confirmar y Desbloquear Tablero'}
        </button>
      </form>
    </Modal>
  );
};
