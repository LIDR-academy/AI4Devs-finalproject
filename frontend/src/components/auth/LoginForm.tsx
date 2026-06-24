'use client';

import React, { useState } from 'react';
import { useLogin } from '@/services/authService';

interface LoginFormProps {
  onSuccess?: () => void;
}

/**
 * LoginForm component.
 *
 * Renders email + password inputs, a submit button, loading state, and
 * error display. Calls the useLogin() mutation on submit.
 */
export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => onSuccess?.() },
    );
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form" noValidate>
      <div className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="login-email"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="login-password"
          />
        </div>

        {login.isError && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
            data-testid="login-error"
          >
            {login.error?.message ?? 'Login failed. Please try again.'}
          </div>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-testid="login-submit"
        >
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </div>
    </form>
  );
}
