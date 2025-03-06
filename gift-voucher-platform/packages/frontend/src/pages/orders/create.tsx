import React, { useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { OrderForm } from '@/components/orders/OrderForm';
import { useOrders, CreateOrderData } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';

const CreateOrderPage: NextPage = () => {
  const router = useRouter();
  const { createOrder, loading, error } = useOrders();
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleSubmit = useCallback(async (data: CreateOrderData) => {
    try {
      await createOrder(data);
      router.push('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
    }
  }, [createOrder, router]);

  // Redirect if not authenticated or not admin/store manager
  if (!isLoading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!isLoading && user && user.role !== 'admin' && user.role !== 'store_manager') {
    router.push('/dashboard');
    return null;
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Create Gift Voucher Order | Gift Voucher Platform</title>
        <meta name="description" content="Create a new gift voucher order" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Create Gift Voucher Order</h1>
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
                  Create a new gift voucher order with payment details and voucher information in one step.
                </p>
                <OrderForm 
                  onSubmit={handleSubmit} 
                  isLoading={loading} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateOrderPage; 