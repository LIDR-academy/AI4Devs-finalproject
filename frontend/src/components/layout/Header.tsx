import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

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
    <header className="bg-white shadow-sm border-b border-medical-gray-200 h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-medical-primary">SIGQ</h1>
        <span className="ml-2 text-sm text-medical-gray-500">Sistema Integral de Gestión Quirúrgica</span>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-medical-primary flex items-center justify-center text-white font-medium">
                {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="text-sm">
                <div className="font-medium text-medical-gray-900">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email || 'Usuario'}
                </div>
                <div className="text-xs text-medical-gray-500">
                  {user.roles?.[0] || 'Usuario'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="btn btn-outline text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
