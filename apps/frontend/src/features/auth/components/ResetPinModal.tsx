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

function usePinDigitsState() {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'ENTER_NEW' | 'CONFIRM_NEW'>('ENTER_NEW');

  const currentVal = step === 'ENTER_NEW' ? newPin : confirmPin;

  const onDigit = (digit: string) => {
    if (currentVal.length >= 6) return;
    if (step === 'ENTER_NEW') setNewPin((prev) => prev + digit);
    else setConfirmPin((prev) => prev + digit);
  };

  const onDelete = () => {
    if (step === 'ENTER_NEW') setNewPin((prev) => prev.slice(0, -1));
    else setConfirmPin((prev) => prev.slice(0, -1));
  };

  const resetAll = () => {
    setStep('ENTER_NEW');
    setNewPin('');
    setConfirmPin('');
  };

  return { newPin, confirmPin, step, setStep, currentVal, onDigit, onDelete, resetAll, setConfirmPin };
}

function useResetPinForm(token: string, onSuccess: () => void) {
  const digits = usePinDigitsState();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDigitPress = (digit: string) => {
    setError(null);
    digits.onDigit(digit);
  };

  const handleNextStep = () => {
    if (digits.newPin.length < 4) {
      setError('El PIN debe contener al menos 4 dígitos.');
      return;
    }
    setError(null);
    digits.setStep('CONFIRM_NEW');
  };

  const handleResetSubmit = async () => {
    if (digits.newPin !== digits.confirmPin) {
      setError('Los números de PIN ingresados no coinciden.');
      digits.setConfirmPin('');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.resetAdminPin(token, digits.newPin);
      setSuccess(true);
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer el PIN.');
      digits.resetAll();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step: digits.step,
    currentVal: digits.currentVal,
    newPin: digits.newPin,
    confirmPin: digits.confirmPin,
    error,
    isLoading,
    success,
    handleDigitPress,
    handleDeletePress: () => { setError(null); digits.onDelete(); },
    handleNextStep,
    handleResetSubmit,
  };
}

const ResetPinDotsDisplay: React.FC<{ length: number }> = ({ length }) => (
  <div className="pin-dots-bar">
    {Array.from({ length: Math.max(4, length) }).map((_, idx) => (
      <div key={idx} className={`pin-dot-indicator ${idx < length ? 'active' : ''}`} />
    ))}
  </div>
);

const ResetPinSuccessBanner: React.FC = () => (
  <div className="banner-success">
    <div className="flex-center flex-gap-sm fw-semibold">
      <CheckCircle2 size={20} />
      <span>¡PIN restablecido con éxito!</span>
    </div>
    <p className="fs-sm mt-2 text-center">
      Redirigiendo a la pantalla de inicio de sesión...
    </p>
  </div>
);

const ResetPinActionButtons: React.FC<{
  step: 'ENTER_NEW' | 'CONFIRM_NEW';
  newPinLength: number;
  confirmPinLength: number;
  isLoading: boolean;
  onNext: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}> = ({ step, newPinLength, confirmPinLength, isLoading, onNext, onSubmit, onCancel }) => (
  <div className="flex-column gap-3 mt-4">
    {step === 'ENTER_NEW' ? (
      <button type="button" disabled={newPinLength < 4 || isLoading} className="btn-touch btn-primary w-full" onClick={onNext}>
        Continuar
      </button>
    ) : (
      <button type="button" disabled={confirmPinLength < 4 || isLoading} className="btn-touch btn-primary w-full" onClick={onSubmit}>
        {isLoading ? 'Actualizando PIN...' : 'Confirmar y Guardar PIN'}
      </button>
    )}
    <button type="button" disabled={isLoading} className="btn-touch btn-secondary w-full" onClick={onCancel}>
      Cancelar
    </button>
  </div>
);

export const ResetPinModal: React.FC<ResetPinModalProps> = ({ token, isOpen, onSuccess, onCancel }) => {
  const form = useResetPinForm(token, onSuccess);
  if (!isOpen) return null;

  return (
    <Modal size="sm" centered>
      <div className="modal-header-center">
        <div className="card-badge-icon icon-badge-md">
          <KeyRound size={28} />
        </div>
      </div>
      <h2 className="fs-xl fw-bold mb-2">Restablecer PIN de Administrador</h2>
      <p className="text-secondary-color fs-sm mb-4">
        {form.step === 'ENTER_NEW' ? 'Ingrese su nuevo PIN de 4 a 6 dígitos' : 'Confirme su nuevo PIN de seguridad'}
      </p>
      {form.error && <ErrorBanner message={form.error} icon={<AlertCircle size={18} />} compact />}
      {form.success ? (
        <ResetPinSuccessBanner />
      ) : (
        <>
          <ResetPinDotsDisplay length={form.currentVal.length} />
          <PinPad onDigitPress={form.handleDigitPress} onDeletePress={form.handleDeletePress} disabled={form.isLoading} />
          <ResetPinActionButtons
            step={form.step}
            newPinLength={form.newPin.length}
            confirmPinLength={form.confirmPin.length}
            isLoading={form.isLoading}
            onNext={form.handleNextStep}
            onSubmit={form.handleResetSubmit}
            onCancel={onCancel}
          />
        </>
      )}
    </Modal>
  );
};
