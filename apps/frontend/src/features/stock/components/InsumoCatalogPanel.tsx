import React, { useState, useEffect } from 'react';
import { Package, Truck, ChevronRight, ChevronDown } from 'lucide-react';
import { StockService, InsumoItem } from '../services/stock.service.js';
import { CreateInsumoModal } from './CreateInsumoModal.js';
import { RestockInsumoModal } from './RestockInsumoModal.js';
import { CatalogToolbar } from './CatalogToolbar.js';
import { InsumoCatalogGrid } from './InsumoCatalogGrid.js';
import { CatalogView, getCatalogView, setCatalogView } from '../catalogViewPreference.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import styles from './InsumoCatalogPanel.module.css';

interface InsumoCatalogHeaderProps {
  onCreateClick: () => void;
  canManage: boolean;
}

const InsumoCatalogHeader: React.FC<InsumoCatalogHeaderProps> = ({ onCreateClick, canManage }) => (
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

    {canManage && (
      <button type="button" onClick={onCreateClick} className="btn-touch btn-primary">
        + Nuevo Insumo
      </button>
    )}
  </div>
);

interface InsumoTableRowProps {
  item: InsumoItem;
  onRestock: (insumo: InsumoItem) => void;
  canManage: boolean;
}

const InsumoTableRow: React.FC<InsumoTableRowProps> = ({ item, onRestock, canManage }) => {
  const [expanded, setExpanded] = useState(false);
  const breakdown = item.stockByLocation ?? [];

  return (
    <>
      <tr>
        <td className="text-primary-color font-mono">{item.id}</td>
        <td className="fw-semibold">{item.name}</td>
        <td>
          <span className="neutral-badge">{item.unitOfMeasure}</span>
        </td>
        <td className="text-success-color fw-semibold">
          {breakdown.length > 0 && (
            <button
              type="button"
              className={styles['stock-disclosure']}
              aria-expanded={expanded}
              aria-controls={`stock-breakdown-${item.id}`}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          {item.warehouseStock} {item.unitOfMeasure}
        </td>
        <td className="text-right">
          {canManage && (
            <button
              type="button"
              onClick={() => onRestock(item)}
              className={`btn-touch btn-secondary flex-center flex-gap-xs ${styles['btn-table-action']}`}
            >
              <Truck size={16} />
              Reabastecer
            </button>
          )}
        </td>
      </tr>
      {expanded && breakdown.length > 0 && (
        <tr id={`stock-breakdown-${item.id}`}>
          <td colSpan={5}>
            <dl className={styles['stock-breakdown']}>
              {breakdown.map((s) => (
                <div key={s.storageLocationId} className={styles['stock-breakdown-row']}>
                  <dt>{s.storageLocationName}</dt>
                  <dd>
                    {s.quantity} {item.unitOfMeasure}
                  </dd>
                </div>
              ))}
            </dl>
          </td>
        </tr>
      )}
    </>
  );
};

interface InsumoTableProps {
  insumos: InsumoItem[];
  onRestock: (insumo: InsumoItem) => void;
  canManage: boolean;
}

const InsumoTable: React.FC<InsumoTableProps> = ({ insumos, onRestock, canManage }) => (
  <div className="table-wrapper">
    <table className="data-table">
      <thead>
        <tr>
          <th>ID Insumo</th>
          <th>Nombre Insumo</th>
          <th>Unidad Medida</th>
          <th>Stock en Bodega (total)</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {insumos.map((item) => (
          <InsumoTableRow key={item.id} item={item} onRestock={onRestock} canManage={canManage} />
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
  canManage: boolean;
  view: CatalogView;
}

const InsumoCatalogBody: React.FC<InsumoCatalogBodyProps> = ({ error, loading, filteredInsumos, onRestock, canManage, view }) => (
  <>
    {error && <ErrorBanner message={error} />}

    {loading ? (
      <div className="text-secondary-color text-center p-5">Cargando inventario de bodega...</div>
    ) : filteredInsumos.length === 0 ? (
      <div className="card-dashboard text-center text-secondary-color p-6">
        No se encontraron insumos registrados en bodega.
      </div>
    ) : view === 'grid' ? (
      <InsumoCatalogGrid insumos={filteredInsumos} onRestock={onRestock} canManage={canManage} />
    ) : (
      <InsumoTable insumos={filteredInsumos} onRestock={onRestock} canManage={canManage} />
    )}
  </>
);

/** TK-116-FE (US-031): alternador grid/lista del catálogo, persistido por dispositivo. */
function useCatalogViewState() {
  const [view, setView] = useState<CatalogView>(() => getCatalogView());

  const handleViewChange = (next: CatalogView) => {
    setView(next);
    setCatalogView(next);
  };

  return { view, handleViewChange };
}

/**
 * @param canManage `true` sólo para ADMIN — muestra "+ Nuevo Insumo" y "Reabastecer"
 * (endpoints `POST /insumos` y `PATCH /insumos/:id/restock`, ambos `requireRole('ADMIN')`
 * en backend). Default `false`: montado en `/estaciones` (ruta de operario) sólo lista.
 */
export const InsumoCatalogPanel: React.FC<{ canManage?: boolean }> = ({ canManage = false }) => {
  const [insumos, setInsumos] = useState<InsumoItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restockTarget, setRestockTarget] = useState<InsumoItem | null>(null);
  const { view, handleViewChange } = useCatalogViewState();

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
      <InsumoCatalogHeader onCreateClick={() => setIsModalOpen(true)} canManage={canManage} />

      <CatalogToolbar search={search} onSearchChange={setSearch} view={view} onViewChange={handleViewChange} />

      <InsumoCatalogBody
        error={error}
        loading={loading}
        filteredInsumos={filteredInsumos}
        onRestock={setRestockTarget}
        canManage={canManage}
        view={view}
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
