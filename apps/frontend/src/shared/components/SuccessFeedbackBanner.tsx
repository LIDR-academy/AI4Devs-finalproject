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
  <div
    role="status"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 14px',
      marginBottom: '16px',
      backgroundColor: 'rgba(0, 210, 190, 0.12)',
      border: '1px solid var(--color-primary)',
      borderRadius: '8px',
      color: 'var(--color-primary)',
      fontSize: '0.88rem',
    }}
  >
    <CheckCircle2 size={18} />
    <span>{message}</span>
  </div>
);
