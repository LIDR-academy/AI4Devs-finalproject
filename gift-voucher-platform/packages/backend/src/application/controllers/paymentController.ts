import { Request, Response } from 'express';
import { Order } from '../../domain/models/Order';
import { 
  initMercadoPago, 
  createPreference, 
  getPaymentInfo, 
  processWebhookNotification 
} from '../../infrastructure/services/mercadoPagoService';

// Initialize Mercado Pago when the controller is loaded
try {
  initMercadoPago();
  console.log('Mercado Pago SDK initialized successfully');
} catch (error) {
  console.error('Failed to initialize Mercado Pago SDK:', error);
}

/**
 * Create a Mercado Pago checkout for an order
 * @route POST /api/payments/mercadopago/create/:orderId
 * @access Private
 */
export const createMercadoPagoCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
      return;
    }
    
    // Check if order is already paid
    if (order.paymentDetails.paymentStatus === 'completed') {
      res.status(400).json({
        success: false,
        error: 'Order is already paid'
      });
      return;
    }
    
    // Set up success, failure, and pending URLs
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/payment/success?orderId=${orderId}`;
    const failureUrl = `${baseUrl}/payment/failure?orderId=${orderId}`;
    const pendingUrl = `${baseUrl}/payment/pending?orderId=${orderId}`;
    
    // Create Mercado Pago preference
    const preference = await createPreference(order, successUrl, failureUrl, pendingUrl);
    
    // Update order with payment provider
    await Order.findByIdAndUpdate(orderId, {
      'paymentDetails.provider': 'mercadopago'
    });
    
    res.status(200).json({
      success: true,
      data: {
        checkoutUrl: preference.init_point,
        preferenceId: preference.id
      }
    });
  } catch (error: any) {
    console.error('Error creating Mercado Pago checkout:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * Handle Mercado Pago webhook notifications
 * @route POST /api/payments/webhook/mercadopago
 * @access Public
 */
export const handleMercadoPagoWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, id } = req.query;
    
    if (!topic || !id) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
      return;
    }
    
    // Process the notification
    const paymentInfo = await processWebhookNotification(topic as string, id as string);
    
    if (!paymentInfo) {
      // Not a payment notification or processing failed
      res.status(200).json({ success: true });
      return;
    }
    
    // Find the order using the external_reference
    const order = await Order.findById(paymentInfo.external_reference);
    if (!order) {
      console.error('Order not found for external reference:', paymentInfo.external_reference);
      res.status(200).json({ success: true });
      return;
    }
    
    // Update order payment status based on Mercado Pago status
    let paymentStatus: 'pending' | 'completed' | 'failed' = 'pending';
    
    switch (paymentInfo.status) {
      case 'approved':
        paymentStatus = 'completed';
        break;
      case 'rejected':
        paymentStatus = 'failed';
        break;
      default:
        paymentStatus = 'pending';
    }
    
    // Update the order with payment information
    await Order.findByIdAndUpdate(order._id, {
      'paymentDetails.paymentId': paymentInfo.id.toString(),
      'paymentDetails.paymentStatus': paymentStatus,
      'paymentDetails.provider': 'mercadopago'
    });
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error handling Mercado Pago webhook:', error);
    // Always return 200 to Mercado Pago to acknowledge receipt
    res.status(200).json({ success: true });
  }
};

/**
 * Get payment status for an order
 * @route GET /api/payments/status/:orderId
 * @access Private
 */
export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
      return;
    }
    
    // If the order has a payment ID and provider is Mercado Pago, get the latest status
    if (order.paymentDetails.paymentId && order.paymentDetails.provider === 'mercadopago') {
      try {
        const paymentInfo = await getPaymentInfo(order.paymentDetails.paymentId);
        
        // Map Mercado Pago status to our status
        let paymentStatus: 'pending' | 'completed' | 'failed' = 'pending';
        
        switch (paymentInfo.status) {
          case 'approved':
            paymentStatus = 'completed';
            break;
          case 'rejected':
            paymentStatus = 'failed';
            break;
          default:
            paymentStatus = 'pending';
        }
        
        // Update the order if status has changed
        if (paymentStatus !== order.paymentDetails.paymentStatus) {
          await Order.findByIdAndUpdate(orderId, {
            'paymentDetails.paymentStatus': paymentStatus
          });
        }
        
        res.status(200).json({
          success: true,
          data: {
            paymentStatus,
            paymentDetails: paymentInfo
          }
        });
      } catch (error) {
        // If there's an error getting payment info, return the current status
        res.status(200).json({
          success: true,
          data: {
            paymentStatus: order.paymentDetails.paymentStatus
          }
        });
      }
    } else {
      // If no payment ID or not Mercado Pago, return the current status
      res.status(200).json({
        success: true,
        data: {
          paymentStatus: order.paymentDetails.paymentStatus
        }
      });
    }
  } catch (error: any) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
}; 