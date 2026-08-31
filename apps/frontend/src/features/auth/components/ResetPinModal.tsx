import React, { useState } from 'react';
import { Modal } from '../../../shared/components/Modal.js';
import { PinPad } from './PinPad.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { AuthService } from '../services/auth.service.js';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

interface ResetPinModalProps {
  token: string;
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ResetPinModal: React.FC<ResetPinModalProps> = ({ token, isOpen, onSuccess, onCancel }) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'ENTER_NEW' | 'CONFIRM_NEW'>('ENTER_NEW');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentVal = step === 'ENTER_NEW' ? newPin : confirmPin;

  const handleDigitPress = (digit: string) => {
    if (currentVal.length < 6) {
      setError(null);
      if (step === 'ENTER_NEW') {
        setNewPin((prev) => prev + digit);
      } else {
        setConfirmPin((prev) => prev + digit);
      }
    }
  };

  const handleDeletePress = () => {
    setError(null);
    if (step === 'ENTER_NEW') {
      setNewPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  const handleNextStep = () => {
    if (newPin.length < 4) {
      setError('El PIN debe contener al menos 4 dígitos.');
      return;
    }
    setError(null);
    setStep('CONFIRM_NEW');
  };

  const handleResetSubmit = async () => {
    if (newPin !== confirmPin) {
      setError('Los números de PIN ingresados no coinciden.');
      setConfirmPin('');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await AuthService.resetAdminPin(token, newPin);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer el PIN.');
      setStep('ENTER_NEW');
      setNewPin('');
      setConfirmPin('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal maxWidth="420px" width="100%" textAlign="center">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <div className="card-badge-icon" style={{ width: '56px', height: '56px' }}>
          <KeyRound size={28} />
        </div>
      </div>

      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '6px' }}>
        Restablecer PIN de Administrador
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
        {step === 'ENTER_NEW'
          ? 'Ingrese su nuevo PIN de 4 a 6 dígitos'
          : 'Confirme su nuevo PIN de seguridad'}
      </p>

      {error && (
        <ErrorBanner message={error} icon={<AlertCircle size={18} />} padding="10px 14px" fontSize="0.88rem" />
      )}

      {success ? (
        <div
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '10px',
            padding: '16px',
            color: 'var(--color-success, #16a34a)',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}>
            <CheckCircle2 size={20} />
            <span>¡PIN restablecido con éxito!</span>
          </div>
          <p style={{ fontSize: '0.85rem', margin: '6px 0 0 0', color: 'var(--text-primary)' }}>
            Redirigiendo a la pantalla de inicio de sesión...
          </p>
        </div>
      ) : (
        <>
          {/* Indicadores visuales de dígitos */}
          <div
            style={{
              backgroundColor: 'var(--bg-root)',
              border: '1px solid var(--border-card)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            {Array.from({ length: Math.max(4, currentVal.length) }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: idx < currentVal.length ? 'var(--color-primary)' : 'var(--border-card)',
                  transition: 'all 0.15s ease',
                }}
              />
            ))}
          </div>

          <PinPad onDigitPress={handleDigitPress} onDeletePress={handleDeletePress} disabled={isLoading} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            {step === 'ENTER_NEW' ? (
              <button
                type="button"
                disabled={newPin.length < 4 || isLoading}
                className="btn-touch btn-primary"
                onClick={handleNextStep}
                style={{ width: '100%' }}
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                disabled={confirmPin.length < 4 || isLoading}
                className="btn-touch btn-primary"
                onClick={handleResetSubmit}
                style={{ width: '100%' }}
              >
                {isLoading ? 'Actualizando PIN...' : 'Confirmar y Guardar PIN'}
              </button>
            )}

            <button
              type="button"
              disabled={isLoading}
              className="btn-touch btn-secondary"
              onClick={onCancel}
              style={{ width: '100%' }}
            >
              Cancelar
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};
