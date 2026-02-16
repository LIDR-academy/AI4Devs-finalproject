import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export const Navbar: React.FC = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-primary-600">SC Padel Club</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        <Link to="/courts" className="text-gray-700 hover:text-primary-600 transition-colors">
                            Canchas
                        </Link>

                        {isAuthenticated && (
                            <>
                                <Link
                                    to="/reservations"
                                    className="text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    Mis Reservas
                                </Link>

                                {isAdmin && (
                                    <Link
                                        to="/admin/users"
                                        className="text-gray-700 hover:text-primary-600 transition-colors"
                                    >
                                        Usuarios
                                    </Link>
                                )}

                                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-300">
                                    <span className="text-sm text-gray-600">
                                        {user?.email}
                                        {isAdmin && (
                                            <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded">
                                                Admin
                                            </span>
                                        )}
                                    </span>
                                    <button onClick={handleLogout} className="btn-secondary text-sm">
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </>
                        )}

                        {!isAuthenticated && (
                            <Link to="/login" className="btn-primary">
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
