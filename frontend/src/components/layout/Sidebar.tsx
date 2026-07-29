import { useEffect, useId, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { APP_NAV_ITEMS } from '../../config/navigation';
import { SidebarItem } from '../ui';
import './Sidebar.css';

export function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navId = useId();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('app-nav-open');

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('app-nav-open');
    };
  }, [menuOpen]);

  return (
    <aside className={`app-sidebar${menuOpen ? ' app-sidebar--open' : ''}`}>
      <div className="app-sidebar__topbar">
        <p className="app-sidebar__brand">Reading Analytics</p>
        <button
          type="button"
          className="app-sidebar__menu-toggle"
          aria-expanded={menuOpen}
          aria-controls={navId}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="app-sidebar__menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {menuOpen ? (
        <button
          type="button"
          className="app-sidebar__backdrop"
          aria-label="Cerrar menú"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <nav id={navId} className="app-sidebar__nav" aria-label="Navegación principal">
        {APP_NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            label={item.label}
            end={item.end}
          />
        ))}
      </nav>
    </aside>
  );
}
