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

export const WarehouseExtractionModal: React.FC<WarehouseExtractionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedInsumoId, setSelectedInsumoId] = useState('ins-1');
  const [quantity, setQuantity] = useState(1.0);
  const [location, setLocation] = useState('KITCHEN_FRIDGE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const insumos = StockService.getAvailableInsumos();

  const handleIncrement = () => setQuantity((prev) => Math.round((prev + 0.5) * 10) / 10);
  const handleDecrement = () => setQuantity((prev) => Math.max(0.5, Math.round((prev - 0.5) * 10) / 10));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await StockService.recordExtraction({
        insumoId: selectedInsumoId,
        quantity: quantity.toString(),
        toLocation: location,
      });

      // Añadir remanente en frontend
      KitchenService.addLocalRemanente({
        id: result.remanenteId,
        insumoId: result.insumoId,
        insumoName: result.insumoName,
        unitOfMeasure: selectedInsumoId === 'ins-3' ? 'UNITS' : selectedInsumoId === 'ins-2' ? 'L' : 'KG',
        currentQuantity: result.quantityExtracted,
        initialQuantity: result.quantityExtracted,
        location: result.location,
        expirationDate: result.expirationDate,
        hoursRemaining: 24.0,
        isCriticalAlert: true,
        status: 'ACTIVE',
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('[WarehouseExtractionModal] Error registrando la extraccion de bodega:', err);
      alert('Error registrando extraccion de bodega');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="select-insumo-extraction" className="form-label">
            Seleccionar Insumo de Bodega:
          </label>
          <select
            value={selectedInsumoId}
            onChange={(e) => setSelectedInsumoId(e.target.value)}
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
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input-touch"
            id="select-location-extraction"
          >
            <option value="KITCHEN_FRIDGE">Refrigerador Principal (KITCHEN_FRIDGE)</option>
            <option value="KITCHEN_PREP">Mesa de Preparación (KITCHEN_PREP)</option>
            <option value="KITCHEN_LINE">Línea de Servicio (KITCHEN_LINE)</option>
          </select>
        </div>

        <div>
          <label htmlFor="input-quantity-extraction" className="form-label">
            Cantidad a Extraer:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn-touch btn-secondary"
              onClick={handleDecrement}
              style={{ width: '56px', height: '56px', fontSize: '1.5rem', fontWeight: 700 }}
              id="btn-decrement-qty"
            >
              <Minus size={24} />
            </button>

            <input
              type="number"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0.5)}
              className="input-touch"
              style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700 }}
              id="input-quantity-extraction"
            />

            <button
              type="button"
              className="btn-touch btn-secondary"
              onClick={handleIncrement}
              style={{ width: '56px', height: '56px', fontSize: '1.5rem', fontWeight: 700 }}
              id="btn-increment-qty"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'rgba(0, 210, 190, 0.1)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--color-primary)' }}>
          ⚠️ Al confirmar la extracción, el insumo pasará automáticamente al tablero de <strong>Remanentes Activos con vencimiento prioritario a 24 Horas FEFO</strong>.
        </div>

        <ModalFooterActions
          onCancel={onClose}
          confirmLabel="Confirmar Extracción"
          submittingLabel="Procesando..."
          isSubmitting={isSubmitting}
        />
      </form>
    </Modal>
  );
};
