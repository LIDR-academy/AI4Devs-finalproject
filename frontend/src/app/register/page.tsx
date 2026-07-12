'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';

/**
 * Register page — /register
 *
 * On successful registration, navigates to /search.
 */
export default function RegisterPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/search');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create account</h1>
        <p className="text-sm text-gray-500 mb-6">
          Join StayHub and start booking stays.
        </p>

        <RegisterForm onSuccess={handleSuccess} />

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
