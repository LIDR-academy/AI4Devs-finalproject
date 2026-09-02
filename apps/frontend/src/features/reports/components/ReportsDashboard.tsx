import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Trash2, PieChart, RefreshCw, X, Clock } from 'lucide-react';
import { ReportsService, WasteSummaryItem, RotationMetrics } from '../services/reports.service.js';
import { SettingsService } from '../../settings/services/settings.service.js';
import { Modal } from '../../../shared/components/Modal.js';
import { AccessDeniedState } from '../../../shared/components/AccessDeniedState.js';
import styles from './ReportsDashboard.module.css';

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
    <div className={`flex-gap-xs ${styles['filter-toggle-group']}`}>
      {FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`btn-touch ${styles['filter-toggle-btn']} ${filterRange === option.value ? 'btn-primary' : 'btn-secondary'}`}
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
  rotationMetrics: RotationMetrics | null;
}

const RotationMetricsCard: React.FC<{ rotationMetrics: RotationMetrics | null }> = ({ rotationMetrics }) => {
  if (!rotationMetrics) {
    return (
      <div className="card-dashboard">
        <div className="card-header">
          <div className="card-badge-icon">
            <Clock size={20} />
          </div>
          <h3 className="card-title">TRR Real (Rotación de Remanentes)</h3>
        </div>
        <div className="fs-md text-secondary-color">Cargando...</div>
      </div>
    );
  }

  // US-020 Escenario 2: sampleSize 0 (o, defensivamente, un contrato de backend violado que
  // devolviera averageTrrHours null con sampleSize > 0) muestra un estado vacio explicito,
  // nunca "0h" (que se leeria enganosamente como un resultado perfecto).
  if (rotationMetrics.sampleSize === 0 || rotationMetrics.averageTrrHours === null) {
    return (
      <div className="card-dashboard">
        <div className="card-header">
          <div className="card-badge-icon">
            <Clock size={20} />
          </div>
          <h3 className="card-title">TRR Real (Rotación de Remanentes)</h3>
        </div>
        <div className="fs-md text-secondary-color">Sin remanentes finalizados en este periodo</div>
      </div>
    );
  }

  const isCompliant = rotationMetrics.averageTrrHours <= rotationMetrics.targetTrrHours;
  const badgeVariant = isCompliant ? 'card-badge-icon--success' : 'card-badge-icon--danger';
  const textVariant = isCompliant ? 'text-success-color' : 'text-danger-color';

  return (
    <div className="card-dashboard">
      <div className="card-header">
        <div className={`card-badge-icon ${badgeVariant}`}>
          <Clock size={20} />
        </div>
        <h3 className="card-title">TRR Real (Rotación de Remanentes)</h3>
      </div>
      <div className="fs-3xl fw-black">
        {rotationMetrics.averageTrrHours.toFixed(1)} <span className="text-secondary-color fs-sm">horas</span>
      </div>
      <div className={`fs-sm ${textVariant}`}>
        Objetivo: {rotationMetrics.targetTrrHours}h {isCompliant ? '· Dentro del objetivo' : '· Fuera del objetivo'}
      </div>
    </div>
  );
};

const KpiCards: React.FC<KpiCardsProps> = ({ totalQuantity, expirationWaste, rotationMetrics }) => (
  <div className={`metrics-grid ${styles['mb-7']}`}>
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

    <RotationMetricsCard rotationMetrics={rotationMetrics} />
  </div>
);

interface WasteBarChartProps {
  isLoading: boolean;
  data: WasteSummaryItem[];
  maxVal: number;
  currencySymbol: string;
}

const WasteBarChart: React.FC<WasteBarChartProps> = ({ isLoading, data, maxVal, currencySymbol }) => (
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
                  {item.insumoName} <span className={`text-secondary-color ${styles['fw-regular']}`}>({item.reason})</span>
                </span>
                <span className="text-danger-color">
                  {item.totalDiscardedQuantity} {item.unitOfMeasure}
                </span>
              </div>

              <div className="flex-between mb-1 fs-xs text-secondary-color">
                <span />
                {item.totalDiscardedCost !== null ? (
                  <span>{currencySymbol}{item.totalDiscardedCost}</span>
                ) : (
                  <span>Sin costo registrado</span>
                )}
              </div>

              <div className={styles['progress-bar-track']}>
                <div
                  className={`${styles['progress-bar-fill']} ${item.reason === 'EXPIRATION' ? styles['progress-bar-fill--danger'] : styles['progress-bar-fill--warning']}`}
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
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [rotationMetrics, setRotationMetrics] = useState<RotationMetrics | null>(null);

  useEffect(() => {
    if (isOpen && userRole === 'ADMIN') {
      setIsLoading(true);
      const now = new Date();
      const startDate = new Date(now.getTime() - 7 * 86400000).toISOString();
      const endDate = now.toISOString();

      ReportsService.fetchWasteReport(startDate, endDate)
        .then(setData)
        .finally(() => setIsLoading(false));

      ReportsService.fetchRotationMetrics(startDate, endDate).then(setRotationMetrics);

      SettingsService.fetchSettings()
        .then((settings) => setCurrencySymbol(settings.currencySymbol))
        .catch(() => {});
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

      <KpiCards totalQuantity={totalQuantity} expirationWaste={expirationWaste} rotationMetrics={rotationMetrics} />
      <WasteBarChart isLoading={isLoading} data={data} maxVal={maxVal} currencySymbol={currencySymbol} />
    </Modal>
  );
};
