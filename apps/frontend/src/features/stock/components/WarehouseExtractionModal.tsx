import React, { useState } from 'react';
import { Plus, Minus, PackageCheck } from 'lucide-react';
import { StockService } from '../services/stock.service.js';
import { KitchenService } from '../../kitchen/services/kitchen.service.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ModalFooterActions } from '../../../shared/components/ModalFooterActions.js';

interface WarehouseExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Insumo {
  id: string;
  name: string;
  stock: number;
  unit: string;
}

interface ExtractionSelectFieldsProps {
  insumos: Insumo[];
  selectedInsumoId: string;
  onInsumoChange: (id: string) => void;
  location: string;
  onLocationChange: (location: string) => void;
}

const ExtractionSelectFields: React.FC<ExtractionSelectFieldsProps> = ({
  insumos,
  selectedInsumoId,
  onInsumoChange,
  location,
  onLocationChange,
}) => (
  <>
    <div>
      <label htmlFor="select-insumo-extraction" className="form-label">
        Seleccionar Insumo de Bodega:
      </label>
      <select
        value={selectedInsumoId}
        onChange={(e) => onInsumoChange(e.target.value)}
        className="input-touch"
        id="select-insumo-extraction"
      >
        {insumos.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name} (Stock Bodega: {i.stock} {i.unit})
          </option>
        ))}
      </select>
    </div>

    <div>
      <label htmlFor="select-location-extraction" className="form-label">
        Ubicación Destino en Cocina:
      </label>
      <select value={location} onChange={(e) => onLocationChange(e.target.value)} className="input-touch" id="select-location-extraction">
        <option value="KITCHEN_FRIDGE">Refrigerador Principal (KITCHEN_FRIDGE)</option>
        <option value="KITCHEN_PREP">Mesa de Preparación (KITCHEN_PREP)</option>
        <option value="KITCHEN_LINE">Línea de Servicio (KITCHEN_LINE)</option>
      </select>
    </div>
  </>
);

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onChange: (value: number) => void;
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({ quantity, onIncrement, onDecrement, onChange }) => (
  <div>
    <label htmlFor="input-quantity-extraction" className="form-label">
      Cantidad a Extraer:
    </label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button
        type="button"
        className="btn-touch btn-secondary"
        onClick={onDecrement}
        style={{ width: '56px', height: '56px', fontSize: '1.5rem', fontWeight: 700 }}
        id="btn-decrement-qty"
      >
        <Minus size={24} />
      </button>

      <input
        type="number"
        step="0.1"
        value={quantity}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0.5)}
        className="input-touch"
        style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700 }}
        id="input-quantity-extraction"
      />

      <button
        type="button"
        className="btn-touch btn-secondary"
        onClick={onIncrement}
        style={{ width: '56px', height: '56px', fontSize: '1.5rem', fontWeight: 700 }}
        id="btn-increment-qty"
      >
        <Plus size={24} />
      </button>
    </div>
  </div>
);

const UNIT_BY_INSUMO_ID: Record<string, string> = { 'ins-2': 'L', 'ins-3': 'UNITS' };

function resolveUnitOfMeasure(selectedInsumoId: string, insumos: Insumo[]): string {
  const found = insumos.find((i) => i.id === selectedInsumoId);
  if (found?.unit) return found.unit;
  return UNIT_BY_INSUMO_ID[selectedInsumoId] ?? 'KG';
}

function buildLocalRemanenteFromExtraction(selectedInsumoId: string, insumos: Insumo[], result: Awaited<ReturnType<typeof StockService.recordExtraction>>) {
  return {
    id: result.remanenteId,
    insumoId: result.insumoId,
    insumoName: result.insumoName,
    unitOfMeasure: resolveUnitOfMeasure(selectedInsumoId, insumos),
    currentQuantity: result.quantityExtracted,
    initialQuantity: result.quantityExtracted,
    location: result.location,
    expirationDate: result.expirationDate,
    hoursRemaining: 24.0,
    isCriticalAlert: true,
    status: 'ACTIVE' as const,
  };
}

