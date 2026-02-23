import React from 'react';
import { Reservation } from '../../../shared/types';

interface ReservationCardProps {
    reservation: Reservation;
    onPayClick?: (reservationId: string) => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onPayClick }) => {
    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return {
            date: date.toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }),
            time: date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }),
        };
    };

    const start = formatDateTime(reservation.startTime);
    const end = formatDateTime(reservation.endTime);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'CREATED':
                return (
                    <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Pendiente de pago
                    </span>
                );
            case 'CONFIRMED':
                return (
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Confirmada
                    </span>
                );
            case 'CANCELLED':
                return (
                    <span className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Cancelada
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        {status}
                    </span>
                );
        }
    };

    const isPending = reservation.status === 'CREATED';

    return (
        <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{reservation.court.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{start.date}</p>
                </div>
                {getStatusBadge(reservation.status)}
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                    <span className="text-gray-600 w-20">Horario:</span>
                    <span className="font-medium text-gray-900">
                        {start.time} - {end.time}
                    </span>
                </div>
                <div className="flex items-center text-sm">
                    <span className="text-gray-600 w-20">ID:</span>
                    <span className="font-mono text-xs text-gray-500">{reservation.id.slice(0, 8)}...</span>
                </div>
            </div>

            {isPending && onPayClick && (
                <div className="pt-4 border-t border-gray-200">
                    <button
                        onClick={() => onPayClick(reservation.id)}
                        className="btn-primary w-full"
                    >
                        Pagar Ahora
                    </button>
                </div>
            )}
        </div>
    );
};
