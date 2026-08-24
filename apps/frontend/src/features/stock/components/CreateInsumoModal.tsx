import React, { useState } from 'react';
import { StockService, CreateInsumoDTO } from '../services/stock.service.js';

interface CreateInsumoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateInsumoModal: React.FC<CreateInsumoModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState<'KG' | 'L' | 'UNITS'>('KG');
  const [initialWarehouseStock, setInitialWarehouseStock] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del insumo es obligatorio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: CreateInsumoDTO = {
        name: name.trim(),
        unitOfMeasure,
        initialWarehouseStock: initialWarehouseStock || '0',
      };
      await StockService.createInsumo(payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrio un error al registrar el insumo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: '#1E293B',
          color: '#F8FAFC',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 600 }}>
          📦 Registrar Nuevo Insumo
        </h2>

        {error && (
          <div
            style={{
              backgroundColor: '#7F1D1D',
              color: '#FEE2E2',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="insumo-name-input" style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#94A3B8' }}>
              Nombre del Insumo *
            </label>
            <input
              id="insumo-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Queso Parmesano"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #334155',
                backgroundColor: '#0F172A',
                color: '#F8FAFC',
                fontSize: '1rem',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#94A3B8' }}>
              Unidad de Medida *
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['KG', 'L', 'UNITS'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setUnitOfMeasure(unit)}
                  style={{
                    flex: 1,
                    minHeight: '48px',
                    borderRadius: '8px',
                    border: unitOfMeasure === unit ? '2px solid var(--color-primary)' : '1px solid #334155',
                    backgroundColor: unitOfMeasure === unit ? 'var(--color-primary)' : '#0F172A',
                    color: '#F8FAFC',
                    fontWeight: unitOfMeasure === unit ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="initial-stock-input" style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#94A3B8' }}>
              Stock Inicial en Bodega
            </label>
            <input
              id="initial-stock-input"
              type="number"
              step="0.001"
              min="0"
              value={initialWarehouseStock}
              onChange={(e) => setInitialWarehouseStock(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #334155',
                backgroundColor: '#0F172A',
                color: '#F8FAFC',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-touch btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-touch btn-primary"
            >
              {loading ? 'Guardando...' : 'Guardar Insumo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
