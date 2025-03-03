import React, { useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useOrders } from '@/hooks/useOrders';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';

const OrdersPage: NextPage = () => {
  const { user } = useAuth();
  const { orders, loading, error, fetchOrders, deleteOrder } = useOrders();

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteOrder(id);
      // Refresh the orders list after deletion
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  }, [deleteOrder, fetchOrders]);

  return (
    <DashboardLayout>
      <Head>
        <title>Orders | Gift Voucher Platform</title>
        <meta name="description" content="Manage orders for gift vouchers" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
            {user && (user.role === 'admin' || user.role === 'store_manager') && (
              <Link 
                href="/orders/create" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Order
              </Link>
            )}
          </div>

          <div className="mt-4">
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              <OrdersTable 
                orders={orders} 
                onDelete={handleDelete} 
                isLoading={loading} 
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage; 