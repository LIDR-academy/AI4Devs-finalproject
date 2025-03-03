import express from 'express';
import {
  getAllOrders,
  getOrderById,
  getOrdersByCustomerId,
  createOrder,
  updateOrder,
  deleteOrder
} from '../../application/controllers/orderController';
import { getVoucherByCode, redeemVoucher } from '../../application/controllers/voucherController';

const router = express.Router();

// GET all orders
router.get('/', getAllOrders);

// GET orders by customer ID
router.get('/customer/:customerId', getOrdersByCustomerId);

// GET voucher by code
router.get('/voucher/:code', getVoucherByCode);

// PUT redeem voucher by code
router.put('/voucher/:code/redeem', redeemVoucher);

// GET order by ID
router.get('/:id', getOrderById);

// POST create new order
router.post('/', createOrder);

// PUT update order
router.put('/:id', updateOrder);

// DELETE order
router.delete('/:id', deleteOrder);

export { router as orderRoutes }; 