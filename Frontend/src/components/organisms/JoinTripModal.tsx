import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Key, Loader2 } from 'lucide-react';
import { joinTripByCode } from '@/services/trip.service';
import type { TripResponse } from '@/types/trip.types';

interface JoinTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (trip: TripResponse) => void;
  onError?: (error: unknown) => void;
}

/**
 * JoinTripModal organism component
 * Complex organism with form, validation, API integration, and accessibility features
 * Follows Atomic Design: Located in organisms/ due to high complexity (10+ elements, API calls, multiple states)
 */
export function JoinTripModal({ isOpen, onClose, onSuccess, onError }: JoinTripModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const savedFocusRef = useRef<HTMLElement | null>(null);
  const joinInputRef = useRef<HTMLInputElement | null>(null);

  // Focus management: save and restore focus
  useEffect(() => {
    if (isOpen) {
      // Save currently focused element
      savedFocusRef.current = document.activeElement as HTMLElement;
    } else if (savedFocusRef.current) {
      // Restore focus when modal closes
      savedFocusRef.current.focus();
      savedFocusRef.current = null;
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-uppercase and allow only A-Z and 0-9
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    // Limit to 8 characters
    setCode(value.slice(0, 8));
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (code.length !== 8) {
      setError('El código debe tener exactamente 8 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const trip = await joinTripByCode(code);

      // Success!
      onSuccess(trip);
      onClose();
      setCode('');
    } catch (err) {
      const error = err as { statusCode?: number; message?: string };
      // Handle specific error codes
      if (error.statusCode === 404) {
        setError('No encontramos un viaje con ese código. Verifica que esté correcto.');
      } else if (error.statusCode === 409) {
        setError('Ya eres participante de este viaje');
      } else if (error.statusCode === 401) {
        setError('Tu sesión ha expirado. Inicia sesión nuevamente');
      } else {
        setError(error.message || 'Error al unirse al viaje');
      }

      // Notify parent component of error
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose();
      setCode('');
      setError('');
    }
  }, [isLoading, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, handleClose]);

  useEffect(() => {
    if (isOpen && joinInputRef.current) {
      joinInputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const isValid = code.length === 8;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        tabIndex={-1}
        aria-labelledby="join-trip-title"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 disabled:opacity-50"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
            <Key size={24} className="text-violet-600" />
          </div>
          <h2 id="join-trip-title" className="font-heading text-xl font-bold text-slate-900">
            Unirse a un viaje
          </h2>
        </div>

        {/* Description */}
        <p className="mb-6 text-sm text-slate-600">
          Ingresa el código de 8 caracteres que compartió el creador del viaje
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code Input */}
          <div>
            <label htmlFor="trip-code" className="mb-2 block text-sm font-medium text-slate-700">
              Código del viaje
            </label>
            <input
              ref={joinInputRef}
              id="trip-code"
              type="text"
              value={code}
              onChange={handleInputChange}
              placeholder="Ej: ABC12345"
              maxLength={8}
              className={`h-12 w-full max-w-full rounded-xl border px-4 text-center text-base font-semibold uppercase tracking-wider transition-colors ${
                error
                  ? 'border-red-500 ring-2 ring-red-100'
                  : 'border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100'
              } focus:outline-none`}
              disabled={isLoading}
              autoComplete="off"
            />
            <p
              className={`mt-2 text-xs ${code.length === 8 ? 'text-violet-600' : 'text-slate-500'}`}
            >
              {code.length > 0
                ? `${code.length}/8 caracteres`
                : 'Código de 8 caracteres (letras y números)'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="h-12 w-full rounded-xl bg-violet-600 font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" />
                Uniéndose...
              </span>
            ) : (
              'Unirse'
            )}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full text-center text-sm text-slate-600 transition-colors hover:text-slate-900 disabled:opacity-50"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
