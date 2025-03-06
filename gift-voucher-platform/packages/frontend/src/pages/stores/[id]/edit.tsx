import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useStore } from '@/hooks/useStore';
import { StoreForm } from '@/components/stores/StoreForm';
import DashboardLayout from '@/components/layout/DashboardLayout';

const EditStorePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const {
    currentStore,
    loading,
    error,
    fetchStoreById,
    updateStore
  } = useStore();

  useEffect(() => {
    // Fetch store data only when the router is ready and id is available
    if (router.isReady && id && typeof id === 'string') {
      fetchStoreById(id);
    }
  }, [router.isReady, id, fetchStoreById]);

  const handleSubmit = async (data: any) => {
    if (id && typeof id === 'string') {
      const success = await updateStore(id, data);
      if (success) {
        router.push('/stores');
      }
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Edit Store | Gift Voucher Platform</title>
        <meta name="description" content="Edit store details in the Gift Voucher Platform" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Store: {currentStore?.name}
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
                {currentStore ? (
                  <StoreForm
                    initialData={currentStore}
                    onSubmit={handleSubmit}
                    isLoading={loading}
                  />
                ) : loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Store not found</p>
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

export default EditStorePage; 