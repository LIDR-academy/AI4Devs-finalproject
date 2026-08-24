import React, { useState } from 'react';
import { ClipboardCheck, AlertOctagon, CheckSquare, Plus, Minus } from 'lucide-react';
import { RemanenteFEFOItem } from '../services/kitchen.service.js';
import { ReconciliationService } from '../services/reconciliation.service.js';
import { formatQuantity, formatUnitLabel } from '../../../utils/formatters.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';

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
    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.insumoName}</div>
    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
      Teórico: {formatQuantity(item.currentQuantity, item.unitOfMeasure)} {formatUnitLabel(item.unitOfMeasure)} | Expira en {item.hoursRemaining}h
    </div>
    {diff !== 0 && (
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: diff < 0 ? 'var(--color-danger-text)' : 'var(--color-primary)', marginTop: '2px' }}>
        Varianza: {diff > 0 ? `+${formatQuantity(diff, item.unitOfMeasure)}` : formatQuantity(diff, item.unitOfMeasure)} {formatUnitLabel(item.unitOfMeasure)}
        {isCritical && ' ⚠️ (>50% de desvío)'}
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
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <button
      type="button"
      className="btn-touch btn-secondary"
      style={{ minWidth: '40px', minHeight: '40px', padding: '0' }}
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
      style={{
        width: '90px',
        textAlign: 'center',
        fontSize: '1rem',
        fontWeight: 700,
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid var(--border-card)',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
      id={`input-phys-${itemId}`}
    />

    <button
      type="button"
      className="btn-touch btn-secondary"
      style={{ minWidth: '40px', minHeight: '40px', padding: '0' }}
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
    <div
      style={{
        backgroundColor: isCritical ? 'rgba(225, 6, 0, 0.08)' : 'var(--bg-card)',
        border: `1px solid ${isCritical ? 'var(--color-danger)' : 'var(--border-card)'}`,
        padding: '12px 16px',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
      }}
    >
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
  <div
    style={{
      backgroundColor: 'rgba(225, 6, 0, 0.12)',
      border: '1px solid var(--color-danger)',
      padding: '14px',
      borderRadius: '4px',
      marginBottom: '20px',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-danger-text)', fontWeight: 700, marginBottom: '6px' }}>
      <AlertOctagon size={22} />
      ¡Alerta de Varianza Crítica Mayor al 50%!
    </div>
    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
      Se detectó una desviación significativa entre el inventario físico y el teórico. Debe autorizar la diferencia para enviar el cierre.
    </p>
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
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
    <div style={{ marginBottom: '20px' }}>
      <label htmlFor="input-reconciliation-notes" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
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

    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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
    <Modal maxWidth="720px" width="90%">
      <ModalHeader
        icon={<ClipboardCheck style={{ color: 'var(--color-primary)' }} />}
        title="Cierre de Turno y Conciliación de Stock"
        fontSize="1.4rem"
        gap="10px"
        marginBottom="20px"
        onClose={onClose}
      />

      <form onSubmit={form.handleSubmit}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Ingresa las cantidades reales medidas en cocina. Los insumos expirados serán descartados automáticamente.
          </p>

          <div style={{ maxHeight: '340px', overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
