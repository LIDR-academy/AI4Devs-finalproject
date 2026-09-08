import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ClipboardList, Plus, Power, Edit2, Save, X } from 'lucide-react';
import { PanelHeader } from '../../../shared/components/PanelHeader.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { mapToUserFriendlyError } from '../../../shared/utils/errorMessageMapper.js';
import { ConsumptionReasonsService, ConsumptionReasonDto } from '../services/consumptionReasons.service.js';
import styles from './ConsumptionReasonsManagementPanel.module.css';

interface NewReasonFormProps {
  onCreated: () => Promise<void>;
  setError: (msg: string | null) => void;
}

const NewReasonForm: React.FC<NewReasonFormProps> = ({ onCreated, setError }) => {
  const [label, setLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await ConsumptionReasonsService.create(label.trim());
      setLabel('');
      await onCreated();
    } catch (err) {
      setError(mapToUserFriendlyError(err).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`card-dashboard metrics-grid flex-gap-xs ${styles['new-reason-form']}`}>
      <div>
        <label htmlFor="new-reason-label" className="form-label">
          Nuevo Motivo
        </label>
        <input
          id="new-reason-label"
          type="text"
          required
          placeholder="Ej. Ajuste de porción"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="input-touch w-full"
        />
      </div>
      <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="btn-touch btn-primary">
        <Plus size={20} /> {isSubmitting ? 'Guardando...' : 'Crear'}
      </button>
    </form>
  );
};

interface ReasonRowProps {
  reason: ConsumptionReasonDto;
  onToggleActive: (reason: ConsumptionReasonDto) => void;
  onRename: (id: string, label: string) => Promise<void>;
}

const EditReasonInlineForm: React.FC<{
  reason: ConsumptionReasonDto;
  onSave: (id: string, label: string) => Promise<void>;
  onCancel: () => void;
}> = ({ reason, onSave, onCancel }) => {
  const [label, setLabel] = useState(reason.label);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (!label.trim()) return;
    setIsSaving(true);
    setFormError(null);
    try {
      await onSave(reason.id, label.trim());
      onCancel();
    } catch (err) {
      setFormError(mapToUserFriendlyError(err).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-column flex-gap-xs">
      {formError && <ErrorBanner message={formError} />}
      <div className={`metrics-grid ${styles['reason-edit-grid']}`}>
        <input
          ref={inputRef}
          type="text"
          aria-label={`Editar etiqueta de "${reason.label}"`}
          className="input-touch w-full input-touch-compact"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <button type="button" className={`btn-touch btn-secondary ${styles['btn-compact-icon-sm']}`} onClick={onCancel} title="Cancelar">
          <X size={16} />
        </button>
        <button type="button" className={`btn-touch btn-primary ${styles['btn-compact-icon-sm']}`} onClick={handleSave} disabled={isSaving} title="Guardar">
          <Save size={16} />
        </button>
      </div>
    </div>
  );
};

const ReasonRow: React.FC<ReasonRowProps> = ({ reason, onToggleActive, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className={`${styles['reason-row']}${reason.isActive ? '' : ` ${styles['reason-row--inactive']}`}`}>
        <EditReasonInlineForm reason={reason} onSave={onRename} onCancel={() => setIsEditing(false)} />
      </div>
    );
  }

  return (
    <div className={`flex-between ${styles['reason-row']}${reason.isActive ? '' : ` ${styles['reason-row--inactive']}`}`}>
      <div className="flex-gap-xs">
        <ClipboardList size={18} className={reason.isActive ? 'text-primary-color' : 'text-secondary-color'} />
        <span className="text-primary-color fw-bold fs-md">
          {reason.label} {!reason.isActive && '(Inactivo)'}
        </span>
      </div>
      <div className="flex-gap-xs">
        <button type="button" className={`btn-touch btn-secondary ${styles['btn-compact-icon-sm']}`} onClick={() => setIsEditing(true)} title="Editar Motivo">
          <Edit2 size={16} />
        </button>
        <button
          type="button"
          className={`btn-touch ${styles['btn-compact-icon-sm']} ${reason.isActive ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => onToggleActive(reason)}
          title={reason.isActive ? 'Desactivar Motivo' : 'Activar Motivo'}
        >
          <Power size={16} />
        </button>
      </div>
    </div>
  );
};

function useConsumptionReasonsManager() {
  const [reasons, setReasons] = useState<ConsumptionReasonDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Panel ADMIN-only (US-030 Escenario 4): trae también los inactivos para
  // poder reactivarlos — a diferencia del selector de motivo en consumo
  // (TK-108-FE), que solo pide los activos.
  const load = useCallback(async () => {
    try {
      setReasons(await ConsumptionReasonsService.list(true));
    } catch (err) {
      setError(mapToUserFriendlyError(err).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (reason: ConsumptionReasonDto) => {
    setError(null);
    try {
      await ConsumptionReasonsService.update(reason.id, { isActive: !reason.isActive });
      await load();
    } catch (err) {
      setError(mapToUserFriendlyError(err).message);
    }
  };

  const rename = async (id: string, label: string) => {
    await ConsumptionReasonsService.update(id, { label });
    await load();
  };

  return { reasons, error, setError, load, toggleActive, rename };
}

/**
 * Sección "Motivos" de `/ajustes/motivos` (US-030 / ADR-004) — inline, mismo
 * patrón que `RolesManagementPanel` (US-015). Desactivar, nunca borrar:
 * sin botón de eliminar (ADR-004 §3.1) — un motivo desactivado se preserva
 * para no invalidar las referencias históricas de `StockMovement.reasonId`.
 */
export const ConsumptionReasonsManagementPanel: React.FC = () => {
  const m = useConsumptionReasonsManager();

  return (
    <>
      <PanelHeader icon={<ClipboardList className="text-primary-color" />} title="Catálogo de Motivos de Consumo" />
      <div className="flex-column flex-gap-md mt-4">
        {m.error && <ErrorBanner message={m.error} />}
        <NewReasonForm onCreated={m.load} setError={m.setError} />

        <div>
          <h4 className="text-secondary-color fs-md fw-bold mb-3">Motivos Registrados ({m.reasons.length})</h4>
          <div className={`flex-column flex-gap-xs ${styles['reasons-list-scroll']}`}>
            {m.reasons.map((reason) => (
              <ReasonRow key={reason.id} reason={reason} onToggleActive={m.toggleActive} onRename={m.rename} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
