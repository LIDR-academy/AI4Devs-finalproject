import React from 'react';

interface ErrorBannerProps {
  message: string;
  icon?: React.ReactNode;
  padding?: string;
  fontSize?: string;
  marginBottom?: string;
}

/**
 * Banner de error inline compartido, antes duplicado casi identico entre
 * RecipeSelectorModal y PinLoginModal.
 */
export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  icon,
  padding = '12px',
  fontSize = '0.9rem',
  marginBottom = '16px',
}) => {
  return (
    <div
      role="alert"
      style={{
        backgroundColor: 'rgba(225, 6, 0, 0.15)',
        border: '1px solid var(--color-danger)',
        borderRadius: '4px',
        padding,
        marginBottom,
        color: 'var(--color-danger-text)',
        fontSize,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
};
