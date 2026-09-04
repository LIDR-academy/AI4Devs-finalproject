import React, { useState } from 'react';
import { Plus, Minus, PackageCheck, AlertTriangle } from 'lucide-react';
import { StockService } from '../services/stock.service.js';
import { KitchenService, RecipeItem, RemanenteFEFOItem } from '../../kitchen/services/kitchen.service.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ModalFooterActions } from '../../../shared/components/ModalFooterActions.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { mapToUserFriendlyError } from '../../../shared/utils/errorMessageMapper.js';
import { StorageSectorSelect } from './StorageSectorSelect.js';
import styles from './WarehouseExtractionModal.module.css';


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
  purpose: 'KITCHEN_STOCK' | 'RECIPE' | 'DIRECT_DISCARD';
  onPurposeChange: (purpose: 'KITCHEN_STOCK' | 'RECIPE' | 'DIRECT_DISCARD') => void;
  location: string;
  onLocationChange: (location: string) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  recipes: { id: string; name: string }[];
  selectedRecipeId: string;
  onRecipeIdChange: (id: string) => void;
}

interface InsumoPurposeSelectProps {
  insumos: Insumo[];
  selectedInsumoId: string;
  onInsumoChange: (id: string) => void;
  purpose: 'KITCHEN_STOCK' | 'RECIPE' | 'DIRECT_DISCARD';
  onPurposeChange: (purpose: 'KITCHEN_STOCK' | 'RECIPE' | 'DIRECT_DISCARD') => void;
}

const InsumoPurposeSelect: React.FC<InsumoPurposeSelectProps> = ({
  insumos,
  selectedInsumoId,
  onInsumoChange,
  purpose,
  onPurposeChange,
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
      <label htmlFor="select-purpose-extraction" className="form-label">
        Propósito / Motivo de Extracción:
      </label>
      <select
        value={purpose}
        onChange={(e) => onPurposeChange(e.target.value as 'KITCHEN_STOCK' | 'RECIPE' | 'DIRECT_DISCARD')}
        className="input-touch"
        id="select-purpose-extraction"
      >
        <option value="KITCHEN_STOCK">Uso General en Cocina (Stock Activo)</option>
        <option value="RECIPE">Preparación de Receta Específica</option>
        <option value="DIRECT_DISCARD">Descarte Directo desde Bodega (Merma/Deterioro)</option>
      </select>
    </div>
  </>
);

const RecipeDestinationField: React.FC<{ recipes: { id: string; name: string }[]; selectedRecipeId: string; onRecipeIdChange: (id: string) => void }> = ({
  recipes,
  selectedRecipeId,
  onRecipeIdChange,
}) => (
  <div>
    <label htmlFor="select-recipe-extraction" className="form-label">
      Seleccionar Receta Destino:
    </label>
    <select value={selectedRecipeId} onChange={(e) => onRecipeIdChange(e.target.value)} className="input-touch" id="select-recipe-extraction">
      <option value="">-- Seleccionar Receta (Opcional) --</option>
      {recipes.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  </div>
);

const DiscardReasonField: React.FC<{ reason: string; onReasonChange: (r: string) => void }> = ({ reason, onReasonChange }) => (
  <div>
    <label htmlFor="input-reason-extraction" className="form-label">
      Motivo de Descarte (Obligatorio):
    </label>
    <input
      type="text"
      value={reason}
      onChange={(e) => onReasonChange(e.target.value)}
      placeholder="Ej: Empaque roto en transporte, vencido en bodega"
      className="input-touch"
      id="input-reason-extraction"
      required
    />
  </div>
);

const KitchenDestinationField: React.FC<{ location: string; onLocationChange: (l: string) => void }> = ({ location, onLocationChange }) => (
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
);

const ExtractionSelectFields: React.FC<ExtractionSelectFieldsProps> = ({
  insumos,
  selectedInsumoId,
  onInsumoChange,
  purpose,
  onPurposeChange,
  location,
  onLocationChange,
  reason,
  onReasonChange,
  recipes,
  selectedRecipeId,
  onRecipeIdChange,
}) => (
  <>
    <InsumoPurposeSelect insumos={insumos} selectedInsumoId={selectedInsumoId} onInsumoChange={onInsumoChange} purpose={purpose} onPurposeChange={onPurposeChange} />
    {purpose === 'RECIPE' && (
      <RecipeDestinationField recipes={recipes} selectedRecipeId={selectedRecipeId} onRecipeIdChange={onRecipeIdChange} />
    )}
    {purpose === 'DIRECT_DISCARD' ? (
      <DiscardReasonField reason={reason} onReasonChange={onReasonChange} />
    ) : (
      <KitchenDestinationField location={location} onLocationChange={onLocationChange} />
    )}
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
    <div className="flex-gap-md">
      <button
        type="button"
        className={`btn-touch btn-secondary ${styles['qty-stepper-btn-lg']}`}
        onClick={onDecrement}
        id="btn-decrement-qty"
      >
        <Minus size={24} />
      </button>

      <input
        type="number"
        step="0.1"
        value={quantity}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0.5)}
        className={`input-touch ${styles['qty-stepper-input-lg']}`}
        id="input-quantity-extraction"
      />

      <button
        type="button"
        className={`btn-touch btn-secondary ${styles['qty-stepper-btn-lg']}`}
        onClick={onIncrement}
        id="btn-increment-qty"
      >
        <Plus size={24} />
      </button>
    </div>
  </div>
);

