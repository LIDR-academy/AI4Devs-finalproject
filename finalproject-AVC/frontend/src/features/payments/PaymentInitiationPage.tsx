import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentsApi } from '../../api/paymentsApi';
import { reservationsApi } from '../../api/reservationsApi';
import { Reservation } from '../../shared/types';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/components/ToastContext';

export const PaymentInitiationPage: React.FC = () => {
    const { reservationId } = useParams<{ reservationId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchReservation = async () => {
            if (!reservationId) {
                navigate('/reservations');
                return;
            }

            try {
                // Get all user reservations and find the one we need
                const reservations = await reservationsApi.getMyReservations();
                const foundReservation = reservations.find((r) => r.id === reservationId);

                if (!foundReservation) {
                    showToast('Reserva no encontrada', 'error');
                    navigate('/reservations');
                    return;
                }

                if (foundReservation.status !== 'CREATED') {
                    showToast('Esta reserva ya ha sido pagada', 'info');
                    navigate('/reservations');
                    return;
                }

                setReservation(foundReservation);
            } catch (error: any) {
                showToast(
                    error.response?.data?.message || 'Error al cargar la reserva',
                    'error'
                );
                navigate('/reservations');
            } finally {
                setLoading(false);
            }
        };

        fetchReservation();
    }, [reservationId, navigate, showToast]);

    const handleInitiatePayment = async () => {
        if (!reservationId) return;

        setProcessing(true);
        try {
            const payment = await paymentsApi.initiatePayment(reservationId);

            showToast('Redirigiendo a la pasarela de pago...', 'info');

            // Redirect to mock payment gateway
            setTimeout(() => {
                window.location.href = payment.paymentUrl;
            }, 1000);
        } catch (error: any) {
            showToast(
                error.response?.data?.message || 'Error al iniciar el pago',
                'error'
            );
            setProcessing(false);
        }
    };

    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return {
            date: date.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }),
            time: date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }),
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!reservation) {
        return null;
    }

    const start = formatDateTime(reservation.startTime);
    const end = formatDateTime(reservation.endTime);
    const amount = 50.0; // Fixed amount for Phase 0

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="card">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Pagar Reserva</h1>

                {/* Reservation Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Resumen de la Reserva</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Cancha:</span>
                            <span className="font-medium text-gray-900">{reservation.court.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Fecha:</span>
                            <span className="font-medium text-gray-900 capitalize">{start.date}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Horario:</span>
                            <span className="font-medium text-gray-900">
                                {start.time} - {end.time}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="border-t border-b border-gray-200 py-4 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total a pagar:</span>
                        <span className="text-2xl font-bold text-primary-600">${amount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                        <strong>Pago seguro:</strong> Serás redirigido a nuestra pasarela de pago segura.
                        Una vez completado el pago, tu reserva será confirmada automáticamente.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/reservations')}
                        disabled={processing}
                        className="btn-secondary flex-1"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleInitiatePayment}
                        disabled={processing}
                        className="btn-primary flex-1 flex items-center justify-center"
                    >
                        {processing ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">Procesando...</span>
                            </>
                        ) : (
                            'Proceder al Pago'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
