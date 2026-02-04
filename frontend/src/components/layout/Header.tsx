import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import NotificationBell from './NotificationBell';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Forzar navegación incluso si hay error
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-gradient-to-r from-medical-primary to-medical-secondary text-white shadow-md h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
          <span className="text-xl font-bold">⚕️</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">SIGQ</h1>
          <span className="text-xs text-white/80">Sistema Integral de Gestión Quirúrgica</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {user && typeof user === 'object' && (
          <>
            <NotificationBell />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold border-2 border-white/30">
                  {(typeof user.firstName === 'string' && user.firstName[0]) ||
                    (typeof user.email === 'string' && user.email[0]?.toUpperCase()) ||
                    'U'}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-white">
                    {typeof user.firstName === 'string' && typeof user.lastName === 'string'
                      ? `${user.firstName} ${user.lastName}`
                      : (typeof user.email === 'string' && user.email) || 'Usuario'}
                  </div>
                  <div className="text-xs text-white/80">
                    {Array.isArray(user.roles) && user.roles[0] ? user.roles[0] : 'Usuario'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/30"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
