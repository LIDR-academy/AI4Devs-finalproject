import React, { useState } from 'react';
import { PackagePlus } from 'lucide-react';
import { CatalogService, UnitOfMeasure } from '../services/catalog.service.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';

interface CreateInsumoFormProps {
  onCreated: (message: string) => void;
}

function useCreateInsumoForm(onCreated: (message: string) => void) {
  const [name, setName] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState<UnitOfMeasure>('KG');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await CatalogService.createInsumo({ name, unitOfMeasure });
      onCreated(`Insumo "${created.name}" creado con stock inicial ${created.warehouseStock} ${created.unitOfMeasure}.`);
      setName('');
      setUnitOfMeasure('KG');
    } catch (err) {
      // No se cae en un fallback de éxito silencioso — un alta de insumo fallida
      // debe verse como error real, nunca como si el insumo se hubiera creado.
      setError(err instanceof Error ? err.message : 'Error creando el insumo.');
    }
    setIsSubmitting(false);
  };

  return { name, setName, unitOfMeasure, setUnitOfMeasure, error, isSubmitting, handleSubmit };
}

export const CreateInsumoForm: React.FC<CreateInsumoFormProps> = ({ onCreated }) => {
  const form = useCreateInsumoForm(onCreated);

  return (
    <form onSubmit={form.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {form.error && <ErrorBanner message={form.error} />}

      <div>
        <label htmlFor="input-new-insumo-name" className="form-label">
          Nombre del Insumo:
        </label>
        <input
          type="text"
          id="input-new-insumo-name"
          className="input-touch"
          value={form.name}
          onChange={(e) => form.setName(e.target.value)}
          required
          minLength={2}
        />
      </div>

      <div>
        <label htmlFor="select-new-insumo-unit" className="form-label">
          Unidad de Medida:
        </label>
        <select
          id="select-new-insumo-unit"
          className="input-touch"
          value={form.unitOfMeasure}
          onChange={(e) => form.setUnitOfMeasure(e.target.value as UnitOfMeasure)}
        >
          <option value="KG">Kilogramos (KG)</option>
          <option value="L">Litros (L)</option>
          <option value="UNITS">Unidades (UNITS)</option>
        </select>
      </div>

      <button
        type="submit"
        className="btn-touch btn-primary"
        disabled={form.isSubmitting}
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '4px' }}
      >
        <PackagePlus size={18} />
        {form.isSubmitting ? 'Creando...' : 'Crear Insumo'}
      </button>
    </form>
  );
};
