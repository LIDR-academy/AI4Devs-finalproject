import React, { useEffect, useState } from 'react';
import { ClipboardCheck, CheckCircle2, XCircle } from 'lucide-react';
import {
  RecipePreparationsService,
  RecipePreparationDetail,
  RecipePreparationLinkedRemanente,
  CloseItemInput,
} from '../services/recipePreparations.service.js';
import { fetchActiveKitchenAreas, fetchActiveWarehouseSectors, StorageLocationDto } from '../../stock/services/locations.service.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ModalFooterActions } from '../../../shared/components/ModalFooterActions.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { mapToUserFriendlyError } from '../../../shared/utils/errorMessageMapper.js';
import { DecimalQuantity } from '../../../shared/domain/DecimalQuantity.js';
import styles from './ClosePreparationModal.module.css';

interface ClosePreparationModalProps {
  preparationId: string | null;
  recipeName: string;
  onClose: () => void;
  /** Se dispara tras un cierre o abandono exitoso (recarga tablero + preparaciones). */
  onReconciled: () => void;
}

interface RowState {
  leftoverQty: string;
  leftoverLocationId: string;
  markedUnopened: boolean;
  wastedQty: string;
  wasteReason: string;
}

type RowsState = Record<string, RowState>;

const EMPTY_ROW: RowState = { leftoverQty: '0', leftoverLocationId: '', markedUnopened: false, wastedQty: '0', wasteReason: '' };

function initialRow(remanente: RecipePreparationLinkedRemanente): RowState {
  return { ...EMPTY_ROW, leftoverLocationId: remanente.storageLocationId ?? '' };
}

/** Deriva `consumido` y si `sobrante + merma` cuadra contra lo extraído (Guard 17: Decimal, no float). */
function computeRowBalance(extractedQty: string, leftoverQty: string, wastedQty: string) {
  const extracted = new DecimalQuantity(extractedQty || '0');
  const removed = new DecimalQuantity(leftoverQty || '0').add(wastedQty || '0');
  const balanced = !removed.isGreaterThan(extracted.toFixed(4));
  const consumedQty = balanced ? extracted.subtractClamped(removed.toFixed(4)) : new DecimalQuantity('0');
  return { consumedQty, balanced };
}

function hasPositiveLeftover(row: RowState): boolean {
  return new DecimalQuantity(row.leftoverQty || '0').isPositive();
}

function wasteReasonMissing(row: RowState): boolean {
  return new DecimalQuantity(row.wastedQty || '0').isPositive() && !row.wasteReason.trim();
}

function warehouseReturnBlocked(row: RowState, warehouseIds: Set<string>): boolean {
  return hasPositiveLeftover(row) && warehouseIds.has(row.leftoverLocationId) && !row.markedUnopened;
}

function rowError(remanente: RecipePreparationLinkedRemanente, row: RowState, warehouseIds: Set<string>): string | null {
  const { balanced } = computeRowBalance(remanente.currentQuantity, row.leftoverQty, row.wastedQty);
  if (!balanced) return `El sobrante y la merma de "${remanente.insumoName}" superan lo extraído.`;
  if (wasteReasonMissing(row)) return `Debe indicar el motivo de la merma de "${remanente.insumoName}".`;
  if (hasPositiveLeftover(row) && !row.leftoverLocationId) {
    return `Debe elegir dónde queda el sobrante de "${remanente.insumoName}".`;
  }
  if (warehouseReturnBlocked(row, warehouseIds)) {
    return `Para devolver "${remanente.insumoName}" a bodega debe marcar "envase sin abrir".`;
  }
  return null;
}

function closeValidationError(
  remanentes: RecipePreparationLinkedRemanente[],
  rows: RowsState,
  warehouseIds: Set<string>
): string | null {
  for (const r of remanentes) {
    const error = rowError(r, rows[r.id] ?? initialRow(r), warehouseIds);
    if (error) return error;
  }
  return null;
}

function buildCloseItems(remanentes: RecipePreparationLinkedRemanente[], rows: RowsState): CloseItemInput[] {
  return remanentes.map((r) => {
    const row = rows[r.id] ?? initialRow(r);
    const hasLeftover = hasPositiveLeftover(row);
    return {
      insumoId: r.insumoId,
      leftoverQty: row.leftoverQty || '0',
      leftoverLocationId: hasLeftover ? row.leftoverLocationId : undefined,
      markedUnopened: hasLeftover ? row.markedUnopened : undefined,
      wastedQty: row.wastedQty || '0',
      wasteReason: row.wasteReason.trim() || undefined,
    };
  });
}

interface DetailState {
  detail: RecipePreparationDetail | null;
  kitchenAreas: StorageLocationDto[];
  warehouseAreas: StorageLocationDto[];
  loading: boolean;
  loadError: string | null;
}

