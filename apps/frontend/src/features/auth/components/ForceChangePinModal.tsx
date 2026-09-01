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
    <Modal size="sm" centered>
      <div className="modal-header-center">
        <div className="card-badge-icon card-badge-icon--danger icon-badge-md">
          <ShieldAlert size={32} />
        </div>
      </div>

      <h2 className="fs-xl fw-bold mb-1">
        Cambio Obligatorio de PIN
      </h2>
      <p className="text-secondary-color fs-md mb-5">
        Modo Estricto de Seguridad (Guard 36): Por políticas del sistema debe reemplazar su PIN de acceso inicial antes de ingresar al tablero.
      </p>

      {error && (
        <ErrorBanner message={error} icon={<AlertCircle size={18} />} compact />
      )}

      <form onSubmit={handleSubmit} className="flex-column gap-3 mt-3 text-left">
        <div>
          <label htmlFor="input-force-current-pin" className="fs-sm text-secondary-color mb-1 d-block">
            PIN Actual de Acceso:
          </label>
          <input
            id="input-force-current-pin"
            type="password"
            className="input-touch w-full"
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value)}
            maxLength={6}
            placeholder="****"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="input-force-new-pin" className="fs-sm text-secondary-color mb-1 d-block">
            Nuevo PIN Personal (4 a 6 dígitos):
          </label>
          <input
            id="input-force-new-pin"
            type="password"
            className="input-touch w-full"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            maxLength={6}
            placeholder="****"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="input-force-confirm-pin" className="fs-sm text-secondary-color mb-1 d-block">
            Confirmar Nuevo PIN:
          </label>
          <input
            id="input-force-confirm-pin"
            type="password"
            className="input-touch w-full"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            maxLength={6}
            placeholder="****"
            disabled={isLoading}
          />
        </div>


        <button
          type="submit"
          className="btn-touch btn-primary w-full mt-3"
          disabled={isLoading || !currentPin || !newPin || !confirmPin}
        >
          <CheckCircle2 size={20} />
          {isLoading ? 'Actualizando PIN...' : 'Confirmar y Desbloquear Tablero'}
        </button>
      </form>
    </Modal>
  );
};
