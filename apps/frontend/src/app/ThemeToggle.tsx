import React from 'react';
import type { FefoTheme } from './useFefoTheme.js';
import styles from './AppShell.module.css';

/** Interruptor Dia/Noche del Sistema FEFO (US-022). Vive en la topbar del shell. */
export const ThemeToggle: React.FC<{ theme: FefoTheme; onChange: (theme: FefoTheme) => void }> = ({
  theme,
  onChange,
}) => (
  <div className={styles['theme-toggle']} role="group" aria-label="Modo de color del tablero">
    <button
      type="button"
      className={styles['theme-toggle-btn']}
      aria-pressed={theme === 'light'}
      onClick={() => onChange('light')}
      id="btn-theme-day"
    >
      Día
    </button>
    <button
      type="button"
      className={styles['theme-toggle-btn']}
      aria-pressed={theme === 'dark'}
      onClick={() => onChange('dark')}
      id="btn-theme-night"
    >
      Noche
    </button>
  </div>
);
