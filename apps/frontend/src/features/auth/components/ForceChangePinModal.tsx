import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

import { AuthScreen } from '../../../shared/components/AuthScreen.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { AuthService } from '../services/auth.service.js';

interface ForceChangePinModalProps {
  userId: string;
  onSuccess: () => void;
}

interface PinFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}

const PinField: React.FC<PinFieldProps> = ({ id, label, value, onChange, disabled }) => (
  <div>
    <label htmlFor={id} className="fs-sm text-secondary-color mb-1 d-block">
      {label}
    </label>
    <input
      id={id}
      type="password"
      className="input-touch w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={6}
      placeholder="****"
      disabled={disabled}
    />
  </div>
);

function validatePins(currentPin: string, newPin: string, confirmPin: string): string | null {
  if (!currentPin || currentPin.length < 4) return 'El PIN actual debe tener al menos 4 dígitos.';
  if (!newPin || newPin.length < 4) return 'El nuevo PIN debe tener al menos 4 dígitos.';
  if (newPin !== confirmPin) return 'La confirmación no coincide con el nuevo PIN.';
  if (currentPin === newPin) return 'El nuevo PIN no puede ser idéntico al PIN actual.';
  return null;
}

function useForceChangePinForm(userId: string, onSuccess: () => void) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validatePins(currentPin, newPin, confirmPin);
    if (validationError) {
      setError(validationError);
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

  return { currentPin, setCurrentPin, newPin, setNewPin, confirmPin, setConfirmPin, error, isLoading, handleSubmit };
}

export const ForceChangePinModal: React.FC<ForceChangePinModalProps> = ({ userId, onSuccess }) => {
  const form = useForceChangePinForm(userId, onSuccess);

  return (
    <AuthScreen>
      <div className="modal-header-center">
        <div className="card-badge-icon card-badge-icon--danger icon-badge-md">
          <ShieldAlert size={32} />
        </div>
      </div>

      <h2 className="fs-xl fw-bold mb-1">Cambio Obligatorio de PIN</h2>
      <p className="text-secondary-color fs-md mb-5">
        Modo Estricto de Seguridad (Guard 36): Por políticas del sistema debe reemplazar su PIN de acceso inicial antes de ingresar al tablero.
      </p>

      {form.error && <ErrorBanner message={form.error} icon={<AlertCircle size={18} />} compact />}

      <form onSubmit={form.handleSubmit} className="flex-column gap-3 mt-3 text-left">
        <PinField id="input-force-current-pin" label="PIN Actual de Acceso:" value={form.currentPin} onChange={form.setCurrentPin} disabled={form.isLoading} />
        <PinField id="input-force-new-pin" label="Nuevo PIN Personal (4 a 6 dígitos):" value={form.newPin} onChange={form.setNewPin} disabled={form.isLoading} />
        <PinField id="input-force-confirm-pin" label="Confirmar Nuevo PIN:" value={form.confirmPin} onChange={form.setConfirmPin} disabled={form.isLoading} />

        <button
          type="submit"
          className="btn-touch btn-primary w-full mt-3"
          disabled={form.isLoading || !form.currentPin || !form.newPin || !form.confirmPin}
        >
          <CheckCircle2 size={20} />
          {form.isLoading ? 'Actualizando PIN...' : 'Confirmar y Desbloquear Tablero'}
        </button>
      </form>
    </AuthScreen>
  );
};
