import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Product, CreateProductData } from '@/hooks/useProducts';
import { Store } from '@/hooks/useStore';
import api from '@/services/api';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: CreateProductData) => Promise<void>;
  isLoading: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  isLoading
}) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [currentStoreName, setCurrentStoreName] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CreateProductData>({
    defaultValues: initialData ? {
      storeId: initialData.storeId,
      name: initialData.name,
      description: initialData.description,
      price: initialData.price,
      isActive: initialData.isActive
    } : {
      isActive: true // Default to active for new products
    }
  });

  // Watch the form values for debugging
  const formValues = watch();
  console.log('Current form values:', formValues);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoadingStores(true);
        setStoreError(null);
        const response = await api.get('/stores');
        if (response.data.success) {
          console.log('Fetched stores:', response.data.data);
          if (response.data.data.length === 0) {
            setStoreError('No stores found. Please create a store first.');
          }
          setStores(response.data.data);
          
          // If we're editing a product, find the store name for display
          if (initialData && initialData.storeId) {
            const storeMatch = response.data.data.find(
              (store: Store) => store._id === initialData.storeId
            );
            if (storeMatch) {
              setCurrentStoreName(storeMatch.name);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
        setStoreError('Failed to load stores. Please try again.');
      } finally {
        setLoadingStores(false);
      }
    };

    fetchStores();
  }, [initialData]);

  const handleFormSubmit = async (data: CreateProductData) => {
    try {
      // Ensure price is a number
      const formattedData = {
        ...data,
        price: Number(data.price),
        // Make sure isActive is a boolean
        isActive: data.isActive === undefined ? true : Boolean(data.isActive)
      };
      
      console.log('Submitting product data:', formattedData);
      await onSubmit(formattedData);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="storeId" className="block text-sm font-medium text-gray-700">
          Store
        </label>
        {initialData ? (
          <div className="mt-1">
            <input
              type="hidden"
              {...register('storeId')}
              value={initialData.storeId}
            />
            <div className="block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm text-gray-700">
              {loadingStores ? 'Loading store information...' : currentStoreName || 'Store information not available'}
            </div>
            <p className="mt-1 text-xs text-gray-500">Store cannot be changed when editing a product</p>
          </div>
        ) : (
          <select
            id="storeId"
            {...register('storeId', { required: 'Store is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled={loadingStores}
          >
            <option value="">Select a store</option>
            {stores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.name}
              </option>
            ))}
          </select>
        )}
        {errors.storeId && (
          <p className="mt-1 text-sm text-red-600">{errors.storeId.message}</p>
        )}
        {storeError && (
          <p className="mt-1 text-sm text-red-600">{storeError}</p>
        )}
        {loadingStores && !initialData && (
          <p className="mt-1 text-sm text-gray-500">Loading stores...</p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Product name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description', { required: 'Description is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="price"
            step="0.01"
            min="0"
            {...register('price', { 
              required: 'Price is required',
              min: {
                value: 0,
                message: 'Price cannot be negative'
              },
              validate: (value) => !isNaN(Number(value)) || 'Price must be a number'
            })}
            className="pl-7 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
        )}
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="isActive"
            type="checkbox"
            {...register('isActive')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="isActive" className="font-medium text-gray-700">
            Active
          </label>
          <p className="text-gray-500">Mark this product as active and available for purchase</p>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isLoading || loadingStores}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}; 