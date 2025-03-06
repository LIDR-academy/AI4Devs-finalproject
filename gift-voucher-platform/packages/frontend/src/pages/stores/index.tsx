import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useStore } from '@/hooks/useStore';
import { StoresTable } from '@/components/stores/StoresTable';
import DashboardLayout from '@/components/layout/DashboardLayout';

const StoresPage = () => {
  const { stores, loading, error, fetchStores, deleteStore } = useStore();

  useEffect(() => {
    // Only fetch stores once when the component mounts
    fetchStores();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      const success = await deleteStore(id);
      if (success) {
        // Refresh the stores list after successful deletion
        fetchStores();
      }
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Stores Management | Gift Voucher Platform</title>
        <meta name="description" content="Manage stores in the Gift Voucher Platform" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Stores</h1>
            <Link
              href="/stores/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add New Store
            </Link>
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

            <div className="mt-4">
              <StoresTable
                stores={stores}
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

export default StoresPage; 