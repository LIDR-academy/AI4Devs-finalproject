import { useState, useCallback } from 'react';
import api from '../services/api';

interface PaymentStatus {
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentDetails?: any;
}

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  // Create a Mercado Pago checkout for an order
  const createMercadoPagoCheckout = useCallback(async (orderId: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(`/payments/mercadopago/create/${orderId}`);
      
      if (response.data.success) {
        const { checkoutUrl, preferenceId } = response.data.data;
        setCheckoutUrl(checkoutUrl);
        setPreferenceId(preferenceId);
        return checkoutUrl;
      } else {
        throw new Error(response.data.error || 'Failed to create checkout');
      }
    } catch (err: any) {
      console.error('Error creating Mercado Pago checkout:', err);
      setError(err.message || 'Failed to create checkout');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get payment status for an order
  const getPaymentStatus = useCallback(async (orderId: string): Promise<PaymentStatus | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/payments/status/${orderId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to get payment status');
      }
    } catch (err: any) {
      console.error('Error getting payment status:', err);
      setError(err.message || 'Failed to get payment status');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update order payment details
  const updateOrderPayment = useCallback(async (
    orderId: string,
    paymentDetails: {
      paymentId?: string;
      paymentStatus?: 'pending' | 'completed' | 'failed';
      paymentEmail?: string;
      amount?: number;
      provider?: 'mercadopago' | 'paypal' | 'stripe';
    }
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/orders/${orderId}`, {
        paymentDetails
      });
      
      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to update payment details');
      }
    } catch (err: any) {
      console.error('Error updating payment details:', err);
      setError(err.message || 'Failed to update payment details');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    checkoutUrl,
    preferenceId,
    createMercadoPagoCheckout,
    getPaymentStatus,
    updateOrderPayment
  };
}; 