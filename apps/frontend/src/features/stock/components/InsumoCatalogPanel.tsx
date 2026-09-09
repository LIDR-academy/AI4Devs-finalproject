import React, { useState, useEffect } from 'react';
import { Package, ChevronRight, ChevronDown } from 'lucide-react';
import { StockService, InsumoItem } from '../services/stock.service.js';
import { CreateInsumoModal } from './CreateInsumoModal.js';
import { RestockInsumoModal } from './RestockInsumoModal.js';
import { EditInsumoModal } from './EditInsumoModal.js';
import { InsumoManageActions } from './InsumoManageActions.js';
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
        <p className="text-secondary-color mt-1 fs-sm measure">
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
  onEdit: (insumo: InsumoItem) => void;
  canManage: boolean;
}

const InsumoTableRow: React.FC<InsumoTableRowProps> = ({ item, onRestock, onEdit, canManage }) => {
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
          {canManage && <InsumoManageActions item={item} onRestock={onRestock} onEdit={onEdit} />}
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
  onEdit: (insumo: InsumoItem) => void;
  canManage: boolean;
}

const InsumoTable: React.FC<InsumoTableProps> = ({ insumos, onRestock, onEdit, canManage }) => (
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
          <InsumoTableRow key={item.id} item={item} onRestock={onRestock} onEdit={onEdit} canManage={canManage} />
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
  onEdit: (insumo: InsumoItem) => void;
  canManage: boolean;
  view: CatalogView;
}

const InsumoCatalogBody: React.FC<InsumoCatalogBodyProps> = ({ error, loading, filteredInsumos, onRestock, onEdit, canManage, view }) => (
  <>
    {error && <ErrorBanner message={error} />}

    {loading ? (
      <div className="text-secondary-color text-center p-5">Cargando inventario de bodega...</div>
    ) : filteredInsumos.length === 0 ? (
      <div className="card-dashboard text-center text-secondary-color p-6">
        No se encontraron insumos registrados en bodega.
      </div>
    ) : view === 'grid' ? (
      <InsumoCatalogGrid insumos={filteredInsumos} onRestock={onRestock} onEdit={onEdit} canManage={canManage} />
    ) : (
      <InsumoTable insumos={filteredInsumos} onRestock={onRestock} onEdit={onEdit} canManage={canManage} />
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

function useInsumoCatalog() {
  const [insumos, setInsumos] = useState<InsumoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsumos = async () => {
    setLoading(true);
    setError(null);
    try {
      setInsumos(await StockService.getInsumos());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar la lista de insumos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  return { insumos, loading, error, fetchInsumos };
}

/**
 * @param canManage `true` sólo para ADMIN — muestra "+ Nuevo Insumo", "Editar" y
 * "Reabastecer" (endpoints `POST/PUT /insumos` y `PATCH /insumos/:id/restock`, todos
 * `requireRole('ADMIN')`). Default `false`: montado en `/estaciones` sólo lista.
 */
export const InsumoCatalogPanel: React.FC<{ canManage?: boolean }> = ({ canManage = false }) => {
  const { insumos, loading, error, fetchInsumos } = useInsumoCatalog();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restockTarget, setRestockTarget] = useState<InsumoItem | null>(null);
  const [editTarget, setEditTarget] = useState<InsumoItem | null>(null);
  const { view, handleViewChange } = useCatalogViewState();

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
        onEdit={setEditTarget}
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

      <EditInsumoModal
        isOpen={editTarget !== null}
        insumo={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={fetchInsumos}
      />
    </div>
  );
};
