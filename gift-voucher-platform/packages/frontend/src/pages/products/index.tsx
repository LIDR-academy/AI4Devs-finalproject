import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { ProductsTable } from '@/components/products/ProductsTable';
import DashboardLayout from '@/components/layout/DashboardLayout';

const ProductsPage = () => {
  const { products, loading, error, fetchProducts, deleteProduct } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const success = await deleteProduct(id);
    if (success) {
      fetchProducts();
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Products | Gift Voucher Platform</title>
        <meta name="description" content="Manage products in the Gift Voucher Platform" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
            <Link
              href="/products/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Product
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
              <ProductsTable
                products={products}
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

export default ProductsPage; 