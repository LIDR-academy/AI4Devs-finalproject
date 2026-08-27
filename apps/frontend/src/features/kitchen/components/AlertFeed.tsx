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
  <div
    role="alert"
    style={{
      padding: '1.5rem',
      backgroundColor: 'rgba(235, 62, 62, 0.15)',
      border: '1px solid var(--color-danger, #eb3e3e)',
      borderRadius: '8px',
      color: 'var(--text-primary, #f5f5f0)',
      textAlign: 'center',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
      <AlertTriangle size={32} style={{ color: 'var(--color-danger)' }} />
    </div>
    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-danger, #eb3e3e)' }}>Error al Cargar Alertas</h3>
    <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem' }}>{error}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="btn-touch btn-primary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <RefreshCw size={18} />
        Reintentar Carga
      </button>
    )}
  </div>
);

const AlertFeedSkeleton: React.FC = () => (
  <div data-testid="loading-skeleton" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        style={{
          height: '100px',
          backgroundColor: 'var(--bg-card, #1a1a1a)',
          borderRadius: '4px',
          opacity: 0.6,
          animation: 'pulse 1.5s infinite ease-in-out',
        }}
      />
    ))}
  </div>
);

const AlertFeedEmptyState: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary, #8a8a86)' }}>
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
      <CheckCircle2 size={48} style={{ color: 'var(--color-success)' }} />
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
    <section
      aria-label="Feed de Alertas FEFO de Cocina"
      style={{
        backgroundColor: 'var(--bg-root, #101010)',
        color: 'var(--text-primary, #f5f5f0)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <OfflineBanner />

      <header style={{ padding: '1rem', borderBottom: '1px solid var(--border-card, #666666)' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={24} style={{ color: 'var(--color-primary)' }} /> Feed de Alertas & Remanentes CRÍTICOS
        </h2>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary, #8a8a86)', fontSize: '0.9rem' }}>
          Monitoreo en tiempo real del vencimiento de insumos por método FEFO.
        </p>
      </header>

      <main style={{ padding: '1rem', flex: 1 }}>
        {viewState === 'error' && <AlertFeedErrorState error={error as string} onRetry={onRetry} />}
        {viewState === 'loading' && <AlertFeedSkeleton />}
        {viewState === 'empty' && <AlertFeedEmptyState />}
        {viewState === 'data' && <AlertFeedDataReady alerts={alerts} onAction={onAction} />}
      </main>
    </section>
  );
};
