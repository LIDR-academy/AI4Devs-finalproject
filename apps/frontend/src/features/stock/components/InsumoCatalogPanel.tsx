import React, { useState, useEffect } from 'react';
import { StockService, InsumoItem } from '../services/stock.service.js';
import { CreateInsumoModal } from './CreateInsumoModal.js';
import { RestockInsumoModal } from './RestockInsumoModal.js';

interface InsumoCatalogHeaderProps {
  onCreateClick: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const InsumoCatalogHeader: React.FC<InsumoCatalogHeaderProps> = ({ onCreateClick, search, onSearchChange }) => (
  <>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>📦 Inventario y Catálogo de Bodega</h1>
        <p style={{ margin: '4px 0 0 0', color: '#94A3B8', fontSize: '0.875rem' }}>
          Gestiona el catálogo maestro de ingredientes y su disponibilidad en bodega principal.
        </p>
      </div>

      <button onClick={onCreateClick} className="btn-touch btn-primary">
        + Nuevo Insumo
      </button>
    </div>

    <div style={{ marginBottom: '20px' }}>
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="🔍 Buscar insumo por nombre..."
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #334155',
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          fontSize: '0.95rem',
        }}
      />
    </div>
  </>
);

interface InsumoTableRowProps {
  item: InsumoItem;
  onRestock: (insumo: InsumoItem) => void;
}

const InsumoTableRow: React.FC<InsumoTableRowProps> = ({ item, onRestock }) => (
  <tr style={{ borderBottom: '1px solid #334155' }}>
    <td style={{ padding: '16px', fontFamily: 'monospace', color: 'var(--color-primary)' }}>{item.id}</td>
    <td style={{ padding: '16px', fontWeight: 600 }}>{item.name}</td>
    <td style={{ padding: '16px' }}>
      <span
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: '#334155',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      >
        {item.unitOfMeasure}
      </span>
    </td>
    <td style={{ padding: '16px', fontWeight: 600, color: '#34D399' }}>
      {item.warehouseStock} {item.unitOfMeasure}
    </td>
    <td style={{ padding: '16px', textAlign: 'right' }}>
      <button
        onClick={() => onRestock(item)}
        className="btn-touch btn-secondary"
        style={{ minHeight: '36px', padding: '6px 12px', fontSize: '0.8rem' }}
      >
        🚚 Reabastecer
      </button>
    </td>
  </tr>
);

interface InsumoTableProps {
  insumos: InsumoItem[];
  onRestock: (insumo: InsumoItem) => void;
}

const InsumoTable: React.FC<InsumoTableProps> = ({ insumos, onRestock }) => (
  <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #334155' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#1E293B' }}>
      <thead>
        <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8' }}>
          <th style={{ padding: '16px' }}>ID Insumo</th>
          <th style={{ padding: '16px' }}>Nombre Insumo</th>
          <th style={{ padding: '16px' }}>Unidad Medida</th>
          <th style={{ padding: '16px' }}>Stock en Bodega Principal</th>
          <th style={{ padding: '16px' }}></th>
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
    {error && (
      <div
        style={{
          backgroundColor: '#7F1D1D',
          color: '#FEE2E2',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        {error}
      </div>
    )}

    {loading ? (
      <div style={{ color: '#94A3B8', padding: '32px 0', textAlign: 'center' }}>Cargando inventario de bodega...</div>
    ) : filteredInsumos.length === 0 ? (
      <div
        style={{
          backgroundColor: '#1E293B',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: '#94A3B8',
        }}
      >
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
    <div className="insumo-catalog-panel" style={{ padding: '24px', color: '#F8FAFC' }}>
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
