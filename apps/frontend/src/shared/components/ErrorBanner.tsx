import React from 'react';

interface ErrorBannerProps {
  message: string;
  icon?: React.ReactNode;
  compact?: boolean;
}

/**
 * Banner de error inline compartido, antes duplicado casi identico entre
 * RecipeSelectorModal y PinLoginModal.
 *
 * `compact` reemplaza los antiguos props de string libre (padding/fontSize/
 * marginBottom): los 2 combos reales que existian en la app quedan fijos
 * en la clase base vs. `.error-banner-compact` (Guard 29 extendido).
 */
export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, icon, compact = false }) => {
  return (
    <div
      role="alert"
      className={`banner-alert banner-alert-danger flex-gap-xs mb-4 fs-md p-3${compact ? ' error-banner-compact' : ''}`}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
};
