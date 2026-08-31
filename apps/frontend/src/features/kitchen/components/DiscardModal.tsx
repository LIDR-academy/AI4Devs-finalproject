import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { KitchenService, RemanenteFEFOItem } from '../services/kitchen.service.js';
import { formatQuantity, formatUnitLabel } from '../../../utils/formatters.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ModalFooterActions } from '../../../shared/components/ModalFooterActions.js';

interface DiscardModalProps {
  remanente: RemanenteFEFOItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DISCARD_REASONS = [
  { value: 'EXPIRATION', label: 'Producto Vencido (EXPIRATION)' },
  { value: 'DAMAGED', label: 'Insumo Deteriorado / Caído (DAMAGED)' },
  { value: 'QUALITY_FAIL', label: 'Fallo en Control de Calidad (QUALITY_FAIL)' },
];

interface DiscardReasonSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const DiscardReasonSelect: React.FC<DiscardReasonSelectProps> = ({ value, onChange }) => (
  <div>
    <label htmlFor="select-discard-reason" className="form-label">
      Motivo del Descarte / Merma:
    </label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input-touch" id="select-discard-reason">
      {DISCARD_REASONS.map((reason) => (
        <option key={reason.value} value={reason.value}>
          {reason.label}
        </option>
      ))}
    </select>
  </div>
);

import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { mapToUserFriendlyError } from '../../../shared/utils/errorMessageMapper.js';

export const DiscardModal: React.FC<DiscardModalProps> = ({ remanente, onClose, onSuccess }) => {
  const [reason, setReason] = useState('EXPIRATION');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!remanente) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await KitchenService.discardRemanente(remanente.id, reason);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('[DiscardModal] Error registrando el descarte:', err);
      const friendly = mapToUserFriendlyError(err);
      setError(friendly.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Modal maxWidth="450px" width="90%">
      <ModalHeader
        icon={<AlertTriangle />}
        title="Registrar Descarte de Merma"
        titleColor="var(--color-danger)"
        onClose={onClose}
      />

      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.95rem' }}>
        Se dará de baja el insumo <strong>{remanente.insumoName}</strong> ({formatQuantity(remanente.currentQuantity, remanente.unitOfMeasure)} {formatUnitLabel(remanente.unitOfMeasure)}) del inventario activo.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && <ErrorBanner message={error} />}
        <DiscardReasonSelect value={reason} onChange={setReason} />


        <ModalFooterActions
          onCancel={onClose}
          confirmLabel="Confirmar Merma"
          submittingLabel="Procesando..."
          confirmIcon={<Trash2 size={18} />}
          confirmVariant="danger"
          isSubmitting={isSubmitting}
        />
      </form>
    </Modal>
  );
};
