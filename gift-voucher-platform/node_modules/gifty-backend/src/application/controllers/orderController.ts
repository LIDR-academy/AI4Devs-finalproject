import { Request, Response } from 'express';
import { Order, IOrder } from '../../domain/models/Order';
import { User } from '../../domain/models/User';
import { Store } from '../../domain/models/Store';
import { Product } from '../../domain/models/Product';
import mongoose from 'mongoose';
import crypto from 'crypto';
import QRCode from 'qrcode';

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
 * Get all orders
 * @route GET /api/orders
 * @access Private/Admin
 */
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId, voucherStatus, paymentStatus, sort, limit = 10, page = 1 } = req.query;
    const queryObject: any = {};
    
    // Apply filters if provided
    if (customerId) {
      queryObject.customerId = customerId;
    }
    
    if (voucherStatus) {
      queryObject['voucher.status'] = voucherStatus;
    }
    
    if (paymentStatus) {
      queryObject['paymentDetails.paymentStatus'] = paymentStatus;
    }

    let query = Order.find(queryObject);

    // Sort orders
    if (sort) {
      const sortBy = (sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    query = query.skip(skip).limit(Number(limit));

    const orders = await query;
    
    // Get total count for pagination
    const totalCount = await Order.countDocuments(queryObject);
    
    res.status(200).json({
      success: true,
      count: totalCount,
      data: orders
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
 * Get order by ID
 * @route GET /api/orders/:id
 * @access Private
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid order ID format'
      });
      return;
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order
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
 * Get orders by customer ID
 * @route GET /api/orders/customer/:customerId
 * @access Private
 */
export const getOrdersByCustomerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { sort, limit = 10, page = 1 } = req.query;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid customer ID format'
      });
      return;
    }

    // Check if customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
      return;
    }

    // Build query
    let query = Order.find({ customerId }).sort({ createdAt: -1 });

    // Sort orders
    if (sort) {
      const sortBy = (sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    query = query.skip(skip).limit(Number(limit));

    const orders = await query;
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
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
 * Create a new order with embedded voucher
 * @route POST /api/orders
 * @access Private
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      customerId, 
      paymentDetails,
      voucher: {
        storeId,
        productId,
        expirationDate,
        sender_name,
        sender_email,
        receiver_name,
        receiver_email,
        message,
        template = 'template1'
      }
    } = req.body;

    // Validate required fields
    if (!customerId || !storeId || !productId || !expirationDate) {
      res.status(400).json({
        success: false,
        error: 'Please provide customerId, storeId, productId, and expirationDate'
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

    // Validate if the IDs are valid MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(customerId) || 
        !mongoose.Types.ObjectId.isValid(storeId) || 
        !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
      return;
    }

    // Check if customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      res.status(404).json({
        success: false,
        error: 'Customer not found'
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

    // Generate unique voucher code
    const code = generateVoucherCode();

    // Generate QR code
    const qrCode = await generateQRCode(code);

    // Create new order with embedded voucher
    const order = await Order.create({
      customerId,
      paymentDetails,
      voucher: {
        storeId,
        productId,
        code,
        status: 'active',
        expirationDate,
        qrCode,
        sender_name,
        sender_email,
        receiver_name,
        receiver_email,
        message,
        template
      }
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error.message
      });
    }
  }
};

/**
 * Update order
 * @route PUT /api/orders/:id
 * @access Private/Admin
 */
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentDetails, voucher } = req.body;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid order ID format'
      });
      return;
    }

    // Check if order exists
    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    
    // Update payment details if provided
    if (paymentDetails) {
      updateData.paymentDetails = {
        ...(order.paymentDetails as any),
        ...paymentDetails
      };
    }
    
    // Update voucher details if provided
    if (voucher) {
      // Don't allow changing the voucher code or QR code
      const { code, qrCode, ...updatableVoucherFields } = voucher;
      
      updateData.voucher = {
        ...(order.voucher as any),
        ...updatableVoucherFields
      };
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error.message
      });
    }
  }
};

/**
 * Delete order
 * @route DELETE /api/orders/:id
 * @access Private/Admin
 */
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid order ID format'
      });
      return;
    }

    // Check if order exists
    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
      return;
    }

    // Delete order
    await Order.findByIdAndDelete(id);

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