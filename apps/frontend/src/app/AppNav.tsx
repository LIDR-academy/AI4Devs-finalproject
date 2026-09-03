import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, Boxes, ChefHat, BarChart3, Settings } from 'lucide-react';
import styles from './AppShell.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inventario', icon: <Package size={18} /> },
  { to: '/bodega', label: 'Bodega', icon: <Boxes size={18} /> },
  { to: '/recetas', label: 'Recetas', icon: <ChefHat size={18} /> },
  { to: '/reportes', label: 'Reportes', icon: <BarChart3 size={18} />, adminOnly: true },
  { to: '/ajustes', label: 'Ajustes', icon: <Settings size={18} />, adminOnly: true },
];

/** Navegación de rutas de nivel superior (US-023). Reportes/Ajustes se ocultan a no-ADMIN. */
export const AppNav: React.FC<{ userRole: string }> = ({ userRole }) => {
  const isAdmin = userRole === 'ADMIN';
  const visible = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav className={styles.nav} aria-label="Navegación principal">
      {visible.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `${styles['nav-link']} ${isActive ? styles['nav-link-active'] : ''}`}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};
