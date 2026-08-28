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
  <div className="flex-gap-xs" style={{ alignItems: 'center' }}>
    <div className="flex-gap-xs" style={{ backgroundColor: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
      {FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`btn-touch ${filterRange === option.value ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '36px' }}
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
  <div className="metrics-grid mb-2" style={{ marginBottom: '28px' }}>
    <div className="card-dashboard">
      <div className="card-header">
        <div className="card-badge-icon" style={{ backgroundColor: 'rgba(225, 6, 0, 0.15)', color: 'var(--color-danger)' }}>
          <Trash2 size={20} />
        </div>
        <h3 className="card-title">Total Insumos Descartados</h3>
      </div>
      {/* Cifra siempre en --text-primary: mismo criterio que MetricCard en App.tsx, ver TK-068. */}
      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
        {totalQuantity.toFixed(2)} <span className="text-secondary-color" style={{ fontSize: '0.85rem' }}>unidades/KG</span>
      </div>
    </div>

    <div className="card-dashboard">
      <div className="card-header">
        <div className="card-badge-icon" style={{ backgroundColor: 'rgba(255, 106, 0, 0.15)', color: 'var(--color-warning)' }}>
          <PieChart size={20} />
        </div>
        <h3 className="card-title">Mermas por Expiración</h3>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
        {expirationWaste.toFixed(2)} <span className="text-secondary-color" style={{ fontSize: '0.85rem' }}>unidades</span>
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
  <div className="card-dashboard mb-2" style={{ marginBottom: '20px' }}>
    <h3 className="flex-gap-xs mb-2" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
      <Calendar size={18} className="text-primary-color" /> Desglose de Descartes por Insumo
    </h3>

    {isLoading ? (
      <div className="text-center text-secondary-color" style={{ padding: '40px' }}>
        <RefreshCw className="spin" size={24} /> Cargando reporte...
      </div>
    ) : (
      <div className="flex-column flex-gap-sm">
        {data.map((item) => {
          const qty = parseFloat(item.totalDiscardedQuantity || '0');
          const pct = (qty / maxVal) * 100;

          return (
            <div key={item.insumoId + item.reason}>
              <div className="flex-between mb-1" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                <span>
                  {item.insumoName} <span className="text-secondary-color" style={{ fontWeight: 400 }}>({item.reason})</span>
                </span>
                <span className="text-danger-color">
                  {item.totalDiscardedQuantity} {item.unitOfMeasure}
                </span>
              </div>

              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', height: '12px', width: '100%', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(5, pct))}%`,
                    height: '100%',
                    backgroundColor: item.reason === 'EXPIRATION' ? 'var(--color-danger)' : 'var(--color-warning)',
                    borderRadius: '6px',
                    transition: 'width 0.4s ease',
                  }}
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
    <Modal maxWidth="850px" width="92%">
      {/* Header Dashboard */}
      <div className="flex-between mb-2" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="flex-gap-xs" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <BarChart3 className="text-primary-color" /> Dashboard de Reportes y Mermas FEFO
          </h2>
          <p className="text-secondary-color" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
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
