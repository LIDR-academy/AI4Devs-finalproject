import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { KitchenService, RemanenteFEFOItem } from '../services/kitchen.service.js';
import { formatQuantity, formatUnitLabel } from '../../../utils/formatters.js';

interface DiscardModalProps {
  remanente: RemanenteFEFOItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DiscardModal: React.FC<DiscardModalProps> = ({ remanente, onClose, onSuccess }) => {
  const [reason, setReason] = useState('EXPIRATION');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!remanente) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await KitchenService.discardRemanente(remanente.id, reason);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('[DiscardModal] Error registrando el descarte:', err);
      alert('Error registrando el descarte');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '450px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle /> Registrar Descarte de Merma
          </h2>
          <button
            onClick={onClose}
            className="btn-touch btn-secondary"
            style={{ width: '40px', height: '40px', padding: 0 }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.95rem' }}>
          Se dará de baja el insumo <strong>{remanente.insumoName}</strong> ({formatQuantity(remanente.currentQuantity, remanente.unitOfMeasure)} {formatUnitLabel(remanente.unitOfMeasure)}) del inventario activo.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Motivo del Descarte / Merma:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-touch"
              id="select-discard-reason"
            >
              <option value="EXPIRATION">Producto Vencido (EXPIRATION)</option>
              <option value="DAMAGED">Insumo Deteriorado / Caído (DAMAGED)</option>
              <option value="QUALITY_FAIL">Fallo en Control de Calidad (QUALITY_FAIL)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-touch btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-touch btn-danger"
              disabled={isSubmitting}
              style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              id="btn-confirm-discard"
            >
              <Trash2 size={18} />
              {isSubmitting ? 'Procesando...' : 'Confirmar Merma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
