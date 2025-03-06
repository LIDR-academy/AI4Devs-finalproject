import { Request, Response } from 'express';
import { Product } from '../../domain/models/Product';
import { Order } from '../../domain/models/Order';
import { Voucher } from '../../domain/models/Voucher';
import { VoucherUsage } from '../../domain/models/VoucherUsage';
import mongoose from 'mongoose';

// Extend the Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    role?: string;
  };
}

/**
 * Get dashboard statistics
 * @route GET /api/dashboard/stats
 * @access Private
 */
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Get user ID from request (assuming it's set by auth middleware)
    const userId = req.user?.id;
    const userRole = req.user?.role || 'customer';
    
    // Query parameters
    const limit = parseInt(req.query.limit as string) || 5;
    
    // Prepare filter based on user role
    const filter: any = {};
    if (userRole === 'store_manager') {
      // If store manager, only show their store's data
      // Assuming stores have an ownerId field
      filter.storeId = { $in: await getStoreIdsByOwnerId(userId) };
    } else if (userRole === 'customer') {
      // If customer, only show their data
      filter.customerId = userId;
    }
    // Admin can see all data, so no filter needed

    // Get counts
    const [
      totalProducts,
      totalOrders,
      vouchers,
      voucherUsages,
      recentVouchers
    ] = await Promise.all([
      Product.countDocuments(userRole === 'store_manager' ? filter : {}),
      Order.countDocuments(userRole === 'customer' ? { customerId: userId } : {}),
      Voucher.find(filter).lean(),
      VoucherUsage.countDocuments(filter),
      Voucher.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('productId', 'name')
        .populate('customerId', 'name')
        .populate('storeId', 'name')
        .lean()
    ]);

    // Count vouchers by status
    const activeVouchers = vouchers.filter((v: any) => v.status === 'active').length;
    const redeemedVouchers = vouchers.filter((v: any) => v.status === 'redeemed').length;
    const expiredVouchers = vouchers.filter((v: any) => v.status === 'expired').length;

    // Format recent vouchers for response
    const formattedRecentVouchers = recentVouchers.map((voucher: any) => ({
      id: voucher._id,
      code: voucher.code,
      productId: voucher.productId?._id || voucher.productId,
      productName: voucher.productId?.name || 'Unknown Product',
      customerId: voucher.customerId?._id || voucher.customerId,
      customerName: voucher.customerId?.name || 'Unknown Customer',
      storeId: voucher.storeId?._id || voucher.storeId,
      storeName: voucher.storeId?.name || 'Unknown Store',
      status: voucher.status,
      expirationDate: voucher.expirationDate,
      createdAt: voucher.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        activeVouchers,
        redeemedVouchers,
        expiredVouchers,
        totalVoucherUsages: voucherUsages,
        recentVouchers: formattedRecentVouchers
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
 * Helper function to get store IDs by owner ID
 */
async function getStoreIdsByOwnerId(ownerId: string | undefined): Promise<mongoose.Types.ObjectId[]> {
  if (!ownerId) return [];
  
  try {
    // Assuming there's a Store model with an ownerId field
    const Store = mongoose.model('Store');
    const stores = await Store.find({ ownerId }).select('_id').lean();
    return stores.map((store: any) => store._id);
  } catch (error) {
    console.error('Error fetching stores by owner ID:', error);
    return [];
  }
}