const DuplicateRemanenteWarning: React.FC<{ activeRemanentes: RemanenteFEFOItem[] }> = ({ activeRemanentes }) => {
  if (activeRemanentes.length === 0) return null;

  return (
    <div className="banner-alert banner-alert-warning" role="status">
      <AlertTriangle size={16} className={styles['inline-icon-spacer']} />
      <span>
        Atención: ya existe un remanente activo de este insumo en cocina.{' '}
        {activeRemanentes.map((r, index) => (
          <strong key={r.id}>
            {index > 0 ? ', ' : ''}
            {r.currentQuantity} {r.unitOfMeasure} en {r.location}
          </strong>
        ))}
        . Puede continuar con la extracción de todos modos.
      </span>
    </div>
  );
};

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
  purpose: 'KITCHEN_STOCK' | 'RECIPE' | 'DIRECT_DISCARD';
  onPurposeChange: (purpose: 'KITCHEN_STOCK' | 'RECIPE' | 'DIRECT_DISCARD') => void;
  location: string;
  onLocationChange: (location: string) => void;
  fromStorageLocationId: string;
  onFromStorageLocationIdChange: (id: string) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  recipes: { id: string; name: string }[];
  selectedRecipeId: string;
  onRecipeIdChange: (id: string) => void;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onQuantityChange: (value: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  duplicateActiveRemanentes: RemanenteFEFOItem[];
}

const ExtractionForm: React.FC<ExtractionFormProps> = ({
  insumos,
  selectedInsumoId,
  onInsumoChange,
  purpose,
  onPurposeChange,
  location,
  onLocationChange,
  fromStorageLocationId,
  onFromStorageLocationIdChange,
  reason,
  onReasonChange,
  recipes,
  selectedRecipeId,
  onRecipeIdChange,
  quantity,
  onIncrement,
  onDecrement,
  onQuantityChange,
  onSubmit,
  onCancel,
  isSubmitting,
  duplicateActiveRemanentes,
}) => (
  <form onSubmit={onSubmit} className="flex-column flex-gap-md">
    <StorageSectorSelect
      id="select-from-sector-extraction"
      label="Sector de Bodega Origen *"
      value={fromStorageLocationId}
      onChange={onFromStorageLocationIdChange}
    />
    <ExtractionSelectFields
      insumos={insumos}
      selectedInsumoId={selectedInsumoId}
      onInsumoChange={onInsumoChange}
      purpose={purpose}
      onPurposeChange={onPurposeChange}
      location={location}
      onLocationChange={onLocationChange}
      reason={reason}
      onReasonChange={onReasonChange}
      recipes={recipes}
      selectedRecipeId={selectedRecipeId}
      onRecipeIdChange={onRecipeIdChange}
    />

    <DuplicateRemanenteWarning activeRemanentes={duplicateActiveRemanentes} />

    <QuantityStepper quantity={quantity} onIncrement={onIncrement} onDecrement={onDecrement} onChange={onQuantityChange} />

    <ExtractionNoteBanner purpose={purpose} />

    <ModalFooterActions onCancel={onCancel} confirmLabel="Confirmar Extracción" submittingLabel="Procesando..." isSubmitting={isSubmitting} />
  </form>
);

