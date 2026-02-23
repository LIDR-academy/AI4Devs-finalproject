import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const HomePage: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">Bienvenido a SC Padel Club</h1>
                <p className="text-xl text-gray-600 mb-8">
                    Reserva tu cancha de pádel de forma rápida y sencilla
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/courts" className="btn-primary text-lg px-8 py-3">
                        Ver Canchas Disponibles
                    </Link>
                    {isAuthenticated && (
                        <Link to="/reservations" className="btn-secondary text-lg px-8 py-3">
                            Mis Reservas
                        </Link>
                    )}
                </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
                <div className="card text-center">
                    <div className="text-4xl mb-4">🎾</div>
                    <h3 className="text-xl font-semibold mb-2">Canchas de Calidad</h3>
                    <p className="text-gray-600">Canchas profesionales en excelente estado</p>
                </div>

                <div className="card text-center">
                    <div className="text-4xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold mb-2">Reserva Online</h3>
                    <p className="text-gray-600">Sistema de reservas disponible 24/7</p>
                </div>

                <div className="card text-center">
                    <div className="text-4xl mb-4">💳</div>
                    <h3 className="text-xl font-semibold mb-2">Pago Seguro</h3>
                    <p className="text-gray-600">Procesa tus pagos de forma segura</p>
                </div>
            </div>

            {/* How it works */}
            <div className="mt-16">
                <h2 className="text-3xl font-bold text-center mb-8">¿Cómo funciona?</h2>
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                            1
                        </div>
                        <h4 className="font-semibold mb-2">Inicia Sesión</h4>
                        <p className="text-sm text-gray-600">Accede con tu cuenta</p>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                            2
                        </div>
                        <h4 className="font-semibold mb-2">Elige tu Cancha</h4>
                        <p className="text-sm text-gray-600">Selecciona fecha y horario</p>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                            3
                        </div>
                        <h4 className="font-semibold mb-2">Realiza el Pago</h4>
                        <p className="text-sm text-gray-600">Confirma tu reserva</p>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                            4
                        </div>
                        <h4 className="font-semibold mb-2">¡A Jugar!</h4>
                        <p className="text-sm text-gray-600">Disfruta tu partido</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
