import React from 'react';
import Head from 'next/head';
import { useStore } from '@/hooks/useStore';
import { StoreForm } from '@/components/stores/StoreForm';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';

const CreateStorePage = () => {
  const router = useRouter();
  const { createStore, loading, error } = useStore();

  const handleSubmit = async (data: any) => {
    const success = await createStore(data);
    if (success) {
      router.push('/stores');
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Create Store | Gift Voucher Platform</title>
        <meta name="description" content="Create a new store in the Gift Voucher Platform" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Create Store</h1>
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
                <StoreForm
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

export default CreateStorePage; 