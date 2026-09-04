import React, { useEffect, useState } from 'react';
import { fetchActiveWarehouseSectors, StorageLocationDto } from '../services/locations.service.js';

interface StorageSectorSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (storageLocationId: string) => void;
  /** Texto auxiliar bajo el selector (ej. saldo disponible en el sector elegido). */
  hint?: string;
}

/**
 * US-025 / US-016: selector obligatorio de sub-sector de bodega (`type = WAREHOUSE`,
 * activos), poblado dinámicamente desde `GET /api/v1/locations`. Sin literales
 * hardcodeados. Compartido por el alta de insumo, el reabastecimiento y la
 * extracción (sector de origen).
 */
export const StorageSectorSelect: React.FC<StorageSectorSelectProps> = ({ id, label, value, onChange, hint }) => {
  const [sectors, setSectors] = useState<StorageLocationDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchActiveWarehouseSectors()
      .then((items) => {
        if (cancelled) return;
        setSectors(items);
        if (!value && items.length > 0) onChange(items[0].id);
      })
      .catch(() => {
        if (!cancelled) setSectors([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <select id={id} className="input-touch w-full" value={value} onChange={(e) => onChange(e.target.value)} required>
        <option value="" disabled>
          — Seleccionar sector —
        </option>
        {sectors.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      {hint && <p className="text-secondary-color fs-sm mt-1">{hint}</p>}
    </div>
  );
};
