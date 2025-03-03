import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface MercadoPagoCheckoutProps {
  orderId: string;
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
  onPending?: () => void;
}

const MercadoPagoCheckout: React.FC<MercadoPagoCheckoutProps> = ({
  orderId,
  onSuccess,
  onFailure,
  onPending
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    const createCheckout = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.post(`/payments/mercadopago/create/${orderId}`);
        
        if (response.data.success) {
          setCheckoutUrl(response.data.data.checkoutUrl);
        } else {
          throw new Error(response.data.error || 'Failed to create checkout');
        }
      } catch (err: any) {
        console.error('Error creating Mercado Pago checkout:', err);
        setError(err.message || 'Failed to create checkout');
        if (onFailure) {
          onFailure(err.message || 'Failed to create checkout');
        }
      } finally {
        setLoading(false);
      }
    };
    
    createCheckout();
  }, [orderId, onFailure]);

  // Handle URL parameters when returning from Mercado Pago
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    
    if (status) {
      switch (status) {
        case 'approved':
          if (onSuccess) onSuccess();
          break;
        case 'pending':
          if (onPending) onPending();
          break;
        case 'failure':
          if (onFailure) onFailure('Payment failed');
          break;
        default:
          break;
      }
    }
  }, [onSuccess, onFailure, onPending]);

  // Function to check payment status
  const checkPaymentStatus = async () => {
    try {
      const response = await api.get(`/payments/status/${orderId}`);
      
      if (response.data.success) {
        const { paymentStatus } = response.data.data;
        
        switch (paymentStatus) {
          case 'completed':
            if (onSuccess) onSuccess();
            break;
          case 'pending':
            if (onPending) onPending();
            break;
          case 'failed':
            if (onFailure) onFailure('Payment failed');
            break;
          default:
            break;
        }
      }
    } catch (err: any) {
      console.error('Error checking payment status:', err);
    }
  };

  // Poll for payment status updates
  useEffect(() => {
    if (!loading && !error && checkoutUrl) {
      const interval = setInterval(checkPaymentStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [loading, error, checkoutUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-gray-600">Preparing checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6">
        <h3 className="text-lg font-medium text-red-800">Payment Error</h3>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Complete Your Payment</h2>
      <p className="text-gray-600 mb-6">You'll be redirected to Mercado Pago to complete your payment securely.</p>
      
      {checkoutUrl ? (
        <div className="flex flex-col items-center">
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Pay with Mercado Pago
          </a>
          <p className="mt-4 text-sm text-gray-500">
            If you're not redirected automatically, please click the button above.
          </p>
        </div>
      ) : (
        <p className="text-red-600">Unable to generate checkout link. Please try again.</p>
      )}
    </div>
  );
};

export default MercadoPagoCheckout; 