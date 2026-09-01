import React from 'react';
import { useOnlineStatus } from '../../../shared/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="offline-banner"
    >
      <WifiOff size={20} />
      <span>Modo Sin Conexión: Operando localmente. Sincronización pendiente.</span>
    </div>
  );
};
