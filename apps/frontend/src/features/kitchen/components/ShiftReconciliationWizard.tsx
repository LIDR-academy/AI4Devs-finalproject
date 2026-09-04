import React, { useState } from 'react';
import { ClipboardCheck, AlertOctagon, CheckSquare, Plus, Minus } from 'lucide-react';
import { RemanenteFEFOItem } from '../services/kitchen.service.js';
import { ReconciliationService } from '../services/reconciliation.service.js';
import { formatQuantity, formatUnitLabel } from '../../../utils/formatters.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import styles from './ShiftReconciliationWizard.module.css';

interface ReconciliationFormState {
  counts: { [remanenteId: string]: number };
  notes: string;
  setNotes: (notes: string) => void;
  isCriticalAuthChecked: boolean;
  setIsCriticalAuthChecked: (checked: boolean) => void;
  isSubmitting: boolean;
  hasCriticalVariance: boolean;
  canSubmit: boolean;
  handleQuantityChange: (id: string, newQty: number) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

function useShiftReconciliationForm(
  remanentes: RemanenteFEFOItem[],
  operatorId: string,
  onSuccess: () => void,
  onClose: () => void
): ReconciliationFormState {
  const [counts, setCounts] = useState<{ [remanenteId: string]: number }>(() => {
    const initial: { [remanenteId: string]: number } = {};
    remanentes.forEach((r) => {
      initial[r.id] = parseFloat(r.currentQuantity);
    });
    return initial;
  });

  const [notes, setNotes] = useState('');
  const [isCriticalAuthChecked, setIsCriticalAuthChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuantityChange = (id: string, newQty: number) => {
    setCounts((prev) => ({ ...prev, [id]: Math.max(0, Math.round(newQty * 10000) / 10000) }));
  };

  const hasCriticalVariance = remanentes.some((r) => {
    const theo = parseFloat(r.currentQuantity);
    const phys = counts[r.id] ?? theo;
    return getVarianceInfo(theo, phys).isCritical;
  });

  const canSubmit = !hasCriticalVariance || isCriticalAuthChecked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const itemsPayload = Object.entries(counts).map(([remanenteId, physicalQuantity]) => ({ remanenteId, physicalQuantity }));
      await ReconciliationService.submitReconciliation({ operatorId, notes, items: itemsPayload });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('[ShiftReconciliationWizard] Error durante la conciliacion de turno:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { counts, notes, setNotes, isCriticalAuthChecked, setIsCriticalAuthChecked, isSubmitting, hasCriticalVariance, canSubmit, handleQuantityChange, handleSubmit };
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
  onQuantityChange: (id: string, newQty: number) => void;
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

const ReconciliationItemRow: React.FC<ReconciliationItemRowProps> = ({ item, physicalQuantity, onQuantityChange }) => {
  const theo = parseFloat(item.currentQuantity);
  const { diff, isCritical } = getVarianceInfo(theo, physicalQuantity);

  return (
    <div className={`flex-between gap-3 reconciliation-item-row${isCritical ? ` ${styles['reconciliation-row--critical']}` : ''}`}>
      <ReconciliationItemInfo item={item} diff={diff} isCritical={isCritical} />
      <ReconciliationQuantityControls itemId={item.id} physicalQuantity={physicalQuantity} onQuantityChange={onQuantityChange} />
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
              onQuantityChange={form.handleQuantityChange}
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
