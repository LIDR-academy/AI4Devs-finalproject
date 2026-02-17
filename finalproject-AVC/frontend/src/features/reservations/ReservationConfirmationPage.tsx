import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { reservationsApi } from '../../api/reservationsApi';
import { useToast } from '../../shared/components/ToastContext';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

interface LocationState {
    courtId: string;
    courtName: string;
    startTime: string;
    endTime: string;
}

export const ReservationConfirmationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const state = location.state as LocationState;

    // Redirect if no state
    if (!state || !state.courtId) {
        navigate('/courts');
        return null;
    }

    const { courtId, courtName, startTime, endTime } = state;

    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return {
            date: date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
            time: date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }),
        };
    };

    const start = formatDateTime(startTime);
    const end = formatDateTime(endTime);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const reservation = await reservationsApi.createReservation({
                courtId,
                startTime,
                endTime,
            });

            showToast('¡Reserva creada exitosamente!', 'success');

            // Navigate to my reservations
            navigate('/reservations', { replace: true });
        } catch (error: any) {
            if (error.response?.status === 409) {
                showToast('Este horario ya no está disponible', 'error');
            } else {
                showToast(
                    error.response?.data?.message || 'Error al crear la reserva',
                    'error'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="card">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Confirmar Reserva</h1>

                <div className="space-y-4 mb-8">
                    {/* Court Info */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">Cancha:</span>
                        <span className="font-semibold text-gray-900">{courtName}</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">Fecha:</span>
                        <span className="font-semibold text-gray-900 capitalize">{start.date}</span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">Horario:</span>
                        <span className="font-semibold text-gray-900">
                            {start.time} - {end.time}
                        </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600">Estado inicial:</span>
                        <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
                            Pendiente de pago
                        </span>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                        <strong>Importante:</strong> Tu reserva se creará con estado "Pendiente de pago".
                        Deberás completar el pago para confirmarla.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="btn-secondary flex-1"
                        data-testid="cancel-reservation-button"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="btn-primary flex-1 flex items-center justify-center"
                        data-testid="confirm-reservation-button"
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">Creando...</span>
                            </>
                        ) : (
                            'Confirmar Reserva'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
