import React from 'react';
import styles from './ActionButton.module.css';

/** Capa de color de **acción** (qué botón es cuál) — nunca urgencia/estado. */
type ActionKind = 'extract' | 'add' | 'recipe';

interface ActionButtonProps {
  action: ActionKind;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  /** Texto auxiliar bajo el label, en mono (ej. "bodega → cocina"). */
  hint?: string;
  id?: string;
  disabled?: boolean;
}

/**
 * Botón de acción circular de la lámina "Aplicación" (US-023 / TK-086-FE).
 * Círculo de 72px, `border-radius: 9999px` — **única excepción documentada** a las
 * esquinas rectas del Sistema FEFO: su forma redonda lo distingue de todo lo demás
 * (cuadrado). De día relleno sólido; de noche contorno de tiza (ver ActionButton.module.css).
 */
export const ActionButton: React.FC<ActionButtonProps> = ({ action, label, icon, onClick, hint, id, disabled }) => (
  <span className={styles['action-btn']}>
    <button
      type="button"
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.circle} ${styles[`circle--${action}`]}`}
      aria-label={label}
    >
      <span aria-hidden="true" className={styles.glyph}>
        {icon}
      </span>
    </button>
    <span className={styles.label}>{label}</span>
    {hint && <span className={styles.hint}>{hint}</span>}
  </span>
);
