import api from './api';

// Interface for dashboard statistics
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  activeVouchers: number;
  redeemedVouchers: number;
  expiredVouchers?: number;
  totalVoucherUsages?: number;
}

// Interface for order data
export interface Order {
  _id: string;
  productId: string;
  productName?: string;
  customerId: string;
  customerName?: string;
  storeId: string;
  storeName?: string;
  amount: number;
  voucher: {
    code: string;
    status: 'active' | 'redeemed' | 'expired';
    expirationDate: string;
    qrCode: string;
  };
  createdAt: string;
}

// Interface for dashboard data
export interface DashboardData {
  stats: DashboardStats;
  recentVouchers: Order[];
}

/**
 * Fetch dashboard data including stats and recent vouchers
 */
export const getDashboardData = async (limit = 5): Promise<DashboardData> => {
  try {
    // Fetch orders with voucher data
    const ordersRes = await api.get(`/orders?limit=${limit}&sort=-createdAt`);
    const orders = ordersRes.data.data || [];
    
    // Fetch products count
    const productsRes = await api.get('/products?limit=1');
    const totalProducts = productsRes.data.count || 0;
    
    // Calculate voucher stats from orders
    const totalOrders = ordersRes.data.count || 0;
    
    // Count vouchers by status
    const activeVouchers = orders.filter((order: Order) => 
      order.voucher && order.voucher.status === 'active'
    ).length;
    
    const redeemedVouchers = orders.filter((order: Order) => 
      order.voucher && order.voucher.status === 'redeemed'
    ).length;
    
    const expiredVouchers = orders.filter((order: Order) => 
      order.voucher && order.voucher.status === 'expired'
    ).length;

    return {
      stats: {
        totalProducts,
        totalOrders,
        activeVouchers,
        redeemedVouchers,
        expiredVouchers
      },
      recentVouchers: orders
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      stats: {
        totalProducts: 0,
        totalOrders: 0,
        activeVouchers: 0,
        redeemedVouchers: 0,
        expiredVouchers: 0
      },
      recentVouchers: []
    };
  }
};

/**
 * Fetch dashboard statistics (legacy method, use getDashboardData instead)
 * @deprecated Use getDashboardData instead
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // In a real application, you might have a dedicated endpoint for this
    // For now, we'll make separate requests and combine the data
    const [productsRes, ordersRes] = await Promise.all([
      api.get('/products?limit=1'),
      api.get('/orders?limit=1'),
    ]);

    // Extract total counts from response headers or response data
    const totalProducts = productsRes.data.count || 0;
    const totalOrders = ordersRes.data.count || 0;
    
    // Get orders with voucher data
    const orders = ordersRes.data.data || [];
    
    // Count active and redeemed vouchers
    const activeVouchers = orders.filter((order: Order) => 
      order.voucher && order.voucher.status === 'active'
    ).length;
    
    const redeemedVouchers = orders.filter((order: Order) => 
      order.voucher && order.voucher.status === 'redeemed'
    ).length;

    return {
      totalProducts,
      totalOrders,
      activeVouchers,
      redeemedVouchers,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalProducts: 0,
      totalOrders: 0,
      activeVouchers: 0,
      redeemedVouchers: 0,
    };
  }
};

/**
 * Fetch recent vouchers (legacy method, use getDashboardData instead)
 * @deprecated Use getDashboardData instead
 */
export const getRecentVouchers = async (limit = 5): Promise<Order[]> => {
  try {
    const response = await api.get(`/orders?limit=${limit}&sort=-createdAt`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching recent vouchers:', error);
    return [];
  }
};

/**
 * Fetch vouchers by status
 */
export const getVouchersByStatus = async (status: 'active' | 'redeemed' | 'expired', limit = 10): Promise<Order[]> => {
  try {
    console.log(`Fetching orders with voucher status ${status} with limit:`, limit);
    const response = await api.get(`/orders?voucherStatus=${status}&limit=${limit}&sort=-createdAt`);
    
    console.log('Orders API response:', response.data);
    
    if (response.data && response.data.success) {
      return response.data.data || [];
    }
    
    console.error('Invalid response format:', response.data);
    throw new Error('Failed to fetch orders: Invalid response format');
  } catch (error: any) {
    console.error(`Error fetching ${status} vouchers:`, error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
}; 