const ExtractionNoteBanner: React.FC<{ purpose: 'KITCHEN_STOCK' | 'RECIPE' | 'DIRECT_DISCARD' }> = ({ purpose }) => (
  <div className={`banner-alert banner-alert-success ${styles['extraction-note-banner']}`}>
    {purpose === 'DIRECT_DISCARD' ? (
      <span><AlertTriangle size={16} className={styles['inline-icon-spacer']} /> Se registrará la <strong>merma directa desde bodega</strong> descontando el stock sin pasarlo a cocina.</span>
    ) : (
      <span><AlertTriangle size={16} className={styles['inline-icon-spacer']} /> Al confirmar la extracción, el insumo pasará al tablero de <strong>Remanentes Activos con vencimiento prioritario FEFO</strong>.</span>
    )}
  </div>
);

interface PerformExtractionArgs {
  activeInsumoId: string;
  quantity: number;
  location: string;
  fromStorageLocationId: string;
  purpose: 'KITCHEN_STOCK' | 'RECIPE' | 'DIRECT_DISCARD';
  reason: string;
  selectedRecipeId: string;
  insumos: Insumo[];
  onSuccess: () => void;
  onClose: () => void;
}

async function performExtraction(args: PerformExtractionArgs) {
  const { activeInsumoId, quantity, location, fromStorageLocationId, purpose, reason, selectedRecipeId, insumos, onSuccess, onClose } = args;
  const result = await StockService.recordExtraction({
    insumoId: activeInsumoId,
    quantity: quantity.toString(),
    fromStorageLocationId,
    toLocation: purpose === 'DIRECT_DISCARD' ? 'WASTE_BIN' : location,
    purpose,
    reason: reason.trim() || undefined,
    recipeId: selectedRecipeId || undefined,
  });

  if (purpose !== 'DIRECT_DISCARD' && result.remanenteId) {
    KitchenService.addLocalRemanente(buildLocalRemanenteFromExtraction(activeInsumoId, insumos, result));
  }
  onSuccess();
  onClose();
}

// US-021: detecta una apertura duplicada en CUALQUIER ubicacion de cocina al cambiar de insumo.
function useDuplicateRemanenteWarning(insumoId: string): RemanenteFEFOItem[] {
  const [duplicateActiveRemanentes, setDuplicateActiveRemanentes] = useState<RemanenteFEFOItem[]>([]);

  React.useEffect(() => {
    // Limpia la advertencia del insumo anterior de inmediato: de lo contrario, mientras la
    // nueva consulta esta en vuelo, el texto "ya existe un remanente activo de este insumo"
    // seguiria mostrando el remanente del insumo YA DESELECCIONADO (falso positivo transitorio).
    setDuplicateActiveRemanentes([]);
    if (!insumoId) return;

    let cancelled = false;
    KitchenService.checkActiveRemanente(insumoId).then((items) => {
      if (!cancelled) setDuplicateActiveRemanentes(items);
    });
    return () => {
      cancelled = true;
    };
  }, [insumoId]);

  return duplicateActiveRemanentes;
}

