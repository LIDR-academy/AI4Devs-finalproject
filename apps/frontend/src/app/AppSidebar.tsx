import React from 'react';
import { useRestaurantName } from './useRestaurantName.js';
import styles from './AppShell.module.css';

/**
 * Barra lateral "ficha de comanda" del Sistema FEFO (US-023): wordmark vertical
 * del restaurante + dos perforaciones decorativas. Invierte su tono respecto al
 * fondo para contrastar en ambos turnos.
 */
export const AppSidebar: React.FC = () => {
  const restaurantName = useRestaurantName();

  return (
    <aside className={styles.sidebar}>
      <span className={`${styles.punch} ${styles['punch-top']}`} aria-hidden="true" />
      <span className={`${styles.punch} ${styles['punch-bottom']}`} aria-hidden="true" />
      <span className={styles.wordmark}>{restaurantName}</span>
    </aside>
  );
};
