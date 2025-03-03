import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface PaymentStatusProps {
  orderId: string;
  onStatusChange?: (status: 'pending' | 'completed' | 'failed') => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ orderId, onStatusChange }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/payments/status/${orderId}`);
      
      if (response.data.success) {
        const { paymentStatus: status, paymentDetails } = response.data.data;
        setPaymentStatus(status);
        setPaymentDetails(paymentDetails);
        
        if (onStatusChange) {
          onStatusChange(status);
        }
      } else {
        throw new Error(response.data.error || 'Failed to fetch payment status');
      }
    } catch (err: any) {
      console.error('Error fetching payment status:', err);
      setError(err.message || 'Failed to fetch payment status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
    
    // Poll for status updates every 5 seconds
    const interval = setInterval(fetchPaymentStatus, 5000);
    
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading && !paymentStatus) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mr-2"></div>
        <p className="text-gray-600">Checking payment status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchPaymentStatus}
          className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center mb-2">
        <h3 className="text-lg font-medium text-gray-800 mr-2">Payment Status:</h3>
        {paymentStatus === 'completed' && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md">
            Completed
          </span>
        )}
        {paymentStatus === 'pending' && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-md">
            Pending
          </span>
        )}
        {paymentStatus === 'failed' && (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-md">
            Failed
          </span>
        )}
      </div>
      
      {paymentStatus === 'pending' && (
        <div className="mt-2">
          <p className="text-gray-600">Your payment is being processed. This page will update automatically when the payment is complete.</p>
          <button
            onClick={fetchPaymentStatus}
            className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Check Status
          </button>
        </div>
      )}
      
      {paymentStatus === 'failed' && (
        <div className="mt-2">
          <p className="text-red-600">Your payment was not successful. Please try again or contact support.</p>
        </div>
      )}
      
      {paymentStatus === 'completed' && (
        <div className="mt-2">
          <p className="text-green-600">Your payment was successful! Your voucher is now active.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus; 