function useExtractionFields() {
  const [selectedInsumoId, setSelectedInsumoId] = useState('');
  const [quantity, setQuantity] = useState(1.0);
  const [purpose, setPurpose] = useState<'KITCHEN_STOCK' | 'RECIPE' | 'DIRECT_DISCARD'>('KITCHEN_STOCK');
  const [location, setLocation] = useState('KITCHEN_FRIDGE');
  const [fromStorageLocationId, setFromStorageLocationId] = useState('');
  const [reason, setReason] = useState('');
  const [recipes, setRecipes] = useState<{ id: string; name: string }[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    KitchenService.fetchAvailableRecipes()
      .then((items: RecipeItem[]) => setRecipes(items.map((r: RecipeItem) => ({ id: r.id, name: r.name }))))
      .catch(() => setRecipes([]));
  }, []);

  return {
    selectedInsumoId, setSelectedInsumoId, quantity, setQuantity, purpose, setPurpose,
    location, setLocation, fromStorageLocationId, setFromStorageLocationId, reason, setReason,
    recipes, selectedRecipeId, setSelectedRecipeId, isSubmitting, setIsSubmitting, error, setError,
  };
}

function useExtractionForm(insumos: Insumo[], onSuccess: () => void, onClose: () => void) {
  const s = useExtractionFields();
  const activeInsumoId = s.selectedInsumoId || (insumos.length > 0 ? insumos[0].id : '');
  const duplicateActiveRemanentes = useDuplicateRemanenteWarning(activeInsumoId);

  const handleIncrement = () => s.setQuantity((prev) => Math.round((prev + 0.5) * 10) / 10);
  const handleDecrement = () => s.setQuantity((prev) => Math.max(0.5, Math.round((prev - 0.5) * 10) / 10));

  const validationError = (): string | null => {
    if (s.purpose === 'DIRECT_DISCARD' && !s.reason.trim()) return 'Debe especificar el motivo descriptivo del descarte directo.';
    if (!s.fromStorageLocationId) return 'Debe seleccionar el sub-sector de bodega de origen.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInsumoId) return;
    const invalid = validationError();
    if (invalid) return s.setError(invalid);
    s.setIsSubmitting(true);
    s.setError(null);
    try {
      await performExtraction({
        activeInsumoId, quantity: s.quantity, location: s.location, fromStorageLocationId: s.fromStorageLocationId,
        purpose: s.purpose, reason: s.reason, selectedRecipeId: s.selectedRecipeId, insumos, onSuccess, onClose,
      });
    } catch (err) {
      console.error('[WarehouseExtractionModal] Error registrando la extraccion de bodega:', err);
      s.setError(mapToUserFriendlyError(err).message);
    } finally {
      s.setIsSubmitting(false);
    }
  };

  const bind: Omit<ExtractionFormProps, 'insumos' | 'onCancel'> = {
    selectedInsumoId: activeInsumoId,
    onInsumoChange: s.setSelectedInsumoId,
    purpose: s.purpose,
    onPurposeChange: s.setPurpose,
    location: s.location,
    onLocationChange: s.setLocation,
    fromStorageLocationId: s.fromStorageLocationId,
    onFromStorageLocationIdChange: s.setFromStorageLocationId,
    reason: s.reason,
    onReasonChange: s.setReason,
    recipes: s.recipes,
    selectedRecipeId: s.selectedRecipeId,
    onRecipeIdChange: s.setSelectedRecipeId,
    quantity: s.quantity,
    onIncrement: handleIncrement,
    onDecrement: handleDecrement,
    onQuantityChange: s.setQuantity,
    onSubmit: handleSubmit,
    isSubmitting: s.isSubmitting,
    duplicateActiveRemanentes,
  };

  return { error: s.error, bind };
}

function useAvailableInsumos(isOpen: boolean): Insumo[] {
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

  return insumos.length > 0 ? insumos : StockService.getAvailableInsumos();
}

export const WarehouseExtractionModal: React.FC<WarehouseExtractionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const displayInsumos = useAvailableInsumos(isOpen);
  const form = useExtractionForm(displayInsumos, onSuccess, onClose);

  if (!isOpen) return null;

  return (
    <Modal size="md">
      <ModalHeader
        icon={<PackageCheck className="text-primary-color" />}
        title="Extracción de Bodega (Alta TRR)"
        size="lg"
        onClose={onClose}
      />

      {form.error && <ErrorBanner message={form.error} />}

      <ExtractionForm insumos={displayInsumos} onCancel={onClose} {...form.bind} />
    </Modal>
  );
};
