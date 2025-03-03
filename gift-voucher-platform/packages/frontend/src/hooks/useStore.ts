import { useState } from 'react';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import api from '../services/api';

export interface Store {
  _id: any;
  id: string;
  name: string;
  ownerId: string;
  ownerName?: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreData {
  name: string;
  ownerId: string;
  email: string;
  phone: string;
  address: string;
}

export interface UpdateStoreData extends Partial<CreateStoreData> {}

export const useStore = () => {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/stores');
      console.log('Fetched stores:', response.data);
      if (response.data.success) {
        setStores(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch stores');
      }
    } catch (err: any) {
      console.error('Error fetching stores:', err);
      setError(err.message || 'Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreById = useCallback(async (id: string) => {
    if (!id) return null; // Early return if id is not provided
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/stores/${id}`);
      console.log('Fetched store:', response.data);
      if (response.data.success) {
        setCurrentStore(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch store');
      }
    } catch (err: any) {
      console.error('Error fetching store:', err);
      setError(err.message || 'Failed to fetch store');
      return null;
    } finally {
      setLoading(false);
    }
  }, []); // Added useCallback to memoize the function

  const createStore = async (data: CreateStoreData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/stores', data);
      console.log('Created store:', response.data);
      if (response.data.success) {
        router.push('/stores');
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to create store');
      }
    } catch (err: any) {
      console.error('Error creating store:', err);
      setError(err.message || 'Failed to create store');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateStore = async (id: string, data: UpdateStoreData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/stores/${id}`, data);
      console.log('Updated store:', response.data);
      if (response.data.success) {
        router.push('/stores');
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to update store');
      }
    } catch (err: any) {
      console.error('Error updating store:', err);
      setError(err.message || 'Failed to update store');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteStore = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(`/stores/${id}`);
      console.log('Deleted store:', response.data);
      if (response.data.success) {
        // Remove store from local state
        setStores(stores.filter(store => store.id !== id));
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to delete store');
      }
    } catch (err: any) {
      console.error('Error deleting store:', err);
      setError(err.message || 'Failed to delete store');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    stores,
    currentStore,
    loading,
    error,
    fetchStores,
    fetchStoreById,
    createStore,
    updateStore,
    deleteStore,
  };
}; 