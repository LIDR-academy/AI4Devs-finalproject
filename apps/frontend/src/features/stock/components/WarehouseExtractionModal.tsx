import React, { useState } from 'react';
import { Plus, Minus, PackageCheck, AlertTriangle } from 'lucide-react';
import { StockService, StockByLocationEntry } from '../services/stock.service.js';
import { KitchenService, RecipeItem, RemanenteFEFOItem } from '../../kitchen/services/kitchen.service.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ModalFooterActions } from '../../../shared/components/ModalFooterActions.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { BarcodeScannerButton } from '../../../shared/components/BarcodeScannerButton.js';
import { mapToUserFriendlyError } from '../../../shared/utils/errorMessageMapper.js';
import { DecimalQuantity } from '../../../shared/domain/DecimalQuantity.js';
import {
  RecipePreparationsService,
  RecipePreparationSummary,
} from '../../kitchen/services/recipePreparations.service.js';
import { StorageSectorSelect } from './StorageSectorSelect.js';
import styles from './WarehouseExtractionModal.module.css';

const QTY_STEP = '0.5';
const QTY_MIN = '0.5';


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
  /** US-025: saldo por sub-sector — el total (`stock`) puede estar en un sector distinto
      al elegido como origen; sin esto el operario no sabe por qué "hay stock" pero la
      extracción falla con 422 (bug real reportado: leche 10L en Cámara de Congelados,
      Bodega de Secos con 0). */
  stockByLocation: StockByLocationEntry[];
  /** US-032: código de barras, ya incluido en la respuesta de GET /stock/insumos —
      permite matchear el escaneo contra el catálogo ya cargado en memoria, sin una
      segunda llamada de red (TK-119-FE, revisión adversarial). */
  barcode: string | null;
}

