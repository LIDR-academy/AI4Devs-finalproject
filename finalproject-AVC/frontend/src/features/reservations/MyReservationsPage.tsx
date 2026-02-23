import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationsApi } from '../../api/reservationsApi';
import { Reservation } from '../../shared/types';
import { ReservationCard } from './components/ReservationCard';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/components/ToastContext';

export const MyReservationsPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const data = await reservationsApi.getMyReservations();
                setReservations(data);
            } catch (error: any) {
                showToast(
                    error.response?.data?.message || 'Error al cargar las reservas',
                    'error'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [showToast]);

    const handlePayClick = (reservationId: string) => {
        // Navigate to payment page (will implement in next tickets)
        navigate(`/payments/initiate/${reservationId}`);
    };

    const filteredReservations = reservations.filter((reservation) => {
        if (filter === 'all') return true;
        if (filter === 'pending') return reservation.status === 'CREATED';
        if (filter === 'confirmed') return reservation.status === 'CONFIRMED';
        return true;
    });

    const pendingCount = reservations.filter((r) => r.status === 'CREATED').length;
    const confirmedCount = reservations.filter((r) => r.status === 'CONFIRMED').length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Reservas</h1>
                <p className="text-gray-600">Gestiona tus reservas de canchas</p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${filter === 'all'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Todas ({reservations.length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${filter === 'pending'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Pendientes ({pendingCount})
                    </button>
                    <button
                        onClick={() => setFilter('confirmed')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${filter === 'confirmed'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Confirmadas ({confirmedCount})
                    </button>
                </nav>
            </div>

            {/* Reservations Grid */}
            {filteredReservations.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">
                        {filter === 'all'
                            ? 'No tienes reservas aún'
                            : filter === 'pending'
                                ? 'No tienes reservas pendientes'
                                : 'No tienes reservas confirmadas'}
                    </p>
                    <button onClick={() => navigate('/courts')} className="btn-primary">
                        Reservar una Cancha
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReservations.map((reservation) => (
                        <ReservationCard
                            key={reservation.id}
                            reservation={reservation}
                            onPayClick={handlePayClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
