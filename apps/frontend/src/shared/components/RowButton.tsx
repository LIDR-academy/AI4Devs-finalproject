import React from 'react';
import styles from './RowButton.module.css';

type RowButtonVariant = 'default' | 'urgent' | 'ghost';

interface RowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: RowButtonVariant;
}

/**
 * Botón de fila de la tabla FEFO (US-023 / TK-086-FE). La variante `urgent` se
 * deriva de la urgencia de la fila (no se elige a mano en cada llamada), para que
 * la fila crítica se distinga de un vistazo del resto y de la variante `ghost`.
 */
export const RowButton: React.FC<RowButtonProps> = ({ variant = 'default', className = '', children, ...rest }) => (
  <button
    type="button"
    className={`btn-touch ${styles['row-btn']} ${styles[`row-btn--${variant}`]} ${className}`.trim()}
    {...rest}
  >
    {children}
  </button>
);
