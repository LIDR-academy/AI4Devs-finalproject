import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../ui';
import { LanguageSwitcher } from '../LanguageSwitcher';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { authenticated, login, logout } = useAuth();
  const { t } = useTranslation('common');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = useMemo(() => [
    { path: '/', label: t('nav.home') },
    { path: '/trips', label: t('nav.trips'), requiresAuth: true },
    { path: '/matches', label: t('nav.search'), requiresAuth: true },
    { path: '/bookings', label: t('nav.bookings'), requiresAuth: true },
    { path: '/history', label: t('nav.history'), requiresAuth: true },
  ], [t]);
  
  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y menú desktop */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-3 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <img 
                src="/logo.png" 
                alt="bonÀreaGo" 
                className="h-10 w-auto transition-transform duration-200 group-hover:scale-105"
              />
              <span className="text-xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors duration-200">
                bonÀreaGo
              </span>
            </Link>
            
            {/* Menú Desktop */}
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => {
                if (item.requiresAuth && !authenticated) {
                  return null;
                }
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActivePath(item.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Botones de autenticación (desktop) y botón hamburger */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            
            {/* Botones de autenticación - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {authenticated ? (
                <>
                  <Link
                    to="/me"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActivePath('/me')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {t('nav.profile')}
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={logout}
                  >
                    {t('actions.logout')}
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={login}
                >
                  {t('actions.login')}
                </Button>
              )}
            </div>

            {/* Botón Hamburger - Mobile */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">{t('actions.openMenu')}</span>
              {mobileMenuOpen ? (
                // Icono X
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Icono hamburger
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              if (item.requiresAuth && !authenticated) {
                return null;
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            
            {/* Language Switcher - Mobile */}
            <div className="px-3 py-2">
              <LanguageSwitcher />
            </div>
            
            {/* Perfil y autenticación en móvil */}
            {authenticated && (
              <Link
                to="/me"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/me')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.profile')}
              </Link>
            )}
            
            <div className="px-3 py-2">
              {authenticated ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  {t('actions.logout')}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    login();
                    setMobileMenuOpen(false);
                  }}
                >
                  {t('actions.login')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
