import React, { useEffect, useState } from 'react';
import { MinusCircle } from 'lucide-react';
import { KitchenService, RemanenteFEFOItem } from '../services/kitchen.service.js';
import { ConsumptionReasonDto } from '../services/consumptionReasons.service.js';
import { formatQuantity, formatUnitLabel } from '../../../utils/formatters.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ModalFooterActions } from '../../../shared/components/ModalFooterActions.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { mapToUserFriendlyError } from '../../../shared/utils/errorMessageMapper.js';
import { useActiveConsumptionReasons } from '../../../shared/hooks/useActiveConsumptionReasons.js';
import { ConsumptionReasonSelect } from '../../../shared/components/ConsumptionReasonSelect.js';

export interface ConsumeTarget {
  remanente: RemanenteFEFOItem;
  quantity: number;
}

interface ConsumeReasonModalProps {
  target: ConsumeTarget | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ReasonSelectProps {
  reasons: ConsumptionReasonDto[];
  value: string;
  onChange: (value: string) => void;
}

const ReasonSelect: React.FC<ReasonSelectProps> = ({ reasons, value, onChange }) => (
  <div>
    <label htmlFor="select-consume-reason" className="form-label">
      Motivo del Consumo *:
    </label>
    {/* ADR-004 / US-004: el motivo es obligatorio — validado en consumeValidationError
        (mismo patrón que el motivo de descarte directo en WarehouseExtractionModal),
        no con `required` nativo, para mostrar el ErrorBanner del modal en vez del
        popup del navegador (Guard 38). */}
    <ConsumptionReasonSelect id="select-consume-reason" value={value} reasons={reasons} onChange={onChange} />
  </div>
);

interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
}

const NotesInput: React.FC<NotesInputProps> = ({ value, onChange }) => (
  <div>
    <label htmlFor="input-consume-notes" className="form-label">
      Notas (opcional):
    </label>
    <input
      id="input-consume-notes"
      type="text"
      placeholder="Ej. Se sirvió de más en la mesa 4"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-touch w-full"
    />
  </div>
);

function consumeValidationError(reasonId: string): string | null {
  if (!reasonId) return 'Debe seleccionar el motivo del consumo.';
  return null;
}

function useConsumeReasonForm(target: ConsumeTarget | null, onSuccess: () => void, onClose: () => void) {
  const [reasonId, setReasonId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reiniciar el formulario cada vez que se abre para un remanente distinto.
    setReasonId('');
    setNotes('');
    setError(null);
  }, [target]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    const validationError = consumeValidationError(reasonId);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await KitchenService.consumeRemanente(target.remanente.id, target.quantity, reasonId, notes.trim() || undefined);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('[ConsumeReasonModal] Error registrando el consumo:', err);
      setError(mapToUserFriendlyError(err).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { reasonId, setReasonId, notes, setNotes, isSubmitting, error, handleSubmit };
}

/**
 * ADR-004 / US-004 / TK-108-FE: modal liviano abierto por los botones rápidos de
 * cantidad de `ActiveRemanentesList` — mismo patrón que `DiscardModal`. Reemplaza
 * el toque directo (`onConsume(id, qty)` sin confirmación) por cantidad + motivo
 * estructurado (catálogo `TK-107-FE`) + texto libre opcional, antes de confirmar.
 */
export const ConsumeReasonModal: React.FC<ConsumeReasonModalProps> = ({ target, onClose, onSuccess }) => {
  const reasons = useActiveConsumptionReasons(target !== null);
  const f = useConsumeReasonForm(target, onSuccess, onClose);

  if (!target) return null;
  const { remanente, quantity } = target;

  return (
    <Modal size="sm">
      <ModalHeader icon={<MinusCircle className="text-primary-color" />} title="Registrar Consumo" onClose={onClose} />

      <p className="text-secondary-color mb-4 fs-md">
        Vas a consumir <strong>{formatQuantity(quantity, remanente.unitOfMeasure)} {formatUnitLabel(remanente.unitOfMeasure)}</strong> de{' '}
        <strong>{remanente.insumoName}</strong>.
      </p>

      <form onSubmit={f.handleSubmit} className="flex-column gap-4">
        {f.error && <ErrorBanner message={f.error} />}
        <ReasonSelect reasons={reasons} value={f.reasonId} onChange={f.setReasonId} />
        <NotesInput value={f.notes} onChange={f.setNotes} />

        <ModalFooterActions
          onCancel={onClose}
          confirmLabel="Confirmar Consumo"
          submittingLabel="Procesando..."
          confirmIcon={<MinusCircle size={18} />}
          isSubmitting={f.isSubmitting}
        />
      </form>
    </Modal>
  );
};
