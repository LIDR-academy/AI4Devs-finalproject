import express from 'express';
import {
  createMercadoPagoCheckout,
  handleMercadoPagoWebhook,
  getPaymentStatus
} from '../../application/controllers/paymentController';

const router = express.Router();

// GET all payments
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get all payments - endpoint to be implemented' });
});

// GET payment by ID
router.get('/:id', (req, res) => {
  res.status(200).json({ message: `Get payment with ID: ${req.params.id} - endpoint to be implemented` });
});

// POST create new payment
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Create new payment - endpoint to be implemented', data: req.body });
});

// PUT update payment status
router.put('/:id/status', (req, res) => {
  res.status(200).json({ message: `Update payment status for ID: ${req.params.id} - endpoint to be implemented`, data: req.body });
});

// GET payment methods
router.get('/methods', (req, res) => {
  res.status(200).json({ message: 'Get payment methods - endpoint to be implemented' });
});

// Mercado Pago routes
// POST create Mercado Pago checkout for an order
router.post('/mercadopago/create/:orderId', createMercadoPagoCheckout);

// POST handle Mercado Pago webhook notifications
router.post('/webhook/mercadopago', handleMercadoPagoWebhook);

// GET payment status for an order
router.get('/status/:orderId', getPaymentStatus);

export { router as paymentRoutes }; 