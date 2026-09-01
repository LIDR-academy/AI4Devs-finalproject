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
  key: 'critical' | 'warning' | 'safe';
  label: string;
}

function getSeverity(hours: number): Severity {
  if (hours <= 6) {
    return { key: 'critical', label: 'CRÍTICO (< 6h)' };
  }
  if (hours <= 24) {
    return { key: 'warning', label: 'ADVERTENCIA (< 24h)' };
  }
  return { key: 'safe', label: 'ÓPTIMO' };
}

interface AlertActionButtonsProps {
  alert: AlertItem;
  onAction: (id: string, action: 'consume' | 'discard') => void;
}

const AlertActionButtons: React.FC<AlertActionButtonsProps> = ({ alert, onAction }) => (
  <div className="semaphoric-actions">
    <button
      onClick={() => onAction(alert.id, 'consume')}
      aria-label={`Consumir ${alert.ingredientName}`}
      className="semaphoric-action-btn semaphoric-action-btn--consume"
    >
      Consumir
    </button>
    <button
      onClick={() => onAction(alert.id, 'discard')}
      aria-label={`Descartar ${alert.ingredientName}`}
      className="semaphoric-action-btn semaphoric-action-btn--discard"
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
      className={`semaphoric-card severity-${severity.key}`}
    >
      <div className="semaphoric-header">
        <h4 className="semaphoric-title">
          {alert.ingredientName}
        </h4>
        <span className="severity-badge">
          {severity.label}
        </span>
      </div>

      <div className="semaphoric-meta">
        <span>Lote: <strong>{alert.lotNumber}</strong></span> •
        <span> Cantidad: <strong>{alert.quantity} {alert.unit}</strong></span>
      </div>

      <div className="semaphoric-footer">
        {/* Texto siempre en --text-primary (no en el tono del tier): a este tamaño/peso ningún tono de acento
            alcanza el 7:1 exigido para "números principales" por el Design System v2.0.0; la urgencia ya la
            comunican el borde izquierdo y el badge (uso no-textual, ≥3:1). */}
        <span className="semaphoric-time">
          ⏳ Vence en {alert.hoursRemaining}h
        </span>

        {onAction && <AlertActionButtons alert={alert} onAction={onAction} />}
      </div>
    </article>
  );
};
