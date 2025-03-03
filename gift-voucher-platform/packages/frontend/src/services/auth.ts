import { signIn, signOut } from 'next-auth/react';
import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const login = async (credentials: LoginCredentials) => {
  try {
    const result = await signIn('credentials', {
      ...credentials,
      redirect: false,
    });

    return { success: !result?.error, error: result?.error };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const register = async (data: RegisterData) => {
  try {
    // Register the user with the API
    const response = await api.post('/users', {
      ...data,
      role: 'customer', // Default role for new registrations
    });

    // If registration is successful, log the user in
    if (response.data) {
      return await login({
        email: data.email,
        password: data.password,
      });
    }

    return { success: false, error: 'Registration failed' };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Registration failed',
    };
  }
};

export const logout = async () => {
  await signOut({ callbackUrl: '/' });
}; 