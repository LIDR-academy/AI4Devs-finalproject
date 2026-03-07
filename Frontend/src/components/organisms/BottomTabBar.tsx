import { Link, useLocation } from 'react-router-dom';
import { Home, Map, User } from 'lucide-react';

/**
 * BottomTabBar organism component
 * Fixed bottom navigation bar with 3 items (Home, Viajes, Perfil)
 * Follows Design System Guide: fixed bottom-0, z-50, 3 items
 *
 * Note: FAB has been removed according to UI_FLOW_DESIGN.md
 * The "Nuevo Gasto" button is now integrated in the TripDetailPage expenses tab
 */
export const BottomTabBar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto">
        {/* Grid with 3 equal columns for symmetric distribution */}
        <div className="grid grid-cols-3 items-center h-16 px-2">
          {/* Home - Column 1 */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 rounded-lg p-1 ${
              isActive('/') ? 'text-violet-600' : 'text-slate-400'
            }`}
          >
            <Home size={24} />
            <span className="text-xs font-medium">Inicio</span>
          </Link>

          {/* Mis Viajes - Column 2 */}
          <Link
            to="/trips"
            className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 rounded-lg p-1 ${
              isActive('/trips') ? 'text-violet-600' : 'text-slate-400'
            }`}
          >
            <Map size={24} />
            <span className="text-xs font-medium">Viajes</span>
          </Link>

          {/* Perfil - Column 3 */}
          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 rounded-lg p-1 ${
              isActive('/profile') ? 'text-violet-600' : 'text-slate-400'
            }`}
          >
            <User size={24} />
            <span className="text-xs font-medium">Perfil</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
