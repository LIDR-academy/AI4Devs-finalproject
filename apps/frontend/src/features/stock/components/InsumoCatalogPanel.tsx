import React, { useState, useEffect } from 'react';
import { Package, Search, Truck } from 'lucide-react';
import { StockService, InsumoItem } from '../services/stock.service.js';
import { CreateInsumoModal } from './CreateInsumoModal.js';
import { RestockInsumoModal } from './RestockInsumoModal.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';

interface InsumoCatalogHeaderProps {
  onCreateClick: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const InsumoCatalogHeader: React.FC<InsumoCatalogHeaderProps> = ({ onCreateClick, search, onSearchChange }) => (
  <>
    <div className="flex-between flex-wrap" style={{ marginBottom: '24px', gap: '16px' }}>
      <div className="flex-gap-xs">
        <Package size={22} className="text-primary-color" style={{ flexShrink: 0 }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Inventario y Catálogo de Bodega</h1>
          <p className="text-secondary-color" style={{ margin: '4px 0 0 0', fontSize: '0.875rem' }}>
            Gestiona el catálogo maestro de ingredientes y su disponibilidad en bodega principal.
          </p>
        </div>
      </div>

      <button type="button" onClick={onCreateClick} className="btn-touch btn-primary">
        + Nuevo Insumo
      </button>
    </div>

    <div className="search-input-wrapper">
      <Search size={18} className="search-icon-left" />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar insumo por nombre..."
        className="input-touch input-with-icon w-full"
        style={{ fontSize: '0.95rem' }}
      />
    </div>
  </>
);

interface InsumoTableRowProps {
  item: InsumoItem;
  onRestock: (insumo: InsumoItem) => void;
}

const InsumoTableRow: React.FC<InsumoTableRowProps> = ({ item, onRestock }) => (
  <tr>
    <td className="text-primary-color" style={{ fontFamily: 'monospace' }}>{item.id}</td>
    <td style={{ fontWeight: 600 }}>{item.name}</td>
    <td>
      <span
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: 'var(--border-card)',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      >
        {item.unitOfMeasure}
      </span>
    </td>
    <td className="text-success-color" style={{ fontWeight: 600 }}>
      {item.warehouseStock} {item.unitOfMeasure}
    </td>
    <td style={{ textAlign: 'right' }}>
      <button
        type="button"
        onClick={() => onRestock(item)}
        className="btn-touch btn-secondary flex-center flex-gap-xs"
        style={{ minHeight: '36px', padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex' }}
      >
        <Truck size={16} />
        Reabastecer
      </button>
    </td>
  </tr>
);

interface InsumoTableProps {
  insumos: InsumoItem[];
  onRestock: (insumo: InsumoItem) => void;
}

const InsumoTable: React.FC<InsumoTableProps> = ({ insumos, onRestock }) => (
  <div className="table-wrapper">
    <table className="data-table">
      <thead>
        <tr>
          <th>ID Insumo</th>
          <th>Nombre Insumo</th>
          <th>Unidad Medida</th>
          <th>Stock en Bodega Principal</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {insumos.map((item) => (
          <InsumoTableRow key={item.id} item={item} onRestock={onRestock} />
        ))}
      </tbody>
    </table>
  </div>
);

interface InsumoCatalogBodyProps {
  error: string | null;
  loading: boolean;
  filteredInsumos: InsumoItem[];
  onRestock: (insumo: InsumoItem) => void;
}

const InsumoCatalogBody: React.FC<InsumoCatalogBodyProps> = ({ error, loading, filteredInsumos, onRestock }) => (
  <>
    {error && <ErrorBanner message={error} />}

    {loading ? (
      <div className="text-secondary-color text-center" style={{ padding: '32px 0' }}>Cargando inventario de bodega...</div>
    ) : filteredInsumos.length === 0 ? (
      <div className="card-dashboard text-center text-secondary-color" style={{ padding: '40px' }}>
        No se encontraron insumos registrados en bodega.
      </div>
    ) : (
      <InsumoTable insumos={filteredInsumos} onRestock={onRestock} />
    )}
  </>
);

export const InsumoCatalogPanel: React.FC = () => {
  const [insumos, setInsumos] = useState<InsumoItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restockTarget, setRestockTarget] = useState<InsumoItem | null>(null);

  const fetchInsumos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await StockService.getInsumos();
      setInsumos(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al cargar la lista de insumos.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  const filteredInsumos = insumos.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="insumo-catalog-panel" style={{ padding: '24px', color: 'var(--text-primary)' }}>
      <InsumoCatalogHeader onCreateClick={() => setIsModalOpen(true)} search={search} onSearchChange={setSearch} />

      <InsumoCatalogBody
        error={error}
        loading={loading}
        filteredInsumos={filteredInsumos}
        onRestock={setRestockTarget}
      />

      <CreateInsumoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchInsumos} />

      <RestockInsumoModal
        isOpen={restockTarget !== null}
        insumo={restockTarget}
        onClose={() => setRestockTarget(null)}
        onSuccess={fetchInsumos}
      />
    </div>
  );
};
