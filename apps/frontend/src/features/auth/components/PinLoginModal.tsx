import React, { useState } from 'react';
import { PinPad } from './PinPad.js';
import { AuthService, LoginPinResponse } from '../services/auth.service.js';
import { Lock, UserCheck, AlertCircle } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';

interface PinLoginModalProps {
  onSuccess: (authData: LoginPinResponse) => void;
  initialNotice?: string;
}


interface UserSelectorProps {
  selectedUserId: string;
  onChange: (id: string) => void;
  disabled: boolean;
}

/**
 * Antes un <select> con 2 operarios de fixtures de desarrollo hardcodeados
 * (usr-carlos-1/usr-maria-2) — en una base de datos de producción nueva el único
 * usuario real es el admin sembrado por TK-051, que nunca aparecía en esa lista:
 * un humano real no podía loguearse tras un despliegue nuevo. El backend no expone
 * ningún endpoint para listar operarios (mismo hallazgo ya documentado en
 * TK-049-FE/UserStatusForm.tsx), así que se pide el ID real en vez de simular una
 * lista que podría no reflejar los usuarios reales de este despliegue.
 */
const UserSelector: React.FC<UserSelectorProps> = ({ selectedUserId, onChange, disabled }) => (
  <div className="mb-5 text-left">
    <label
      htmlFor="input-pin-login-user"
      className="fs-sm text-secondary-color mb-2 d-block"
    >
      ID de Operario:
    </label>
    <input
      type="text"
      id="input-pin-login-user"
      className="input-touch w-full"
      value={selectedUserId}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="ej. bootstrap-admin"
      autoComplete="off"
    />
  </div>
);

const PinDotsDisplay: React.FC<{ pinLength: number }> = ({ pinLength }) => (
  <div className="pin-dots-bar">
    {Array.from({ length: Math.max(4, pinLength) }).map((_, idx) => (
      <div key={idx} className={`pin-dot-indicator ${idx < pinLength ? 'active' : ''}`} />
    ))}
  </div>
);

const PinLoginHeader: React.FC = () => (
  <>
    <div className="modal-header-center">
      <div className="card-badge-icon icon-badge-md">
        <Lock size={28} />
      </div>
    </div>

    <h2 className="fs-xl fw-bold mb-1">Acceso Táctil de Operarios</h2>
    <p className="text-secondary-color fs-md mb-5">
      Ingrese su ID de operario y su PIN de seguridad
    </p>
  </>
);

const PinSubmitButton: React.FC<{ disabled: boolean; isLoading: boolean; onClick: React.MouseEventHandler<HTMLButtonElement> }> = ({
  disabled,
  isLoading,
  onClick,
}) => (
  <button type="button" disabled={disabled} onClick={onClick} className="btn-touch btn-primary w-full mt-3">
    <UserCheck size={20} />
    {isLoading ? 'Verificando PIN...' : 'Ingresar a Cocina'}
  </button>
);

function usePinLoginForm(onSuccess: (authData: LoginPinResponse) => void) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDigitPress = (digit: string) => {
    if (pin.length < 6) {
      setError(null);
      setPin((prev) => prev + digit);
    }
  };

  const handleDeletePress = () => {
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId.trim()) {
      setError('Ingresa tu ID de operario.');
      return;
    }
    if (pin.length < 4) {
      setError('El PIN debe tener al menos 4 digitos.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.loginWithPin(selectedUserId, pin);
      onSuccess(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PIN incorrecto. Intente de nuevo.');
      setPin(''); // Limpiar mascara de PIN en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  return { selectedUserId, setSelectedUserId, pin, error, isLoading, handleDigitPress, handleDeletePress, handleLoginSubmit };
}

import { ForgotPinModal } from './ForgotPinModal.js';

export const PinLoginModal: React.FC<PinLoginModalProps> = ({ onSuccess, initialNotice }) => {
  const form = usePinLoginForm(onSuccess);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  return (
    <>
      <Modal size="sm" centered>
        <PinLoginHeader />

        <UserSelector selectedUserId={form.selectedUserId} onChange={form.setSelectedUserId} disabled={form.isLoading} />
        <PinDotsDisplay pinLength={form.pin.length} />

        {(form.error || initialNotice) && (
          <ErrorBanner message={form.error || initialNotice || ''} icon={<AlertCircle size={18} />} compact />
        )}

        <PinPad onDigitPress={form.handleDigitPress} onDeletePress={form.handleDeletePress} disabled={form.isLoading} />

        <PinSubmitButton
          disabled={form.isLoading || form.pin.length < 4 || !form.selectedUserId.trim()}
          isLoading={form.isLoading}
          onClick={form.handleLoginSubmit}
        />

        <div className="mt-3">
          <button
            type="button"
            className="btn-link"
            onClick={() => setIsForgotModalOpen(true)}
          >
            ¿Olvidó su PIN de Administrador?
          </button>
        </div>
      </Modal>

      <ForgotPinModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </>
  );
};
