import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { VoucherUsage } from '../../domain/models/VoucherUsage';
import { Voucher } from '../../domain/models/Voucher';
import { Store } from '../../domain/models/Store';
import { User } from '../../domain/models/User';

/**
 * Get all voucher usages with optional filtering, sorting, and pagination
 */
export const getAllVoucherUsages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      voucherId, 
      storeId, 
      customerId, 
      sort = '-usedAt', 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const queryOptions: any = {};
    
    if (voucherId) {
      if (!mongoose.Types.ObjectId.isValid(voucherId as string)) {
        res.status(400).json({ message: 'Invalid voucher ID format' });
        return;
      }
      queryOptions.voucherId = voucherId;
    }
    
    if (storeId) {
      if (!mongoose.Types.ObjectId.isValid(storeId as string)) {
        res.status(400).json({ message: 'Invalid store ID format' });
        return;
      }
      queryOptions.storeId = storeId;
    }
    
    if (customerId) {
      if (!mongoose.Types.ObjectId.isValid(customerId as string)) {
        res.status(400).json({ message: 'Invalid customer ID format' });
        return;
      }
      queryOptions.customerId = customerId;
    }
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const voucherUsages = await VoucherUsage.find(queryOptions)
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum)
      .populate('voucherId', 'code status')
      .populate('storeId', 'name')
      .populate('customerId', 'name email');
    
    const total = await VoucherUsage.countDocuments(queryOptions);
    
    res.status(200).json({
      voucherUsages,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      totalResults: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving voucher usages', error: (error as Error).message });
  }
};

/**
 * Get voucher usage by ID
 */
export const getVoucherUsageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid voucher usage ID format' });
      return;
    }
    
    const voucherUsage = await VoucherUsage.findById(id)
      .populate('voucherId', 'code status')
      .populate('storeId', 'name')
      .populate('customerId', 'name email');
    
    if (!voucherUsage) {
      res.status(404).json({ message: 'Voucher usage not found' });
      return;
    }
    
    res.status(200).json(voucherUsage);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving voucher usage', error: (error as Error).message });
  }
};

/**
 * Get voucher usages by voucher ID
 */
export const getVoucherUsageByVoucherId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { voucherId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(voucherId)) {
      res.status(400).json({ message: 'Invalid voucher ID format' });
      return;
    }
    
    // Check if voucher exists
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      res.status(404).json({ message: 'Voucher not found' });
      return;
    }
    
    const voucherUsage = await VoucherUsage.findOne({ voucherId })
      .populate('voucherId', 'code status')
      .populate('storeId', 'name')
      .populate('customerId', 'name email');
    
    if (!voucherUsage) {
      res.status(404).json({ message: 'Voucher usage not found' });
      return;
    }
    
    res.status(200).json(voucherUsage);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving voucher usage', error: (error as Error).message });
  }
};

/**
 * Get voucher usages by store ID
 */
export const getVoucherUsagesByStoreId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { page = 1, limit = 10, sort = '-usedAt' } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      res.status(400).json({ message: 'Invalid store ID format' });
      return;
    }
    
    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const voucherUsages = await VoucherUsage.find({ storeId })
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum)
      .populate('voucherId', 'code status')
      .populate('storeId', 'name')
      .populate('customerId', 'name email');
    
    const total = await VoucherUsage.countDocuments({ storeId });
    
    res.status(200).json({
      voucherUsages,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      totalResults: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving voucher usages', error: (error as Error).message });
  }
};

/**
 * Get voucher usages by customer ID
 */
export const getVoucherUsagesByCustomerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10, sort = '-usedAt' } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      res.status(400).json({ message: 'Invalid customer ID format' });
      return;
    }
    
    // Check if customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const voucherUsages = await VoucherUsage.find({ customerId })
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum)
      .populate('voucherId', 'code status')
      .populate('storeId', 'name')
      .populate('customerId', 'name email');
    
    const total = await VoucherUsage.countDocuments({ customerId });
    
    res.status(200).json({
      voucherUsages,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      totalResults: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving voucher usages', error: (error as Error).message });
  }
};

/**
 * Create a new voucher usage record
 */
export const createVoucherUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { voucherId, storeId, customerId } = req.body;
    
    // Validate required fields
    if (!voucherId || !storeId || !customerId) {
      res.status(400).json({ message: 'Voucher ID, Store ID, and Customer ID are required' });
      return;
    }
    
    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(voucherId) || 
        !mongoose.Types.ObjectId.isValid(storeId) || 
        !mongoose.Types.ObjectId.isValid(customerId)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }
    
    // Check if voucher exists and is valid
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      res.status(404).json({ message: 'Voucher not found' });
      return;
    }
    
    if (voucher.status !== 'active') {
      res.status(400).json({ message: 'Voucher is not active' });
      return;
    }
    
    // Check if voucher has already been used
    const existingUsage = await VoucherUsage.findOne({ voucherId });
    if (existingUsage) {
      res.status(400).json({ message: 'Voucher has already been redeemed' });
      return;
    }
    
    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }
    
    // Check if customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    
    // Create new voucher usage
    const voucherUsage = new VoucherUsage({
      voucherId,
      storeId,
      customerId,
      usedAt: new Date()
    });
    
    // Update voucher status to 'redeemed'
    await Voucher.findByIdAndUpdate(voucherId, { status: 'redeemed' });
    
    const savedVoucherUsage = await voucherUsage.save();
    
    res.status(201).json(savedVoucherUsage);
  } catch (error) {
    if ((error as any).code === 11000) {
      res.status(400).json({ message: 'Voucher has already been redeemed' });
      return;
    }
    
    res.status(500).json({ message: 'Error creating voucher usage', error: (error as Error).message });
  }
};

/**
 * Delete a voucher usage record
 */
export const deleteVoucherUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid voucher usage ID format' });
      return;
    }
    
    const voucherUsage = await VoucherUsage.findById(id);
    
    if (!voucherUsage) {
      res.status(404).json({ message: 'Voucher usage not found' });
      return;
    }
    
    // Reactivate the voucher
    await Voucher.findByIdAndUpdate(voucherUsage.voucherId, { status: 'active' });
    
    await VoucherUsage.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Voucher usage deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting voucher usage', error: (error as Error).message });
  }
}; 