interface ExtractionFormProps {
  insumos: Insumo[];
  selectedInsumoId: string;
  onInsumoChange: (id: string) => void;
  location: string;
  onLocationChange: (location: string) => void;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onQuantityChange: (value: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ExtractionForm: React.FC<ExtractionFormProps> = ({
  insumos,
  selectedInsumoId,
  onInsumoChange,
  location,
  onLocationChange,
  quantity,
  onIncrement,
  onDecrement,
  onQuantityChange,
  onSubmit,
  onCancel,
  isSubmitting,
}) => (
  <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <ExtractionSelectFields
      insumos={insumos}
      selectedInsumoId={selectedInsumoId}
      onInsumoChange={onInsumoChange}
      location={location}
      onLocationChange={onLocationChange}
    />

    <QuantityStepper quantity={quantity} onIncrement={onIncrement} onDecrement={onDecrement} onChange={onQuantityChange} />

    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'rgba(0, 210, 190, 0.1)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--color-primary)' }}>
      ⚠️ Al confirmar la extracción, el insumo pasará automáticamente al tablero de <strong>Remanentes Activos con vencimiento prioritario a 24 Horas FEFO</strong>.
    </div>

    <ModalFooterActions onCancel={onCancel} confirmLabel="Confirmar Extracción" submittingLabel="Procesando..." isSubmitting={isSubmitting} />
  </form>
);

function useExtractionForm(insumos: Insumo[], onSuccess: () => void, onClose: () => void) {
  const [selectedInsumoId, setSelectedInsumoId] = useState('');
  const [quantity, setQuantity] = useState(1.0);
  const [location, setLocation] = useState('KITCHEN_FRIDGE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeInsumoId = selectedInsumoId || (insumos.length > 0 ? insumos[0].id : '');

  const handleIncrement = () => setQuantity((prev) => Math.round((prev + 0.5) * 10) / 10);
  const handleDecrement = () => setQuantity((prev) => Math.max(0.5, Math.round((prev - 0.5) * 10) / 10));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInsumoId) return;
    setIsSubmitting(true);

    try {
      const result = await StockService.recordExtraction({ insumoId: activeInsumoId, quantity: quantity.toString(), toLocation: location });
      KitchenService.addLocalRemanente(buildLocalRemanenteFromExtraction(activeInsumoId, insumos, result));
      onSuccess();
      onClose();
    } catch (err) {
      console.error('[WarehouseExtractionModal] Error registrando la extraccion de bodega:', err);
      alert('Error registrando extraccion de bodega');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { selectedInsumoId: activeInsumoId, setSelectedInsumoId, quantity, setQuantity, location, setLocation, isSubmitting, handleIncrement, handleDecrement, handleSubmit };
}

export const WarehouseExtractionModal: React.FC<WarehouseExtractionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      StockService.getInsumos()
        .then((items) => {
          setInsumos(items.map((i) => ({ id: i.id, name: i.name, stock: Number(i.warehouseStock), unit: i.unitOfMeasure })));
        })
        .catch(() => {
          setInsumos(StockService.getAvailableInsumos());
        });
    }
  }, [isOpen]);

  const displayInsumos = insumos.length > 0 ? insumos : StockService.getAvailableInsumos();
  const form = useExtractionForm(displayInsumos, onSuccess, onClose);

  if (!isOpen) return null;

  return (
    <Modal maxWidth="500px" width="90%">
      <ModalHeader
        icon={<PackageCheck style={{ color: 'var(--color-primary)' }} />}
        title="Extracción de Bodega (Alta TRR)"
        fontSize="1.4rem"
        gap="10px"
        marginBottom="20px"
        onClose={onClose}
      />

      <ExtractionForm
        insumos={displayInsumos}
        selectedInsumoId={form.selectedInsumoId}
        onInsumoChange={form.setSelectedInsumoId}
        location={form.location}
        onLocationChange={form.setLocation}
        quantity={form.quantity}
        onIncrement={form.handleIncrement}
        onDecrement={form.handleDecrement}
        onQuantityChange={form.setQuantity}
        onSubmit={form.handleSubmit}
        onCancel={onClose}
        isSubmitting={form.isSubmitting}
      />
    </Modal>
  );
};
