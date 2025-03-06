import React, { useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { OrderForm } from '@/components/orders/OrderForm';
import { useOrders, UpdateOrderData } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';

const EditOrderPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { currentOrder, loading, error, fetchOrderById, updateOrder } = useOrders();
  const { user, isAuthenticated, isLoading } = useAuth();

  const fetchOrder = useCallback(async () => {
    if (id && typeof id === 'string') {
      await fetchOrderById(id);
    }
  }, [id, fetchOrderById]);

  useEffect(() => {
    if (router.isReady) {
      fetchOrder();
    }
  }, [router.isReady, fetchOrder]);

  const handleSubmit = useCallback(async (data: UpdateOrderData) => {
    try {
      if (id && typeof id === 'string') {
        await updateOrder(id, data);
        router.push('/orders');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  }, [id, updateOrder, router]);

  // Redirect if not authenticated or not admin/store manager
  if (!isLoading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!isLoading && user && user.role !== 'admin' && user.role !== 'store_manager') {
    router.push('/dashboard');
    return null;
  }

  // Show loading state while router is initializing
  if (!router.isReady) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2">Loading...</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Edit Gift Voucher Order | Gift Voucher Platform</title>
        <meta name="description" content="Edit an existing gift voucher order" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Gift Voucher Order {currentOrder ? `#${currentOrder._id.substring(0, 8)}` : ''}
            </h1>
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

            <div className="mt-4 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <p className="mb-4 text-sm text-gray-600">
                  Edit payment details and voucher information in one place. You can update payment status or modify voucher details as needed.
                </p>
                {currentOrder ? (
                  <OrderForm 
                    initialData={currentOrder} 
                    onSubmit={handleSubmit} 
                    isLoading={loading} 
                  />
                ) : loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-2">Loading order data...</span>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Order not found</p>
                    <button
                      type="button"
                      onClick={() => router.push('/orders')}
                      className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Go back to orders
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditOrderPage; 