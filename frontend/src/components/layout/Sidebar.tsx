import { APP_NAV_ITEMS } from '../../config/navigation';
import { SidebarItem } from '../ui';
import './Sidebar.css';

export function Sidebar() {
  return (
    <aside className="app-sidebar">
      <p className="app-sidebar__brand">Reading Analytics</p>
      <nav className="app-sidebar__nav" aria-label="Navegación principal">
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
