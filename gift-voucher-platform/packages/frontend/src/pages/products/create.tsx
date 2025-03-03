import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useProducts } from '@/hooks/useProducts';
import { ProductForm } from '@/components/products/ProductForm';
import DashboardLayout from '@/components/layout/DashboardLayout';

const CreateProductPage = () => {
  const router = useRouter();
  const { createProduct, loading, error } = useProducts();

  const handleSubmit = async (data: any) => {
    const success = await createProduct(data);
    if (success) {
      router.push('/products');
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Create Product | Gift Voucher Platform</title>
        <meta name="description" content="Create a new product in the Gift Voucher Platform" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Create Product</h1>
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
                <ProductForm onSubmit={handleSubmit} isLoading={loading} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateProductPage; 