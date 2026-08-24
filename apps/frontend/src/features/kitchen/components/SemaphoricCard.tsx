import React from 'react';

export interface AlertItem {
  id: string;
  ingredientName: string;
  lotNumber: string;
  hoursRemaining: number;
  quantity: string;
  unit: string;
}

interface SemaphoricCardProps {
  alert: AlertItem;
  onAction?: (id: string, action: 'consume' | 'discard') => void;
}

interface Severity {
  color: string;
  label: string;
  bg: string;
}

function getSeverity(hours: number): Severity {
  if (hours <= 6) {
    return { color: 'var(--color-danger, #ff2a2a)', bg: 'rgba(255, 42, 42, 0.12)', label: 'CRÍTICO (< 6h)' };
  }
  if (hours <= 24) {
    return { color: 'var(--color-warning, #f4a261)', bg: 'rgba(244, 162, 97, 0.12)', label: 'ADVERTENCIA (< 24h)' };
  }
  return { color: 'var(--color-success, #00a896)', bg: 'rgba(0, 168, 150, 0.12)', label: 'ÓPTIMO' };
}

interface AlertActionButtonsProps {
  alert: AlertItem;
  onAction: (id: string, action: 'consume' | 'discard') => void;
}

const AlertActionButtons: React.FC<AlertActionButtonsProps> = ({ alert, onAction }) => (
  <div style={{ display: 'flex', gap: '0.5rem' }}>
    <button
      onClick={() => onAction(alert.id, 'consume')}
      aria-label={`Consumir ${alert.ingredientName}`}
      style={{
        minHeight: '48px',
        minWidth: '90px',
        backgroundColor: 'var(--color-primary, #00a896)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      Consumir
    </button>
    <button
      onClick={() => onAction(alert.id, 'discard')}
      aria-label={`Descartar ${alert.ingredientName}`}
      style={{
        minHeight: '48px',
        minWidth: '90px',
        backgroundColor: 'transparent',
        color: 'var(--color-danger, #ff2a2a)',
        border: '1px solid var(--color-danger, #ff2a2a)',
        borderRadius: '6px',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      Descartar
    </button>
  </div>
);

export const SemaphoricCard: React.FC<SemaphoricCardProps> = ({ alert, onAction }) => {
  const severity = getSeverity(alert.hoursRemaining);

  return (
    <article
      data-testid={`semaphoric-card-${alert.id}`}
      style={{
        backgroundColor: 'var(--bg-card, #101c24)',
        borderLeft: `6px solid ${severity.color}`,
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, color: 'var(--text-primary, #ffffff)', fontSize: '1.1rem' }}>
          {alert.ingredientName}
        </h4>
        <span
          style={{
            backgroundColor: severity.bg,
            color: severity.color,
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          {severity.label}
        </span>
      </div>

      <div style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.9rem' }}>
        <span>Lote: <strong>{alert.lotNumber}</strong></span> • 
        <span> Cantidad: <strong>{alert.quantity} {alert.unit}</strong></span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: severity.color, fontWeight: 700, fontSize: '0.95rem' }}>
          ⏳ Vence en {alert.hoursRemaining}h
        </span>

        {onAction && <AlertActionButtons alert={alert} onAction={onAction} />}
      </div>
    </article>
  );
};
