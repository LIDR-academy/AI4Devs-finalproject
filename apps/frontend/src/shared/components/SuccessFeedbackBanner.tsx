import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessFeedbackBannerProps {
  message: string;
}

/**
 * Banner de confirmación inline compartido — antes duplicado casi idéntico
 * entre UserManagementPanel y CatalogManagementPanel (ver regla de reuso de SK-17).
 */
export const SuccessFeedbackBanner: React.FC<SuccessFeedbackBannerProps> = ({ message }) => (
  <div role="status" className="banner-alert banner-alert-success flex-gap-xs error-banner-compact mb-4">
    <CheckCircle2 size={18} />
    <span>{message}</span>
  </div>
);
