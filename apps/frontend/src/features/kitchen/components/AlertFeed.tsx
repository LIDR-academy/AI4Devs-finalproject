import React from 'react';
import { SemaphoricCard, AlertItem } from './SemaphoricCard.js';
import { OfflineBanner } from './OfflineBanner.js';
import { CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export interface AlertFeedProps {
  alerts?: AlertItem[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onAction?: (id: string, action: 'consume' | 'discard') => void;
}

const AlertFeedErrorState: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div role="alert" className="banner-alert banner-alert-danger flex-column flex-center text-center">
    <div className="flex-center mb-2">
      <AlertTriangle size={32} className="text-danger-color" />
    </div>
    <h3 className="text-danger-color mb-2">Error al Cargar Alertas</h3>
    <p className="mb-4 fs-md">{error}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="btn-touch btn-primary flex-gap-xs"
      >
        <RefreshCw size={18} />
        Reintentar Carga
      </button>
    )}
  </div>
);

const AlertFeedSkeleton: React.FC = () => (
  <div data-testid="loading-skeleton" className="flex-column gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="skeleton-item" />
    ))}
  </div>
);

const AlertFeedEmptyState: React.FC = () => (
  <div className="alert-empty-state">
    <div className="flex-center mb-2">
      <CheckCircle2 size={48} className="text-success-color" />
    </div>
    <h3>No hay remanentes en riesgo de vencimiento</h3>
    <p>Todos los insumos en cocina cumplen las directivas FEFO óptimas.</p>
  </div>
);

const AlertFeedDataReady: React.FC<{ alerts: AlertItem[]; onAction?: (id: string, action: 'consume' | 'discard') => void }> = ({
  alerts,
  onAction,
}) => (
  <div data-testid="alerts-container">
    {alerts.map((alert) => (
      <SemaphoricCard key={alert.id} alert={alert} onAction={onAction} />
    ))}
  </div>
);

type AlertFeedViewState = 'error' | 'loading' | 'empty' | 'data';

function resolveViewState(isLoading: boolean, error: string | null, alertsCount: number): AlertFeedViewState {
  if (isLoading) return 'loading';
  if (error) return 'error';
  if (alertsCount === 0) return 'empty';
  return 'data';
}

export const AlertFeed: React.FC<AlertFeedProps> = ({
  alerts = [],
  isLoading = false,
  error = null,
  onRetry,
  onAction,
}) => {
  const viewState = resolveViewState(isLoading, error, alerts.length);

  return (
    <section aria-label="Feed de Alertas FEFO de Cocina" className="alert-feed-container">
      <OfflineBanner />

      <header className="alert-feed-header">
        <h2 className="flex-gap-xs m-0 fs-xl">
          <AlertTriangle size={24} className="text-primary-color" /> Feed de Alertas & Remanentes CRÍTICOS
        </h2>
        <p className="text-secondary-color mt-1 fs-md">
          Monitoreo en tiempo real del vencimiento de insumos por método FEFO.
        </p>
      </header>

      <main className="alert-feed-main">
        {viewState === 'error' && <AlertFeedErrorState error={error as string} onRetry={onRetry} />}
        {viewState === 'loading' && <AlertFeedSkeleton />}
        {viewState === 'empty' && <AlertFeedEmptyState />}
        {viewState === 'data' && <AlertFeedDataReady alerts={alerts} onAction={onAction} />}
      </main>
    </section>
  );
};
