import { Request, Response } from 'express';
import { Voucher, IVoucher } from '../../domain/models/Voucher';
import { Store } from '../../domain/models/Store';
import { Product } from '../../domain/models/Product';
import { User } from '../../domain/models/User';
import mongoose from 'mongoose';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { Order } from '../../domain/models/Order';

/**
 * Generate a unique voucher code
 * @returns {string} Unique voucher code
 */
const generateVoucherCode = (): string => {
  // Generate a random string of 8 characters
  const randomString = crypto.randomBytes(4).toString('hex').toUpperCase();
  // Add a timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  // Combine and format with dashes for readability
  return `${randomString.slice(0, 4)}-${randomString.slice(4)}-${timestamp}`;
};

/**
 * Generate QR code for a voucher
 * @param {string} voucherCode - The voucher code
 * @returns {Promise<string>} Base64 encoded QR code image
 */
const generateQRCode = async (voucherCode: string): Promise<string> => {
  try {
    // Generate QR code with the full redemption URL
    const redemptionUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vouchers/redeem/${voucherCode}`;
    return await QRCode.toDataURL(redemptionUrl);
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Get all vouchers
 * @route GET /api/vouchers
 * @access Private/Admin
 */
export const getAllVouchers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId, productId, customerId, status, sort, limit = 10, page = 1 } = req.query;
    const queryObject: any = {};
    
    // Apply filters if provided
    if (storeId) {
      queryObject.storeId = storeId;
    }
    
    if (productId) {
      queryObject.productId = productId;
    }
    
    if (customerId) {
      queryObject.customerId = customerId;
    }
    
    if (status) {
      queryObject.status = status;
    }

    let query = Voucher.find(queryObject);

    // Sort vouchers
    if (sort) {
      const sortBy = (sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    query = query.skip(skip).limit(Number(limit));

    const vouchers = await query;
    
    res.status(200).json({
      success: true,
      count: vouchers.length,
      data: vouchers
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * Get voucher by ID
 * @route GET /api/vouchers/:id
 * @access Private
 */
export const getVoucherById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid voucher ID format'
      });
      return;
    }

    const voucher = await Voucher.findById(id);

    if (!voucher) {
      res.status(404).json({
        success: false,
        error: 'Voucher not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: voucher
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * Get voucher by code
 * @route GET /api/orders/voucher/:code
 * @access Public
 */
export const getVoucherByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;

    // Find the order that contains the voucher with the given code
    const order = await Order.findOne({ 'voucher.code': code })
      .populate('customerId', 'name email')
      .populate('voucher.storeId', 'name')
      .populate('voucher.productId', 'name price');

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Voucher not found'
      });
      return;
    }

    // Get related data
    const customer = order.customerId as any;
    const store = order.voucher.storeId as any;
    const product = order.voucher.productId as any;

    // Return the voucher data from the order
    res.status(200).json({
      success: true,
      data: {
        _id: order._id,
        code: order.voucher.code,
        status: order.voucher.status,
        expirationDate: order.voucher.expirationDate,
        qrCode: order.voucher.qrCode,
        productName: product?.name || 'Unknown Product',
        productId: order.voucher.productId,
        customerName: customer?.name || 'Unknown Customer',
        customerId: order.customerId,
        storeName: store?.name || 'Unknown Store',
        storeId: order.voucher.storeId,
        amount: order.paymentDetails.amount,
        createdAt: order.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * Get vouchers by store ID
 * @route GET /api/vouchers/store/:storeId
 * @access Private/StoreManager
 */
export const getVouchersByStoreId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { status, sort, limit = 10, page = 1 } = req.query;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid store ID format'
      });
      return;
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Store not found'
      });
      return;
    }

    // Build query
    const queryObject: any = { storeId };
    
    if (status) {
      queryObject.status = status;
    }

    let query = Voucher.find(queryObject);

    // Sort vouchers
    if (sort) {
      const sortBy = (sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    query = query.skip(skip).limit(Number(limit));

    const vouchers = await query;
    
    res.status(200).json({
      success: true,
      count: vouchers.length,
      data: vouchers
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * Get vouchers by customer ID
 * @route GET /api/vouchers/customer/:customerId
 * @access Private
 */
export const getVouchersByCustomerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { status, sort, limit = 10, page = 1 } = req.query;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid customer ID format'
      });
      return;
    }

    // Check if user exists
    const user = await User.findById(customerId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
      return;
    }

    // Build query
    const queryObject: any = { customerId };
    
    if (status) {
      queryObject.status = status;
    }

    let query = Voucher.find(queryObject);

    // Sort vouchers
    if (sort) {
      const sortBy = (sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    query = query.skip(skip).limit(Number(limit));

    const vouchers = await query;
    
    res.status(200).json({
      success: true,
      count: vouchers.length,
      data: vouchers
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * Create new voucher
 * @route POST /api/vouchers
 * @access Private/StoreManager
 */
export const createVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      storeId, 
      productId, 
      customerId, 
      expirationDate, 
      status,
      sender_name,
      sender_email,
      receiver_name,
      receiver_email,
      message,
      template
    } = req.body;

    // Validate required fields
    if (!storeId || !productId || !expirationDate) {
      res.status(400).json({
        success: false,
        error: 'Please provide storeId, productId, and expirationDate'
      });
      return;
    }

    // Validate gift voucher fields
    if (!sender_name || !sender_email || !receiver_name || !receiver_email || !message) {
      res.status(400).json({
        success: false,
        error: 'Please provide sender_name, sender_email, receiver_name, receiver_email, and message'
      });
      return;
    }

    // Validate email formats
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(sender_email) || !emailRegex.test(receiver_email)) {
      res.status(400).json({
        success: false,
        error: 'Please provide valid email addresses'
      });
      return;
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Store not found'
      });
      return;
    }

    // Check if product exists and belongs to the store
    const product = await Product.findOne({ _id: productId, storeId });
    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Product not found or does not belong to the specified store'
      });
      return;
    }

    // Check if customer exists if customerId is provided
    if (customerId) {
      const customer = await User.findOne({ _id: customerId, role: 'customer' });
      if (!customer) {
        res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
        return;
      }
    }

    // Generate unique voucher code
    const code = generateVoucherCode();

    // Generate QR code
    const qrCode = await generateQRCode(code);

    // Create new voucher
    const voucher = new Voucher({
      storeId,
      productId,
      customerId: customerId || null,
      code,
      status: status || 'active',
      expirationDate,
      qrCode,
      sender_name,
      sender_email,
      receiver_name,
      receiver_email,
      message,
      template: template || 'template1'
    });

    await voucher.save();

    // TODO: Send email with voucher details to sender, receiver, and store manager

    res.status(201).json({
      success: true,
      data: voucher
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * Update voucher
 * @route PUT /api/vouchers/:id
 * @access Private/StoreManager
 */
export const updateVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { 
      customerId, 
      status, 
      expirationDate,
      sender_name,
      sender_email,
      receiver_name,
      receiver_email,
      message,
      template
    } = req.body;

    // Find voucher by ID
    const voucher = await Voucher.findById(id);
    if (!voucher) {
      res.status(404).json({
        success: false,
        error: 'Voucher not found'
      });
      return;
    }

    // Validate email formats if provided
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (sender_email && !emailRegex.test(sender_email)) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid sender email address'
      });
      return;
    }
    if (receiver_email && !emailRegex.test(receiver_email)) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid receiver email address'
      });
      return;
    }

    // Check if customer exists if customerId is provided
    if (customerId) {
      const customer = await User.findOne({ _id: customerId, role: 'customer' });
      if (!customer) {
        res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
        return;
      }
    }

    // Update voucher fields
    if (customerId !== undefined) voucher.customerId = customerId;
    if (status) voucher.status = status;
    if (expirationDate) voucher.expirationDate = new Date(expirationDate);
    if (sender_name) voucher.sender_name = sender_name;
    if (sender_email) voucher.sender_email = sender_email;
    if (receiver_name) voucher.receiver_name = receiver_name;
    if (receiver_email) voucher.receiver_email = receiver_email;
    if (message) voucher.message = message;
    if (template) voucher.template = template;

    await voucher.save();

    res.status(200).json({
      success: true,
      data: voucher
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * Delete voucher
 * @route DELETE /api/vouchers/:id
 * @access Private/StoreManager
 */
export const deleteVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid voucher ID format'
      });
      return;
    }

    // Check if voucher exists
    const voucher = await Voucher.findById(id);
    if (!voucher) {
      res.status(404).json({
        success: false,
        error: 'Voucher not found'
      });
      return;
    }

    // Delete voucher
    await Voucher.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * Redeem voucher
 * @route PUT /api/orders/voucher/:code/redeem
 * @access Public
 */
export const redeemVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;

    // Find order with the voucher code
    const order = await Order.findOne({ 'voucher.code': code });
    
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Voucher not found'
      });
      return;
    }

    // Check if voucher is already redeemed
    if (order.voucher.status === 'redeemed') {
      res.status(400).json({
        success: false,
        error: 'Voucher has already been redeemed'
      });
      return;
    }

    // Check if voucher is expired
    const now = new Date();
    if (new Date(order.voucher.expirationDate) < now) {
      // Update voucher status to expired
      order.voucher.status = 'expired';
      await order.save();
      
      res.status(400).json({
        success: false,
        error: 'Voucher has expired'
      });
      return;
    }

    // Update voucher status to redeemed
    order.voucher.status = 'redeemed';
    await order.save();

    // Populate related data for the response
    await order.populate('customerId', 'name email');
    await order.populate('voucher.storeId', 'name');
    await order.populate('voucher.productId', 'name price');

    // Get related data
    const customer = order.customerId as any;
    const store = order.voucher.storeId as any;
    const product = order.voucher.productId as any;

    res.status(200).json({
      success: true,
      message: 'Voucher successfully redeemed',
      data: {
        _id: order._id,
        code: order.voucher.code,
        status: order.voucher.status,
        expirationDate: order.voucher.expirationDate,
        qrCode: order.voucher.qrCode,
        productName: product?.name || 'Unknown Product',
        productId: order.voucher.productId,
        customerName: customer?.name || 'Unknown Customer',
        customerId: order.customerId,
        storeName: store?.name || 'Unknown Store',
        storeId: order.voucher.storeId,
        amount: order.paymentDetails.amount,
        createdAt: order.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
}; 