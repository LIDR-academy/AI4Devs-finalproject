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
      className="banner-alert banner-alert-danger flex-gap-xs"
      style={{
        padding,
        marginBottom,
        fontSize,
      }}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
};