function stockAtSector(insumo: Insumo | undefined, storageLocationId: string): DecimalQuantity {
  const entry = insumo?.stockByLocation.find((l) => l.storageLocationId === storageLocationId);
  return new DecimalQuantity(entry?.quantity ?? '0');
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
  plannedPortions: number;
  onPlannedPortionsChange: (n: number) => void;
  recipePreparationId: string;
  onRecipePreparationIdChange: (id: string) => void;
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

interface RecipeDestinationFieldProps {
  recipes: { id: string; name: string }[];
  selectedRecipeId: string;
  onRecipeIdChange: (id: string) => void;
  plannedPortions: number;
  onPlannedPortionsChange: (n: number) => void;
  recipePreparationId: string;
  onRecipePreparationIdChange: (id: string) => void;
}

// US-027: al elegir una receta, ofrece "añadir a una preparación en curso" si hay alguna abierta.
function useOpenPreparationsForRecipe(recipeId: string) {
  const [openPreps, setOpenPreps] = useState<RecipePreparationSummary[]>([]);
  React.useEffect(() => {
    if (!recipeId) {
      setOpenPreps([]);
      return;
    }
    let cancelled = false;
    RecipePreparationsService.list('OPEN')
      .then((all) => {
        if (!cancelled) setOpenPreps(all.filter((p) => p.recipeId === recipeId));
      })
      .catch(() => {
        if (!cancelled) setOpenPreps([]);
      });
    return () => {
      cancelled = true;
    };
  }, [recipeId]);
  return openPreps;
}

const RecipeSelect: React.FC<{ recipes: { id: string; name: string }[]; value: string; onChange: (id: string) => void }> = ({ recipes, value, onChange }) => (
  <div>
    <label htmlFor="select-recipe-extraction" className="form-label">Seleccionar Receta Destino *:</label>
    {/* US-027: la receta es obligatoria en modo RECIPE — validado en extractionValidationError
        (mismo patrón que el motivo de descarte), no con `required` nativo, para mostrar el
        ErrorBanner del modal en vez del popup del navegador (Guard 38). */}
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input-touch" id="select-recipe-extraction">
      <option value="">-- Seleccionar Receta --</option>
      {recipes.map((r) => (
        <option key={r.id} value={r.id}>{r.name}</option>
      ))}
    </select>
  </div>
);

const PlannedPortionsInput: React.FC<{ value: number; onChange: (n: number) => void }> = ({ value, onChange }) => (
  <div>
    <label htmlFor="input-planned-portions" className="form-label">Porciones Planificadas:</label>
    <input
      type="number"
      min="1"
      step="1"
      value={value}
      onChange={(e) => {
        const parsed = Number(e.target.value);
        onChange(Number.isFinite(parsed) && parsed >= 1 ? Math.trunc(parsed) : 1);
      }}
      className="input-touch"
      id="input-planned-portions"
    />
  </div>
);

const OpenPreparationSelect: React.FC<{ openPreps: RecipePreparationSummary[]; value: string; onChange: (id: string) => void }> = ({ openPreps, value, onChange }) => (
  <div>
    <label htmlFor="select-open-preparation" className="form-label">Añadir a Preparación en Curso (opcional):</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input-touch" id="select-open-preparation">
      <option value="">-- Nueva preparación --</option>
      {openPreps.map((p) => (
        <option key={p.id} value={p.id}>
          {p.plannedPortions} porciones · abierta {new Date(p.openedAt).toLocaleTimeString()}
        </option>
      ))}
    </select>
  </div>
);

const RecipeDestinationField: React.FC<RecipeDestinationFieldProps> = ({
  recipes,
  selectedRecipeId,
  onRecipeIdChange,
  plannedPortions,
  onPlannedPortionsChange,
  recipePreparationId,
  onRecipePreparationIdChange,
}) => {
  const openPreps = useOpenPreparationsForRecipe(selectedRecipeId);
  return (
    <>
      <RecipeSelect
        recipes={recipes}
        value={selectedRecipeId}
        onChange={(id) => {
          onRecipeIdChange(id);
          onRecipePreparationIdChange('');
        }}
      />
      <PlannedPortionsInput value={plannedPortions} onChange={onPlannedPortionsChange} />
      {openPreps.length > 0 && (
        <OpenPreparationSelect openPreps={openPreps} value={recipePreparationId} onChange={onRecipePreparationIdChange} />
      )}
    </>
  );
};

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
  // US-026: áreas de cocina del catálogo (StorageLocation type=KITCHEN), sin literales.
  <StorageSectorSelect
    id="select-location-extraction"
    label="Ubicación Destino en Cocina *"
    areaType="KITCHEN"
    value={location}
    onChange={onLocationChange}
  />
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
  plannedPortions,
  onPlannedPortionsChange,
  recipePreparationId,
  onRecipePreparationIdChange,
}) => (
  <>
    <InsumoPurposeSelect insumos={insumos} selectedInsumoId={selectedInsumoId} onInsumoChange={onInsumoChange} purpose={purpose} onPurposeChange={onPurposeChange} />
    {purpose === 'RECIPE' && (
      <RecipeDestinationField
        recipes={recipes}
        selectedRecipeId={selectedRecipeId}
        onRecipeIdChange={onRecipeIdChange}
        plannedPortions={plannedPortions}
        onPlannedPortionsChange={onPlannedPortionsChange}
        recipePreparationId={recipePreparationId}
        onRecipePreparationIdChange={onRecipePreparationIdChange}
      />
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
        min="0"
        value={quantity}
        onChange={(e) => {
          // AUDIT-DEV-006 F-6: no coacciona en silencio '' / NaN a 0.5 — un valor
          // inválido pasa como 0 y la validación de submit lo rechaza explícitamente.
          const parsed = Number(e.target.value);
          onChange(Number.isFinite(parsed) ? parsed : 0);
        }}
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

function buildLocalRemanenteFromExtraction(
  selectedInsumoId: string,
  insumos: Insumo[],
  result: Awaited<ReturnType<typeof StockService.recordExtraction>> & { remanenteId: string }
) {
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
  plannedPortions: number;
  onPlannedPortionsChange: (n: number) => void;
  recipePreparationId: string;
  onRecipePreparationIdChange: (id: string) => void;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onQuantityChange: (value: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  duplicateActiveRemanentes: RemanenteFEFOItem[];
}

function originSectorHint(p: ExtractionFormProps): string | undefined {
  if (!p.selectedInsumoId || !p.fromStorageLocationId) return undefined;
  const insumo = p.insumos.find((i) => i.id === p.selectedInsumoId);
  const available = stockAtSector(insumo, p.fromStorageLocationId);
  return `Disponible en este sector: ${available.toFixed(3)} ${insumo?.unit ?? ''} (total en bodega: ${insumo?.stock ?? 0} ${insumo?.unit ?? ''})`;
}

const ExtractionForm: React.FC<ExtractionFormProps> = (p) => (
  <form onSubmit={p.onSubmit} className="flex-column flex-gap-md">
    <StorageSectorSelect
      id="select-from-sector-extraction"
      label="Sector de Bodega Origen *"
      value={p.fromStorageLocationId}
      onChange={p.onFromStorageLocationIdChange}
      hint={originSectorHint(p)}
    />
    <ExtractionSelectFields {...p} />
    <DuplicateRemanenteWarning activeRemanentes={p.duplicateActiveRemanentes} />
    <QuantityStepper quantity={p.quantity} onIncrement={p.onIncrement} onDecrement={p.onDecrement} onChange={p.onQuantityChange} />
    <ExtractionNoteBanner purpose={p.purpose} />
    <ModalFooterActions onCancel={p.onCancel} confirmLabel="Confirmar Extracción" submittingLabel="Procesando..." isSubmitting={p.isSubmitting} />
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
  plannedPortions: number;
  recipePreparationId: string;
  insumos: Insumo[];
  onSuccess: () => void;
  onClose: () => void;
}

async function performExtraction(args: PerformExtractionArgs) {
  const { activeInsumoId, quantity, location, fromStorageLocationId, purpose, reason, selectedRecipeId, plannedPortions, recipePreparationId, insumos, onSuccess, onClose } = args;
  const result = await StockService.recordExtraction({
    insumoId: activeInsumoId,
    quantity: quantity.toString(),
    fromStorageLocationId,
    // US-026: id del área de cocina del catálogo (el descarte directo no la usa).
    toStorageLocationId: purpose === 'DIRECT_DISCARD' ? undefined : location,
    purpose,
    reason: reason.trim() || undefined,
    recipeId: selectedRecipeId || undefined,
    // US-027: solo relevantes en modo RECIPE.
    plannedPortions: purpose === 'RECIPE' ? plannedPortions : undefined,
    recipePreparationId: purpose === 'RECIPE' && recipePreparationId ? recipePreparationId : undefined,
  });

  if (purpose !== 'DIRECT_DISCARD' && result.remanenteId !== null) {
    KitchenService.addLocalRemanente(
      buildLocalRemanenteFromExtraction(activeInsumoId, insumos, { ...result, remanenteId: result.remanenteId })
    );
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
  const [location, setLocation] = useState(''); // US-026: id del área de cocina; StorageSectorSelect auto-selecciona la primera
  const [fromStorageLocationId, setFromStorageLocationId] = useState('');
  const [reason, setReason] = useState('');
  const [recipes, setRecipes] = useState<{ id: string; name: string }[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [plannedPortions, setPlannedPortions] = useState(1);
  const [recipePreparationId, setRecipePreparationId] = useState('');
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
    recipes, selectedRecipeId, setSelectedRecipeId, plannedPortions, setPlannedPortions,
    recipePreparationId, setRecipePreparationId, isSubmitting, setIsSubmitting, error, setError,
  };
}

// AUDIT-DEV-006 F-6: aritmética decimal (VO compartido), no `prev + 0.5` con flotantes.
const stepQuantityUp = (prev: number): number => new DecimalQuantity(prev).add(QTY_STEP).toNumber();
const stepQuantityDown = (prev: number): number =>
  new DecimalQuantity(prev).subtractClamped(QTY_STEP).clampMin(QTY_MIN).toNumber();

// US-025: el total de bodega puede estar todo en OTRO sub-sector — valida contra el saldo
// del sector de origen elegido, no contra el agregado (evita el 422 confuso; bug real
// reportado: insumo con stock total > 0 pero 0 en el sector auto-seleccionado).
function insufficientSectorStockError(insumo: Insumo | undefined, fromStorageLocationId: string, quantity: number): string | null {
  const available = stockAtSector(insumo, fromStorageLocationId);
  const requested = new DecimalQuantity(quantity || 0);
  if (!requested.isGreaterThan(available.toFixed(6))) return null;
  const unit = insumo?.unit ?? '';
  return `Stock insuficiente en este sector para "${insumo?.name ?? 'el insumo'}". Solicitado: ${requested.toFixed(3)} ${unit}, disponible en este sector: ${available.toFixed(3)} ${unit}.`;
}

function extractionValidationError(s: ReturnType<typeof useExtractionFields>, activeInsumoId: string, insumos: Insumo[]): string | null {
  if (s.purpose === 'DIRECT_DISCARD' && !s.reason.trim()) return 'Debe especificar el motivo descriptivo del descarte directo.';
  if (s.purpose === 'RECIPE' && !s.selectedRecipeId) return 'Debe seleccionar la receta que va a preparar.';
  if (!s.fromStorageLocationId) return 'Debe seleccionar el sub-sector de bodega de origen.';
  if (!new DecimalQuantity(s.quantity || 0).isPositive()) return 'La cantidad a extraer debe ser mayor que cero.';

  const insumo = insumos.find((i) => i.id === activeInsumoId);
  return insufficientSectorStockError(insumo, s.fromStorageLocationId, s.quantity);
}

function useExtractionForm(insumos: Insumo[], onSuccess: () => void, onClose: () => void) {
  const s = useExtractionFields();
  const activeInsumoId = s.selectedInsumoId || (insumos.length > 0 ? insumos[0].id : '');
  const duplicateActiveRemanentes = useDuplicateRemanenteWarning(activeInsumoId);

  const handleIncrement = () => s.setQuantity(stepQuantityUp);
  const handleDecrement = () => s.setQuantity(stepQuantityDown);
  const validationError = (): string | null => extractionValidationError(s, activeInsumoId, insumos);

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
        purpose: s.purpose, reason: s.reason, selectedRecipeId: s.selectedRecipeId,
        plannedPortions: s.plannedPortions, recipePreparationId: s.recipePreparationId,
        insumos, onSuccess, onClose,
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
    plannedPortions: s.plannedPortions,
    onPlannedPortionsChange: s.setPlannedPortions,
    recipePreparationId: s.recipePreparationId,
    onRecipePreparationIdChange: s.setRecipePreparationId,
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

interface AvailableInsumosState {
  insumos: Insumo[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

// AUDIT-DEV-006 F-5: sin fallback a lista demo estática. Si el backend falla, se expone
// el error para que el modal lo muestre y ofrezca reintentar — nunca insumos inventados.
function useAvailableInsumos(isOpen: boolean): AvailableInsumosState {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  React.useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    StockService.getInsumos()
      .then((items) => {
        if (cancelled) return;
        setInsumos(
          items.map((i) => ({
            id: i.id,
            name: i.name,
            stock: Number(i.warehouseStock),
            unit: i.unitOfMeasure,
            stockByLocation: i.stockByLocation ?? [],
            barcode: i.barcode ?? null,
          }))
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setInsumos([]);
        setError(mapToUserFriendlyError(err).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, reloadNonce]);

  return { insumos, loading, error, reload: () => setReloadNonce((n) => n + 1) };
}

// US-032/TK-119-FE: el componente de escaneo no sabe nada de insumos, solo emite el
// código decodificado. GET /stock/insumos (useAvailableInsumos) ya trae `barcode` por
// insumo con el mismo mapper que el endpoint dedicado de búsqueda — matchear contra el
// catálogo ya cargado en memoria evita una segunda llamada de red por cada escaneo y,
// de paso, garantiza que el insumo encontrado SIEMPRE está entre las opciones del
// selector manual (revisión adversarial: una búsqueda de servidor independiente podía,
// en teoría, devolver un id ausente del catálogo ya renderizado).
function useBarcodeScan(insumos: Insumo[], onMatch: (insumoId: string) => void) {
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScan = (barcode: string) => {
    const insumo = insumos.find((i) => i.barcode === barcode);
    if (insumo) {
      setScanError(null);
      onMatch(insumo.id);
    } else {
      setScanError('Código no encontrado — solicita a un Administrador que lo dé de alta.');
    }
  };

  return { scanError, handleScan };
}

const InsumosLoadError: React.FC<{ message: string; onRetry: () => void; onClose: () => void }> = ({ message, onRetry, onClose }) => (
  <div className="flex-column flex-gap-md">
    <ErrorBanner message={message} />
    <div className="flex-gap-md">
      <button type="button" className="btn-touch btn-secondary" onClick={onClose}>
        Cerrar
      </button>
      <button type="button" className="btn-touch btn-primary" onClick={onRetry} id="btn-retry-load-insumos">
        Reintentar
      </button>
    </div>
  </div>
);

export const WarehouseExtractionModal: React.FC<WarehouseExtractionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const insumosState = useAvailableInsumos(isOpen);
  const form = useExtractionForm(insumosState.insumos, onSuccess, onClose);
  const { scanError, handleScan } = useBarcodeScan(insumosState.insumos, form.bind.onInsumoChange);

  if (!isOpen) return null;

  return (
    <Modal size="md">
      <ModalHeader
        icon={<PackageCheck className="text-primary-color" />}
        title="Extracción de Bodega (Alta TRR)"
        size="lg"
        onClose={onClose}
      />

      {insumosState.error ? (
        <InsumosLoadError message={insumosState.error} onRetry={insumosState.reload} onClose={onClose} />
      ) : insumosState.loading && insumosState.insumos.length === 0 ? (
        <p role="status" className={styles['extraction-note-banner']}>Cargando insumos de bodega…</p>
      ) : insumosState.insumos.length === 0 ? (
        <ErrorBanner message="No hay insumos de bodega disponibles para extraer." />
      ) : (
        <>
          <BarcodeScannerButton onScan={handleScan} />
          {scanError && <ErrorBanner message={scanError} />}
          {form.error && <ErrorBanner message={form.error} />}
          <ExtractionForm insumos={insumosState.insumos} onCancel={onClose} {...form.bind} />
        </>
      )}
    </Modal>
  );
};
