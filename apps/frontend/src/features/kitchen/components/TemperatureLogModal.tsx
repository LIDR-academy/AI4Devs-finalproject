import React, { useEffect, useState } from 'react';
import { Thermometer } from 'lucide-react';
import { KitchenService, TemperatureLogItem, TemperatureUnitType } from '../services/kitchen.service.js';
import { StorageSectorSelect } from '../../stock/components/StorageSectorSelect.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ModalFooterActions } from '../../../shared/components/ModalFooterActions.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { SuccessFeedbackBanner } from '../../../shared/components/SuccessFeedbackBanner.js';
import { mapToUserFriendlyError } from '../../../shared/utils/errorMessageMapper.js';

interface TemperatureLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UNIT_TYPE_OPTIONS: { value: TemperatureUnitType; label: string }[] = [
  { value: 'REFRIGERATOR', label: 'Refrigerador (rango seguro ≤ 4 °C)' },
  { value: 'FREEZER', label: 'Congelador (rango seguro ≤ -18 °C)' },
];

const UnitTypeSelect: React.FC<{ value: TemperatureUnitType; onChange: (v: TemperatureUnitType) => void }> = ({ value, onChange }) => (
  <div>
    <label htmlFor="select-temperature-unit-type" className="form-label">
      Tipo de Unidad *:
    </label>
    <select
      id="select-temperature-unit-type"
      className="input-touch w-full"
      value={value}
      onChange={(e) => onChange(e.target.value as TemperatureUnitType)}
    >
      {UNIT_TYPE_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

const TemperatureInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div>
    <label htmlFor="input-temperature-celsius" className="form-label">
      Temperatura leída en el termómetro (°C) *:
    </label>
    <input
      id="input-temperature-celsius"
      type="number"
      step="0.01"
      placeholder="Ej. 3.5 o -20"
      className="input-touch w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

/** Confirmación del registro creado — nunca un error: fuera de rango solo advierte (US-033). */
const RecordedFeedback: React.FC<{ log: TemperatureLogItem; onClose: () => void }> = ({ log, onClose }) => (
  <>
    <SuccessFeedbackBanner
      variant={log.isWithinSafeRange ? 'success' : 'warning'}
      message={
        log.isWithinSafeRange
          ? `Lectura de ${log.temperatureCelsius} °C registrada — dentro del rango seguro.`
          : `Lectura de ${log.temperatureCelsius} °C registrada — FUERA del rango seguro. Revisa la unidad y avisa al Administrador.`
      }
    />
    <div className="modal-footer-actions justify-end no-margin-top">
      <button type="button" className="btn-touch btn-primary" onClick={onClose} id="btn-close-temperature-confirmation">
        Entendido
      </button>
    </div>
  </>
);

// Coincide con el backend (`Decimal(5,2)`): hasta 3 dígitos enteros y 2 decimales.
const TEMPERATURE_PATTERN = /^-?\d{1,3}(\.\d{1,2})?$/;

function temperatureValidationError(storageLocationId: string, temperatureCelsius: string): string | null {
  if (!storageLocationId) return 'Debe seleccionar el sub-sector donde tomó la lectura.';
  if (!temperatureCelsius.trim()) return 'Debe ingresar la temperatura leída en el termómetro.';
  if (!TEMPERATURE_PATTERN.test(temperatureCelsius.trim())) {
    return 'La temperatura debe ser un número de hasta 3 dígitos enteros y 2 decimales (ej. "-18.00").';
  }
  return null;
}

function useTemperatureLogForm(isOpen: boolean) {
  const [storageLocationId, setStorageLocationId] = useState('');
  const [unitType, setUnitType] = useState<TemperatureUnitType>('REFRIGERATOR');
  const [temperatureCelsius, setTemperatureCelsius] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recorded, setRecorded] = useState<TemperatureLogItem | null>(null);

  useEffect(() => {
    // Reinicia el formulario en cada apertura: si no, la confirmación de la lectura
    // anterior seguiría visible al volver a abrir el modal.
    setTemperatureCelsius('');
    setError(null);
    setRecorded(null);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = temperatureValidationError(storageLocationId, temperatureCelsius);
    if (invalid) return setError(invalid);

    setIsSubmitting(true);
    setError(null);
    try {
      setRecorded(await KitchenService.recordTemperatureLog({ storageLocationId, unitType, temperatureCelsius: temperatureCelsius.trim() }));
    } catch (err) {
      console.error('[TemperatureLogModal] Error registrando la temperatura:', err);
      setError(mapToUserFriendlyError(err).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    storageLocationId, setStorageLocationId, unitType, setUnitType,
    temperatureCelsius, setTemperatureCelsius, isSubmitting, error, recorded, handleSubmit,
  };
}

/**
 * US-033 / TK-120-FE: registro manual de la temperatura leída en el termómetro físico
 * de un sub-sector al iniciar turno. Una lectura fuera del rango FDA **nunca bloquea**:
 * se registra igual y solo se muestra con acento de advertencia (decisión de negocio
 * confirmada con el humano, Guard 28).
 */
export const TemperatureLogModal: React.FC<TemperatureLogModalProps> = ({ isOpen, onClose }) => {
  const f = useTemperatureLogForm(isOpen);

  if (!isOpen) return null;

  return (
    <Modal size="sm">
      <ModalHeader icon={<Thermometer className="text-primary-color" />} title="Registrar Temperatura" onClose={onClose} />

      {f.recorded ? (
        <RecordedFeedback log={f.recorded} onClose={onClose} />
      ) : (
        <form onSubmit={f.handleSubmit} className="flex-column gap-4">
          {f.error && <ErrorBanner message={f.error} />}
          <StorageSectorSelect
            id="select-temperature-sector"
            label="Sub-sector Refrigerado *"
            value={f.storageLocationId}
            onChange={f.setStorageLocationId}
          />
          <UnitTypeSelect value={f.unitType} onChange={f.setUnitType} />
          <TemperatureInput value={f.temperatureCelsius} onChange={f.setTemperatureCelsius} />

          <ModalFooterActions
            onCancel={onClose}
            confirmLabel="Registrar Lectura"
            submittingLabel="Registrando..."
            confirmIcon={<Thermometer size={18} />}
            isSubmitting={f.isSubmitting}
          />
        </form>
      )}
    </Modal>
  );
};
