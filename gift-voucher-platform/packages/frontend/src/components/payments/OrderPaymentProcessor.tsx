import React, { useState } from 'react';
import { usePayments } from '../../hooks/usePayments';
import { CreateOrderData } from '../../hooks/useOrders';
import api from '../../services/api';

interface OrderPaymentProcessorProps {
  formData: Omit<CreateOrderData, 'paymentDetails'>;
  onPaymentComplete: (orderId: string, paymentDetails: any) => void;
  onPaymentError: (error: string) => void;
}

const OrderPaymentProcessor: React.FC<OrderPaymentProcessorProps> = ({
  formData,
  onPaymentComplete,
  onPaymentError
}) => {
  const { loading, error, createMercadoPagoCheckout } = usePayments();
  const [tempOrderId, setTempOrderId] = useState<string | null>(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  // Create a temporary order and initiate payment
  const handleInitiatePayment = async () => {
    try {
      setProcessingOrder(true);
      
      // Validate required fields
      if (!formData.customerId || 
          !formData.voucher.storeId || 
          !formData.voucher.productId ||
          !formData.voucher.sender_name ||
          !formData.voucher.sender_email ||
          !formData.voucher.receiver_name ||
          !formData.voucher.receiver_email ||
          !formData.voucher.message) {
        throw new Error("Missing required fields");
      }
      
      // Fetch product details to get the price
      let productPrice = 0;
      try {
        const productResponse = await api.get(`/products/${formData.voucher.productId}`);
        if (productResponse.data.success) {
          productPrice = productResponse.data.data.price;
        } else {
          throw new Error('Failed to fetch product price');
        }
      } catch (err) {
        console.error('Error fetching product price:', err);
        throw new Error('Failed to fetch product price');
      }
      
      // Ensure we have a valid price
      if (!productPrice || productPrice <= 0) {
        throw new Error('Invalid product price');
      }
      
      // Create a temporary order with pending payment status
      const tempOrderData = {
        ...formData,
        paymentDetails: {
          paymentId: 'temp_' + Date.now(),
          paymentStatus: 'pending',
          paymentEmail: formData.voucher.sender_email, // Use sender email as default payment email
          amount: productPrice, // Set the correct product price
          provider: 'mercadopago'
        }
      };
      
      // Create the temporary order
      const response = await api.post('/orders', tempOrderData);
      
      if (response.data.success) {
        const orderId = response.data.data._id;
        setTempOrderId(orderId);
        
        // Create Mercado Pago checkout for the order
        const checkoutUrl = await createMercadoPagoCheckout(orderId);
        
        if (checkoutUrl) {
          // Redirect to Mercado Pago checkout
          window.location.href = checkoutUrl;
        } else {
          throw new Error('Failed to create Mercado Pago checkout');
        }
      } else {
        throw new Error(response.data.error || 'Failed to create temporary order');
      }
    } catch (err: any) {
      console.error('Error initiating payment:', err);
      onPaymentError(err.message || 'Failed to initiate payment');
    } finally {
      setProcessingOrder(false);
    }
  };

  // Check if we have returned from Mercado Pago with a payment status
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const orderId = urlParams.get('orderId');
    
    if (status && orderId) {
      // Get payment details from the order
      const fetchPaymentDetails = async () => {
        try {
          const response = await api.get(`/payments/status/${orderId}`);
          
          if (response.data.success) {
            const { paymentStatus, paymentDetails } = response.data.data;
            
            // If payment was successful, complete the order
            if (paymentStatus === 'completed') {
              onPaymentComplete(orderId, paymentDetails);
            } else if (paymentStatus === 'failed') {
              onPaymentError('Payment failed. Please try again.');
            }
          }
        } catch (err: any) {
          console.error('Error fetching payment details:', err);
          onPaymentError('Failed to verify payment status');
        }
      };
      
      fetchPaymentDetails();
    }
  }, [onPaymentComplete, onPaymentError]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-md font-medium text-red-800">Payment Error</h3>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-800">Payment</h4>
      <p className="text-sm text-gray-600">
        Click the button below to proceed to payment with Mercado Pago. Your order will be processed after payment is complete.
      </p>
      
      <button
        type="button"
        onClick={handleInitiatePayment}
        disabled={loading || processingOrder}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading || processingOrder ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>Pay with Mercado Pago</>
        )}
      </button>
      
      <div className="mt-2 text-xs text-gray-500">
        <p>You will be redirected to Mercado Pago to complete your payment securely.</p>
      </div>
    </div>
  );
};

export default OrderPaymentProcessor; 