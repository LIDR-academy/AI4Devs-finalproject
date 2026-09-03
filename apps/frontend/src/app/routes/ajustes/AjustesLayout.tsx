import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Settings, Users, ShieldCheck, History } from 'lucide-react';
import styles from './AjustesLayout.module.css';

const SUB_TABS = [
  { to: 'configuracion', label: 'Configuración', icon: <Settings size={18} /> },
  { to: 'personal', label: 'Personal', icon: <Users size={18} /> },
  { to: 'roles', label: 'Roles', icon: <ShieldCheck size={18} /> },
  { to: 'movimientos', label: 'Movimientos', icon: <History size={18} /> },
];

/**
 * Layout de `/ajustes` (US-024) — barra de sub-pestañas deep-linkables + `<Outlet>`.
 * ADMIN-only: `router.tsx` lo envuelve en `<ProtectedRoute requiredRole="ADMIN">`,
 * así que las 5 sub-rutas quedan protegidas de una sola vez.
 */
export const AjustesLayout: React.FC = () => (
  <>
    <h1 className="fs-2xl fw-bold mb-4">Ajustes y Administración</h1>
    <nav className={styles['sub-tabs']} aria-label="Secciones de Ajustes">
      {SUB_TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `${styles['sub-tab']} ${isActive ? styles['sub-tab-active'] : ''}`}
        >
          {tab.icon}
          {tab.label}
        </NavLink>
      ))}
    </nav>
    <Outlet />
  </>
);
