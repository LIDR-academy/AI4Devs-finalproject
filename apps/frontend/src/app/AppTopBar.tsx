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
    <AppNav userRole={currentUser.role} />
    <div className={styles['topbar-session']}>
      <ThemeToggle theme={theme} onChange={onThemeChange} />
      <SessionBadge name={currentUser.name} role={currentUser.role} />
      <button type="button" className="btn-touch btn-danger" onClick={onLogout} id="btn-logout">
        <LogOut size={20} />
        Cerrar Sesión
      </button>
    </div>
  </header>
);
