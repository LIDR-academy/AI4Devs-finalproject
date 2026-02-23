import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

export const MockPaymentGatewayPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);

    const paymentId = searchParams.get('paymentId');
    const amount = searchParams.get('amount') || '50.00';

    useEffect(() => {
        if (!paymentId) {
            navigate('/reservations');
        }
    }, [paymentId, navigate]);

    const handlePaymentSuccess = () => {
        setProcessing(true);
        // Simulate payment processing delay
        setTimeout(() => {
            navigate(`/payments/${paymentId}/confirm`);
        }, 2000);
    };

    const handlePaymentFailure = () => {
        setProcessing(true);
        // Simulate processing delay
        setTimeout(() => {
            navigate('/reservations', {
                state: { paymentFailed: true },
            });
        }, 1500);
    };

    if (!paymentId) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                {/* Mock Gateway Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Pasarela de Pago Mock</h1>
                    <p className="text-sm text-gray-600 mt-2">Simulador de pago para desarrollo</p>
                </div>

                {/* Payment Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">ID de Pago:</span>
                        <span className="text-xs font-mono text-gray-900">{paymentId.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-lg font-semibold text-gray-900">Monto:</span>
                        <span className="text-2xl font-bold text-blue-600">${amount}</span>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-xs text-yellow-800">
                        <strong>⚠️ Modo de Desarrollo:</strong> Esta es una pasarela de pago simulada.
                        Puedes simular un pago exitoso o fallido.
                    </p>
                </div>

                {/* Action Buttons */}
                {processing ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <LoadingSpinner size="lg" />
                        <p className="text-sm text-gray-600 mt-4">Procesando pago...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <button
                            onClick={handlePaymentSuccess}
                            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                            ✓ Simular Pago Exitoso
                        </button>
                        <button
                            onClick={handlePaymentFailure}
                            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                        >
                            ✗ Simular Pago Fallido
                        </button>
                    </div>
                )}

                {/* Footer */}
                <p className="text-xs text-center text-gray-500 mt-6">
                    SC Padel Club - Entorno de Desarrollo
                </p>
            </div>
        </div>
    );
};
