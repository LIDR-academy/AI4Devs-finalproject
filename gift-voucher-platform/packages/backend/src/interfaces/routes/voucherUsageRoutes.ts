import express from 'express';
import {
  getAllVoucherUsages,
  getVoucherUsageById,
  getVoucherUsageByVoucherId,
  getVoucherUsagesByStoreId,
  getVoucherUsagesByCustomerId,
  createVoucherUsage,
  deleteVoucherUsage
} from '../../application/controllers/voucherUsageController';

const router = express.Router();

// GET all voucher usages
router.get('/', getAllVoucherUsages);

// GET voucher usages by voucher ID
router.get('/voucher/:voucherId', getVoucherUsageByVoucherId);

// GET voucher usages by store ID
router.get('/store/:storeId', getVoucherUsagesByStoreId);

// GET voucher usages by customer ID
router.get('/customer/:customerId', getVoucherUsagesByCustomerId);

// GET voucher usage by ID
router.get('/:id', getVoucherUsageById);

// POST create new voucher usage
router.post('/', createVoucherUsage);

// DELETE voucher usage
router.delete('/:id', deleteVoucherUsage);

export { router as voucherUsageRoutes }; 