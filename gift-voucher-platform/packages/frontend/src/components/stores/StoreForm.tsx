import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Store, CreateStoreData } from '@/hooks/useStore';
import api from '@/services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface StoreFormProps {
  initialData?: Store;
  onSubmit: (data: CreateStoreData) => Promise<void>;
  isLoading: boolean;
}

export const StoreForm: React.FC<StoreFormProps> = ({
  initialData,
  onSubmit,
  isLoading
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateStoreData>({
    defaultValues: initialData ? {
      name: initialData.name,
      ownerId: initialData.ownerId,
      email: initialData.email,
      phone: initialData.phone,
      address: initialData.address,
    } : {}
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setUserError(null);
        const response = await api.get('/users');
        if (response.data.success) {
          // Filter users to only include store_manager and admin roles
          const eligibleUsers = response.data.data.filter(
            (user: User) => ['store_manager', 'admin'].includes(user.role)
          );
          if (eligibleUsers.length === 0) {
            setUserError('No eligible store managers found. Please create a user with store_manager role first.');
          }
          setUsers(eligibleUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUserError('Failed to load users. Please try again.');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleFormSubmit = async (data: CreateStoreData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Store Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Store name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700">
          Store Owner
        </label>
        <select
          id="ownerId"
          {...register('ownerId', { required: 'Store owner is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={loadingUsers}
        >
          <option value="" key="default">Select an owner</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
        {errors.ownerId && (
          <p className="mt-1 text-sm text-red-600">{errors.ownerId.message}</p>
        )}
        {userError && (
          <p className="mt-1 text-sm text-red-600">{userError}</p>
        )}
        {loadingUsers && (
          <p className="mt-1 text-sm text-gray-500">Loading users...</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Store Email
        </label>
        <input
          type="email"
          id="email"
          {...register('email', {
            required: 'Store email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          {...register('phone', { required: 'Phone number is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          id="address"
          {...register('address', { required: 'Address is required' })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isLoading || loadingUsers}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Store'}
        </button>
      </div>
    </form>
  );
}; 