function useClosePreparationDetail(preparationId: string | null): DetailState {
  const [state, setState] = useState<DetailState>({
    detail: null,
    kitchenAreas: [],
    warehouseAreas: [],
    loading: false,
    loadError: null,
  });

  useEffect(() => {
    if (!preparationId) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, loadError: null }));
    Promise.all([RecipePreparationsService.detail(preparationId), fetchActiveKitchenAreas(), fetchActiveWarehouseSectors()])
      .then(([detail, kitchenAreas, warehouseAreas]) => {
        if (!cancelled) setState({ detail, kitchenAreas, warehouseAreas, loading: false, loadError: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, loadError: mapToUserFriendlyError(err).message }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [preparationId]);

  return state;
}

function useCloseForm(detail: RecipePreparationDetail | null) {
  const [actualPortions, setActualPortions] = useState(0);
  const [rows, setRows] = useState<RowsState>({});

  useEffect(() => {
    if (!detail) return;
    setActualPortions(detail.plannedPortions);
    const next: RowsState = {};
    detail.remanentes.forEach((r) => {
      next[r.id] = initialRow(r);
    });
    setRows(next);
  }, [detail]);

  const updateRow = (remanenteId: string, patch: Partial<RowState>) =>
    setRows((prev) => ({ ...prev, [remanenteId]: { ...(prev[remanenteId] ?? EMPTY_ROW), ...patch } }));

  return { actualPortions, setActualPortions, rows, updateRow };
}

const RowExtractedInfo: React.FC<{ remanente: RecipePreparationLinkedRemanente }> = ({ remanente }) => (
  <div>
    <div className="fw-semibold fs-md">{remanente.insumoName}</div>
    <div className="fs-sm text-secondary-color">
      Extraído: {remanente.currentQuantity} · en {remanente.storageLocationName}
    </div>
  </div>
);

interface LeftoverFieldsProps {
  remanente: RecipePreparationLinkedRemanente;
  row: RowState;
  kitchenAreas: StorageLocationDto[];
  warehouseAreas: StorageLocationDto[];
  onChange: (patch: Partial<RowState>) => void;
}

const LeftoverFields: React.FC<LeftoverFieldsProps> = ({ remanente, row, kitchenAreas, warehouseAreas, onChange }) => (
  <>
    <div>
      <label htmlFor={`input-leftover-${remanente.id}`} className="form-label">
        Sobrante:
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={row.leftoverQty}
        onChange={(e) => onChange({ leftoverQty: e.target.value })}
        className="input-touch"
        id={`input-leftover-${remanente.id}`}
      />
    </div>
    <div>
      <label htmlFor={`select-leftover-dest-${remanente.id}`} className="form-label">
        ¿Dónde queda?
      </label>
      <select
        value={row.leftoverLocationId}
        onChange={(e) => onChange({ leftoverLocationId: e.target.value })}
        className="input-touch"
        id={`select-leftover-dest-${remanente.id}`}
      >
        <option value="">-- Elegir ubicación --</option>
        <optgroup label="Áreas de cocina">
          {kitchenAreas.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </optgroup>
        {remanente.isPristine && warehouseAreas.length > 0 && (
          <optgroup label="Devolver a bodega (solo intacto)">
            {warehouseAreas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
    {remanente.isPristine && (
      <label className={`flex-gap-sm fs-sm ${styles['cursor-pointer']}`} htmlFor={`chk-unopened-${remanente.id}`}>
        <input
          type="checkbox"
          checked={row.markedUnopened}
          onChange={(e) => onChange({ markedUnopened: e.target.checked })}
          id={`chk-unopened-${remanente.id}`}
        />
        Envase sin abrir
      </label>
    )}
  </>
);

interface WasteFieldsProps {
  remanente: RecipePreparationLinkedRemanente;
  row: RowState;
  onChange: (patch: Partial<RowState>) => void;
}

const WasteFields: React.FC<WasteFieldsProps> = ({ remanente, row, onChange }) => (
  <>
    <div>
      <label htmlFor={`input-waste-${remanente.id}`} className="form-label">
        Merma:
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={row.wastedQty}
        onChange={(e) => onChange({ wastedQty: e.target.value })}
        className="input-touch"
        id={`input-waste-${remanente.id}`}
      />
    </div>
    <div>
      <label htmlFor={`input-waste-reason-${remanente.id}`} className="form-label">
        Motivo de la merma:
      </label>
      <input
        type="text"
        value={row.wasteReason}
        onChange={(e) => onChange({ wasteReason: e.target.value })}
        placeholder="Ej: quemado, caído al piso"
        className="input-touch"
        id={`input-waste-reason-${remanente.id}`}
      />
    </div>
  </>
);

const RowBalanceIndicator: React.FC<{ remanente: RecipePreparationLinkedRemanente; row: RowState }> = ({ remanente, row }) => {
  const { consumedQty, balanced } = computeRowBalance(remanente.currentQuantity, row.leftoverQty, row.wastedQty);
  return (
    <div className={`${styles['balance-row']} ${balanced ? styles['balance-ok'] : styles['balance-bad']}`}>
      {balanced ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      Consumido: {consumedQty.toFixed(3)} {balanced ? '· cuadra' : '· no cuadra con lo extraído'}
    </div>
  );
};

const PreparationItemRow: React.FC<LeftoverFieldsProps> = ({ remanente, row, kitchenAreas, warehouseAreas, onChange }) => {
  const { balanced } = computeRowBalance(remanente.currentQuantity, row.leftoverQty, row.wastedQty);
  return (
    <div className={`reconciliation-item-row${balanced ? '' : ` ${styles['item-row--unbalanced']}`}`}>
      <RowExtractedInfo remanente={remanente} />
      <div className={styles['field-grid']}>
        <LeftoverFields remanente={remanente} row={row} kitchenAreas={kitchenAreas} warehouseAreas={warehouseAreas} onChange={onChange} />
        <WasteFields remanente={remanente} row={row} onChange={onChange} />
      </div>
      <RowBalanceIndicator remanente={remanente} row={row} />
    </div>
  );
};

const ActualPortionsField: React.FC<{ value: number; onChange: (n: number) => void; plannedPortions: number }> = ({
  value,
  onChange,
  plannedPortions,
}) => (
  <div className="mb-4">
    <label htmlFor="input-actual-portions" className="form-label">
      Porciones reales obtenidas (planificadas: {plannedPortions}):
    </label>
    <input
      type="number"
      min="0"
      step="1"
      value={value}
      onChange={(e) => {
        const n = Number(e.target.value);
        onChange(Number.isFinite(n) && n >= 0 ? Math.trunc(n) : 0);
      }}
      className="input-touch"
      id="input-actual-portions"
    />
  </div>
);

function useSubmitClose(
  preparationId: string | null,
  detail: RecipePreparationDetail | null,
  form: ReturnType<typeof useCloseForm>,
  warehouseIds: Set<string>,
  onReconciled: () => void,
  onClose: () => void
) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !preparationId) return;
    const invalid = closeValidationError(detail.remanentes, form.rows, warehouseIds);
    if (invalid) return setSubmitError(invalid);

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await RecipePreparationsService.close(preparationId, {
        actualPortions: form.actualPortions,
        items: buildCloseItems(detail.remanentes, form.rows),
      });
      onReconciled();
      onClose();
    } catch (err) {
      console.error('[ClosePreparationModal] Error cerrando la preparación:', err);
      setSubmitError(mapToUserFriendlyError(err).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitError, isSubmitting, handleSubmit };
}

interface ReconciliationFormProps {
  detail: RecipePreparationDetail;
  form: ReturnType<typeof useCloseForm>;
  kitchenAreas: StorageLocationDto[];
  warehouseAreas: StorageLocationDto[];
  submitError: string | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const ReconciliationForm: React.FC<ReconciliationFormProps> = ({
  detail,
  form,
  kitchenAreas,
  warehouseAreas,
  submitError,
  isSubmitting,
  onSubmit,
  onCancel,
}) => (
  <form onSubmit={onSubmit} className="flex-column">
    {submitError && <ErrorBanner message={submitError} />}
    <ActualPortionsField value={form.actualPortions} onChange={form.setActualPortions} plannedPortions={detail.plannedPortions} />
    <div className={`flex-column flex-gap-md mb-4 ${styles['list-scroll']}`}>
      {detail.remanentes.map((r) => (
        <PreparationItemRow
          key={r.id}
          remanente={r}
          row={form.rows[r.id] ?? initialRow(r)}
          kitchenAreas={kitchenAreas}
          warehouseAreas={warehouseAreas}
          onChange={(patch) => form.updateRow(r.id, patch)}
        />
      ))}
    </div>
    <ModalFooterActions onCancel={onCancel} confirmLabel="Cerrar Preparación" submittingLabel="Cerrando..." isSubmitting={isSubmitting} />
  </form>
);

export const ClosePreparationModal: React.FC<ClosePreparationModalProps> = ({
  preparationId,
  recipeName,
  onClose,
  onReconciled,
}) => {
  const { detail, kitchenAreas, warehouseAreas, loading, loadError } = useClosePreparationDetail(preparationId);
  const form = useCloseForm(detail);
  const warehouseIds = new Set(warehouseAreas.map((a) => a.id));
  const submit = useSubmitClose(preparationId, detail, form, warehouseIds, onReconciled, onClose);

  if (!preparationId) return null;

  return (
    <Modal size="xl">
      <ModalHeader icon={<ClipboardCheck className="text-primary-color" />} title={`Cerrar Preparación — ${recipeName}`} size="lg" onClose={onClose} />
      {loadError ? (
        <ErrorBanner message={loadError} />
      ) : loading || !detail ? (
        <p role="status" className="fs-sm text-secondary-color">Cargando preparación…</p>
      ) : (
        <ReconciliationForm
          detail={detail}
          form={form}
          kitchenAreas={kitchenAreas}
          warehouseAreas={warehouseAreas}
          submitError={submit.submitError}
          isSubmitting={submit.isSubmitting}
          onSubmit={submit.handleSubmit}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
};
