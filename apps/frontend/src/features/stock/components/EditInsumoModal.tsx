import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { StockService, InsumoItem, UpdateInsumoDTO } from '../services/stock.service.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ModalFooterActions } from '../../../shared/components/ModalFooterActions.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';

interface EditInsumoModalProps {
  isOpen: boolean;
  insumo: InsumoItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface EditFormFieldsProps {
  insumo: InsumoItem;
  name: string;
  unitCost: string;
  barcode: string;
  onNameChange: (v: string) => void;
  onUnitCostChange: (v: string) => void;
  onBarcodeChange: (v: string) => void;
  error: string | null;
}

const EditInsumoFormFields: React.FC<EditFormFieldsProps> = ({
  insumo,
  name,
  unitCost,
  barcode,
  onNameChange,
  onUnitCostChange,
  onBarcodeChange,
  error,
}) => (
  <>
    <p className="text-secondary-color mb-4 fs-sm">
      Unidad de medida: <strong>{insumo.unitOfMeasure}</strong> (no editable). El stock no se modifica aquí.
    </p>

    {error && <ErrorBanner message={error} />}

    <label htmlFor="edit-insumo-name" className="form-label">Nombre</label>
    <input
      id="edit-insumo-name"
      type="text"
      value={name}
      onChange={(e) => onNameChange(e.target.value)}
      className="input-touch w-full mb-4"
      required
      maxLength={120}
    />

    <label htmlFor="edit-insumo-cost" className="form-label">Costo unitario (opcional)</label>
    <input
      id="edit-insumo-cost"
      type="text"
      inputMode="decimal"
      value={unitCost}
      onChange={(e) => onUnitCostChange(e.target.value)}
      placeholder="Ej. 820.00 — vacío lo deja sin costo"
      className="input-touch w-full mb-4"
    />

    <label htmlFor="edit-insumo-barcode" className="form-label">Código de barras (opcional)</label>
    <input
      id="edit-insumo-barcode"
      type="text"
      value={barcode}
      onChange={(e) => onBarcodeChange(e.target.value)}
      placeholder="Vacío lo deja sin código"
      className="input-touch w-full"
      maxLength={64}
    />
  </>
);

/** Construye el patch enviando solo los campos que cambiaron; `''` en un opcional → `null` (limpiar). */
function buildPatch(insumo: InsumoItem, name: string, unitCost: string, barcode: string): UpdateInsumoDTO {
  const patch: UpdateInsumoDTO = {};
  const trimmedName = name.trim();
  if (trimmedName && trimmedName !== insumo.name) patch.name = trimmedName;

  const nextCost = unitCost.trim() === '' ? null : unitCost.trim();
  if (nextCost !== (insumo.unitCost ?? null)) patch.unitCost = nextCost;

  const nextBarcode = barcode.trim() === '' ? null : barcode.trim();
  if (nextBarcode !== (insumo.barcode ?? null)) patch.barcode = nextBarcode;

  return patch;
}

function useEditInsumoForm(insumo: InsumoItem | null, onSuccess: () => void, onClose: () => void) {
  const [name, setName] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [barcode, setBarcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!insumo) return;
    setName(insumo.name);
    setUnitCost(insumo.unitCost ?? '');
    setBarcode(insumo.barcode ?? '');
    setError(null);
  }, [insumo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insumo) return;
    if (!name.trim()) {
      setError('El nombre del insumo no puede estar vacío.');
      return;
    }

    const patch = buildPatch(insumo, name, unitCost, barcode);
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await StockService.updateInsumo(insumo.id, patch);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al editar el insumo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { name, setName, unitCost, setUnitCost, barcode, setBarcode, isSubmitting, error, handleSubmit };
}

export const EditInsumoModal: React.FC<EditInsumoModalProps> = ({ isOpen, insumo, onClose, onSuccess }) => {
  const form = useEditInsumoForm(insumo, onSuccess, onClose);

  if (!isOpen || !insumo) return null;

  return (
    <Modal size="md">
      <ModalHeader icon={<Pencil className="text-primary-color" />} title="Editar Insumo" onClose={onClose} />
      <form onSubmit={form.handleSubmit}>
        <EditInsumoFormFields
          insumo={insumo}
          name={form.name}
          unitCost={form.unitCost}
          barcode={form.barcode}
          onNameChange={form.setName}
          onUnitCostChange={form.setUnitCost}
          onBarcodeChange={form.setBarcode}
          error={form.error}
        />
        <ModalFooterActions
          onCancel={onClose}
          confirmLabel="Guardar Cambios"
          submittingLabel="Guardando..."
          isSubmitting={form.isSubmitting}
        />
      </form>
    </Modal>
  );
};
