import * as mercadopago from 'mercadopago';
import { IOrder, Order } from '../../domain/models/Order';

/**
 * Initialize Mercado Pago configuration with access token
 */
export const initMercadoPago = (): void => {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN is not defined in environment variables');
  }
  
  mercadopago.configure({
    access_token: accessToken
  });
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
    // Get product information from the order
    const { voucher, paymentDetails } = order;
    
    // Create preference data
    const preference = {
      items: [
        {
          id: voucher.productId.toString(),
          title: `Gift Voucher - ${voucher.code}`,
          description: `Gift voucher for ${voucher.receiver_name}`,
          quantity: 1,
          currency_id: 'ARS', // Change according to your currency
          unit_price: paymentDetails.amount
        }
      ],
      payer: {
        name: voucher.sender_name.split(' ')[0] || '',
        surname: voucher.sender_name.split(' ').slice(1).join(' ') || '',
        email: voucher.sender_email,
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl
      },
      auto_return: 'approved',
      external_reference: order._id.toString(),
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhook/mercadopago`,
    };
    
    // Create the preference in Mercado Pago
    const response = await mercadopago.preferences.create(preference);
    
    return response.body;
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
    const response = await mercadopago.payment.get(paymentId);
    return response.body;
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
    if (topic === 'payment') {
      const paymentInfo = await getPaymentInfo(id);
      return paymentInfo;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error processing Mercado Pago webhook:', error);
    throw new Error(`Failed to process webhook: ${error.message}`);
  }
}; 