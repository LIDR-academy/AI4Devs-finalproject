import React, { useState, useEffect } from 'react';
import { Package, Search, Truck } from 'lucide-react';
import { StockService, InsumoItem } from '../services/stock.service.js';
import { CreateInsumoModal } from './CreateInsumoModal.js';
import { RestockInsumoModal } from './RestockInsumoModal.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import styles from './InsumoCatalogPanel.module.css';

interface InsumoCatalogHeaderProps {
  onCreateClick: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const InsumoCatalogHeader: React.FC<InsumoCatalogHeaderProps> = ({ onCreateClick, search, onSearchChange }) => (
  <>
    <div className="flex-between flex-wrap mb-6 gap-4">
      <div className="flex-gap-xs">
        <Package size={22} className="text-primary-color flex-shrink-0" />
        <div>
          <h1 className="m-0 fs-lg fw-bold">Inventario y Catálogo de Bodega</h1>
          <p className="text-secondary-color mt-1 fs-sm">
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
        className="input-touch input-with-icon w-full fs-md"
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
    <td className="text-primary-color font-mono">{item.id}</td>
    <td className="fw-semibold">{item.name}</td>
    <td>
      <span className="neutral-badge">
        {item.unitOfMeasure}
      </span>
    </td>
    <td className="text-success-color fw-semibold">
      {item.warehouseStock} {item.unitOfMeasure}
    </td>
    <td className="text-right">
      <button
        type="button"
        onClick={() => onRestock(item)}
        className={`btn-touch btn-secondary flex-center flex-gap-xs ${styles['btn-table-action']}`}
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
      <div className="text-secondary-color text-center p-5">Cargando inventario de bodega...</div>
    ) : filteredInsumos.length === 0 ? (
      <div className="card-dashboard text-center text-secondary-color p-6">
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
    <div className={styles['insumo-catalog-panel']}>
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
