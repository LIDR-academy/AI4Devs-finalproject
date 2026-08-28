import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { StockService, InsumoItem } from '../services/stock.service.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ModalFooterActions } from '../../../shared/components/ModalFooterActions.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';

interface RestockInsumoModalProps {
  isOpen: boolean;
  insumo: InsumoItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface RestockFormFieldsProps {
  insumo: InsumoItem;
  quantity: string;
  onQuantityChange: (value: string) => void;
  error: string | null;
}

const RestockFormFields: React.FC<RestockFormFieldsProps> = ({ insumo, quantity, onQuantityChange, error }) => (
  <>
    <p className="text-secondary-color" style={{ margin: '0 0 16px 0', fontSize: '0.9rem' }}>
      {insumo.name} — stock actual:{' '}
      <strong>
        {insumo.warehouseStock} {insumo.unitOfMeasure}
      </strong>
    </p>

    {error && <ErrorBanner message={error} />}

    <label htmlFor="restock-quantity-input" className="form-label">
      Cantidad Recibida ({insumo.unitOfMeasure}):
    </label>
    <input
      id="restock-quantity-input"
      type="number"
      step="0.001"
      min="0.001"
      value={quantity}
      onChange={(e) => onQuantityChange(e.target.value)}
      placeholder="Ej. 20"
      className="input-touch w-full"
      required
    />
  </>
);

function useRestockForm(insumo: InsumoItem | null, onSuccess: () => void, onClose: () => void) {
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insumo) return;

    const parsedQuantity = Number(quantity);
    if (!quantity || !(parsedQuantity > 0)) {
      setError('La cantidad a reabastecer debe ser un numero positivo.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await StockService.restockInsumo(insumo.id, { quantity });
      setQuantity('');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrio un error al reabastecer el insumo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { quantity, setQuantity, isSubmitting, error, handleSubmit };
}

export const RestockInsumoModal: React.FC<RestockInsumoModalProps> = ({ isOpen, insumo, onClose, onSuccess }) => {
  const form = useRestockForm(insumo, onSuccess, onClose);

  if (!isOpen || !insumo) return null;

  return (
    <Modal maxWidth="480px" width="100%">
      <ModalHeader
        icon={<Truck style={{ color: 'var(--color-primary)' }} />}
        title="Reabastecer Insumo"
        fontSize="1.25rem"
        gap="8px"
        marginBottom="16px"
        onClose={onClose}
      />

      <form onSubmit={form.handleSubmit}>
        <RestockFormFields insumo={insumo} quantity={form.quantity} onQuantityChange={form.setQuantity} error={form.error} />
        <ModalFooterActions
          onCancel={onClose}
          confirmLabel="Confirmar Reabastecimiento"
          submittingLabel="Reabasteciendo..."
          isSubmitting={form.isSubmitting}
        />
      </form>
    </Modal>
  );
};
