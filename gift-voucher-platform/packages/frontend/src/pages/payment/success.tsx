import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOrders } from '../../hooks/useOrders';
import { usePayments } from '../../hooks/usePayments';
import Link from 'next/link';

const PaymentSuccessPage: React.FC = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const { updateOrderPayment } = usePayments();
  const { fetchOrderById, currentOrder } = useOrders();

  useEffect(() => {
    if (orderId && typeof orderId === 'string') {
      // Fetch the order details
      fetchOrderById(orderId);
      
      // Update the order payment status to completed
      updateOrderPayment(orderId, {
        paymentStatus: 'completed'
      });
    }
  }, [orderId, fetchOrderById, updateOrderPayment]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-medium text-gray-900">Payment Successful!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your payment has been processed successfully. Your gift voucher is now active.
            </p>
            
            {currentOrder && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Order ID:</span> {currentOrder._id}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Amount:</span> ${currentOrder.paymentDetails.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Voucher Code:</span> {currentOrder.voucher.code}
                </p>
              </div>
            )}
            
            <div className="mt-6 flex flex-col space-y-2">
              {orderId && (
                <Link href={`/orders/${orderId}`}>
                  <a className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    View Order Details
                  </a>
                </Link>
              )}
              <Link href="/">
                <a className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Return to Home
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 