import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { StockService, CreateInsumoDTO } from '../services/stock.service.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';

interface CreateInsumoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface InsumoModalFormProps {
  name: string;
  setName: (v: string) => void;
  unitOfMeasure: 'KG' | 'L' | 'UNITS';
  setUnitOfMeasure: (v: 'KG' | 'L' | 'UNITS') => void;
  initialWarehouseStock: string;
  setInitialWarehouseStock: (v: string) => void;
  loading: boolean;
  onClose: () => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const InsumoModalForm: React.FC<InsumoModalFormProps> = ({
  name,
  setName,
  unitOfMeasure,
  setUnitOfMeasure,
  initialWarehouseStock,
  setInitialWarehouseStock,
  loading,
  onClose,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="insumo-name-input" className="form-label">
          Nombre del Insumo *
        </label>
        <input
          id="insumo-name-input"
          type="text"
          className="input-touch w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Queso Parmesano"
          required
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <span className="form-label">
          Unidad de Medida *
        </span>
        <div className="flex-gap-xs">
          {(['KG', 'L', 'UNITS'] as const).map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => setUnitOfMeasure(unit)}
              className="flex-1 btn-touch"
              style={{
                border: unitOfMeasure === unit ? '2px solid var(--color-primary)' : '1px solid var(--border-card)',
                backgroundColor: unitOfMeasure === unit ? 'var(--color-primary)' : 'var(--bg-root)',
                color: unitOfMeasure === unit ? 'var(--color-primary-on)' : 'var(--text-primary)',
                fontWeight: unitOfMeasure === unit ? 600 : 400,
              }}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="initial-stock-input" className="form-label">
          Stock Inicial en Bodega
        </label>
        <input
          id="initial-stock-input"
          type="number"
          step="0.001"
          min="0"
          className="input-touch w-full"
          value={initialWarehouseStock}
          onChange={(e) => setInitialWarehouseStock(e.target.value)}
        />
      </div>

      <div className="modal-footer-actions" style={{ justifyContent: 'flex-end', marginTop: 0 }}>
        <button type="button" onClick={onClose} disabled={loading} className="btn-touch btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="btn-touch btn-primary">
          {loading ? 'Guardando...' : 'Guardar Insumo'}
        </button>
      </div>
    </form>
  );
};

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
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '480px' }}>
        <h2 className="flex-gap-xs mb-2" style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 600 }}>
          <Package size={20} className="text-primary-color" />
          Registrar Nuevo Insumo
        </h2>

        {error && <ErrorBanner message={error} />}

        <InsumoModalForm
          name={name}
          setName={setName}
          unitOfMeasure={unitOfMeasure}
          setUnitOfMeasure={setUnitOfMeasure}
          initialWarehouseStock={initialWarehouseStock}
          setInitialWarehouseStock={setInitialWarehouseStock}
          loading={loading}
          onClose={onClose}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
