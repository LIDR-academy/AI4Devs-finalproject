import express from 'express';
import { 
  getAllVouchers, 
  getVoucherById, 
  getVoucherByCode,
  getVouchersByStoreId,
  getVouchersByCustomerId,
  createVoucher, 
  updateVoucher, 
  deleteVoucher,
  redeemVoucher
} from '../../application/controllers/voucherController';

const router = express.Router();

// GET all vouchers
router.get('/', getAllVouchers);

// GET voucher by ID
router.get('/:id', getVoucherById);

// GET voucher by code
router.get('/code/:code', getVoucherByCode);

// GET vouchers by store ID
router.get('/store/:storeId', getVouchersByStoreId);

// GET vouchers by customer ID
router.get('/customer/:customerId', getVouchersByCustomerId);

// POST create new voucher
router.post('/', createVoucher);

// PUT update voucher
router.put('/:id', updateVoucher);

// DELETE voucher
router.delete('/:id', deleteVoucher);

// PUT redeem voucher
router.put('/code/:code/redeem', redeemVoucher);

export { router as voucherRoutes }; 