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
  /** Uso no-textual: borde izquierdo, fondo de badge (≥3:1, no necesita ser AAA-texto). */
  accentColor: string;
  /** Uso textual: label del badge, "Vence en Xh", botón "Descartar" (debe cumplir 4.5:1/7:1 sobre --bg-card). */
  textColor: string;
  label: string;
  bg: string;
}

function getSeverity(hours: number): Severity {
  if (hours <= 6) {
    return {
      accentColor: 'var(--color-danger, #e10600)',
      textColor: 'var(--color-danger-text, #ff6b5e)',
      bg: 'rgba(225, 6, 0, 0.12)',
      label: 'CRÍTICO (< 6h)',
    };
  }
  if (hours <= 24) {
    return {
      accentColor: 'var(--color-warning, #ff6a00)',
      textColor: 'var(--color-warning, #ff6a00)',
      bg: 'rgba(255, 106, 0, 0.12)',
      label: 'ADVERTENCIA (< 24h)',
    };
  }
  return {
    accentColor: 'var(--color-success, #2fbf6e)',
    textColor: 'var(--color-success, #2fbf6e)',
    bg: 'rgba(47, 191, 110, 0.12)',
    label: 'ÓPTIMO',
  };
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
        backgroundColor: 'var(--color-primary, #ff6a00)',
        color: 'var(--color-primary-on, #101010)',
        border: 'none',
        borderRadius: '4px',
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
        color: 'var(--color-danger-text, #ff6b5e)',
        border: '1px solid var(--color-danger, #e10600)',
        borderRadius: '4px',
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
        backgroundColor: 'var(--bg-card, #1a1a1a)',
        borderLeft: `6px solid ${severity.accentColor}`,
        borderRadius: '4px',
        padding: '1rem',
        marginBottom: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, color: 'var(--text-primary, #f5f5f0)', fontSize: '1.1rem' }}>
          {alert.ingredientName}
        </h4>
        <span
          style={{
            backgroundColor: severity.bg,
            color: severity.textColor,
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          {severity.label}
        </span>
      </div>

      <div style={{ color: 'var(--text-secondary, #8a8a86)', fontSize: '0.9rem' }}>
        <span>Lote: <strong>{alert.lotNumber}</strong></span> •
        <span> Cantidad: <strong>{alert.quantity} {alert.unit}</strong></span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Texto siempre en --text-primary (no en el tono del tier): a este tamaño/peso ningún tono de acento
            alcanza el 7:1 exigido para "números principales" por el Design System v2.0.0; la urgencia ya la
            comunican el borde izquierdo y el badge (uso no-textual, ≥3:1). */}
        <span style={{ color: 'var(--text-primary, #f5f5f0)', fontWeight: 700, fontSize: '0.95rem' }}>
          ⏳ Vence en {alert.hoursRemaining}h
        </span>

        {onAction && <AlertActionButtons alert={alert} onAction={onAction} />}
      </div>
    </article>
  );
};
