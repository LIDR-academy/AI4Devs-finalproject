import { useState, useEffect, useRef } from 'react';
import { X, Settings, Lock, Unlock, Loader2 } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { updateTrip } from '@/services/trip.service';
import type { TripResponse } from '@/types/trip.types';
import type { ApiError } from '@/types/api.types';

interface TripSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripResponse;
  onSuccess: (updatedTrip: TripResponse) => void;
  onError?: (error: unknown) => void;
}

/**
 * TripSettingsModal organism component
 * Modal for editing trip settings (name)
 * Follows Atomic Design: Located in organisms/ due to complexity (form, API calls, multiple states)
 */
export function TripSettingsModal({
  isOpen,
  onClose,
  trip,
  onSuccess,
  onError,
}: TripSettingsModalProps) {
  const [name, setName] = useState(trip.name);
  const [status, setStatus] = useState<'ACTIVE' | 'CLOSED'>(
    (trip.status as 'ACTIVE' | 'CLOSED') || 'ACTIVE',
  );
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClosingTrip, setIsClosingTrip] = useState(false);
  const savedFocusRef = useRef<HTMLElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Reset form when trip changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setName(trip.name);
      setStatus((trip.status as 'ACTIVE' | 'CLOSED') || 'ACTIVE');
      setError('');
      setIsClosingTrip(false);
      // Save currently focused element
      savedFocusRef.current = document.activeElement as HTMLElement;
      // Focus input after a short delay to ensure modal is rendered
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    } else if (savedFocusRef.current) {
      // Restore focus when modal closes
      savedFocusRef.current.focus();
      savedFocusRef.current = null;
    }
  }, [isOpen, trip.name, trip.status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('El nombre del viaje no puede estar vacío');
      nameInputRef.current?.focus();
      return;
    }

    if (trimmedName.length > 255) {
      setError('El nombre del viaje no puede exceder 255 caracteres');
      nameInputRef.current?.focus();
      return;
    }

    // Check if anything has changed
    const nameChanged = trimmedName !== trip.name;
    const statusChanged = status !== (trip.status as 'ACTIVE' | 'CLOSED');

    // If nothing changed, just close
    if (!nameChanged && !statusChanged) {
      onClose();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updateData: { name?: string; status?: 'ACTIVE' | 'CLOSED' } = {};
      if (nameChanged) {
        updateData.name = trimmedName;
      }
      if (statusChanged) {
        updateData.status = status;
      }

      const updatedTrip = await updateTrip(trip.id, updateData);
      onSuccess(updatedTrip);
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      let errorMessage = apiError.message || 'No se pudo actualizar el viaje. Intenta nuevamente.';

      if (apiError.statusCode === 403) {
        errorMessage = 'Solo el creador del viaje puede actualizar su configuración';
      } else if (apiError.statusCode === 404) {
        errorMessage = 'El viaje no existe o ha sido eliminado';
      } else if (apiError.statusCode === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
      }

      setError(errorMessage);
      if (onError) {
        onError(err);
      }
      nameInputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseTrip = async () => {
    if (status === 'CLOSED') {
      // If already closed, just close modal
      onClose();
      return;
    }

    setIsClosingTrip(true);
    setError('');

    try {
      const updatedTrip = await updateTrip(trip.id, { status: 'CLOSED' });
      setStatus('CLOSED');
      onSuccess(updatedTrip);
      setIsClosingTrip(false);
    } catch (err) {
      const apiError = err as ApiError;
      let errorMessage = apiError.message || 'No se pudo cerrar el viaje. Intenta nuevamente.';

      if (apiError.statusCode === 403) {
        errorMessage = 'Solo el creador del viaje puede cerrar el viaje';
      } else if (apiError.statusCode === 404) {
        errorMessage = 'El viaje no existe o ha sido eliminado';
      } else if (apiError.statusCode === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
      }

      setError(errorMessage);
      if (onError) {
        onError(err);
      }
      setIsClosingTrip(false);
    }
  };

  const handleReopenTrip = async () => {
    if (status === 'ACTIVE') {
      // If already active, just close modal
      onClose();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedTrip = await updateTrip(trip.id, { status: 'ACTIVE' });
      setStatus('ACTIVE');
      onSuccess(updatedTrip);
      setIsLoading(false);
    } catch (err) {
      const apiError = err as ApiError;
      let errorMessage = apiError.message || 'No se pudo reabrir el viaje. Intenta nuevamente.';

      if (apiError.statusCode === 403) {
        errorMessage = 'Solo el creador del viaje puede reabrir el viaje';
      } else if (apiError.statusCode === 404) {
        errorMessage = 'El viaje no existe o ha sido eliminado';
      } else if (apiError.statusCode === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
      }

      setError(errorMessage);
      if (onError) {
        onError(err);
      }
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !isClosingTrip) {
      setName(trip.name);
      setStatus((trip.status as 'ACTIVE' | 'CLOSED') || 'ACTIVE');
      setError('');
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading && !isClosingTrip) {
      handleClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading && !isClosingTrip) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const isValid = name.trim().length > 0 && name.trim().length <= 255;
  const hasChanges =
    name.trim() !== trip.name || status !== (trip.status as 'ACTIVE' | 'CLOSED');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200"
        role="dialog"
        tabIndex={-1}
        aria-labelledby="trip-settings-title"
        aria-describedby="trip-settings-description"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading || isClosingTrip}
          className="absolute right-4 top-4 w-11 h-11 p-2 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-95 active:opacity-70 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 rounded-lg transition-colors"
          aria-label="Cerrar"
        >
          <X size={20} className="flex-shrink-0" />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
            <Settings size={24} className="text-violet-600" />
          </div>
          <h2 id="trip-settings-title" className="font-heading text-xl font-bold text-slate-900">
            Configuración del viaje
          </h2>
        </div>

        {/* Description */}
        <p id="trip-settings-description" className="mb-6 text-sm text-slate-600">
          Edita el nombre del viaje o cambia su estado. La moneda y el código no se pueden modificar.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <Input
              ref={nameInputRef}
              id="trip-name"
              type="text"
              label="Nombre del viaje"
              value={name}
              onChange={handleInputChange}
              placeholder="Ej: Viaje a Cartagena"
              disabled={isLoading}
              error={error}
              maxLength={255}
              required
              aria-describedby={error ? 'trip-name-error' : undefined}
              aria-invalid={!!error}
            />
          </div>

          {/* Status Toggle */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-900 mb-1 block">
                  Estado del viaje
                </label>
                <p className="text-xs text-slate-500">
                  {status === 'ACTIVE'
                    ? 'El viaje está activo y permite agregar gastos'
                    : 'El viaje está cerrado y no permite agregar nuevos gastos'}
                </p>
              </div>
              <div className="ml-4">
                {status === 'ACTIVE' ? (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                    <span className="text-sm font-medium text-emerald-700">Activo</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
                    <span className="text-sm font-medium text-slate-600">Cerrado</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {status === 'ACTIVE' ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCloseTrip}
                  disabled={isLoading || isClosingTrip}
                  className="flex-1"
                >
                  {isClosingTrip ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin flex-shrink-0" />
                      Cerrando...
                    </>
                  ) : (
                    <>
                      <Lock size={16} className="mr-2 flex-shrink-0" />
                      Cerrar viaje
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleReopenTrip}
                  disabled={isLoading || isClosingTrip}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin flex-shrink-0" />
                      Reabriendo...
                    </>
                  ) : (
                    <>
                      <Unlock size={16} className="mr-2 flex-shrink-0" />
                      Reabrir viaje
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Read-only fields */}
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div>
              <label className="text-xs font-medium text-slate-500">Moneda</label>
              <p className="text-sm font-medium text-slate-900">{trip.currency || 'COP'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Código</label>
              <p className="text-sm font-medium text-slate-900 font-mono">{trip.code}</p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              id="trip-name-error"
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={
                isLoading ||
                isClosingTrip ||
                !isValid ||
                !hasChanges
              }
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin flex-shrink-0" />
                  Guardando...
                </>
              ) : hasChanges ? (
                'Guardar cambios'
              ) : (
                'Sin cambios'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
