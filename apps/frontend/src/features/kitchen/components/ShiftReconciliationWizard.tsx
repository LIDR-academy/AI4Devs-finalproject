import React, { useState } from 'react';
import { ClipboardCheck, AlertOctagon, CheckSquare, X, Plus, Minus } from 'lucide-react';
import { RemanenteFEFOItem } from '../services/kitchen.service.js';
import { ReconciliationService } from '../services/reconciliation.service.js';
import { formatQuantity, formatUnitLabel } from '../../../utils/formatters.js';

interface ShiftReconciliationWizardProps {
  isOpen: boolean;
  remanentes: RemanenteFEFOItem[];
  operatorId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ShiftReconciliationWizard: React.FC<ShiftReconciliationWizardProps> = ({
  isOpen,
  remanentes,
  operatorId,
  onClose,
  onSuccess,
}) => {
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

  if (!isOpen) return null;

  const handleQuantityChange = (id: string, newQty: number) => {
    setCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.round(newQty * 10000) / 10000),
    }));
  };

  // Calcular si existe alguna varianza > 50%
  let hasCriticalVariance = false;
  remanentes.forEach((r) => {
    const theo = parseFloat(r.currentQuantity);
    const phys = counts[r.id] ?? theo;
    if (theo > 0) {
      const devRatio = Math.abs(phys - theo) / theo;
      if (devRatio > 0.5) {
        hasCriticalVariance = true;
      }
    }
  });

  const canSubmit = !hasCriticalVariance || isCriticalAuthChecked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const itemsPayload = Object.entries(counts).map(([remanenteId, physicalQuantity]) => ({
        remanenteId,
        physicalQuantity,
      }));

      await ReconciliationService.submitReconciliation({
        operatorId,
        notes,
        items: itemsPayload,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('[ShiftReconciliationWizard] Error durante la conciliacion de turno:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '720px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardCheck style={{ color: 'var(--color-primary)' }} /> Cierre de Turno y Conciliación de Stock
          </h2>
          <button className="btn-icon" onClick={onClose} id="btn-close-reconciliation">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Ingresa las cantidades reales medidas en cocina. Los insumos expirados serán descartados automáticamente.
          </p>

          <div style={{ maxHeight: '340px', overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {remanentes.map((r) => {
              const theo = parseFloat(r.currentQuantity);
              const phys = counts[r.id] ?? theo;
              const diff = phys - theo;
              const devRatio = theo > 0 ? Math.abs(diff) / theo : 0;
              const isItemCritical = devRatio > 0.5;

              return (
                <div
                  key={r.id}
                  style={{
                    backgroundColor: isItemCritical ? 'rgba(255, 42, 42, 0.08)' : 'var(--bg-card)',
                    border: `1px solid ${isItemCritical ? 'var(--color-danger)' : 'var(--border-card)'}`,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{r.insumoName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Teórico: {formatQuantity(r.currentQuantity, r.unitOfMeasure)} {formatUnitLabel(r.unitOfMeasure)} | Expira en {r.hoursRemaining}h
                    </div>
                    {diff !== 0 && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: diff < 0 ? 'var(--color-danger)' : 'var(--color-primary)',
                          marginTop: '2px',
                        }}
                      >
                        Varianza: {diff > 0 ? `+${formatQuantity(diff, r.unitOfMeasure)}` : formatQuantity(diff, r.unitOfMeasure)} {formatUnitLabel(r.unitOfMeasure)}
                        {isItemCritical && ' ⚠️ (>50% de desvío)'}
                      </div>
                    )}
                  </div>

                  {/* Controles Táctiles Numericos ergonomicos */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-touch btn-secondary"
                      style={{ minWidth: '40px', minHeight: '40px', padding: '0' }}
                      onClick={() => handleQuantityChange(r.id, phys - 0.1)}
                    >
                      <Minus size={18} />
                    </button>

                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={phys}
                      onChange={(e) => handleQuantityChange(r.id, parseFloat(e.target.value) || 0)}
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
                      id={`input-phys-${r.id}`}
                    />

                    <button
                      type="button"
                      className="btn-touch btn-secondary"
                      style={{ minWidth: '40px', minHeight: '40px', padding: '0' }}
                      onClick={() => handleQuantityChange(r.id, phys + 0.1)}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Banner de Alerta Crítica por Varianza > 50% */}
          {hasCriticalVariance && (
            <div
              style={{
                backgroundColor: 'rgba(255, 42, 42, 0.12)',
                border: '1px solid var(--color-danger)',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-danger)', fontWeight: 700, marginBottom: '6px' }}>
                <AlertOctagon size={22} />
                ¡Alerta de Varianza Crítica Mayor al 50%!
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
                Se detectó una desviación significativa entre el inventario físico y el teórico. Debe autorizar la diferencia para enviar el cierre.
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isCriticalAuthChecked}
                  onChange={(e) => setIsCriticalAuthChecked(e.target.checked)}
                  id="chk-authorize-critical"
                />
                Autorizar diferencia crítica (&gt;50%)
              </label>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
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
            <button type="button" className="btn-touch btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-touch btn-primary"
              disabled={!canSubmit || isSubmitting}
              id="btn-submit-reconciliation"
            >
              <CheckSquare size={18} />
              {isSubmitting ? 'Guardando...' : 'Enviar Conciliación de Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
