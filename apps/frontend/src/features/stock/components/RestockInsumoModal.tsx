import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { StockService, InsumoItem } from '../services/stock.service.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ModalFooterActions } from '../../../shared/components/ModalFooterActions.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { StorageSectorSelect } from './StorageSectorSelect.js';

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
  storageLocationId: string;
  onStorageLocationIdChange: (value: string) => void;
  error: string | null;
}

const RestockFormFields: React.FC<RestockFormFieldsProps> = ({
  insumo,
  quantity,
  onQuantityChange,
  storageLocationId,
  onStorageLocationIdChange,
  error,
}) => (
  <>
    <p className="text-secondary-color mb-4 fs-md">
      {insumo.name} — stock total en bodega:{' '}
      <strong>
        {insumo.warehouseStock} {insumo.unitOfMeasure}
      </strong>
    </p>

    {(insumo.stockByLocation ?? []).length > 0 && (
      <dl className="text-secondary-color fs-sm mb-4">
        {(insumo.stockByLocation ?? []).map((s) => (
          <div key={s.storageLocationId} className="flex-between">
            <dt>{s.storageLocationName}</dt>
            <dd>
              {s.quantity} {insumo.unitOfMeasure}
            </dd>
          </div>
        ))}
      </dl>
    )}

    {error && <ErrorBanner message={error} />}

    <div className="mb-4">
      <StorageSectorSelect
        id="restock-sector-select"
        label="Sub-sector de Bodega destino *"
        value={storageLocationId}
        onChange={onStorageLocationIdChange}
      />
    </div>

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
  const [storageLocationId, setStorageLocationId] = useState('');
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
    if (!storageLocationId) {
      setError('Debe seleccionar el sub-sector de bodega destino.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await StockService.restockInsumo(insumo.id, { quantity, storageLocationId });
      setQuantity('');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrio un error al reabastecer el insumo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { quantity, setQuantity, storageLocationId, setStorageLocationId, isSubmitting, error, handleSubmit };
}

export const RestockInsumoModal: React.FC<RestockInsumoModalProps> = ({ isOpen, insumo, onClose, onSuccess }) => {
  const form = useRestockForm(insumo, onSuccess, onClose);

  if (!isOpen || !insumo) return null;

  return (
    <Modal size="md">
      <ModalHeader
        icon={<Truck className="text-primary-color" />}
        title="Reabastecer Insumo"
        onClose={onClose}
      />

      <form onSubmit={form.handleSubmit}>
        <RestockFormFields
          insumo={insumo}
          quantity={form.quantity}
          onQuantityChange={form.setQuantity}
          storageLocationId={form.storageLocationId}
          onStorageLocationIdChange={form.setStorageLocationId}
          error={form.error}
        />
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
