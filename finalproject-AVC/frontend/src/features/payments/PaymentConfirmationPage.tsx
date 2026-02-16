import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentsApi } from '../../api/paymentsApi';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/components/ToastContext';

export const PaymentConfirmationPage: React.FC = () => {
    const { paymentId } = useParams<{ paymentId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [confirming, setConfirming] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const confirmPayment = async () => {
            if (!paymentId) {
                navigate('/reservations');
                return;
            }

            try {
                const result = await paymentsApi.confirmPayment(paymentId);

                // Payment confirmed successfully
                setSuccess(true);
                showToast('¡Pago confirmado! Tu reserva está lista.', 'success');

                // Redirect to reservations after 3 seconds
                setTimeout(() => {
                    navigate('/reservations', { replace: true });
                }, 3000);
            } catch (error: any) {
                showToast(
                    error.response?.data?.message || 'Error al confirmar el pago',
                    'error'
                );

                // Redirect to reservations after error
                setTimeout(() => {
                    navigate('/reservations', { replace: true });
                }, 2000);
            } finally {
                setConfirming(false);
            }
        };

        confirmPayment();
    }, [paymentId, navigate, showToast]);

    if (confirming) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-lg text-gray-600 mt-4">Confirmando tu pago...</p>
                    <p className="text-sm text-gray-500 mt-2">Por favor espera un momento</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full mx-4">
                    <div className="card text-center">
                        {/* Success Icon */}
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                className="w-10 h-10 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>

                        {/* Success Message */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Confirmado!</h1>
                        <p className="text-gray-600 mb-6">
                            Tu reserva ha sido confirmada exitosamente. Recibirás un correo de confirmación en breve.
                        </p>

                        {/* Details */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-green-800">
                                <strong>Estado:</strong> Reserva confirmada
                            </p>
                            <p className="text-sm text-green-800 mt-1">
                                <strong>Pago:</strong> Procesado exitosamente
                            </p>
                        </div>

                        {/* Redirect Info */}
                        <p className="text-sm text-gray-500">
                            Serás redirigido a tus reservas en unos segundos...
                        </p>

                        {/* Manual Navigation */}
                        <button
                            onClick={() => navigate('/reservations', { replace: true })}
                            className="btn-primary w-full mt-4"
                        >
                            Ver Mis Reservas
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
