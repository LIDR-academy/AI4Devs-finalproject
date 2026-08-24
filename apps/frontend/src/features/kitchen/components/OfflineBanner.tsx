import React from 'react';
import { useOnlineStatus } from '../../../shared/hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        backgroundColor: 'var(--color-danger, #e10600)',
        color: 'var(--text-primary, #f5f5f0)',
        padding: '0.75rem 1rem',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        minHeight: '48px',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>⚠️</span>
      <span>Modo Sin Conexión: Operando localmente. Sincronización pendiente.</span>
    </div>
  );
};
