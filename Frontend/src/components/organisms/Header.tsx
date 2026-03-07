import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../atoms/Button';
import { useAuthContext } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

interface HeaderProps {
  /**
   * Show navigation actions (default: true)
   * When false, only title is displayed
   */
  showActions?: boolean;
  /**
   * Custom title (default: "TravelSplit")
   * Displays as header title text
   */
  title?: string;
  /**
   * Custom actions to render
   * Replaces default navigation actions when provided
   */
  actions?: ReactNode;
  /**
   * Show back button (default: false)
   * When true, displays back arrow button on the left
   */
  showBackButton?: boolean;
  /**
   * Callback function for back button click
   * If not provided, uses navigate(-1) as default
   */
  onBack?: () => void;
}

/**
 * Header organism component
 * Complex component combining multiple molecules and atoms
 * Follows Design System Guide: pattern [←] Título [Acciones]
 *
 * @param {HeaderProps} props - Component props
 * @param {boolean} props.showActions - Show navigation actions (default: true)
 * @param {string} props.title - Custom title (default: "TravelSplit")
 * @param {ReactNode} props.actions - Custom actions to render
 * @param {boolean} props.showBackButton - Show back button (default: false)
 * @param {() => void} props.onBack - Callback for back button click
 *
 * Variants:
 * - Simple: Only title (for HomePage not authenticated)
 * - With back button: [←] Título [Acciones]
 * - With actions: Title + navigation actions (default)
 *
 * UX/UI: Muestra diferentes acciones según el estado de autenticación:
 * - No autenticado: Botón "Iniciar Sesión"
 * - Autenticado: Nombre del usuario y botón "Cerrar Sesión"
 */
export const Header = ({
  showActions = true,
  title = 'TravelSplit',
  actions,
  showBackButton = false,
  onBack,
}: HeaderProps) => {
  const { isAuthenticated, user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const defaultActions = isAuthenticated ? (
    <nav className="flex items-center gap-4" aria-label="Main navigation">
      {!isHomePage && (
        <Link
          to="/"
          className="text-slate-700 hover:text-slate-900 active:text-slate-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 transition-colors transition-transform rounded-lg px-2 py-1"
        >
          Inicio
        </Link>
      )}
      {user && <span className="text-slate-700 text-sm font-medium">{user.nombre}</span>}
      <Button variant="secondary" size="sm" onClick={handleLogout}>
        Cerrar Sesión
      </Button>
    </nav>
  ) : (
    <nav className="flex items-center gap-4" aria-label="Main navigation">
      {!isHomePage && (
        <Link
          to="/"
          className="text-slate-700 hover:text-slate-900 active:text-slate-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 transition-colors transition-transform rounded-lg px-2 py-1"
        >
          Inicio
        </Link>
      )}
      <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
        Iniciar Sesión
      </Button>
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 bg-white shadow border-b border-slate-200">
      <div className="w-full px-6">
        <div className="h-16 flex items-center gap-4">
          {showBackButton && (
            <button
              type="button"
              onClick={handleBack}
              className="p-2 -ml-2 text-slate-700 hover:text-slate-900 active:text-slate-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 rounded-lg transition-colors transition-transform"
              aria-label="Volver"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-heading font-semibold text-slate-900 flex-1">
            {title}
          </h1>
          {showActions && (actions || defaultActions)}
        </div>
      </div>
    </header>
  );
};
