import React, { useState, useEffect } from 'react';
import { reservationsApi } from '../../api/reservationsApi';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

interface ReservationWithUser {
    id: string;
    courtId: string;
    userId: string;
    startTime: string;
    endTime: string;
    status: 'CREATED' | 'CONFIRMED';
    createdAt: string;
    court: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        email: string;
        role: string;
    };
}

export const ReservationsManagementPage: React.FC = () => {
    const [reservations, setReservations] = useState<ReservationWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await reservationsApi.getAllReservations();
            setReservations(data as ReservationWithUser[]);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar reservas');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            CREATED: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-green-100 text-green-800',
        };

        const labels = {
            CREATED: 'Creada',
            CONFIRMED: 'Confirmada',
        };

        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const getUserName = (user: ReservationWithUser['user']) => {
        return user.email;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
                <button onClick={loadReservations} className="btn-secondary" disabled={loading}>
                    {loading ? 'Cargando...' : 'Actualizar'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <LoadingSpinner />
                </div>
            ) : reservations.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-600 text-lg mb-2">No hay reservas en el sistema</p>
                    <p className="text-gray-500">Cuando los jugadores realicen reservas, aparecerán aquí.</p>
                </div>
            ) : (
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">
                        Todas las Reservas ({reservations.length})
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cancha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Horario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reservations.map((reservation) => (
                                    <tr key={reservation.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {getUserName(reservation.user)}
                                            </div>
                                            <div className="text-sm text-gray-500">{reservation.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{reservation.court.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatDate(reservation.startTime)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(reservation.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
