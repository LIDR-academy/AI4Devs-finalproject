import React from 'react';
import type { UrgencyLevel } from './urgency.js';
import styles from './UrgencyChip.module.css';

interface UrgencyChipProps {
  level: UrgencyLevel;
  label: string;
}

/**
 * Chip de urgencia de la escala FEFO (US-023 / TK-086-FE). Reemplaza el badge
 * tri-color heredado con la escala completa de 4 niveles. **Siempre** marca
 * cuadrada + texto — la marca es el canal redundante al color (WCAG 1.4.1),
 * no decoración. De día relleno tintado; de noche contorno (ver .module.css).
 */
export const UrgencyChip: React.FC<UrgencyChipProps> = ({ level, label }) => (
  <span className={`${styles.chip} ${styles[`chip--${level}`]}`}>
    <span aria-hidden="true" className={styles.mark} />
    {label}
  </span>
);
