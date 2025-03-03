import React, { useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useProducts } from '@/hooks/useProducts';
import { ProductForm } from '@/components/products/ProductForm';
import DashboardLayout from '@/components/layout/DashboardLayout';

const EditProductPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const {
    currentProduct,
    loading,
    error,
    fetchProductById,
    updateProduct
  } = useProducts();

  const fetchProduct = useCallback(async () => {
    if (id && typeof id === 'string') {
      await fetchProductById(id);
    }
  }, [id, fetchProductById]);

  useEffect(() => {
    if (router.isReady) {
      fetchProduct();
    }
  }, [router.isReady, fetchProduct]);

  const handleSubmit = async (data: any) => {
    if (id && typeof id === 'string') {
      console.log('Submitting update for product:', id, data);
      const success = await updateProduct(id, data);
      if (success) {
        router.push('/products');
      }
    }
  };

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
        <title>Edit Product | Gift Voucher Platform</title>
        <meta name="description" content="Edit product details in the Gift Voucher Platform" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Product: {currentProduct?.name}
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
                {currentProduct ? (
                  <ProductForm
                    initialData={currentProduct}
                    onSubmit={handleSubmit}
                    isLoading={loading}
                  />
                ) : loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-2">Loading product data...</span>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Product not found</p>
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

export default EditProductPage; 