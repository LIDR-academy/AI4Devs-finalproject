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

export const DiscardModal: React.FC<DiscardModalProps> = ({ remanente, onClose, onSuccess }) => {
  const [reason, setReason] = useState('EXPIRATION');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!remanente) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await KitchenService.discardRemanente(remanente.id, reason);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('[DiscardModal] Error registrando el descarte:', err);
      alert('Error registrando el descarte');
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
        <div>
          <label className="form-label">
            Motivo del Descarte / Merma:
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="input-touch"
            id="select-discard-reason"
          >
            <option value="EXPIRATION">Producto Vencido (EXPIRATION)</option>
            <option value="DAMAGED">Insumo Deteriorado / Caído (DAMAGED)</option>
            <option value="QUALITY_FAIL">Fallo en Control de Calidad (QUALITY_FAIL)</option>
          </select>
        </div>

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
