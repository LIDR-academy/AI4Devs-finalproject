import React from 'react';
import styles from './AuthScreen.module.css';

interface AuthScreenProps {
  children: React.ReactNode;
}

/**
 * Layout de pantalla completa para los flujos de autenticación (US-023 / TK-095-FE WS-1 #2).
 * Reemplaza el uso de `<Modal size="sm" centered>` en `PinLoginModal` / `ForceChangePinModal`
 * / `ResetPinModal`: esas vistas son la pantalla entera cuando no hay sesión, así que se
 * dibujan sobre el fondo FEFO (`--bg-root`) — no sobre el scrim negro de `.modal-overlay`.
 * La tarjeta conserva el mismo tratamiento visual que `.modal-card`.
 */
export const AuthScreen: React.FC<AuthScreenProps> = ({ children }) => (
  <div className={styles.screen}>
    <div className={styles.card}>{children}</div>
  </div>
);
