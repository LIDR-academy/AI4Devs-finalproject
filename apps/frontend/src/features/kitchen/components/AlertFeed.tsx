import React from 'react';
import { SemaphoricCard, AlertItem } from './SemaphoricCard';
import { OfflineBanner } from './OfflineBanner';

interface AlertFeedProps {
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
      border: '1px solid var(--color-danger, #ff2a2a)',
      backgroundColor: 'rgba(255, 42, 42, 0.1)',
      padding: '1rem',
      borderRadius: '8px',
      textAlign: 'center',
    }}
  >
    <p style={{ color: 'var(--color-danger, #ff2a2a)', fontWeight: 600 }}>{error}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          minHeight: '48px',
          padding: '0 1.5rem',
          backgroundColor: 'var(--color-primary, #00a896)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Reintentar Carga
      </button>
    )}
  </div>
);

const AlertFeedLoadingSkeleton: React.FC = () => (
  <div data-testid="loading-skeleton" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        style={{
          height: '100px',
          backgroundColor: 'var(--bg-card, #101c24)',
          borderRadius: '8px',
          opacity: 0.6,
          animation: 'pulse 1.5s infinite ease-in-out',
        }}
      />
    ))}
  </div>
);

const AlertFeedEmptyState: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary, #94a3b8)' }}>
    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>✅</span>
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
  if (error) return 'error';
  if (isLoading) return 'loading';
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
        backgroundColor: 'var(--bg-root, #0b1319)',
        color: 'var(--text-primary, #fafafa)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <OfflineBanner />

      <header style={{ padding: '1rem', borderBottom: '1px solid var(--border-card, #192a36)' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>🚨 Feed de Alertas & Remanentes CRÍTICOS</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.9rem' }}>
          Monitoreo en tiempo real del vencimiento de insumos por método FEFO.
        </p>
      </header>

      <main style={{ padding: '1rem', flex: 1 }}>
        {viewState === 'error' && <AlertFeedErrorState error={error as string} onRetry={onRetry} />}
        {viewState === 'loading' && <AlertFeedLoadingSkeleton />}
        {viewState === 'empty' && <AlertFeedEmptyState />}
        {viewState === 'data' && <AlertFeedDataReady alerts={alerts} onAction={onAction} />}
      </main>
    </section>
  );
};
