import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MercadoPagoCheckout, PaymentStatus } from '../../components/payments';
import { usePayments } from '../../hooks/usePayments';
import { useOrders } from '../../hooks/useOrders';
import Layout from '../../components/layout/Layout';

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const { loading: paymentLoading, error: paymentError } = usePayments();
  const { currentOrder, loading: orderLoading, error: orderError, fetchOrderById } = useOrders();
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    if (orderId && typeof orderId === 'string') {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);

  const handlePaymentSuccess = () => {
    setPaymentCompleted(true);
    // Redirect to order details after a short delay
    setTimeout(() => {
      router.push(`/orders/${orderId}`);
    }, 3000);
  };

  const handlePaymentFailure = (error: string) => {
    console.error('Payment failed:', error);
  };

  const handlePaymentPending = () => {
    // Refresh order data
    if (orderId && typeof orderId === 'string') {
      fetchOrderById(orderId);
    }
  };

  if (orderLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Loading order information...</p>
        </div>
      </Layout>
    );
  }

  if (orderError || !orderId) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="mt-2 text-red-700">{orderError || 'Invalid order ID'}</p>
            <button
              onClick={() => router.push('/orders')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentOrder) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-yellow-800">Order Not Found</h3>
            <p className="mt-2 text-yellow-700">The order you're looking for could not be found.</p>
            <button
              onClick={() => router.push('/orders')}
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // If payment is already completed, show success message
  if (currentOrder.paymentDetails.paymentStatus === 'completed' || paymentCompleted) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 border border-green-200 rounded-md p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-green-800">Payment Successful</h3>
            <p className="mt-2 text-green-700">Your payment has been processed successfully!</p>
            <p className="mt-1 text-green-600">You will be redirected to your order details shortly.</p>
            <button
              onClick={() => router.push(`/orders/${orderId}`)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              View Order Details
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Payment</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentOrder._id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="mt-1 text-sm text-gray-900">${currentOrder.paymentDetails.amount.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Recipient</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentOrder.voucher.receiver_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Product</dt>
                <dd className="mt-1 text-sm text-gray-900">Gift Voucher</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Payment Status</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <PaymentStatus 
              orderId={orderId as string} 
              onStatusChange={(status) => {
                if (status === 'completed') {
                  handlePaymentSuccess();
                }
              }}
            />
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Payment Method</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {currentOrder.paymentDetails.provider === 'mercadopago' ? (
              <MercadoPagoCheckout
                orderId={orderId as string}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                onPending={handlePaymentPending}
              />
            ) : (
              <div className="text-gray-600">
                <p>Please select a payment method:</p>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      // Update order to use Mercado Pago
                      if (orderId && typeof orderId === 'string') {
                        // This would typically update the order's payment provider
                        router.reload();
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Pay with Mercado Pago
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage; 