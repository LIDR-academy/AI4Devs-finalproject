import { useState, useCallback } from 'react';
import api from '../services/api';

export interface Order {
  _id: string;
  customerId: string;
  paymentDetails: {
    paymentId: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentEmail: string;
    amount: number;
    provider: 'mercadopago' | 'paypal' | 'stripe';
  };
  voucher: {
    storeId: string;
    productId: string;
    code: string;
    status: 'active' | 'redeemed' | 'expired';
    expirationDate: string;
    qrCode: string;
    sender_name: string;
    sender_email: string;
    receiver_name: string;
    receiver_email: string;
    message: string;
    template: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  customerId: string;
  paymentDetails: {
    paymentId: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentEmail: string;
    amount: number;
    provider: 'mercadopago' | 'paypal' | 'stripe';
  };
  voucher: {
    storeId: string;
    productId: string;
    expirationDate: string;
    sender_name: string;
    sender_email: string;
    receiver_name: string;
    receiver_email: string;
    message: string;
    template: string;
  };
}

export interface UpdateOrderData {
  paymentDetails?: {
    paymentId?: string;
    paymentStatus?: 'pending' | 'completed' | 'failed';
    paymentEmail?: string;
    amount?: number;
    provider?: 'mercadopago' | 'paypal' | 'stripe';
  };
  voucher?: {
    status?: 'active' | 'redeemed' | 'expired';
    expirationDate?: string;
    sender_name?: string;
    sender_email?: string;
    receiver_name?: string;
    receiver_email?: string;
    message?: string;
    template?: string;
  };
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (customerId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/orders';
      if (customerId) {
        url = `/orders/customer/${customerId}`;
      }
      
      const response = await api.get(url);
      
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch orders');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/orders/${id}`);
      
      if (response.data.success) {
        setCurrentOrder(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch order');
      }
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Failed to fetch order');
      setCurrentOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (data: CreateOrderData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Creating order with data:', data);
      
      const response = await api.post('/orders', data);
      
      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to create order');
      }
    } catch (err: any) {
      console.error('Error creating order:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
      }
      setError(err.message || 'Failed to create order');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrder = useCallback(async (id: string, data: UpdateOrderData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Updating order with data:', data);
      
      const response = await api.put(`/orders/${id}`, data);
      
      if (response.data.success) {
        setCurrentOrder(response.data.data);
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to update order');
      }
    } catch (err: any) {
      console.error('Error updating order:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
      }
      setError(err.message || 'Failed to update order');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOrder = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.delete(`/orders/${id}`);
      
      if (response.data.success) {
        setOrders(orders.filter((order) => order._id !== id));
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to delete order');
      }
    } catch (err: any) {
      console.error('Error deleting order:', err);
      setError(err.message || 'Failed to delete order');
      return false;
    } finally {
      setLoading(false);
    }
  }, [orders]);

  return {
    orders,
    currentOrder,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    deleteOrder
  };
}; 