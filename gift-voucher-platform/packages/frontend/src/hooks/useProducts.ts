import { useState, useCallback } from 'react';
import api from '../services/api';

export interface Product {
  _id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  storeId: string;
  name: string;
  description: string;
  price: number;
  isActive?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (storeId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/products';
      if (storeId) {
        url = `/products/store/${storeId}`;
      }
      
      const response = await api.get(url);
      
      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch products');
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/products/${id}`);
      
      if (response.data.success) {
        setCurrentProduct(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch product');
      }
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to fetch product');
      setCurrentProduct(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (data: CreateProductData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Log the data being sent to help debug
      console.log('Creating product with data:', data);
      
      const response = await api.post('/products', data);
      
      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to create product');
      }
    } catch (err: any) {
      console.error('Error creating product:', err);
      // Log more detailed error information
      if (err.response) {
        console.error('Error response data:', err.response.data);
      }
      setError(err.message || 'Failed to create product');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, data: UpdateProductData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Log the data being sent to help debug
      console.log('Updating product with data:', data);
      
      const response = await api.put(`/products/${id}`, data);
      
      if (response.data.success) {
        setCurrentProduct({ ...currentProduct, ...data } as Product);
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to update product');
      }
    } catch (err: any) {
      console.error('Error updating product:', err);
      // Log more detailed error information
      if (err.response) {
        console.error('Error response data:', err.response.data);
      }
      setError(err.message || 'Failed to update product');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentProduct]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.delete(`/products/${id}`);
      
      if (response.data.success) {
        setProducts(products.filter((product) => product._id !== id));
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to delete product');
      }
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product');
      return false;
    } finally {
      setLoading(false);
    }
  }, [products]);

  return {
    products,
    currentProduct,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct
  };
}; 