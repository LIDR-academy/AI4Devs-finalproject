/**
 * AppHeader
 *
 * Application header shown to authenticated users.
 * Displays the user's name, profile photo and a "Logout" button.
 *
 * When the user clicks "Logout":
 *   1. authStore.logout() is called (clears local session + notifies backend — C4)
 *   2. The user is redirected to /login
 *
 * Note: This component only renders when a session is active (AuthGuard ensures this).
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@state/authStore';

export function AppHeader() {
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  if (!session) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const initials = session.nombre
    ? session.nombre
        .split(' ')
        .slice(0, 2)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <header className="app-header">
      {/* Brand */}
      <div className="app-header__brand">
        <span className="app-header__brand-icon">☯️</span>
        <span className="app-header__brand-quote">
          <em>“The quieter you become, the more you can hear.”</em>
          <span className="app-header__brand-author">— Ram Dass</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="app-header__nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `app-header__nav-link${isActive ? ' app-header__nav-link--active' : ''}`
          }
        >
          Create Meditation
        </NavLink>
        <NavLink
          to="/library"
          className={({ isActive }) =>
            `app-header__nav-link${isActive ? ' app-header__nav-link--active' : ''}`
          }
        >
          Library
        </NavLink>
      </nav>

      {/* User section */}
      <div className="app-header__user">
        <div className="app-header__avatar-wrap">
          {session.foto ? (
            <img
              className="app-header__avatar"
              src={session.foto}
              alt={`Foto de perfil de ${session.nombre}`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="app-header__avatar-initials">{initials}</span>
          )}
        </div>
        <span className="app-header__name" data-testid="header-user-name">
          {session.nombre}
        </span>
        <div className="app-header__divider" />
        <button
          className="app-header__logout"
          onClick={handleLogout}
          data-testid="header-logout-button"
          title="Cerrar sesión"
        >
          <svg
            className="app-header__logout-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}
