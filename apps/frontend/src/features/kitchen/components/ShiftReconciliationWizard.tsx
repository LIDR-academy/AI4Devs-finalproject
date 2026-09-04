import React, { useState } from 'react';
import { ClipboardCheck, AlertOctagon, CheckSquare, Plus, Minus } from 'lucide-react';
import { RemanenteFEFOItem } from '../services/kitchen.service.js';
import { ReconciliationService } from '../services/reconciliation.service.js';
import { ConsumptionReasonDto } from '../services/consumptionReasons.service.js';
import { useActiveConsumptionReasons } from '../../../shared/hooks/useActiveConsumptionReasons.js';
import { ConsumptionReasonSelect } from '../../../shared/components/ConsumptionReasonSelect.js';
import { formatQuantity, formatUnitLabel } from '../../../utils/formatters.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import styles from './ShiftReconciliationWizard.module.css';

interface ReconciliationFormState {
  counts: { [remanenteId: string]: number };
  reasonIds: { [remanenteId: string]: string };
  notes: string;
  setNotes: (notes: string) => void;
  isCriticalAuthChecked: boolean;
  setIsCriticalAuthChecked: (checked: boolean) => void;
  isSubmitting: boolean;
  hasCriticalVariance: boolean;
  hasMissingReason: boolean;
  canSubmit: boolean;
  handleQuantityChange: (id: string, newQty: number) => void;
  handleReasonChange: (id: string, reasonId: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

function initialCounts(remanentes: RemanenteFEFOItem[]): { [remanenteId: string]: number } {
  const initial: { [remanenteId: string]: number } = {};
  remanentes.forEach((r) => {
    initial[r.id] = parseFloat(r.currentQuantity);
  });
  return initial;
}

// ADR-004: toda línea con varianza negativa exige motivo — sin él, el envío se bloquea
// (mismo patrón que la autorización de varianza crítica, ya existente).
function computeVarianceFlags(
  remanentes: RemanenteFEFOItem[],
  counts: { [remanenteId: string]: number },
  reasonIds: { [remanenteId: string]: string }
): { hasCriticalVariance: boolean; hasMissingReason: boolean } {
  let hasCriticalVariance = false;
  let hasMissingReason = false;
  for (const r of remanentes) {
    const theo = parseFloat(r.currentQuantity);
    const info = getVarianceInfo(theo, counts[r.id] ?? theo);
    if (info.isCritical) hasCriticalVariance = true;
    if (info.diff < 0 && !reasonIds[r.id]) hasMissingReason = true;
  }
  return { hasCriticalVariance, hasMissingReason };
}

function buildItemsPayload(counts: { [remanenteId: string]: number }, reasonIds: { [remanenteId: string]: string }) {
  return Object.entries(counts).map(([remanenteId, physicalQuantity]) => ({
    remanenteId,
    physicalQuantity,
    reasonId: reasonIds[remanenteId] || undefined,
  }));
}

function useShiftReconciliationForm(
  remanentes: RemanenteFEFOItem[],
  operatorId: string,
  onSuccess: () => void,
  onClose: () => void
): ReconciliationFormState {
  const [counts, setCounts] = useState(() => initialCounts(remanentes));
  // ADR-004 / US-008 / TK-109-FE: motivo elegido por línea con varianza negativa.
  const [reasonIds, setReasonIds] = useState<{ [remanenteId: string]: string }>({});

  const [notes, setNotes] = useState('');
  const [isCriticalAuthChecked, setIsCriticalAuthChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuantityChange = (id: string, newQty: number) => {
    setCounts((prev) => ({ ...prev, [id]: Math.max(0, Math.round(newQty * 10000) / 10000) }));
  };

  const handleReasonChange = (id: string, reasonId: string) => {
    setReasonIds((prev) => ({ ...prev, [id]: reasonId }));
  };

  const { hasCriticalVariance, hasMissingReason } = computeVarianceFlags(remanentes, counts, reasonIds);
  const canSubmit = (!hasCriticalVariance || isCriticalAuthChecked) && !hasMissingReason;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const items = buildItemsPayload(counts, reasonIds);
      await ReconciliationService.submitReconciliation({ operatorId, notes, items });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('[ShiftReconciliationWizard] Error durante la conciliacion de turno:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    counts,
    reasonIds,
    notes,
    setNotes,
    isCriticalAuthChecked,
    setIsCriticalAuthChecked,
    isSubmitting,
    hasCriticalVariance,
    hasMissingReason,
    canSubmit,
    handleQuantityChange,
    handleReasonChange,
    handleSubmit,
  };
}

interface ShiftReconciliationWizardProps {
  isOpen: boolean;
  remanentes: RemanenteFEFOItem[];
  operatorId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CRITICAL_VARIANCE_RATIO = 0.5;

interface VarianceInfo {
  diff: number;
  devRatio: number;
  isCritical: boolean;
}

function getVarianceInfo(theoretical: number, physical: number): VarianceInfo {
  const diff = physical - theoretical;
  const devRatio = theoretical > 0 ? Math.abs(diff) / theoretical : 0;
  return { diff, devRatio, isCritical: devRatio > CRITICAL_VARIANCE_RATIO };
}

interface ReconciliationItemRowProps {
  item: RemanenteFEFOItem;
  physicalQuantity: number;
  reasonId: string;
  reasons: ConsumptionReasonDto[];
  onQuantityChange: (id: string, newQty: number) => void;
  onReasonChange: (id: string, reasonId: string) => void;
}

const ReconciliationItemInfo: React.FC<{ item: RemanenteFEFOItem; diff: number; isCritical: boolean }> = ({ item, diff, isCritical }) => (
  <div>
    <div className="fw-semibold fs-md">{item.insumoName}</div>
    <div className="fs-sm text-secondary-color">
      Teórico: {formatQuantity(item.currentQuantity, item.unitOfMeasure)} {formatUnitLabel(item.unitOfMeasure)} | Expira en {item.hoursRemaining}h
    </div>
    {diff !== 0 && (
      <div className={`fs-xs fw-bold mt-1 ${diff < 0 ? styles['variance-negative'] : styles['variance-positive']}`}>
        Varianza: {diff > 0 ? `+${formatQuantity(diff, item.unitOfMeasure)}` : formatQuantity(diff, item.unitOfMeasure)} {formatUnitLabel(item.unitOfMeasure)}
        {isCritical && ' (desvío crítico >50%)'}
      </div>
    )}
  </div>
);

interface ReconciliationQuantityControlsProps {
  itemId: string;
  physicalQuantity: number;
  onQuantityChange: (id: string, newQty: number) => void;
}

const ReconciliationQuantityControls: React.FC<ReconciliationQuantityControlsProps> = ({ itemId, physicalQuantity, onQuantityChange }) => (
  <div className="flex-gap-sm">
    <button
      type="button"
      className={`btn-touch btn-secondary ${styles['qty-stepper-btn-sm']}`}
      onClick={() => onQuantityChange(itemId, physicalQuantity - 0.1)}
    >
      <Minus size={18} />
    </button>

    <input
      type="number"
      step="0.05"
      min="0"
      value={physicalQuantity}
      onChange={(e) => onQuantityChange(itemId, parseFloat(e.target.value) || 0)}
      className={styles['qty-stepper-input-sm']}
      id={`input-phys-${itemId}`}
    />

    <button
      type="button"
      className={`btn-touch btn-secondary ${styles['qty-stepper-btn-sm']}`}
      onClick={() => onQuantityChange(itemId, physicalQuantity + 0.1)}
    >
      <Plus size={18} />
    </button>
  </div>
);

// ADR-004 / US-008 / TK-109-FE: motivo inline, solo cuando la línea da varianza negativa.
// Sin `required` nativo (Guard 38) — el envío se bloquea vía `hasMissingReason`/`canSubmit`,
// mismo patrón que la autorización de varianza crítica (checkbox, no popup del navegador).
const NegativeVarianceReasonSelect: React.FC<{
  itemId: string;
  reasonId: string;
  reasons: ConsumptionReasonDto[];
  onReasonChange: (id: string, reasonId: string) => void;
}> = ({ itemId, reasonId, reasons, onReasonChange }) => (
  <div className="mt-2">
    <label htmlFor={`select-recon-reason-${itemId}`} className="form-label fs-xs">
      Motivo de la Varianza Negativa *:
    </label>
    <ConsumptionReasonSelect
      id={`select-recon-reason-${itemId}`}
      value={reasonId}
      reasons={reasons}
      onChange={(value) => onReasonChange(itemId, value)}
      className="input-touch input-touch-compact"
    />
  </div>
);

const ReconciliationItemRow: React.FC<ReconciliationItemRowProps> = ({ item, physicalQuantity, reasonId, reasons, onQuantityChange, onReasonChange }) => {
  const theo = parseFloat(item.currentQuantity);
  const { diff, isCritical } = getVarianceInfo(theo, physicalQuantity);
  // TK-115-FE: misma condición que hasMissingReason en computeVarianceFlags — sin
  // lógica de detección nueva, solo el resaltado visual de la fila.
  const isPendingReason = diff < 0 && !reasonId;

  return (
    <div
      className={`flex-column reconciliation-item-row${isCritical ? ` ${styles['reconciliation-row--critical']}` : ''}${
        isPendingReason ? ` ${styles['reconciliation-row--pending-reason']}` : ''
      }`}
    >
      <div className="flex-between gap-3">
        <ReconciliationItemInfo item={item} diff={diff} isCritical={isCritical} />
        <ReconciliationQuantityControls itemId={item.id} physicalQuantity={physicalQuantity} onQuantityChange={onQuantityChange} />
      </div>
      {diff < 0 && (
        <NegativeVarianceReasonSelect itemId={item.id} reasonId={reasonId} reasons={reasons} onReasonChange={onReasonChange} />
      )}
    </div>
  );
};

interface CriticalVarianceBannerProps {
  isAuthorized: boolean;
  onAuthorize: (checked: boolean) => void;
}

const CriticalVarianceBanner: React.FC<CriticalVarianceBannerProps> = ({ isAuthorized, onAuthorize }) => (
  <div className={`${styles['critical-variance-banner']} mb-5`}>
    <div className={`${styles['critical-variance-alert-row']} fw-bold mb-2`}>
      <AlertOctagon size={22} />
      ¡Alerta de Varianza Crítica Mayor al 50%!
    </div>
    <p className="fs-sm mb-3">
      Se detectó una desviación significativa entre el inventario físico y el teórico. Debe autorizar la diferencia para enviar el cierre.
    </p>
    <label className={`flex-gap-sm fs-sm fw-semibold ${styles['cursor-pointer']}`}>
      <input
        type="checkbox"
        checked={isAuthorized}
        onChange={(e) => onAuthorize(e.target.checked)}
        id="chk-authorize-critical"
      />
      Autorizar diferencia crítica (&gt;50%)
    </label>
  </div>
);

interface ReconciliationFooterProps {
  notes: string;
  setNotes: (notes: string) => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
}

const ReconciliationFooter: React.FC<ReconciliationFooterProps> = ({ notes, setNotes, canSubmit, isSubmitting, onCancel }) => (
  <>
    <div className="mb-5">
      <label htmlFor="input-reconciliation-notes" className="d-block fs-sm fw-semibold mb-2">
        Notas del Cierre de Turno (Opcional)
      </label>
      <input
        type="text"
        className="input-touch"
        placeholder="Ej. Cambio de turno noche sin novedades"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        id="input-reconciliation-notes"
      />
    </div>

    <div className={`${styles['d-flex']} justify-end gap-3`}>
      <button type="button" className="btn-touch btn-secondary" onClick={onCancel} disabled={isSubmitting}>
        Cancelar
      </button>
      <button type="submit" className="btn-touch btn-primary" disabled={!canSubmit || isSubmitting} id="btn-submit-reconciliation">
        <CheckSquare size={18} />
        {isSubmitting ? 'Guardando...' : 'Enviar Conciliación de Turno'}
      </button>
    </div>
  </>
);

export const ShiftReconciliationWizard: React.FC<ShiftReconciliationWizardProps> = ({
  isOpen,
  remanentes,
  operatorId,
  onClose,
  onSuccess,
}) => {
  const form = useShiftReconciliationForm(remanentes, operatorId, onSuccess, onClose);
  const reasons = useActiveConsumptionReasons(isOpen);

  if (!isOpen) return null;

  return (
    <Modal size="xl">
      <ModalHeader
        icon={<ClipboardCheck className="text-primary-color" />}
        title="Cierre de Turno y Conciliación de Stock"
        size="lg"
        onClose={onClose}
      />

      <form onSubmit={form.handleSubmit}>
        <p className="fs-md text-secondary-color mb-4">
          Ingresa las cantidades reales medidas en cocina. Los insumos expirados serán descartados automáticamente.
        </p>

        <div className={`flex-column gap-3 mb-5 ${styles['reconciliation-list-scroll']}`}>
          {remanentes.map((r) => (
            <ReconciliationItemRow
              key={r.id}
              item={r}
              physicalQuantity={form.counts[r.id] ?? parseFloat(r.currentQuantity)}
              reasonId={form.reasonIds[r.id] ?? ''}
              reasons={reasons}
              onQuantityChange={form.handleQuantityChange}
              onReasonChange={form.handleReasonChange}
            />
          ))}
        </div>

        {form.hasCriticalVariance && (
          <CriticalVarianceBanner isAuthorized={form.isCriticalAuthChecked} onAuthorize={form.setIsCriticalAuthChecked} />
        )}

        <ReconciliationFooter
          notes={form.notes}
          setNotes={form.setNotes}
          canSubmit={form.canSubmit}
          isSubmitting={form.isSubmitting}
          onCancel={onClose}
        />
      </form>
    </Modal>
  );
};
