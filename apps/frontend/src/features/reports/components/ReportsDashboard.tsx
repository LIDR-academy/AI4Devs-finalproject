import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Calendar, Trash2, PieChart, RefreshCw, Clock } from 'lucide-react';
import { ReportsService, WasteSummaryItem, RotationMetrics } from '../services/reports.service.js';
import { SettingsService } from '../../settings/services/settings.service.js';
import { PreparationWasteReportPanel } from './PreparationWasteReportPanel.js';
import { TemperatureLogReportPanel } from './TemperatureLogReportPanel.js';
import { usePermissions } from '../../../shared/hooks/usePermissions.js';
import styles from './ReportsDashboard.module.css';

// TK-121-FE: el acceso a `/reportes` lo garantiza `<ProtectedRoute requiredPermission="reports:view">`;
// el componente ya no recibe el rol, consulta el permiso por su cuenta.
type ReportsDashboardProps = Record<string, never>;

type FilterRange = 'today' | 'week' | 'month';

interface ReportsFilterBarProps {
  filterRange: FilterRange;
  onFilterChange: (range: FilterRange) => void;
}

const FILTER_OPTIONS: Array<{ value: FilterRange; label: string }> = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: '7 Días' },
  { value: 'month', label: 'Mes' },
];

const ReportsFilterBar: React.FC<ReportsFilterBarProps> = ({ filterRange, onFilterChange }) => (
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

/**
 * Dashboard de mermas y KPIs FEFO. Desde `US-024` se renderiza **inline** en el
 * `<main>` del shell (ruta `/reportes`), no como `<Modal>` flotante — consistente
 * con `/estaciones` y `/recetas`. El gating `ADMIN` vive en `<ProtectedRoute>`.
 */
function useReportRangeDates(filterRange: FilterRange): { startDate: string; endDate: string } {
  // TK-105-FE: filterRange ahora sí determina el rango consultado — antes (TK-078)
  // disparaba el refetch pero el cálculo quedaba fijo en 7 días sin importar la pestaña.
  return useMemo(() => {
    const daysByRange: Record<FilterRange, number> = { today: 1, week: 7, month: 30 };
    const now = new Date();
    return {
      startDate: new Date(now.getTime() - daysByRange[filterRange] * 86400000).toISOString(),
      endDate: now.toISOString(),
    };
  }, [filterRange]);
}

function useReportsData(canViewReports: boolean, filterRange: FilterRange) {
  const [data, setData] = useState<WasteSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [rotationMetrics, setRotationMetrics] = useState<RotationMetrics | null>(null);
  const { startDate, endDate } = useReportRangeDates(filterRange);

  useEffect(() => {
    // TK-121-FE: por permiso (`reports:view`), no por `role === 'ADMIN'` — evita
    // disparar peticiones que el backend rechazaría con 403.
    if (!canViewReports) return;
    setIsLoading(true);

    ReportsService.fetchWasteReport(startDate, endDate)
      .then(setData)
      .finally(() => setIsLoading(false));

    ReportsService.fetchRotationMetrics(startDate, endDate).then(setRotationMetrics);

    SettingsService.fetchSettings()
      .then((settings) => setCurrencySymbol(settings.currencySymbol))
      .catch(() => {});
  }, [canViewReports, startDate, endDate]);

  return { data, isLoading, currencySymbol, rotationMetrics, startDate, endDate };
}

export const ReportsDashboard: React.FC<ReportsDashboardProps> = () => {
  const [filterRange, setFilterRange] = useState<FilterRange>('week');
  const { has } = usePermissions();
  const { data, isLoading, currencySymbol, rotationMetrics, startDate, endDate } = useReportsData(has('reports:view'), filterRange);

  const totalQuantity = data.reduce((acc, item) => acc + parseFloat(item.totalDiscardedQuantity || '0'), 0);
  const expirationWaste = data
    .filter((d) => d.reason === 'EXPIRATION')
    .reduce((acc, item) => acc + parseFloat(item.totalDiscardedQuantity || '0'), 0);

  const maxVal = Math.max(...data.map((d) => parseFloat(d.totalDiscardedQuantity || '0')), 1);

  return (
    <>
      <header className="flex-between flex-wrap mb-6 gap-3">
        <div>
          <h1 className="flex-gap-xs fs-xl fw-bold">
            <BarChart3 className="text-primary-color" /> Dashboard de Reportes y Mermas FEFO
          </h1>
          <p className="text-secondary-color fs-sm mt-1">
            Indicadores de Desperdicio y Eficiencia en Tiempo Real
          </p>
        </div>

        <ReportsFilterBar filterRange={filterRange} onFilterChange={setFilterRange} />
      </header>

      <KpiCards totalQuantity={totalQuantity} expirationWaste={expirationWaste} rotationMetrics={rotationMetrics} />
      <WasteBarChart isLoading={isLoading} data={data} maxVal={maxVal} currencySymbol={currencySymbol} />
      <PreparationWasteReportPanel startDate={startDate} endDate={endDate} currencySymbol={currencySymbol} />
      {/* US-033/TK-120-FE: histórico de temperatura — la ruta /reportes ya está gateada a ADMIN. */}
      <TemperatureLogReportPanel startDate={startDate} endDate={endDate} />
    </>
  );
};
