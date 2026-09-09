import React from 'react';
import { LogOut, User } from 'lucide-react';
import { AppNav } from './AppNav.js';
import { ThemeToggle } from './ThemeToggle.js';
import type { FefoTheme } from './useFefoTheme.js';
import styles from './AppShell.module.css';

interface AppTopBarProps {
  currentUser: { name: string; role: string };
  theme: FefoTheme;
  onThemeChange: (theme: FefoTheme) => void;
  onLogout: () => void;
}

const SessionBadge: React.FC<{ name: string; role: string }> = ({ name, role }) => (
  <div className={styles['user-badge']}>
    <span className={styles['status']}>
      <span className={styles['status-dot']} aria-hidden="true" />
      Conectado
    </span>
    <User size={18} className="text-primary-color" />
    <div>
      <div className="fs-md fw-semibold">{name}</div>
      <div className="fs-xs text-secondary-color">{role}</div>
    </div>
  </div>
);

export const AppTopBar: React.FC<AppTopBarProps> = ({ currentUser, theme, onThemeChange, onLogout }) => (
  <header className={styles.topbar}>
    <AppNav />
    <div className={styles['topbar-session']}>
      <SessionBadge name={currentUser.name} role={currentUser.role} />
      {/* TK-095-FE WS-1 #4: cerrar sesión es una acción rutinaria — botón fantasma
          con borde de tinta (como `.mockup__logout` del artefacto), no `btn-danger`. */}
      <button type="button" className="btn-touch btn-secondary" onClick={onLogout} id="btn-logout">
        <LogOut size={20} />
        Cerrar Sesión
      </button>
      {/* TK-095-FE WS-4 #11: el interruptor de turno va al final del cluster de
          sesión (preferencia), no flotando entre la nav y la identidad. */}
      <ThemeToggle theme={theme} onChange={onThemeChange} />
    </div>
  </header>
);
