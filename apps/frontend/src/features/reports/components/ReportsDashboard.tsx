import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Trash2, PieChart, RefreshCw, X } from 'lucide-react';
import { ReportsService, WasteSummaryItem } from '../services/reports.service.js';
import { Modal } from '../../../shared/components/Modal.js';
import { AccessDeniedState } from '../../../shared/components/AccessDeniedState.js';

interface ReportsDashboardProps {
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
}

type FilterRange = 'today' | 'week' | 'month';

interface ReportsFilterBarProps {
  filterRange: FilterRange;
  onFilterChange: (range: FilterRange) => void;
  onClose: () => void;
}

const FILTER_OPTIONS: Array<{ value: FilterRange; label: string }> = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: '7 Días' },
  { value: 'month', label: 'Mes' },
];

const ReportsFilterBar: React.FC<ReportsFilterBarProps> = ({ filterRange, onFilterChange, onClose }) => (
  <div className="flex-gap-xs">
    <div className="flex-gap-xs filter-toggle-group">
      {FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`btn-touch filter-toggle-btn ${filterRange === option.value ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onFilterChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>

    <button className="btn-touch btn-secondary btn-icon" onClick={onClose} id="btn-close-reports">
      <X size={20} />
    </button>
  </div>
);

interface KpiCardsProps {
  totalQuantity: number;
  expirationWaste: number;
}

const KpiCards: React.FC<KpiCardsProps> = ({ totalQuantity, expirationWaste }) => (
  <div className="metrics-grid mb-7">
    <div className="card-dashboard">
      <div className="card-header">
        <div className="card-badge-icon card-badge-icon--danger">
          <Trash2 size={20} />
        </div>
        <h3 className="card-title">Total Insumos Descartados</h3>
      </div>
      {/* Cifra siempre en el color de texto por defecto (hereda --text-primary): mismo criterio que MetricCard en App.tsx, ver TK-068. */}
      <div className="fs-3xl fw-black">
        {totalQuantity.toFixed(2)} <span className="text-secondary-color fs-sm">unidades/KG</span>
      </div>
    </div>

    <div className="card-dashboard">
      <div className="card-header">
        <div className="card-badge-icon card-badge-icon--warning">
          <PieChart size={20} />
        </div>
        <h3 className="card-title">Mermas por Expiración</h3>
      </div>
      <div className="fs-3xl fw-black">
        {expirationWaste.toFixed(2)} <span className="text-secondary-color fs-sm">unidades</span>
      </div>
    </div>
  </div>
);

interface WasteBarChartProps {
  isLoading: boolean;
  data: WasteSummaryItem[];
  maxVal: number;
}

const WasteBarChart: React.FC<WasteBarChartProps> = ({ isLoading, data, maxVal }) => (
  <div className="card-dashboard mb-5">
    <h3 className="flex-gap-xs mb-2 fs-lg fw-bold">
      <Calendar size={18} className="text-primary-color" /> Desglose de Descartes por Insumo
    </h3>

    {isLoading ? (
      <div className="text-center text-secondary-color p-6">
        <RefreshCw className="spin" size={24} /> Cargando reporte...
      </div>
    ) : (
      <div className="flex-column flex-gap-sm">
        {data.map((item) => {
          const qty = parseFloat(item.totalDiscardedQuantity || '0');
          const pct = Math.min(100, Math.max(5, (qty / maxVal) * 100));

          return (
            <div key={item.insumoId + item.reason}>
              <div className="flex-between mb-1 fs-sm fw-semibold">
                <span>
                  {item.insumoName} <span className="text-secondary-color fw-regular">({item.reason})</span>
                </span>
                <span className="text-danger-color">
                  {item.totalDiscardedQuantity} {item.unitOfMeasure}
                </span>
              </div>

              <div className="progress-bar-track">
                <div
                  className={`progress-bar-fill ${item.reason === 'EXPIRATION' ? 'progress-bar-fill--danger' : 'progress-bar-fill--warning'}`}
                  style={{ '--bar-pct': `${pct}%` } as React.CSSProperties}
                />
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ userRole, isOpen, onClose }) => {
  const [data, setData] = useState<WasteSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterRange, setFilterRange] = useState<FilterRange>('week');

  useEffect(() => {
    if (isOpen && userRole === 'ADMIN') {
      setIsLoading(true);
      const now = new Date();
      const startDate = new Date(now.getTime() - 7 * 86400000).toISOString();
      const endDate = now.toISOString();

      ReportsService.fetchWasteReport(startDate, endDate)
        .then(setData)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, userRole, filterRange]);

  if (!isOpen) return null;

  if (userRole !== 'ADMIN') {
    return <AccessDeniedState moduleLabel="Reportes y Analíticas de Mermas" onClose={onClose} />;
  }

  const totalQuantity = data.reduce((acc, item) => acc + parseFloat(item.totalDiscardedQuantity || '0'), 0);
  const expirationWaste = data
    .filter((d) => d.reason === 'EXPIRATION')
    .reduce((acc, item) => acc + parseFloat(item.totalDiscardedQuantity || '0'), 0);

  const maxVal = Math.max(...data.map((d) => parseFloat(d.totalDiscardedQuantity || '0')), 1);

  return (
    <Modal size="xl">
      {/* Header Dashboard */}
      <div className="flex-between mb-6">
        <div>
          <h2 className="flex-gap-xs fs-xl fw-bold">
            <BarChart3 className="text-primary-color" /> Dashboard de Reportes y Mermas FEFO
          </h2>
          <p className="text-secondary-color fs-sm mt-1">
            Indicadores de Desperdicio y Eficiencia en Tiempo Real
          </p>
        </div>

        <ReportsFilterBar filterRange={filterRange} onFilterChange={setFilterRange} onClose={onClose} />
      </div>

      <KpiCards totalQuantity={totalQuantity} expirationWaste={expirationWaste} />
      <WasteBarChart isLoading={isLoading} data={data} maxVal={maxVal} />
    </Modal>
  );
};
