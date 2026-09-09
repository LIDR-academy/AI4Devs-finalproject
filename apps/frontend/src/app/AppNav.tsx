import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, Boxes, ChefHat, BarChart3, Settings } from 'lucide-react';
import { usePermissions } from '../shared/hooks/usePermissions.js';
import styles from './AppShell.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  /** US-015 Esc. 2 / TK-121-FE: código de `Permission` que habilita la pestaña. */
  requiredPermission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inventario', icon: <Package size={18} /> },
  { to: '/bodega', label: 'Bodega', icon: <Boxes size={18} /> },
  { to: '/recetas', label: 'Recetas', icon: <ChefHat size={18} /> },
  { to: '/reportes', label: 'Reportes', icon: <BarChart3 size={18} />, requiredPermission: 'reports:view' },
  { to: '/ajustes', label: 'Ajustes', icon: <Settings size={18} />, requiredPermission: 'roles:manage' },
];

/**
 * Navegación de rutas de nivel superior (US-023). Desde `TK-121-FE` cada pestaña se
 * muestra según el **permiso** que la habilita, no según el rol — así un rol
 * personalizado con `reports:view` ve Reportes sin necesidad de llamarse `ADMIN`.
 */
export const AppNav: React.FC = () => {
  const { has } = usePermissions();
  const visible = NAV_ITEMS.filter((item) => !item.requiredPermission || has(item.requiredPermission));

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
