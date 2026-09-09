import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface SuccessFeedbackBannerProps {
  message: string;
  /**
   * US-033/TK-120-FE: `warning` para una operación que **sí se completó** pero cuyo dato
   * amerita atención (ej. temperatura fuera del rango FDA). Nunca usar `ErrorBanner`
   * para eso: el registro se creó, no hubo error.
   */
  variant?: 'success' | 'warning';
}

/**
 * Banner de confirmación inline compartido — antes duplicado casi idéntico
 * entre UserManagementPanel y CatalogManagementPanel (ver regla de reuso de SK-17).
 */
export const SuccessFeedbackBanner: React.FC<SuccessFeedbackBannerProps> = ({ message, variant = 'success' }) => (
  <div role="status" className={`banner-alert banner-alert-${variant} flex-gap-xs error-banner-compact mb-4`}>
    {variant === 'warning' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
    <span>{message}</span>
  </div>
);
