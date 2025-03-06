import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { IOrder, Order } from '../../domain/models/Order';

/**
 * Initialize Mercado Pago configuration with access token
 */
export const initMercadoPago = (): void => {
  // No need to throw an error if token is missing since we're using hardcoded responses
  console.log('MercadoPago SDK initialized with mock data');
};

/**
 * Create a Mercado Pago preference for Checkout PRO
 * @param order - Order data
 * @param successUrl - URL to redirect after successful payment
 * @param failureUrl - URL to redirect after failed payment
 * @param pendingUrl - URL to redirect for pending payment
 * @returns Preference data including init_point URL
 */
export const createPreference = async (
  order: IOrder,
  successUrl: string,
  failureUrl: string,
  pendingUrl: string
) => {
  try {
    console.log('Creating mock MercadoPago preference for order:', order._id.toString());
    
    // Return hardcoded preference response
    return {
      init_point: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/success?orderId=${order._id.toString()}`,
      id: 'mock_preference_' + Date.now()
    };
  } catch (error: any) {
    console.error('Error creating Mercado Pago preference:', error);
    throw new Error(`Failed to create Mercado Pago preference: ${error.message}`);
  }
};

/**
 * Get payment information from Mercado Pago
 * @param paymentId - Payment ID from Mercado Pago
 * @returns Payment information
 */
export const getPaymentInfo = async (paymentId: string) => {
  try {
    console.log('Getting mock payment info for payment ID:', paymentId);
    
    // Return hardcoded payment response with approved status
    return {
      id: paymentId,
      status: 'approved',
      status_detail: 'accredited',
      payment_method_id: 'credit_card',
      payment_type_id: 'credit_card',
      external_reference: paymentId.replace('mock_payment_', ''),
      date_created: new Date().toISOString(),
      date_approved: new Date().toISOString(),
      transaction_amount: 1000,
      currency_id: 'ARS',
      description: 'Gift Voucher Purchase',
      payer: {
        email: 'test@example.com',
        identification: {
          type: 'DNI',
          number: '12345678'
        }
      }
    };
  } catch (error: any) {
    console.error('Error getting payment info from Mercado Pago:', error);
    throw new Error(`Failed to get payment info: ${error.message}`);
  }
};

/**
 * Process webhook notification from Mercado Pago
 * @param topic - Notification topic
 * @param id - Resource ID
 * @returns Payment data if applicable
 */
export const processWebhookNotification = async (topic: string, id: string) => {
  try {
    console.log('Processing mock webhook notification:', { topic, id });
    
    if (topic === 'payment') {
      // Extract orderId from the id parameter (assuming id contains the orderId)
      const orderId = id.includes('_') ? id.split('_')[1] : id;
      
      // Return hardcoded payment response with approved status
      return {
        id: 'mock_payment_' + Date.now(),
        status: 'approved',
        status_detail: 'accredited',
        payment_method_id: 'credit_card',
        payment_type_id: 'credit_card',
        external_reference: orderId,
        date_created: new Date().toISOString(),
        date_approved: new Date().toISOString(),
        transaction_amount: 1000,
        currency_id: 'ARS',
        description: 'Gift Voucher Purchase',
        payer: {
          email: 'test@example.com',
          identification: {
            type: 'DNI',
            number: '12345678'
          }
        }
      };
    }
    
    return null;
  } catch (error: any) {
    console.error('Error processing Mercado Pago webhook:', error);
    throw new Error(`Failed to process webhook: ${error.message}`);
  }
}; 