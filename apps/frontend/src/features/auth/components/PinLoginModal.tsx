import React, { useState } from 'react';
import { PinPad } from './PinPad.js';
import { AuthService, LoginPinResponse } from '../services/auth.service.js';
import { Lock, UserCheck, AlertCircle } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';

interface PinLoginModalProps {
  onSuccess: (authData: LoginPinResponse) => void;
}

const DEFAULT_USERS = [
  { id: 'usr-carlos-1', name: 'Carlos Gomez (Cocina)' },
  { id: 'usr-maria-2', name: 'Maria Silva (Administrador)' },
];

export const PinLoginModal: React.FC<PinLoginModalProps> = ({ onSuccess }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(DEFAULT_USERS[0].id);
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

  return (
    <Modal maxWidth="420px" width="100%" textAlign="center">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <div className="card-badge-icon" style={{ width: '56px', height: '56px' }}>
          <Lock size={28} />
        </div>
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>
        Acceso Táctil de Operarios
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
        Seleccione su perfil e ingrese su PIN de seguridad
      </p>

      {/* Seleccion de Usuario */}
      <div style={{ marginBottom: '20px', textAlign: 'left' }}>
        <label
          htmlFor="select-pin-login-user"
          style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}
        >
          Operario en Turno:
        </label>
        <div style={{ position: 'relative' }}>
          <select
            id="select-pin-login-user"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-root)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
            }}
          >
            {DEFAULT_USERS.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mascara de PIN •••• */}
      <div
        style={{
          backgroundColor: 'var(--bg-root)',
          border: '1px solid var(--border-card)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          minHeight: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        {Array.from({ length: Math.max(4, pin.length) }).map((_, idx) => (
          <div
            key={idx}
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: idx < pin.length ? 'var(--color-primary)' : 'var(--border-card)',
              transition: 'all 0.15s ease',
            }}
          />
        ))}
      </div>

      {/* Mensaje de Error */}
      {error && (
        <ErrorBanner message={error} icon={<AlertCircle size={18} />} padding="10px 14px" fontSize="0.88rem" />
      )}

      {/* Teclado Numérico Tactil */}
      <PinPad onDigitPress={handleDigitPress} onDeletePress={handleDeletePress} disabled={isLoading} />

      {/* Boton de Ingreso */}
      <button
        type="button"
        disabled={isLoading || pin.length < 4}
        onClick={handleLoginSubmit}
        className="btn-touch btn-primary"
        style={{ width: '100%', marginTop: '12px' }}
      >
        <UserCheck size={20} />
        {isLoading ? 'Verificando PIN...' : 'Ingresar a Cocina'}
      </button>
    </Modal>
  );
};
